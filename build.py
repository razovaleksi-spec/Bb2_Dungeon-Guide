"""Build the ONE offline html from src/ (every picture, script and style is put back inside the file).

    python3 build.py            -> writes Bb2dungeon-ESv4v<VERSION>.html next to this file
    python3 build.py --check    -> same, then checks the md5 equals src/SOURCE_MD5 (proves nothing changed)
    python3 build.py --out x.html

The result needs no internet and no other files: download it and open it on a phone.
"""
import re, sys, os, base64, hashlib

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')
MIME = {'webp': 'image/webp', 'jpg': 'image/jpeg', 'png': 'image/png', 'gif': 'image/gif'}

def read(rel):
    with open(os.path.join(SRC, rel), encoding='utf-8', newline='') as f:
        return f.read()

def build():
    page = read('page.html')
    page = re.sub(r'\{\{@file:([^}]+)\}\}', lambda m: read(m.group(1)), page)
    cache = {}
    def img(m):
        rel = m.group(1)
        if rel not in cache:
            with open(os.path.join(SRC, rel), 'rb') as f:
                data = f.read()
            cache[rel] = 'data:%s;base64,%s' % (MIME[rel.rsplit('.', 1)[1]], base64.b64encode(data).decode())
        return cache[rel]
    page = re.sub(r'\{\{@img:([^}]+)\}\}', img, page)
    left = re.findall(r'\{\{@(?:file|img):[^}]+\}\}', page)
    if left:
        raise SystemExit('markers left over: %s' % left[:3])
    return page.encode('utf-8')

def main(argv):
    out = None
    if '--out' in argv:
        out = argv[argv.index('--out') + 1]
    version = read('VERSION').strip()
    out = out or os.path.join(ROOT, 'Bb2dungeon-ESv4v%s.html' % version)
    data = build()
    with open(out, 'wb') as f:
        f.write(data)
    md5 = hashlib.md5(data).hexdigest()
    print('built %s  %s bytes  md5 %s' % (os.path.basename(out), format(len(data), ','), md5))
    if '--check' in argv:
        want = read('SOURCE_MD5').strip()
        if md5 != want:
            print('CHECK FAILED: expected md5 %s' % want)
            return 1
        print('CHECK OK: identical to the html it was split from')
    return 0

if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
