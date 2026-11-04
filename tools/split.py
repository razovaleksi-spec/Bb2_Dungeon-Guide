"""Split ONE wiki html into editable source files under src/.

    python3 tools/split.py path/to/Bb2dungeon-ESv4v148.html

Use it once per html that was made outside this repo (e.g. in a chat). It REPLACES src/.
Writes:
  src/page.html     the page skeleton; {{@file:...}} and {{@img:...}} mark where files go back in
  src/js/           every <script> that is code; the big main script is cut into src/js/main/ (data + code parts)
  src/data/         every <script> that holds JSON data
  src/css/          every <style> block
  src/img/<group>/  every picture as a real image file (identical pictures are stored once)
  src/VERSION       the version number taken from the file name
  src/SOURCE_MD5    md5 of the html this was split from
Then it runs `build.py --check`: the rebuilt html must be the SAME file byte for byte, or it fails.
"""
import re, sys, os, base64, hashlib, shutil, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')
EXT = {'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif'}
URI = re.compile(r'data:(image/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=]+)')
# data tables inside the main script -> (file name, picture folder)
DATA_CONSTS = {'IMG': ('IMG', 'icons'), 'DATA': ('DATA_dungeons', None), 'CONQUEST': ('CONQUEST_disasters', None),
               'CONQUEST2': ('CONQUEST2_conquests', None), 'SPECIAL': ('SPECIAL_dungeons', None),
               'BOSS_IMAGES': ('BOSS_IMAGES', 'boss'), 'DUNGEON_STATUS': ('DUNGEON_STATUS', 'status'),
               'BOSS_LOOT': ('BOSS_LOOT', 'loot'), 'ITEM_IMAGES': ('ITEM_IMAGES_reroll', 'reroll'),
               'STATS': ('STATS', 'stats'), 'ITEM_DETAILS': ('ITEM_DETAILS_gear', 'gear'),
               'TERMS': ('TERMS', 'terms'), 'SKILL_DETAILS': ('SKILL_DETAILS_skills', 'skills')}

def slug(t, n=48):
    t = re.sub(r'[^A-Za-z0-9]+', '-', t).strip('-').lower()
    return t[:n].strip('-') or 'x'

def literal_end(s, i):
    """s[i] is '[' or '{': return the index just after its matching bracket (skips strings and comments)."""
    depth, n = 0, len(s)
    while i < n:
        c = s[i]
        if c in '"\'`':
            q = c; i += 1
            while s[i] != q:
                i += 2 if s[i] == '\\' else 1
        elif s.startswith('//', i):
            i = s.index('\n', i)
            continue
        elif s.startswith('/*', i):
            i = s.index('*/', i) + 2
            continue
        elif c in '[{(':
            depth += 1
        elif c in ']})':
            depth -= 1
            if depth == 0:
                return i + 1
        i += 1
    raise ValueError('unclosed literal')

def cut_main(inner):
    """Cut the main script into consecutive parts: [code][DATA][code][DATA]...  (joined again = same text)."""
    parts, pos = [], 0
    for m in re.finditer(r'^const (\w+) = ([\[{])', inner, re.M):
        if m.group(1) not in DATA_CONSTS:
            continue
        start = m.start()
        # take the comment lines right above the constant with it
        while True:
            prev = inner.rfind('\n', 0, start - 1)
            line = inner[prev + 1:start]
            if start > 0 and re.match(r'\s*(//|/\*|\*)', line) and prev >= pos - 1 and prev + 1 >= pos:
                start = prev + 1
            else:
                break
        end = literal_end(inner, m.start(2))
        nl = inner.find('\n', end)
        end = len(inner) if nl < 0 else nl + 1
        if start > pos and inner[pos:start].strip() == '':
            if parts:                                  # only blank lines between two parts: keep them with the part before
                parts[-1] = (parts[-1][0], parts[-1][1] + inner[pos:start])
            else:
                start = pos
        elif start > pos:
            parts.append(('code', inner[pos:start]))
        parts.append((m.group(1), inner[start:end]))
        pos = end
    if pos < len(inner):
        if inner[pos:].strip() == '' and parts:
            parts[-1] = (parts[-1][0], parts[-1][1] + inner[pos:])
        else:
            parts.append(('code', inner[pos:]))
    assert ''.join(p[1] for p in parts) == inner
    return parts

