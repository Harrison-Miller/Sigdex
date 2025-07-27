Errors in regiment options parsed by Sigdex

# Summary of common issues

----
# ORDER

# Cities - all correct

# DoK - all correct
# TODO AoRs

# Fyreslayers - all correct
# TODO AoRs

# IDK - all correct
# TODO AoRs

# TODO
# KO - skip until book

# LRL - all correct

# Seraphon - all correct

# Stormcast - all correct
# TODO suplement
# TODO AoRs

# sylvaneth - all correct

----
# CHAOS

# Blades of Khorne - after book

# Tzeentch - all correct

# Slaanesh - all correct

# Nurgle - all correct

# Skaven - all correct

# S2D - all correct 
* Ogroid Myrmidon should be any monsters - this is a data issue, this may be a me problem now

----
# DEATH

# FEC - all correct

# Nighthaunt - technically correct
* shows 0-1 black coach and 0-1 black coach (sog). This is technically still correct because sog and normal unit are mutually exclusive list wide.
	* we could deduplicate this and change the logic in the unit picker and validation to consider them the same unit i.e) name === unitName + sog
	* then remove the sog one from reg options

# OBR - all correct

# SBGL
* bloodseeker palanquin missing all options - data issue
* cado and hallow king can not be in the same army - need to implement validation and stuff for it, might just make a it special case instead of parsin
* radakur the beast and wolf can not be in the same army

----
# Destruction

# GSG
* rabble rowza should be 0-1 monster, but is any - this is a data issue

# IJ - all correct

# Kruleboyz - technically correct
* hobgrot slitta boss should be 0-1 monster, but is any monster. Because kbz has no non-hero monsters, this regiment option doesn't matter.

# Ogors - all correct

# Sons - all correct
