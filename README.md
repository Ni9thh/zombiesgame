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
- Use **Back up** on the page now and then. In Chrome or Edge it asks where to save the `.json` file and remembers the folder you pick (other browsers save to Downloads). **Restore** loads one back in. Keep backups in `D:\Docs\Zombie Website\Backups`.

## Setting how long it takes

Open **Schedule** under the timeline on the page:

- **Starts week / Lasts:** set each phase yourself. The end week and dates update automatically.
- **Whole plan takes __ weeks → Fit phases to this:** stretches or squeezes every phase to fit your total.
- **½× ¾× 1½× 2×:** quick way to scale the whole plan.
- **Move later phases…:** when ticked, making a phase longer pushes the phases after it back (and shorter pulls them in).
- **Back to default schedule:** returns to the weeks in `data.js`.

Your schedule saves with your progress (and in backups). To change the *default* weeks instead, edit `weeks: [start, end]` in `data.js`.

## Task pages

Every task has a **Page →** button that opens its own page (the link turns red once you've written something there). Text saves as you type. **+ Add section** adds your own headings. Use **← Back to plan** or your browser's Back button to return.

Some tasks open with ready-made sections, such as the design doc and naming conventions. Those are set in `PAGE_TEMPLATES` at the bottom of `data.js`. To give another task its own sections, add an entry there using the task's `id`. Everything else uses the `default` sections.

## Common edits

- **Add a task:** in `data.js`, add a line to a phase's `tasks` list, like
  `{ id: "b12", c: 1, t: "Sprint stamina", n: "Drain while sprinting, regen when walking" },`
  (`c: 1` = core, `c: 0` = nice to have)
- **Change a phase's weeks:** edit its `weeks: [start, end]`. Change `totalWeeks` if the whole schedule gets longer.
- **Add a dropdown choice** (e.g. a new gun class): add it to the list in `SCOPE_CATEGORIES` in `data.js`.
- **Add a scope category** (e.g. "Traps" or "Characters"): copy a block in `SCOPE_CATEGORIES`, give it a new `k`, name, and fields.
- **Change colors:** edit the variables at the top of `styles.css`.

## After editing files

Browsers keep saved copies of `styles.css`, `data.js` and `app.js`. When you change any of them, also change `SITE_VERSION` near the top of `index.html` (any new value, like today's date plus a number). That makes every browser load the new files.

## Working on more than one device (PC, iPad)

Publish sends your **whole plan**: task statuses, tasks you added, the scope sheet, task pages and the schedule.

1. On each device, click **Owner sign-in** once and paste your GitHub token. The site checks it straight away and tells you if GitHub doesn't accept it.
2. Work on any device and click **Publish** when you're done.
3. Open the site on another signed-in device and it loads the latest plan automatically.

If a device has changes of its own that weren't published, it won't overwrite them. It shows a banner so you can choose **Load the published plan** or **Keep this device's plan**. And if you publish from a device that's behind, it warns you first.

If a publish fails, a message box says **NOT published** and why. Your changes stay saved on that device, so you can try again.
