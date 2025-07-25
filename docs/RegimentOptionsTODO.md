Errors in regiment options parsed by Sigdex

# Summary of common issues
* A lot of times when a specific units in a regiment option my system marks them as any instead of the amount - I think this is all fixed
* No way to handle xor regiment options
* a lot of 0-1 monster marked as any

# Cities
* Assassin should not have any regiment options - this is a data issue

# DoK - all correct

# Fyreslayers - all correct

# IDK

# KO

# LRL - all correct

# Seraphon
* kroak and slanmaster should be starpriest XOR favored spawn

# Stormcast

# sylvaneth - all correct

# Blades of Khorne

# Tzeentch - all correct

# Slaanesh
* dexcessa should be beguiler XOR synessa
* synessa should be beguiler XOR dexcessa
* sylesske should be beguiler XOR dark egoist

# Nurgle - all correct

# Skaven - all correct

# S2D

# FEC

# Nighthaunt - technically correct
* shows 0-1 black coach and 0-1 black coach (sog). This is technically still correct because sog and normal unit are mutually exclusive list wide.
	* we could deduplicate this and change the logic in the unit picker and validation to consider them the same unit i.e) name === unitName + sog
	* then remove the sog one from reg options

# OBR

# SBGL

# GSG
* rabble rowza should be 0-1 monster, but is any

# IJ - all correct

# Kruleboyz
* hobgrot slitta boss should be 0-1 monster, but is any monster. Because kbz has no non-hero monsters, this regiment option doesn't matter.

# Ogors - all correct

# Sons - all correct
