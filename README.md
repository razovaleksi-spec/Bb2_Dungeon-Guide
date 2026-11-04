# Buriedbornes 2: Dungeon Equipment and Skills Guide

An unofficial guide, compiled by a player: which weapons, armors, accessories and skills drop in every dungeon,
disaster, conquest and special dungeon, with gear cards, skill cards, status terms and an offline Ask box.

## Use it offline
Download the newest `Bb2dungeon-ESv4v<number>.html` file (one file, about 18 MB) and open it in your phone's
browser. Every picture and the Ask box are inside that one file: no internet and no other files are needed.

## How this repo is organised (for editing)
| Folder | What is in it |
|---|---|
| `src/page.html` | the page skeleton |
| `src/js/main/` | the guide data (dungeon tables, gear, skills, stats, terms, loot) and the card / table code |
| `src/js/` | the Ask box and the other page features, one file per feature |
| `src/data/` | data the Ask box reads (knowledge rows, rules, the small intent model) |
| `src/css/` | styles |
| `src/img/` | every picture as an image file (`gear/`, `skills/`, `icons/` = the shared `IMG[n]` icons, `reroll/`, ...) |
| `build.py` | puts everything back into ONE offline html |
| `tools/split.py` | turns an html made elsewhere back into `src/` |
| `tests/` | the test bank (`ask_test.js`, `questions.json`, `golden.json`) |

```
python3 build.py --check                          # rebuild the html; --check proves it equals the html src/ came from
node tests/ask_test.js check Bb2dungeon-ESv4v148.html   # 0 errors, same tables, same Ask box answers
python3 tools/split.py Bb2dungeon-ESv4v150.html   # import an html that was edited somewhere else
```
