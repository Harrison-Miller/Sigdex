export const protectorConstraints = `
	<selectionEntry type="unit" name="Protectors" id="a">
		<selectionEntries>
			<selectionEntry type="model" name="Protector" id="b">
				<selectionEntries>
					<selectionEntry type="upgrade" name="Starsoul Mace" id="f">
						<constraints>
							<constraint type="max" value="2" scope="a" id="g"/>
							<constraint type="max" value="1" scope="parent" id="h"/>
						</constraints>
						<modifiers>
							<modifier type="increment" value="2" field="g">
								<repeats>
									<repeat value="1" repeats="1" scope="root-entry" childId="e"/>
								</repeats>
							</modifier>
						</modifiers>
					</selectionEntry>
					<selectionEntry type="upgrade" name="Protector Stormstrike Glaive" id="i">
						<constraints>
							<constraint type="min" value="1" scope="parent" id="j"/>
							<constraint type="max" value="1" scope="parent" id="k"/>
						</constraints>
						<modifiers>
							<modifier type="set" value="true">
								<conditions>
									<condition type="atLeast" value="1" scope="parent" childId="f"/>
								</conditions>
							</modifier>
							<modifier type="set" value="0" field="j">
								<conditions>
									<condition type="atLeast" value="1" scope="parent" childId="f"/>
								</conditions>
							</modifier>
							<modifier type="set" value="0" field="k">
								<conditions>
									<condition type="atLeast" value="1" scope="parent" childId="f"/>
								</conditions>
							</modifier>
						</modifiers>
					</selectionEntry>
				</selectionEntries>
				<constraints>
					<constraint type="min" value="5" scope="parent" id="c"/>
					<constraint type="max" value="5" scope="parent" id="d"/>
				</constraints>
				<modifiers>
					<modifier type="increment" value="5" field="c">
						<repeats>
							<repeat value="1" repeats="1" scope="root-entry" childId="e"/>
						</repeats>
					</modifier>
					<modifier type="increment" value="5" field="d">
						<repeats>
							<repeat value="1" repeats="1" scope="root-entry" childId="e"/>
						</repeats>
					</modifier>
				</modifiers>
			</selectionEntry>
		</selectionEntries>
	</selectionEntry>`;

/* break down and thoughts on implementation:

<se type="entry" name="Protectors" id="a">
	<ses>
		<!-- model groups -->
		<se type="model" name="Protector" id="b">
			<!- weapons -->
			<ses>
				<se type="upgrade" name="Starsoul Mace" id="f">
					<!-- constraint with scope unit id is the max number of this weapon in the unit -->
					<!-- the other max is used for making this mutually exclusive per a model -->
					<cs>
						<cs type="max" value="2" scope="a" id="g"/>
						<cs type="max" value="1" scope="parent" id="h"/>
					</cs>
					<ms>
						<!-- this is the amount it increments per a reinforcement -->
						<m type="increment" value="2" field="g">
							<repeats>
								<repeat value="1" repeats="1" scope="root-entry" childId="e"/>
							</repeats>
						</m>
						<m type="set" value="0" field="h">
							<conditions>
								<condition type="atLeast" value="1" scope="parent" childId="f"/>
							</conditions>
						</m>
					</ms>
				</se>
				<se type="upgrade" name="Protector Stormstrike Glaive" id="i">
					<!-- having min max means this is the default weapon -->
					<cs>
						<cs type="min" value="1" scope="parent" id="j"/>
						<cs type="max" value="1" scope="parent" id="k"/>
					</cs>
					<!-- a bunch of modifier junk that just means its mutually exclusive with the other option -->
				</se>
			</ses>
			<!-- model count -->
			<cs>
				<cs type="min" value="5" scope="parent" id="c"/>
				<cs type="max" value="5" scope="parent" id="d"/>
			</cs>
		</se>
	</ses>
</se>

When the scope is parent it applies to the parent selectionEntry

unit:
	models:
	- id: a
	  name: Protector
	  weapons:
		- id: f
		  name: Starsoul Mace
		  count: 2
		- id: i
		  name: Protector Stormstrike Glaive
	  count: 5
*/
