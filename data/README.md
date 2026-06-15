# Data

Primary source: Google Sheet `Gmail 2026`, tab `Full Contact Database`.

Spreadsheet ID:

`1pqGWetnt3-UDx9FFR35xhvHtcQHWlmXx5iGIo7TnLFg`

Tab metadata observed:

- Tab: `Full Contact Database`
- Rows: 110,500
- Columns: 26
- CRM parser uses columns A:E: Domain, Date - Year-Month, Email, Label, Snippet

The deployed Apps Script includes a JSON export endpoint via `?format=json`, but direct unauthenticated export is blocked by Google/Apps Script auth in this environment. The CRM app itself reads the live sheet at runtime.
