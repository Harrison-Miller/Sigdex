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

- reinforceable todo/fixes:
  - loftp demons can be reinforced (they show as not reinforeable).

- weapon options todos/fixes:
  - arknaut company
    - skypike replaces both melee and ranged weapons
  - endrinriggers in bsdata there are nested weapon options. We need to split those apart
    - currently it says heavy weapons and gun butts instead of saw. It should say heavy weapons and gun buts instead of rifle and saw that or when we do the check against default we do a contains
  - same with skywardens
  - stormfiends have a similar issue to the above
  - frigate
    - skyhook only replaces sky cannon not carbines
    - there is a formatting typo on the ora y
  - ironclad is super messed up
  - should be armed with carbines, topedoes and boarding weapons
  - 1 of the following sky cannon, sky hook, volley cannon
  - gunhaller same as frigate

- lore todos:
  - parse points for lores and display it
  - make a place to display universal lores and endless spells - probably a section at the top of the army list area

- regiment options todos:
  - parse subhero options - this one is fairly easy.
  - figure out how to compute the least common denominator for keywords with other regiment options.
    - need to figure out what we're looking for and gather all possible units
    - then take the difference of all the sets of keywords to find the keyword for the regiment options
    - we also need to compute the allowed amount of the regiment option, any amount (any might actually be 0-4/5) vs 0-1 vs 0-x
