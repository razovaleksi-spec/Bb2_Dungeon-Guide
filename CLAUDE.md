# Buriedbornes 2 guide - read this first (Claude Code loads it every session)

## The user and the working rules (the user said these; they win over anything else here)
- Works on a PHONE (Chrome on Android, opens the html offline as a local file), not technical, often low on credits.
- Short replies, plain words, ONE clear action at a time, short progress notes on long tasks.
- Do not guess when it can be checked. Label anything not checked HYPOTHESIS.
- ASK before changing the page. Every change = a NEW version number (v149, v150 ...); never overwrite an old version.
  Hand over the built html so the user can check it on the phone.
- Reuse the existing html format and card styles; do not invent new ones. Do not touch the Ask box during an entry task.
- Do not re-analyse what is already verified (see Current state).
- Spelling priority: 1) the in-game image, 2) the html's own spelling, 3) the user's typed text (hasty typos).
- LIST of icons or items to check = an IMAGE SHEET (picture + number + name), not a text list.
- NO DEDUPE RULE: stats / terms that show the same icon in the game use ONE stored picture (IMG[n] = src/img/icons/IMG-nnn).
- Special dungeons (Crystal Beach, Trial) never appear in the index "found in" lines. Every new ARMOR also goes in the Crystal Beach row.
- Content: only shareable facts and mechanics; no "which monster drops this item" feature (decided 2026-10-12).
  Never help edit game saves or duplicate items (anti-cheat / ban risk). Private research notes and game files never go in this repo.
- Style: cyan terms are tappable with no underline; no blue focus ring on the modal X; skills get no reroll images; do not crop the Elvabald photo.
- Footer wording: "compiled by a player". Site title: "Buriedbornes 2: Dungeon Equipment and Skills Guide".
- The repo is PUBLIC by the user's own choice (2026-11-04). Do not raise privacy again.
- The download must stay ONE offline html with every picture inside (build.py does this).

## How to make a change (every time)
1. Edit files in src/ (data in src/js/main/, Ask box features in src/js/, pictures in src/img/).
2. Bump src/VERSION (e.g. 148 -> 149), run `python3 build.py` -> Bb2dungeon-ESv4v149.html.
3. Run `node tests/ask_test.js check Bb2dungeon-ESv4v149.html`. Only the INTENDED answers may change; list them for the user.
   After the user OKs the version: `node tests/ask_test.js record <that html>` so it becomes the new baseline.
4. Commit + push (the repo is the save point now). Hand over the html.
- An html edited somewhere else (e.g. a chat): `python3 tools/split.py <file>` replaces src/ and proves the round trip (md5).
- Pictures: lossless WebP, tight square, 116x116 for icons (crop spec in the user's entry save point).

## Current state (VERIFIED 2026-11-04)
- src/ = v148 (md5 b360ff7fa525f5e3c1aedbdc4c434c75). v148 = v147 + "Did you mean" for misspelled names. NOT approved yet
  (user still has to try it on the phone). Last approval on record = v132.
- tests/golden.json = recorded from v148: 0 page errors, tables 22 / 17 / 23 / 2, 499 names x 3 forms, 168 typed questions.
  v147 against it = 13 answers differ (the 12 typo corrections + "asdkjh" wording) = as expected.
- Phone-speed test (CPU slowed 4x): first paint 0.9 s, fully loaded 7.4 s, Ask answers 0.3-0.6 s.
- Known gap: the index "Conquests (22)" is missing Land Devourer (table has 23). Not fixed yet.

## Plan (do ONE, hand over, ask before the next)
- P1 DONE 2026-11-04: split into src/ + build.py (byte-identical) + test bank.
- P2 Ask box 2.0 core: ONE understanding record {intent, names, filters (stars, slot, stat, dungeon), "no/without", "A or B",
  confidence} shared by every layer; one answer per intent, drawn ONCE (today 6 watchers rewrite answers after showing,
  35 places re-read the raw typed text). Low confidence -> "I read this as ___" + 2-3 tap choices. Follow-ups change one
  filter ("what about 6 star"). Plain "I couldn't find that". Old layers stay as fallback until the test bank passes.
- P3 UI: floating Ask button (the Ask box is ~20 phone screens down), answer right under the input, hide debug panels
  ("What I picked up", "Learning · 0 lessons"), slimmer pinned header (covers ~40 % of the screen with search bars open).
- P4 Fuller answers: "is X good", "good against <boss>", compare card for "A or B", run-count math (1% -> 69 runs = 50 %).
- P5 Speed: decode pictures only when shown (HYPOTHESIS: 7.4 s -> 2-3 s at phone speed).
- Online viewing: GitHub shows html as code. GitHub Pages (or the existing Vercel site) can show the page; not set up yet.
