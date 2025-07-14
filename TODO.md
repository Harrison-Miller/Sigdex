* fix desktop view
* support dark mode
* spinner for page load
* math hammer on warscrolls
* report error in warscroll
* back to top button

* data issues
  * KO regiment options are incorrect/to permissive
  * skitterstrand shouldn't be reinforceable
  * typo in scrapskuttle name
  * dracoth single model doesn't have constraints

* regiment options todos:
  * drekki flynt, should be 0-1 frigate but is any frigate. The 0-1 skyvessel covers this, but indirectly, so we don't parse it correctly.
  * rabble-rowza should be 0-1 monsters, but is any
  * trugg says any mollog which is a legends unit, can probably be fixed by filtering legends units from the categories list (might not be the easiest because of the order things happen)
  * trugg says any dankhold instead of 0-1, this is a subhero though it's a specifically named one not like "moon clan agitator".

* list builder todos:
  * GameView - show rules and, non duplicate entries, etc.
  * regiments of renown
  * SoG enhancement table rule
  * notes option for the list and for each unit/renaming a unit: My cool hero name (actual unit name)
  * don't allow enhancements taken from different tables in the same category.

* set default weapon options on the unit detail page

* all enhancement tables should probably work the same way
  * consider parsing the constraints on them, it might help us figure what armies can take more. Or when tables are mutually exclusive etc.

* parse weird AoR things
  * unique may take enhancements (I'm not sure if this is a thing still)
  * gainging a keyword? This isn't super important

* repeated units like kragnos need to accumulate their keywords (each army has him repeated, but with their own keyword). Same with nagash.

* AoR todo
  * lofnir regiment option seems messed up, might be a data issue
  * murkvast regiments seem messed up
  * murkvast skumdrek, not marked as required general
    * I think this is just a data issue

* fix list button sizing in list regiment

* big drogg fort-kicka is big drogg fort-kicker in the battle profiles with points.

* variants deployment

* add a little champion tag to weapon tables. I'm not sure how I want to do this.
It'd be nice to add it as a weapon ability. But that would be confusing with companion.

* RoR todos:
  * points calculation
  * ror unit settings
  * validation
  * import/export
  * fix big drogg fort-kicka
