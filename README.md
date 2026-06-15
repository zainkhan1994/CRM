# CRM

Simple personal CRM built from the Gmail 2026 Google Sheet.

## Live Apps Script

The production Apps Script web app reads the `Full Contact Database` tab from spreadsheet:

`1pqGWetnt3-UDx9FFR35xhvHtcQHWlmXx5iGIo7TnLFg`

Latest deployed app URL:

https://script.google.com/macros/s/AKfycbzXWjfk2jvi5pInPfHfAf2GAvCl9fWNGstUzskX14xs-xDgCMOTgl-Z9m-wf9P8AlEK8Q/exec

## What is included

- `appscript/Code.gs` - deployed Apps Script CRM app, including sheet reader, UI renderer, interaction logic, and JSON data export endpoint.
- `appscript/Index.html` - earlier HTML UI source retained for reference.
- `appscript/remove_gmail_blueprint_labels.gs` - cleanup script from the Gmail label work.
- `data/README.md` - data source and export notes.
- `legacy-simple-crm/` - earlier static CRM prototype files.

## Data export

The Apps Script source includes `doGet(e)` support for:

`?format=json`

That endpoint emits the parsed CRM dataset from the live Google Sheet when Apps Script allows the request in the authenticated browser session.
