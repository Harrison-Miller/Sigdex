export const liberatorConstraints = `
		<selectionEntry type="unit" name="Liberators" id="a">
			<selectionEntries>
			<selectionEntry type="model" name="Liberator" id="b">
				<selectionEntries>
				<selectionEntry type="upgrade" name="Grandhammer" id="c">
					<constraints>
					<constraint type="max" value="1"  scope="a"  id="d"/>
					<constraint type="max" value="1"  scope="parent"  id="e"/>
					</constraints>
					<modifiers>
					<modifier type="increment" value="1" field="d">
						<repeats>
						<repeat value="1" repeats="1"  scope="a" childId="f"  />
						</repeats>
					</modifier>
					<modifier type="set" value="0" field="e">
						<conditions>
						<condition type="atLeast" value="1"  scope="parent" childId="g" />
						</conditions>
					</modifier>
					</modifiers>
				</selectionEntry>
				<selectionEntry type="upgrade" name="Warhammer" id="h">
					<constraints>
					<constraint type="min" value="1"  scope="parent"  id="a-min" />
					<constraint type="max" value="1"  scope="parent"  id="a-max" />
					</constraints>
					<modifiers>
					<modifier type="set" value="true" >
						<conditions>
						<condition type="atLeast" value="1"  scope="parent" childId="c" />
						</conditions>
					</modifier>
					<modifier type="set" value="0" field="a-min">
						<conditions>
						<condition type="atLeast" value="1"  scope="parent" childId="c" />
						</conditions>
					</modifier>
					<modifier type="set" value="0" field="a-max">
						<conditions>
						<condition type="atLeast" value="1"  scope="parent" childId="c" />
						</conditions>
					</modifier>
					</modifiers>
				</selectionEntry>
				</selectionEntries>
				<constraints>
				<constraint type="min" value="5"  scope="parent"  id="b-min-min"/>
				<constraint type="max" value="5"  scope="parent"  id="b-min-max"/>
				</constraints>
				<modifiers>
				<modifier type="increment" value="5" field="b-min-min">
					<repeats>
					<repeat value="1" repeats="1"  scope="root-entry" childId="i"  />
					</repeats>
				</modifier>
				<modifier type="increment" value="5" field="b-min-max">
					<repeats>
					<repeat value="1" repeats="1"  scope="root-entry" childId="i"  />
					</repeats>
				</modifier>
				</modifiers>
			</selectionEntry>
			</selectionEntries>
		</selectionEntry>`;

/* break down and thoughts on implementation:

<se type="entry" name="Liberators" id="a">
	<!-- model groups -->
	<ses>
		<se type="model" name="Liberator" id="b">
		<!-- weapons -->
			<ses>
				<se type="upgrade" name="Grandhammer" id="c">
					<!-- the grand hammer has two constraints that apply maximums -->
					<!-- the lowest is taken as the maximum -->
					<cs>
						<c type="max" value="1" scope="a" id="d"/>
						<c type="max" value="1" scope="parent" id="e"/>
					</cs>
					<ms>
						<!-- the increment modifier is used to increase the maximum when reinforcing -->
						<m type="increment" value="1" field="d">
							<rs>
								<r value="1" repeats="1" scope="a" childId="f"/>
							</s>
						</m>
						<!-- this actually says that the champion can't take this weapon -->
						<m type="set" value="0" field="e">
							<conditions>
								<c type="atLeast" value="1" scope="parent" childId="g"/>
							</conditions>
						</m>
					</ms>
				</se>
				<se type="upgrade" name="Warhammer" id="h">
					<cs>
						<c type="min" value="1" scope="parent" id="a-min"/>
						<c type="max" value="1" scope="parent" id="a-max"/>
					</cs>
					<!-- I'm not sure what the true value as for as it doesn't have a field -->
					<!-- the other two modifiers are used to make the warhammer mutually exclusive with the grandhammer -->
					<!-- the condition reference childId="c" which is the grandhammer -->
					<ms>
						<m type="set" value="true">
							<conditions>
								<c type="atLeast" value="1" scope="parent" childId="c"/>
							</conditions>
						</m>
						<m type="set" value="0" field="a-min">
							<conditions>
								<c type="atLeast" value="1" scope="parent" childId="c"/>
							</conditions>
						</m>
						<m type="set" value="0" field="a-max">
							<conditions>
								<c type="atLeast" value="1" scope="parent" childId="c"/>
							</conditions>
						</m>
					</ms>
				</se>
			</ses>
			<!-- model count -->
			<cs>
				<c type="min" value="5" scope="parent">
			</cs>
		</se>
	</ses>
</se>

like with squigherd and loonboss the model count for the whole unit is inside the model group.
the min/max will always be the same. the modifers at the same level just describe reinforcing and we don't need to read them
since reinforcing in AoS is extremely simple.

the main difference that we need to think about is the model group has two different weapons.

I took a look at how new recruit displays and handles this.
It literally creates 5 display boxes for the 5 models and each has the option to be
equipped with either weapon but it shows an error.

we wont worry about the modifiers that make things mutually exclusive for now since that's a pretty strong assumption for all things.

however we need to detect that something is a x in unit size weapon constraint:

if there is a modifier that modifies a max field (we know this by the field id). and the scope is the unit id.
then we know how much the weapon count max increases by when the unit is reinforced.

Also weapons that are optional won't have a min constraint

unit:
  models:
  - id: a
	name: Liberators
	weapons:
	- id: c
	  name: Grandhammer
	  max: 1 # this is the max per reinforcement of the unit
	- id: h
	  name: Warhammer
	count: 5

unit:
  models:
  - id: a
	name: Liberators
	weapons:
	- id: c
	  name: Grandhammer
	  replaces: Warhammer
	  max: 1 # this is the max per reinforcement of the unit
	- id: h
	  name: Warhammer
	count: 5

*/
