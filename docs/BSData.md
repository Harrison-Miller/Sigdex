# BSData

[Battle Scribe Data](https://github.com/BSData/age-of-sigmar-4th) is the data the powers Sigdex. It is composed of a bunch of XML files linked together.
The BSData format is designed to support any war game system. Sigdex will only ever support Age of Sigmar. Because of this difference we can intentionally encode rules
during the parsing and display process. Instead of having to parse every node in the xml and encode all modifiers,conditions and links. We can pick and choose what we read, skipping large portions or making assumptions about the rest of the data without reading it. Then we can store the results in a simpler, condensed format that is easy to use for display purposes.

In the AoS 4th edition data repository there are a number of files. In this document we'll describe each and what pieces of data we need to pull from them to build up the
data needed to power Sigdex.

## AoS 4.gst

This is the game system schema file.

- It describes the core rules of list building in the game. e.g) must have 1 general, regiments have a leader, etc.
- It creates a schema for what a unit is, what an ability looks like, what a weapon profile looks like etc.
- It has a list of categories. Mostly keywords, both generic and faction specific, also includes some non-keyword things needed for giving list building restrictions name. e.g) Regimental Leader
- It has a list of regiments of renown, their points what armies can take them by id.
- Information about game mode, general's handbook, path to glory etc.
- Unit profiles for universal units (mostly just universal manifestations)
- Descriptions of shared rules (like crit mortals)
- Descriptions of shared profiles (keywords like fly, ward)
- battle tactic cards
- publication ids - where rules are sourced from is noted in unit profiles

### core rules conditions,modifiers

We don't care about these, because the app will encode it both in parsing and in list building/else where. We'll make assumptions

### schema for units, abilities, etc

We don't care about this for the same reason, the app will encode it inhernetly

### Categories

Categories which can be keywords, multi-keywords, formations, or names of rules/restrictions is useful.
Often units will have conditions that will reference these categories by id. We'd prefer to store them by name in our app so they are easier to display so we need to keep a map of all categories. These categories can also be found in the other files and we will need to added to the list while parsing that file.

## game modes

Within each game mode is a list of RoRs that can be taken. We will just specifically read 2025-06. We'll support selecting the gamemode in the future - but only support general's handbooks.

### RoRs

Each RoR has it's name and points. The RoRs have a bunch of conditions with childId where the childId is the id of a catalogue (the root element of the army .cat file).
I don't think an AoR ever appears here - because AoR's can't take RoRs.

### Universal units

We definitely need to parse these and put them in a special army. I think this only ever manifestations.

### Descriptions

I'd like to parse these and make a glossary/make keywords clickable.

### Publication ids

These aren't useful to us.

## Regiments of Renown.cat

A list of actual unit profiles: The only one we care about is Gotrek. The rest seem to be for something else PtG?
Has a list of units that are in any possible RoR. The unit has a set of min/max mofiers the sets the number of units of that type taken by the RoR.
Has a list of RoRs.
Each RoR has all of it's abilities and a condition the condition links to a condition on each of the units in the RoR.

The actual link to what army can take what RoR is in the AoS 4.gst

## Lores.cat

This has every single lore in the game: spell, prayer, manifestation including universal. Each lore has all of it's abilities here.
Only universal lores have points here. The points for other lores will be in their armies .cat file.

## Faction - Library.cat

A list of units profiles shared between the different versions of the army (base army and AoRs).

### Unit Profile

The unit profile describes the warscroll of the unit.
The statistics like move,health,save,control
A number of abilities
keywords
Then it gets into model groups which are somewhat complicated

#### Model Group

A unit is made up of 1 or model groups. Each model group has a number of models.
For example arkanaut company has 1 model group called arkanaut with 10 models in it.
Squig herd has 2 model groups cavesquigs with 10 models and squigherder with 2 models.

Each model group has a number of weapons. With characteristics like attacks,hit,wound,rend,damage.

Each weapon also has a number of constraints, conditions and modifiers that describe how many of a weapon can be taken.

constraint of min/max=1 means each model in the model group has that weapon.

Weapons inside of selection entry group are mutually exclusive from each other. Each model picks one of the options and the maximum allowed for the model group.
Is the model group size (picked from either totalled).

Some weapons will have a higher max and a min of 0. Meaning that they can take up to X of this weapon. This is usually set for the unit not for the model group.
But that is implied by AoS so we don't look to closesly. Within the conditions for that constraint it will usually reference the id of another weapon that the optional weapon replaces.

Directly below the model group node is a set of modifiers that describe the unit size and if it can be reinforced (it always doubles the size if it can be - because AoS).

## Faction.cat

This contains the information specific to the army or AoR. Because armies and AoRs have different unit restrictions, artifacts, battle traits etc those types of things are also here. Most imporantly this is where points are. Theoretically this allows for there to be different points in the army vs and AoR, but I don't think that's ever the case.

Artifacts
Formations
Heroic Traits
Lores (Spell, Prayer, Manifestation)
Battle Traits
Other enhancements

A list of unit configurations

A list of special categories used for restriction e.g) Moonclan agitators.

### Unit Configuration

The army has a list of units that can be taken, and their configuration for that army.

constraints, conditions, modifiers on when/how it can be taken.
e.g) In Big Waagh a kbz leader can only take kbz units, but otherwise that restriction doesn't exist.

points of the unit

If it can be reinforced there is Reinforced entryLink and a modifier to multiply points by 2

## Faction - AoR.cat

Basically the same as Faction.cat

Special consideration must be paid to things like forced general and units that must be taken.
Sometimes unique units may take enhancements in AoR, which breaks the regular rules.

### Restrict General

Some units will be marked restrict general. Meaning they can no be taken as the general.
This is the reverse of the restriction we want.
We want the validation to say you must include "this unit as your general".
Not you can't have any of these units as general, So if we find restrict general we should gather them all and save it to the army for validation.

There is also sometimes a constraint (but not always), that is more accurate for detecting this.

### Must be general if included

the condition is on the other units it adds Restrict General if that unit is taken
restrict general=abcb-73d0-2b6c-4f17
