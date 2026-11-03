# Zombies Dev Plan

A local website for planning and tracking your round-based zombies game. No install or server needed.

## Open it

Double-click `index.html`. It opens in your browser. Bookmark it so you can get back to it quickly.

## Files

| File | What it's for |
|---|---|
| `index.html` | The page shell. You rarely need to touch this. |
| `data.js` | **The plan itself.** Phases, weeks, goals, milestones, tasks, rules, and the scope sheet categories and their fields. |
| `styles.css` | Colors, fonts, spacing. Colors are variables at the top (`--accent`, `--bg`, etc.). |
| `app.js` | The code that draws the page and saves your progress. |

Edit any of them in a text editor (VS Code is a good free one), save, then refresh the page.

## Where your progress is saved

Task statuses, tasks you add on the page, and everything in the scope sheet are saved in your browser (localStorage), not in the files. That means:

- Editing `data.js` won't wipe your progress. Statuses are matched by each task's `id`, so keep ids the same when you reword a task, and give new tasks a new unique id.
- Progress is tied to this browser and this file location. If you move the folder, switch browsers, or clear browsing data, it won't follow.
- Use **Back up** on the page now and then. It downloads a `.json` file. **Restore** loads one back in. Keep backups in this folder or in source control with your game.

## Common edits

- **Add a task:** in `data.js`, add a line to a phase's `tasks` list, like
  `{ id: "b12", c: 1, t: "Sprint stamina", n: "Drain while sprinting, regen when walking" },`
  (`c: 1` = core, `c: 0` = nice to have)
- **Change a phase's weeks:** edit its `weeks: [start, end]`. Change `totalWeeks` if the whole schedule gets longer.
- **Add a dropdown choice** (e.g. a new gun class): add it to the list in `SCOPE_CATEGORIES` in `data.js`.
- **Add a scope category** (e.g. "Traps" or "Characters"): copy a block in `SCOPE_CATEGORIES`, give it a new `k`, name, and fields.
- **Change colors:** edit the variables at the top of `styles.css`.
