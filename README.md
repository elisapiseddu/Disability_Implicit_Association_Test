# Offline Disability IAT for jsPsych

Version 1.0.0

This package implements a seven-block Disability Implicit Association Test in jsPsych 8.2.3. It is designed for one central deployment to multiple tablets and can continue running after the app has been installed and cached while online.

## Important scientific status

This is an independent research implementation based on the publicly documented Project Implicit Disability IAT structure:

- categories: **Disabled Persons** and **Abled Persons**
- attributes: **Good** and **Bad**
- seven blocks: 20, 20, 20, 40, 20, 20, 40 trials
- E/I keyboard mapping
- correction required after an error
- counterbalanced combined-task order
- Greenwald, Nosek, and Banaji (2003) improved D-score calculation

It is **not an official Harvard or Project Implicit distribution**. The symbol drawings included here are original schematic replacements based on descriptions in published research. They are not copies of Project Implicit's image files. Before calling the task an exact replication, obtain the official/licensed stimulus assets from Project Implicit and replace the arrays `DISABLED_IMAGES` and `ABLED_IMAGES` in `app.js`.

## Recommended hardware

Use the same tablet model for all respondents and connect a small physical or Bluetooth keyboard. The classic IAT uses the **E** and **I** keys. A touchscreen mode is included for piloting, but changing the response device may change reaction-time properties and should not be described as an unchanged administration of the validated keyboard task.

## Files

- `index.html` — administration page
- `app.js` — task, counterbalancing, local backup, D-score
- `style.css` — tablet layout
- `sw.js` — offline cache
- `manifest.json` — installable web app metadata
- `admin.html` — exports all sessions backed up in a tablet browser
- `SCORING_AND_DATA.md` — data dictionary and scoring details
- `DEPLOYMENT.md` — central deployment to eight tablets

## Quick start on a computer

A service worker cannot be installed by double-clicking `index.html`. Serve the folder through localhost:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

The first visit must have internet access so that jsPsych 8.2.3 can be downloaded and cached. Reload once, disconnect from the internet, and confirm the task still opens.

## Data safety

At completion, the task:

1. stores a JSON backup in the tablet browser's local storage;
2. offers a CSV download;
3. offers a full JSON download.

Do not clear browser storage, uninstall the app, or reset a tablet before exporting and verifying the data. At the end of each fieldwork day, open `admin.html` and export the full device backup.

## Participant IDs

The task requires the same participant/seller ID to be entered twice and refuses to start when the two entries differ. The participant ID, enumerator ID, tablet ID, session UUID, app version, counterbalancing condition, device information, and timestamps are attached to the output.

## Adaptation checklist

Before data collection:

- confirm the exact Disability IAT version intended by the supervisor;
- obtain permission or official stimulus files if exact Project Implicit images are required;
- decide whether the category wording should remain `Disabled Persons / Abled Persons` or use the newer `Physically Disabled People / Physically Abled People` wording;
- pilot English comprehension in the target population;
- do not translate evaluative words without a separate validation plan;
- test the exact tablet and keyboard combination;
- preregister exclusion and scoring rules;
- lock the app version once data collection begins.
