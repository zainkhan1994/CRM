# Apple Messages and calls

The exporter reads the Mac's synced Messages and call databases in read-only transactions. It never sends messages, makes calls, changes read state, or uploads data.

```sh
python3 -m venv .apple-env
.apple-env/bin/pip install pytypedstream==0.1.0
.apple-env/bin/python scripts/export-apple.py --output ~/Desktop/apple-history.json
```

Default: latest 5,000 eligible message records and all available calls. Use `--limit 0` for all eligible messages. Retracted messages, recoverable deleted messages, and system/service records are excluded. Reaction records remain identified as message updates. Attachments are indicated, not copied. Text decoding failures are reported rather than guessed.

Open CRM → Inbox → **Import Apple history** and select the exported JSON. The import replaces the previous Apple snapshot, avoiding duplicate records. Gmail data stays separate. The parent CRM page stores the JSON in IndexedDB and passes it to its sandboxed Inbox iframe. No export content is uploaded to GitHub or another service by this integration.

Imports are browser/device/origin-specific: HTTP and HTTPS are separate stores. Import the same file on your phone to see the snapshot there. This is not continuous iCloud sync. Re-run the exporter and import again to refresh. Data availability depends on what has synced to this Mac.

The text decoder uses [pytypedstream](https://github.com/dgelessus/python-typedstream), installed separately under its own license.

## Complete local backend index

```sh
.apple-env/bin/python scripts/export-apple.py --limit 0 --output /path/apple-history-complete.json
python3 scripts/index-apple.py /path/apple-history-complete.json --database /path/apple-history.sqlite --contacts v2/contacts.json
python3 scripts/query-apple.py --database /path/apple-history.sqlite --channel 'Apple Phone' --direction incoming --limit 50
python3 scripts/query-apple.py --database /path/apple-history.sqlite --query 'meeting' --after 2026-09-01 --before 2026-10-01
```

The backend index retains original records and adds full-text search plus channel/date, identity/date, and conversation/date indexes. Contact names are matched only on exact normalized phone/email keys with one unambiguous existing CRM name. It does not merge people by similar names or partial numbers. The index is local; this does not create an online API or cross-device sync.
