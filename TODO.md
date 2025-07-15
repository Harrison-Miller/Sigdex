* fix desktop view
* support dark mode
* spinner for page load
* math hammer on warscrolls
* report error in warscroll
* back to top button

* data issues
  * KO regiment options are incorrect/to permissive
  * skitterstrand shouldn't be reinforceable
  * typo in scrapskuttle name (don't really care now that I do it by id)
  * dracoth single model doesn't have constraints
    * rabble-rowza should be 0-1 monsters, but is any 

* regiment options todos:
  * drekki flynt, should be 0-1 frigate but is any frigate. The 0-1 skyvessel covers this, but indirectly, so we don't parse it correctly.

* list builder todos:
  * GameView - show rules and, non duplicate entries, etc.
  * SoG enhancement table rule
  * notes option for the list and for each unit/renaming a unit: My cool hero name (actual unit name)
  * don't allow enhancements taken from different tables in the same category.
  * duplicate unit button (maybe in unit settings)

* all enhancement tables should probably work the same way
  * consider parsing the constraints on them, it might help us figure what armies can take more. Or when tables are mutually exclusive etc.

* parse weird AoR things
  * certain unique in aor may take enhancements (I'm not sure if this is a thing still)
  * gainging a keyword? This isn't super important

* AoR todo
  * lofnir regiment option seems messed up, might be a data issue
  * murkvast regiments seem messed up
  * murkvast skumdrek, not marked as required general
    * I think this is just a data issue

* fix list button sizing in list regiment

* variants deployment

* add a little champion tag to weapon tables. I'm not sure how I want to do this.
It'd be nice to add it as a weapon ability. But that would be confusing with companion.

* improve import UI - so it auto names list if possible and have a confirm with list of units or something, center buttons etc.

* override button to unit picker

* add timestamps to lists and list item and sort by that, instead of it being random

* "make a list" button on army page

* double or half weapon options when toggling reinforce

* default battle tactic cards (app settings)

* validate grouped weapon options have exactly max selections