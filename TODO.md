- LotFP units special case (only relevant in AoR and points are in the AorR).
- Parse and save AoRs.
  - Do we have the restriction text? We can at least show the restricted unit text.
  - We may need to relink together lores/artifacts/traits etc that are shared.
- save state of all collapse, drop downs and tabs - be smart about it though.
- fix desktop view
- support dark mode
- spinner for page load
- math hammer on warscrolls
- report error in warscroll
- back to top button
- track scroll height

- formatting todo:
  - loonboss has a misformatted ability

- reinforceable todo/fixes:
  - loftp demons can be reinforced (they show as not reinforeable).

- data issues
  - KO regiment options are incorrect/to permissive
  - squigboss has the wrong melee profiles (copied from fungoid)
  - skitterstrand shouldn't be reinforceable
  - typo in scrapskuttle name

- regiment options todos:
  - drekki flynt, should be 0-1 frigate but is any frigate. The 0-1 skyvessel covers this, but indirectly, so we don't parse it correctly.
  - rabble-rowza should be 0-1 monsters, but is any
  - trugg says any mollog which is a legends unit, can probably be fixed by filtering legends units from the categories list (might not be the easiest because of the order things happen)
  - trugg says any dankhold instead of 0-1, this is a subhero though it's a specifically named one not like "moon clan agitator".

- parse and show other enchancement types like s2d banners or monster traits.

- list builder todos:
  - calculate violations for regiment options
  - weapon options hadnling in unit settings
  - heroic traits, artifacts handling in unit settings
  - handle other possible enhancements (we need to parse them first, also could be tricky becasue banners can be on units).
  - auxillary units
  - disbale/remove already selected 0-1 unit from the unit picker.
  - show manifestation units
  - GameView - show rules and, non duplicate entries, etc.
  - ExportView and copy to clipboard
  - armies of renown - requires parsing armies of renow
  - list importing
