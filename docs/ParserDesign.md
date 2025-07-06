# Parser Design

This document describes thoughts on designing and building the parser for BSData to the creation of the structures Sigdex will use.

## V2

V2 of the parser was a composition design. A nice way of saying built while learning the structure of the data.
The data structures used a load of optional values which lead to a lot of extra complications in the vue components.
During the parsing and during rendering there is a lot of cross object lookups and searches through an array of data instead of a hashmap.
This leads to a lot of code like `const unitData = armyData.find((u) => u.name === unit.name)`

It didn't have a good mechanism for handling regiments of renown where we add units from another army to the list and have to look up things about them.

It also didn't have a good way to represent AoRs the biggest reason for this is the Faction - Library.cat was taken as the source of truth for units in the Army rather than what it is - a shared library of unit profiles. The Faction.cat & Faction - AoR.cat files need to be taken as the source of truth for what units can be included.

## Goals

- Avoid optional values that lead to undefined or null values. We can design things to be more ok with zero values. To allow for empty structs on failed hashmap lookup. Or accept undefined/null in limited capacity, but much less than before.
- Store the data in a single comprehensive object to make fetching and passing it around easier.
- Support RoRs and AoRs. Separate unit profiles and unit configuration.
- Try not to use static look tables of information like universal manifestation and army list - though to achieve grand aliance sorting we probably need that since I don't think that information is stored anywhere.
- Have a more wholistic design of the parser that considers all parts of the data from the part.

## Design

The parser will have 2 stages. Parser and Linker. There's a a lot of parts spread out that need multiple files instead of "parseUnit" need access to the game file, the lore file, the unit library and the army file. We can parse everything then link everything together and save it.

We'll store all the units by name in a map. Then each army will store its unit configuration.
