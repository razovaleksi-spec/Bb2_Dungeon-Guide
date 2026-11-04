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
- GitHub is the ONLY home of the guide (user deleted the Vercel page 2026-11-04; do not mention Vercel again).
- User rule (2026-11-04): free to add new code when it makes the html or the offline Ask box work better / smarter / more aware.
- User rule (2026-11-04, after reading the old/new log): NEVER make an answer less informative. New Ask box parts ADD to the
  old answer (old answer stays complete, the new card goes on top, then "Also in the guide:"); replace only a real failure
  (no match, chat filler) or an answer about something else. Prove it: every old answer line must still be there.

## How to make a change (every time)
1. Edit files in src/ (data in src/js/main/, Ask box features in src/js/, pictures in src/img/).
2. Bump src/VERSION (e.g. 148 -> 149), run `python3 build.py` -> Bb2dungeon-ESv4v149.html.
3. Run `node tests/ask_test.js check Bb2dungeon-ESv4v149.html`. Only the INTENDED answers may change; list them for the user.
   After the user OKs the version: `node tests/ask_test.js record <that html>` so it becomes the new baseline.
4. Commit + push (the repo is the save point now). Hand over the html.
- An html edited somewhere else (e.g. a chat): `python3 tools/split.py <file>` replaces src/ and proves the round trip (md5).
- Pictures: lossless WebP, tight square, 116x116 for icons (crop spec in the user's entry save point).

## Current state (VERIFIED 2026-11-04)
- src/ = v152 (built file Bb2dungeon-ESv4v152.html). NOT approved yet. v151 APPROVED by the user 2026-11-04 ("Very good",
  add-on approach) = tests/golden.json baseline now (recorded from v151, 203 questions).
  v152 = v151 + names typed without 's ("bianca staff"), A-or-B for a main stat ("... for int"), where EACH item drops
  ("queens dress and tsukuyomi"), item by boss type ("which conquest drops ray gun"), honest "strongest" card,
  place counts, "how to get 7 star items" from the tables, index "Conquests (23)" with Land Devourer (C4 fixed).
  Wording: items only in special rows are "listed under a special dungeon"; Crystal Beach is never counted as a
  source of gear or skills (it drops only its Loot). Test vs v151: 5 changed = 1 add-on + 4 wording, nothing lost.
  v151 = v150 in ADD-ON mode: 15 of 17 core plans now wait for the old answer and add their card on top (runs maths and
  the gibberish card still replace); same-title cards: the old one always stays; supplement cards ("More about Burn")
  go below; bare_snap (43) ignores core cards when it records the subject, so "it" follow-ups stay right.
  Test vs v148: 0 page errors, 0 name readings changed, 24 answers changed: 15 keep ALL old lines + add new,
  6 random chat wording, 3 old non-answers replaced (1% runs boss table, asdkjh chat filler, "what about 6 star"
  now follows the question just before it). 0 answers lost old information.
  v150 = v149 + Ask core filter engine (stat/ability + stars + slot + place + "is there any"), rarest / most common,
  best place for N-star slot, races / jobs / origins by stat or for a tank, which places have a dungeon status,
  plain "Not in the guide" card for gibberish, player view (src/js/57_player-view.js hides test panels;
  #debug at the end of the page address shows them, #nodebug hides them), awareness layer (42) leaves core cards alone,
  free talk (46) folds renamed: "From the guide", "Other matches in the guide (may not be what you meant)".
  v149 = v148 + Ask core v2 (src/js/56_ask-core-v2-understanding.js) + QA.first in the QA core (33) + the Intent layer (26)
  no longer swaps a core card. User rule (2026-11-04): restructure freely, but a change must IMPROVE Ask box answers.
- v148 = v147 + "Did you mean" for misspelled names (md5 b360ff7fa525f5e3c1aedbdc4c434c75), not approved yet either.
- Ask core v2 = ONE understanding record (QA.understand) + conversation memory (QA.state.core2.last) + plans. It runs FIRST
  (QA.first handler, outermost __qaPre stage 1000, __qaMulti for typed AND tapped questions) and only acts when sure;
  otherwise every question goes the old way. It reuses the old engine (__qaAnswer, the strategy add-on) inside its cards.
  Its cards carry data-core2 + data-keep (chat layers leave them alone). Test hooks: QA.core2.plan(q) / .html(q) / .last().
- tests/golden.json = recorded from v148: 0 page errors, tables 22 / 17 / 23 / 2, 499 names x 3 forms, 168 typed questions.
  v147 against it = 13 answers differ (the 12 typo corrections + "asdkjh" wording) = as expected.
  v149 against it = 0 name readings changed; 13 answers changed = the 12 intended fixes + "asdkjh" (random wording only).
  v150 against it = 0 name readings changed; 25 answers changed = 14 better answers + 11 that only hide test panels or
  reword random chat lines (reviewed line by line).
  tests/questions.json has 35 more questions at the end (not in golden yet): record golden after the user OKs a version.
- Core rule learned: the core must only step in when the old answer is worse; check engineOK / __qaUnderstood first
  ("tips to survive" and "which skills give haste" were wrongly caught once and fixed).
- Phone-speed test (CPU slowed 4x): first paint 0.9 s, fully loaded 7.4 s, Ask answers 0.3-0.6 s.
- C4 FIXED in v152: the index says "Conquests (23)" and lists Land Devourer.

## Plan (do ONE, hand over, ask before the next)
- P1 DONE 2026-11-04: split into src/ + build.py (byte-identical) + test bank.
- P2 STARTED in v149 (fixed: filter follow-ups incl. chains, run-count maths, "no 7 star X" places, DEX/any-stat build +
  where to farm, vague farm -> tap choices, A-or-B for a tank, "is X good", max/cap from tooltips, crafting honesty,
  short status terms + related stats, "good against <boss>" honesty). v150 added the filter engine, rankings, statuses,
  rosters, plain unknown answer and the player view (A5 done).
- P2 Ask box 2.0 core: ONE understanding record {intent, names, filters (stars, slot, stat, dungeon), "no/without", "A or B",
  confidence} shared by every layer; one answer per intent, drawn ONCE (today 6 watchers rewrite answers after showing,
  35 places re-read the raw typed text). Low confidence -> "I read this as ___" + 2-3 tap choices. Follow-ups change one
  filter ("what about 6 star"). Plain "I couldn't find that". Old layers stay as fallback until the test bank passes.
- P3 UI: floating Ask button (the Ask box is ~20 phone screens down), answer right under the input, hide debug panels
  ("What I picked up", "Learning · 0 lessons"), slimmer pinned header (covers ~40 % of the screen with search bars open).
- P4 Fuller answers: "is X good", "good against <boss>", compare card for "A or B", run-count math (1% -> 69 runs = 50 %).
- P5 Speed: decode pictures only when shown (HYPOTHESIS: 7.4 s -> 2-3 s at phone speed).
- Online viewing: GitHub shows html as code. GitHub Pages can show the page; not set up yet (needs the work on main).
