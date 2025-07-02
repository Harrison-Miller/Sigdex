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
  - handle other possible enhancements (we need to parse them first, also could be tricky becasue banners can be on units).
  - disbale/remove already selected 0-1 unit from the unit picker.
  - GameView - show rules and, non duplicate entries, etc.
  - ExportView and copy to clipboard
  - armies of renown - requires parsing armies of renow
  - list importing
  - probably don't select a manifestation lore by default if there isn't an army one (just allow a none option).
  - regiments of renown
  - battle tactic cards
  - SoG enhancement table rule
  - notes option for the list and for each unit/renaming a unit: My cool hero name (actual unit name)
  - badge to show a unit has artifact/heroic trait
  - don't allow enhancements taken from different tables in the same category.
  - companion unit checking. Companion unit allows sub heroe's that are in the companion list. Identify the leader of the subhero group that needs to lead the regiment (it's the one with the points). Probably just mark it in some way.
  - uniques can not take enhancements

- any time we load just make it load everthing, instead of only the current army.

- set default weapon options on the unit detail page

- grouped weapon options don't currently work with reinforcing. You should be able to take 1 of each or 2 of the same. It currently assumes 2 of the same.

- all enhancement tables should probably work the same way
  - consider parsing the constraints on them, it might help us figure what armies can take more. Or when tables are mutually exclusive etc.
- summon abilitiy should probably be stored with the manifestation directly so we don't have to do lookups and vice-a-versa
- lore abilities should be stored directly in the army so we don't have to do lookups.
