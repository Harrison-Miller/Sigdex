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

- data issues
  - KO regiment options are incorrect/to permissive
  - skitterstrand shouldn't be reinforceable
  - typo in scrapskuttle name
  - dracoth single model doesn't have constraints

- regiment options todos:
  - drekki flynt, should be 0-1 frigate but is any frigate. The 0-1 skyvessel covers this, but indirectly, so we don't parse it correctly.
  - rabble-rowza should be 0-1 monsters, but is any
  - trugg says any mollog which is a legends unit, can probably be fixed by filtering legends units from the categories list (might not be the easiest because of the order things happen)
  - trugg says any dankhold instead of 0-1, this is a subhero though it's a specifically named one not like "moon clan agitator".

- list builder todos:
  - disbale/remove already selected 0-1 unit from the unit picker.
  - GameView - show rules and, non duplicate entries, etc.
  - armies of renown - requires parsing armies of renow
  - regiments of renown
  - SoG enhancement table rule
  - notes option for the list and for each unit/renaming a unit: My cool hero name (actual unit name)
  - don't allow enhancements taken from different tables in the same category.
  - limit list name length to like 30 characters

- set default weapon options on the unit detail page

- all enhancement tables should probably work the same way
  - consider parsing the constraints on them, it might help us figure what armies can take more. Or when tables are mutually exclusive etc.

- account for shared abilities like wall crawler in gloomspite gitz
