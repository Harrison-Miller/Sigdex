export const thundererConstraints = `
		<selectionEntry type="unit" name="Grundstok Thunderers" id="a">
      <selectionEntries>
        <selectionEntry type="model" name="Grundstok Thunderer" id="b">
          <selectionEntries>
            <selectionEntry type="upgrade" name="Grundstok Mortar or Aethercannon" id="c">
              <constraints>
                <constraint type="max" value="2" scope="a" id="d"/>
                <constraint type="max" value="1" scope="parent" id="e"/>
              </constraints>
              <modifiers>
                <modifier type="increment" value="2" field="d">
                  <repeats>
                    <repeat value="1" repeats="1" scope="a" childId="f"/>
                  </repeats>
                </modifier>
                <modifier type="set" value="0" field="e">
                  <conditions>
                    <condition type="atLeast" value="1" scope="parent" childId="g"/>
                  </conditions>
                </modifier>
          </modifiers>
            </selectionEntry>
            <selectionEntry type="upgrade" name="Aethershot Rifle" id="h">
              <constraints>
                <constraint type="min" value="1" scope="parent" id="j"/>
                <constraint type="max" value="1" scope="parent" id="k"/>
              </constraints>
              <modifiers>
                <modifier type="set" value="true">
                  <conditionGroups>
                    <conditionGroup type="or">
                      <conditions>
                        <condition type="atLeast" value="1" scope="parent" childId="l"/>
                        <condition type="atLeast" value="1" scope="parent" childId="c"/>
                      </conditions>
                    </conditionGroup>
                  </conditionGroups>
                </modifier>
                <modifier type="set" value="0" field="j">
                  <conditionGroups>
                    <conditionGroup type="or">
                      <conditions>
                        <condition type="atLeast" value="1" scope="parent" childId="l"/>
                        <condition type="atLeast" value="1" scope="parent" childId="c"/>
                      </conditions>
                    </conditionGroup>
                  </conditionGroups>
                </modifier>
                <modifier type="set" value="0" field="k">
                  <conditionGroups>
                    <conditionGroup type="or">
                      <conditions>
                        <condition type="atLeast" value="1" scope="parent" childId="l"/>
                        <condition type="atLeast" value="1" scope="parent" childId="c"/>
                      </conditions>
                    </conditionGroup>
                  </conditionGroups>
                </modifier>
              </modifiers>
            </selectionEntry>
            <selectionEntry type="upgrade" name="Heavy Gun Butt" id="m">
              <constraints>
                <constraint type="min" value="1" scope="parent" id="a-min"/>
                <constraint type="max" value="1" scope="parent" id="a-max"/>
              </constraints>
            </selectionEntry>
            <selectionEntry type="upgrade" name="Aetheric Fumigator or Decksweeper" id="l">
              <constraints>
                <constraint type="max" value="2" scope="a" id="n"/>
                <constraint type="max" value="1" scope="parent" id="o"/>
              </constraints>
              <modifiers>
                <modifier type="increment" value="2" field="n">
                  <repeats>
                    <repeat value="1" repeats="1" scope="a" childId="f"/>
                  </repeats>
                </modifier>
                <modifier type="set" value="0" field="o">
                  <conditions>
                    <condition type="atLeast" value="1" scope="parent" childId="g"/>
                  </conditions>
                </modifier>
              </modifiers>
            </selectionEntry>
          </selectionEntries>
          <constraints>
            <constraint type="min" value="5" scope="parent" id="p"/>
            <constraint type="max" value="5" scope="parent" id="q"/>
          </constraints>
          <modifiers>
            <modifier type="increment" value="5" field="p">
              <repeats>
                <repeat value="1" repeats="1" scope="root-entry" childId="f"/>
              </repeats>
            </modifier>
            <modifier type="increment" value="5" field="q">
              <repeats>
                <repeat value="1" repeats="1" scope="root-entry" childId="f"/>
              </repeats>
            </modifier>
          </modifiers>
        </selectionEntry>
      </selectionEntries>
    </selectionEntry>
   `;

/* break down and thoughts on implementation:
<se type="entry" name="Grundstok Thunderers" id="a">
	<ses>
		<se type="model" name="Grundstok Thunderer" id="b">
			<!-- weapons -->
			<ses>
				<se type="upgrade" name="Grundstok Mortar or Aethercannon" id="c">
				</se>
				<se type="upgrade" name="Aethershot Rifle" id="h">
				</se>
				<se type="upgrade" name="Heavy Gun Butt" id="m">
					<!-- we have min/max = 1, scope=parent so every model has this -->
					<cs>
						<c type="min" value="1" scope="parent" id="a-min"/>
						<c type="max" value="1" scope="parent" id="a-max"/>
					</cs>
				</se>
				<se type="upgrade" name="Aetheric Fumigator or Decksweeper" id="l">
				</se>
			</ses>
			<!-- model count -->
			<cs>
				<c type="min" value="5" scope="parent" id="p"/>
				<c type="max" value="5" scope="parent" id="q"/>
			</cs>
		</se>
	</ses>
</se>

Everyone gets gun butts is obvious.
The count on mortar/fumigator is 2 which is obvious.
But parsing that the rifle is mutually exclusive with the mortar/fumigator is a bit more complex.

rifle has min/max = 1 scope=parent which usualy implies everymodel gets one.

We have to read the modifiers or do another trick

Another trick would be to have separate melee and ranged weapons and assume
they are mutually exclusive Or to just always assume a model only has one range and one melee weapon.

I like the later trick 

unit:
  models:
  - id: a
	name: Grundstok Thunderers
	weapons:
		- id: c
			name: Grundstok Mortar or Aethercannon
			max: 2
		- id: h
			name: Aethershot Rifle
			# no count means every one gets one - by default.
		- id: m
			name: Heavy Gun Butt
			# no count means every one has this weapon
		- id: l
			name: Aetheric Fumigator or Decksweeper
			max: 2
	count: 5


This parsing doesn't understand if a weapon is melee or range.
However when we go to render the information we will be able to detect that and display it correctly.
*/
