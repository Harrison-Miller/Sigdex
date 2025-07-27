* fix desktop view
* spinner for page load
* math hammer on warscrolls
* back to top button

* data issues
  * KO regiment options are incorrect/to permissive
  * rabble-rowza should be 0-1 monsters, but is any 

* regiment options todos:
  * drekki flynt, should be 0-1 frigate but is any frigate. The 0-1 skyvessel covers this, but indirectly, so we don't parse it correctly.

* list builder todos:
  * GameView - show rules and, non duplicate entries, etc.

  * notes option for the list and for each unit/renaming a unit: My cool hero name (actual unit name)
  * don't allow enhancements taken from different tables in the same category.

* all enhancement tables should probably work the same way
  * consider parsing the constraints on them, it might help us figure what armies can take more. Or when tables are mutually exclusive etc.

* variants deployment

* under consideration not sure these are needed or good ideas
  * "make a list" button on army page
  * default battle tactic cards (app settings)


* make back button work in an explicit fashion based on the page not just calling router.back()

* reintroduce prettier/fix formattings

* link enhancement tables by id not name - incase we rename with sog suffix

# v9 release todo
* duplicate list button - doing this from list settings is tricky because of router history
* manage lists from list list (delete/duplicate)

* double or half weapon options when toggling reinforce - I'm not sure this is a good idea, the halfing gets a bit complicated

* filter bar standardization

* finish fixing all the regiment option stuff - almost done, just aors and supplements

* favicon

* toggle for fancy text
