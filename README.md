# Disability IAT — Version 4.0 (code-only update)

This folder contains only the code files. Keep the 16 JPG photographs already uploaded to the GitHub repository.

Upload and replace these files in the repository root:

- `index.html`
- `app.js`
- `style.css`
- `sw.js`
- `manifest.json`
- `admin.html`

Do **not** delete the 16 JPG files.

Version 4 checks that every photograph exists before the test begins. If a filename is missing or different, the setup page lists the exact missing filename.

After committing, open the GitHub Pages URL with `?v=40`, for example:

`https://elisapiseddu.github.io/Disability_Implicit_Association_Test/?v=40`

Use a private window for the first check, or unregister the previous service worker once. Then open the test online once so Version 4 and the photographs are cached for offline use.


## Version 5 data-safety workflow

After every completed IAT, the application does two things:

1. Saves the complete session in this browser's local storage.
2. Attempts to download an individual participant CSV automatically. If Android blocks the automatic download, tap **Download participant CSV again** on the completion screen.

At the end of each fieldwork day, open `admin.html`, select the collection date, and tap **Export selected day as combined CSV**. This creates one daily CSV containing the summary row and all trial rows for every stored session from that date. Exporting does not delete the browser copies.

Do not clear Chrome/site data or use the **Clear all stored sessions** button until files have been transferred and checked. Browser storage is an important backup, but it is still lost if the browser app data is cleared or the tablet is reset/lost.