def main(path):
    raw = open(path, 'rb').read()
    html = raw.decode('utf-8')
    if '{{@' in html:
        raise SystemExit('the html already contains the marker text {{@ ; cannot split safely')
    md5 = hashlib.md5(raw).hexdigest()
    m = re.search(r'v(\d+)\.html$', os.path.basename(path))
    version = m.group(1) if m else '0'
    if os.path.isdir(SRC):
        shutil.rmtree(SRC)
    os.makedirs(SRC)

    def write(rel, text):
        full = os.path.join(SRC, rel)
        os.makedirs(os.path.dirname(full), exist_ok=True)
        with open(full, 'w', encoding='utf-8', newline='') as f:
            f.write(text)

    by_hash, taken = {}, set()
    def pictures(text, group):
        """Replace every picture in text by a marker; save the picture as src/img/<group>/<name>.<ext>."""
        def one(mt):
            mime, b64 = mt.group(1), mt.group(2)
            if mime not in EXT:
                raise SystemExit('unknown picture type ' + mime)
            data = base64.b64decode(b64)
            if base64.b64encode(data).decode() != b64:
                raise SystemExit('a picture is not stored as standard base64; cannot split it safely')
            h = hashlib.sha1(data).hexdigest()
            if h not in by_hash:
                back = text[max(0, mt.start() - 1500):mt.start()]
                if group == 'icons':                      # IMG[n]
                    label = 'IMG-%03d' % len(URI.findall(text[:mt.start()]))
                else:
                    keys = re.findall(r'^\s{0,4}"([^"\n]{1,70})"\s*:\s*[\[{]', back, re.M)
                    label = slug(keys[-1]) if keys else 'pic'
                    sub = re.search(r'name:\s*"([^"\n]{1,60})"[^\n{}]*$', back)   # an ability icon inside a gear entry
                    if sub and group == 'gear':
                        label += '--' + slug(sub.group(1), 30)
                name, k = '%s/%s' % (group, label), 1
                while name + '.' + EXT[mime] in taken:
                    k += 1; name = '%s/%s-%d' % (group, label, k)
                name += '.' + EXT[mime]
                taken.add(name)
                full = os.path.join(SRC, 'img', name)
                os.makedirs(os.path.dirname(full), exist_ok=True)
                with open(full, 'wb') as f:
                    f.write(data)
                by_hash[h] = name
            return '{{@img:img/%s}}' % by_hash[h]
        return URI.sub(one, text)

    n = [0]
    def block(mt):
        tag, attrs, inner = mt.group(1), mt.group(2), mt.group(3)
        if not inner.strip():
            return mt.group(0)
        n[0] += 1
        idm = re.search(r'\bid="([^"]+)"', attrs)
        if tag == 'style':
            rel = 'css/%02d_style.css' % n[0]
            write(rel, pictures(inner, 'page'))
            return '<%s%s>{{@file:%s}}</%s>' % (tag, attrs, rel, tag)
        if 'json' in attrs:
            rel = 'data/%02d_%s.json' % (n[0], slug(idm.group(1)) if idm else 'site-info')
            write(rel, pictures(inner, 'data'))
            return '<%s%s>{{@file:%s}}</%s>' % (tag, attrs, rel, tag)
        if re.search(r'^const ITEM_DETAILS = \{', inner, re.M):       # the main page script
            marks = []
            for i, (kind, text) in enumerate(cut_main(inner)):
                if kind == 'code':
                    first = re.search(r'/\*+[\s-]*([A-Za-z][^*\n]{2,40})|^(?:function|const|let)\s+(\w+)', text, re.M)
                    nm = 'code-' + slug((first.group(1) or first.group(2)) if first else 'misc', 30)
                    rel = 'js/main/%02d_%s.js' % (i + 1, nm)
                    write(rel, pictures(text, 'page'))
                else:
                    fname, grp = DATA_CONSTS[kind]
                    rel = 'js/main/%02d_%s.js' % (i + 1, fname)
                    write(rel, pictures(text, grp or 'page'))
                marks.append('{{@file:%s}}' % rel)
            return '<%s%s>%s</%s>' % (tag, attrs, ''.join(marks), tag)
        if idm:
            title = idm.group(1)
        else:
            cm = re.match(r'\s*/\*[=\-\s]*([^=*\n]{3,70})', inner)
            on = re.findall(r"QA\.(?:on|watch)\('([a-z_0-9]+)'", inner)
            el = re.search(r"\.id='([A-Za-z]+)'", inner)
            title = cm.group(1) if cm else ('ask-' + '-'.join(on[:2]) if on else (el.group(1) if el else
                    ('index-links' if '.idx-link' in inner[:200] else 'script')))
        rel = 'js/%02d_%s.js' % (n[0], slug(title))
        write(rel, pictures(inner, 'page'))
        return '<%s%s>{{@file:%s}}</%s>' % (tag, attrs, rel, tag)

    page = re.sub(r'<(script|style)(\b[^>]*)>(.*?)</\1>', block, html, flags=re.S)
    page = pictures(page, 'page')
    write('page.html', page)
    write('VERSION', version + '\n')
    write('SOURCE_MD5', md5 + '\n')
    print('pictures: %d image files (%d places in the page)' % (len(by_hash), len(URI.findall(html))))
    print('blocks:   %d script/style blocks' % n[0])
    r = subprocess.run([sys.executable, os.path.join(ROOT, 'build.py'), '--check',
                        '--out', os.path.join(SRC, '..', '.split_check.html')], cwd=ROOT)
    try:
        os.remove(os.path.join(ROOT, '.split_check.html'))
    except OSError:
        pass
    sys.exit(r.returncode)

if __name__ == '__main__':
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    main(sys.argv[1])
