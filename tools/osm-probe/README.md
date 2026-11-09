# OSM coverage probe (read-only, standalone)

Measures how many coaching-type businesses OpenStreetMap actually has for Guwahati, and how complete their
website / phone / email fields are. Not imported by the app; changes nothing.

```bash
node tools/osm-probe/probe.mjs --selftest     # offline check of the counting logic (synthetic data only)
mkdir -p /tmp/osm && cd /tmp/osm && node <repo>/tools/osm-probe/probe.mjs   # live run (Node 18+), writes summary.md here
```

Run the live probe from a scratch folder (not inside the repo) so its output files are not committed by accident.
Optional: `OSM_PROBE_CONTACT="you@example.com"` so Overpass operators can reach you. Data © OpenStreetMap contributors (ODbL 1.0).
See `docs/PROSPECTS-PLAN.md`.
