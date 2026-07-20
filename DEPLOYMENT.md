# Central deployment to eight tablets

## Recommended free setup: GitHub Pages + installable offline web app

You maintain one master copy on a computer. Every tablet installs the same web app from one URL.

### 1. Create a private working copy

Keep the master folder under version control. Do not edit files separately on tablets.

### 2. Publish through HTTPS

Service workers require HTTPS. A free GitHub Pages site is adequate for the application files, but check institutional policy before using any external host. The app does not upload research data to GitHub; completed data remain on the tablet unless an enumerator downloads or transfers them.

Upload the folder to a repository and enable Pages for the repository branch. The resulting URL will look like:

```text
https://YOUR-ACCOUNT.github.io/disability-iat/
```

### 3. Prepare each tablet while online

For Tablet 01 through Tablet 08:

1. Open the URL in Chrome or the tablet's supported browser.
2. Wait for the page to load completely.
3. Reload the page once.
4. Use the browser menu and choose **Add to Home screen** or **Install app**.
5. Open the installed app once.
6. Enter a test ID and complete at least several trials.
7. Turn on airplane mode.
8. close and reopen the app.
9. Confirm that it still starts and that the symbol images display.
10. Label the device physically as `TAB-01`, `TAB-02`, and so on.

The app currently uses jsPsych from a fixed public URL during the first installation. The service worker caches that exact version for later offline use.

### 4. Field workflow

For each seller:

1. Read the participant ID from REDCap.
2. Open the installed Disability IAT app.
3. Enter the participant ID twice.
4. Enter enumerator and tablet IDs.
5. confirm consent is recorded.
6. complete the task.
7. tap **Save CSV** and **Save JSON backup**.
8. verify that the files appear in the tablet's Downloads folder.
9. record an `iat_complete` indicator in REDCap.

### 5. End-of-day backup

On every tablet:

1. open `admin.html` from the app's completion page;
2. select **Export all sessions as JSON**;
3. transfer the device backup and all individual CSV files to the encrypted study computer;
4. check the expected participant IDs against REDCap;
5. keep at least two verified copies before clearing any tablet data.

## Updating the study

Update the master files, change `APP_VERSION` in `app.js`, and change the cache name in `sw.js`. Then reconnect each tablet, open the app, reload twice, and verify the displayed version in exported data.

Do not update midway through data collection unless necessary. If an update is unavoidable, document which participants used each app version.

## Fully local alternative

A local web-server app can serve this folder from each Android tablet, but that introduces another app and device-specific setup. GitHub Pages plus pre-field caching is generally simpler. A completely self-contained package would require bundling the jsPsych library file locally; this package instead caches it after the first online installation.
