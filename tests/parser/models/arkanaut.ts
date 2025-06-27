export const akranautConstraints = `
    <selectionEntry type="unit" name="Arkanaut Company" id="a">
      <selectionEntries>
        <selectionEntry type="model" name="Arkanaut" id="b">
          <selectionEntries>
            <selectionEntry type="upgrade" name="Skypike" id="c">
              <constraints>
                <constraint type="max" value="1" scope="a" id="d"/>
                <constraint type="max" value="1" scope="parent" id="e"/>
              </constraints>
              <modifiers>
                <modifier type="increment" value="1" field="d">
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
            <selectionEntry type="upgrade" name="Privateer Pistol" id="h">
              <constraints>
                <constraint type="min" value="1" scope="parent" id="i"/>
                <constraint type="max" value="1" scope="parent" id="j"/>
              </constraints>
              <modifiers>
                <modifier type="set" value="true">
                  <conditionGroups>
                    <conditionGroup type="or">
                      <conditions>
                        <condition type="atLeast" value="1" scope="parent" childId="c"/>
                        <condition type="atLeast" value="1" scope="parent" childId="k"/>
                        <condition type="atLeast" value="1" scope="parent" childId="l"/>
                      </conditions>
                    </conditionGroup>
                  </conditionGroups>
                </modifier>
                <modifier type="set" value="0" field="i">
                  <conditionGroups>
                    <conditionGroup type="or">
                      <conditions>
                        <condition type="atLeast" value="1" scope="parent" childId="c"/>
                        <condition type="atLeast" value="1" scope="parent" childId="k"/>
                        <condition type="atLeast" value="1" scope="parent" childId="l"/>
                      </conditions>
                    </conditionGroup>
                  </conditionGroups>
                </modifier>
                <modifier type="set" value="0" field="j">
                  <conditionGroups>
                    <conditionGroup type="or">
                      <conditions>
                        <condition type="atLeast" value="1" scope="parent" childId="c"/>
                        <condition type="atLeast" value="1" scope="parent" childId="k"/>
                        <condition type="atLeast" value="1" scope="parent" childId="l"/>
                      </conditions>
                    </conditionGroup>
                  </conditionGroups>
                </modifier>
              </modifiers>
            </selectionEntry>
            <selectionEntry type="upgrade" name="Arkanaut Hand Weapon" id="m">
              <constraints>
                <constraint type="min" value="1" scope="parent" id="n"/>
                <constraint type="max" value="1" scope="parent" id="o"/>
              </constraints>
              <modifiers>
                <modifier type="set" value="true">
                  <conditions>
                    <condition type="atLeast" value="1" scope="parent" childId="c"/>
                  </conditions>
                </modifier>
                <modifier type="set" value="0" field="n">
                  <conditions>
                    <condition type="atLeast" value="1" scope="parent" childId="c"/>
                  </conditions>
                </modifier>
                <modifier type="set" value="0" field="o">
                  <conditions>
                    <condition type="atLeast" value="1" scope="parent" childId="c"/>
                  </conditions>
                </modifier>
              </modifiers>
            </selectionEntry>
            <selectionEntry type="upgrade" name="Aethermatic Volley Gun" id="k">
              <constraints>
                <constraint type="max" value="1" scope="a" id="p"/>
                <constraint type="max" value="1" scope="parent" id="q"/>
              </constraints>
              <modifiers>
                <modifier type="increment" value="1" field="p">
                  <repeats>
                    <repeat value="1" repeats="1" scope="a" childId="f"/>
                  </repeats>
                </modifier>
                <modifier type="set" value="0" field="q">
                  <conditions>
                    <condition type="atLeast" value="1" scope="parent" childId="g"/>
                  </conditions>
                </modifier>
              </modifiers>
            </selectionEntry>
            <selectionEntry type="upgrade" name="Light Skyhook" id="l">
              <constraints>
                <constraint type="max" value="1" scope="a" id="r"/>
                <constraint type="max" value="1" scope="parent" id="s"/>
              </constraints>
              <modifiers>
                <modifier type="increment" value="1" field="r">
                  <repeats>
                    <repeat value="1" repeats="1" scope="a" childId="f"/>
                  </repeats>
                </modifier>
                <modifier type="set" value="0" field="s">
                  <conditions>
                    <condition type="atLeast" value="1" scope="parent" childId="g"/>
                  </conditions>
                </modifier>
              </modifiers>
            </selectionEntry>
          </selectionEntries>
          <constraints>
            <constraint type="min" value="10" scope="parent" id="t"/>
            <constraint type="max" value="10" scope="parent" id="u"/>
          </constraints>
          <modifiers>
            <modifier type="increment" value="10" field="t">
              <repeats>
                <repeat value="1" repeats="1" scope="root-entry" childId="f"/>
              </repeats>
            </modifier>
            <modifier type="increment" value="10" field="u">
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

the final results should be:
- each model is armed with Privateer Pistol and Arkanaut Hand Weapon
- 1/10 models can replace Privateer Pistol with an Aethermatic Volley Gun
- 1/10 models can replace Privateer Pistol with a Light Skyhook
- 1/10 models can repalce all their weapon with a Skypike

<se type="unit" name="Arkanaut Company" id="a">
	<ses>
	<se type="model" name="Arkanaut" id="b">
		<ses>
			<se type="upgrade" name="Skypike" id="c">
				<c max="1" scope="a" id="d"/>
				<c max="1" scope="parent" id="e"/>
				<!-- allow 1 more when reinforced -->
				<m increment="1" field="d">
				<!-- champion can't take this -->
				<m set="0" field="e">
					<c childId="g">
				</m>
			</se>
			<se type="upgrade" name="Privateer Pistol" id="h">
				<!-- this is the default weapon constraint -->
				<c min="1" scope="parent" id="i"/>
				<c max="1" scope="parent" id="j"/>
				<!-- skypike or volleygun or light skyhook replaces pistol -->
				<m set="0" field="i">
					<cgs>
						<cg type="or">
							<c childId="c"/>
							<c childId="k"/>
							<c childId="l"/>
						</cg>
					</cgs>
				</m>
			</se>
			<se type="upgrade" name="Arkanaut Hand Weapon" id="m">
				<!-- this is the default weapon constraint -->
				<c min="1" scope="parent" id="n"/>
				<c max="1" scope="parent" id="o"/>
				<!-- skypike replaces pistol -->
				<m set="0" field="n">
					<c childId="c">
				</m>
				<m set="0" field="o">
					<c childId="c">
				</m>
			</se>
			<se type="upgrade" name="Aethermatic Volley Gun" id="k">
				<c max="1" scope="a" id="p"/>
				<c max="1" scope="parent" id="q"/>
				<!-- allow 1 more when reinforced -->
				<m increment="1" field="p">
				<!-- champion can't take this -->
				<m set="0" field="q">
					<c childId="g">
				</m>
			</se>
			<se type="upgrade" name="Light Skyhook" id="l">
				<c max="1" scope="a" id="r"/>
				<c max="1" scope="parent" id="s"/>'
				<!-- allow 1 more when reinforced -->
				<m increment="1" field="r">
				<!-- champion can't take this-->
				<m set="0" field="s">
					<c childId="g">
				</m>
			</se>
		</ses>
		<!--- model count -->
		<cs>
			<c type="min" value="10" scope="parent" id="t"/>
		</cs>
	</se>
	</ses>
</se>

conclusion I do need to start reading the constraints and modifiers.

while parsing we need to keep track of ids then we can switch to names.

unit:
	id: a
	models:
	- id: b
	  name: Arkanaut
	  count: 10
	  weapons:
	  - id: c
			name: Skypike
			replaces: Privateer Pistol, Arkanaut Hand Weapon
			max: 1
	  - id: h
			name: Privateer Pistol
	  - id: m
			name: Arkanaut Hand Weapon
	  - id: k
			name: Aethermatic Volley Gun
			replaces: Privateer Pistol
			max: 1
	  - id: l
			name: Light Skyhook
			max: 1
			replaces: Privateer Pistol

*/
