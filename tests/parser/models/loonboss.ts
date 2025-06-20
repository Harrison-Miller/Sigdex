export const loonbossConstraints = `
		<selectionEntry type="unit" name="Loonboss" id="a">
			<selectionEntries>
				<selectionEntry type="model" name="Loonboss" id="b">
					<selectionEntries>
						<selectionEntry type="upgrade" name="Moon-slicer" id="c">
							<constraints>
								<constraint type="min" value="1" scope="parent" id="d"/>
								<constraint type="max" value="1" scope="parent" id="e"/>
							</constraints>
						</selectionEntry>
					</selectionEntries>
					<constraints>
						<constraint type="min" value="1" scope="parent" id="f"/>
						<constraint type="max" value="1" scope="parent" id="g"/>
					</constraints>
				</selectionEntry>
			</selectionEntries>
		</selectionEntry>`;
/* break down and thoughts on implementation:

this is a hero with one weapon and the xml is very simple.

It's almost identical to squig herd but only has one model type.

the model count is still inside the model group.

the weapon constraint is still set to 1. 

there are no modifiers or repeats because a hero can't be reinforced.

the yaml data model would look similar:

unit:
  models:
	- id: a
	  name: Loonboss
	  weapons:
		- id: b
		  name: Moon-slicer
	  count: 1

*/
