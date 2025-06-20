export const stormfiendConstraints = `
		<selectionEntry type="unit" name="Stormfiends" id="a">
      <selectionEntries>
        <selectionEntry type="model" name="Stormfiend" id="b">
          <constraints>
            <constraint type="min" value="1" scope="parent" id="c"/>
            <constraint type="max" value="1" scope="parent" id="d"/>
          </constraints>
          <selectionEntryGroups>
            <selectionEntryGroup name="Wargear Options" id="e">
              <selectionEntries>
                <selectionEntry type="upgrade" name="Ratling Cannons and Clubbing Blows" id="f">
                  <selectionEntries>
                    <selectionEntry type="upgrade" name="Ratling Cannons" id="g">
                      <constraints>
                        <constraint type="min" value="1" scope="parent" id="h"/>
                        <constraint type="max" value="1" scope="parent" id="i"/>
                      </constraints>
                    </selectionEntry>
                    <selectionEntry type="upgrade" name="Clubbing Blows" id="j">
                      <constraints>
                        <constraint type="min" value="1" scope="parent" id="k"/>
                        <constraint type="max" value="1" scope="parent" id="l"/>
                      </constraints>
                    </selectionEntry>
                  </selectionEntries>
                </selectionEntry>
                <selectionEntry type="upgrade" name="Grinderfists" id="m">
                  <selectionEntries>
                    <selectionEntry type="upgrade" name="Grinderfists" id="n">
                      <constraints>
                        <constraint type="min" value="1" scope="parent" id="o"/>
                        <constraint type="max" value="1" scope="parent" id="p"/>
                      </constraints>
                    </selectionEntry>
                  </selectionEntries>
                </selectionEntry>
              </selectionEntries>
              <constraints>
                <constraint type="min" value="1" scope="parent" id="q"/>
                <constraint type="max" value="1" scope="parent" id="r"/>
              </constraints>
            </selectionEntryGroup>
          </selectionEntryGroups>
          <modifiers>
            <modifier type="increment" value="1" field="c">
              <repeats>
                <repeat value="1" repeats="1" scope="root-entry" childId="s"/>
              </repeats>
            </modifier>
            <modifier type="increment" value="1" field="d">
              <repeats>
                <repeat value="1" repeats="1" scope="root-entry" childId="s"/>
              </repeats>
            </modifier>
          </modifiers>
        </selectionEntry>
        <selectionEntry type="model" name="Stormfiend" id="t">
          <constraints>
            <constraint type="min" value="1" scope="parent" id="u"/>
            <constraint type="max" value="1" scope="parent" id="v"/>
          </constraints>
          <selectionEntryGroups>
            <selectionEntryGroup name="Wargear Options" id="w">
              <selectionEntries>
                <selectionEntry type="upgrade" name="Warpfire Projectors and Clubbing Blows" id="x">
                  <selectionEntries>
                    <selectionEntry type="upgrade" name="Warpfire Projectors" id="y">
                      <constraints>
                        <constraint type="min" value="1" scope="parent" id="z"/>
                        <constraint type="max" value="1" scope="parent" id="aa"/>
                      </constraints>
                    </selectionEntry>
                    <selectionEntry type="upgrade" name="Clubbing Blows" id="ab">
                      <constraints>
                        <constraint type="min" value="1" scope="parent" id="ac"/>
                        <constraint type="max" value="1" scope="parent" id="ad"/>
                      </constraints>
                    </selectionEntry>
                  </selectionEntries>
                </selectionEntry>
                <selectionEntry type="upgrade" name="Windlaunchers and Clubbing Blows" id="ae">
                  <selectionEntries>
                    <selectionEntry type="upgrade" name="Windlaunchers" id="af">
                      <constraints>
                        <constraint type="min" value="1" scope="parent" id="ag"/>
                        <constraint type="max" value="1" scope="parent" id="ah"/>
                      </constraints>
                    </selectionEntry>
                    <selectionEntry type="upgrade" name="Clubbing Blows" id="ai">
                      <constraints>
                        <constraint type="min" value="1" scope="parent" id="aj"/>
                        <constraint type="max" value="1" scope="parent" id="ak"/>
                      </constraints>
                    </selectionEntry>
                  </selectionEntries>
                </selectionEntry>
              </selectionEntries>
              <constraints>
                <constraint type="min" value="1" scope="parent" id="al"/>
                <constraint type="max" value="1" scope="parent" id="am"/>
              </constraints>
            </selectionEntryGroup>
          </selectionEntryGroups>
          <modifiers>
            <modifier type="increment" value="1" field="u">
              <repeats>
                <repeat value="1" repeats="1" scope="root-entry" childId="s"/>
              </repeats>
            </modifier>
            <modifier type="increment" value="1" field="v">
              <repeats>
                <repeat value="1" repeats="1" scope="root-entry" childId="s"/>
              </repeats>
            </modifier>
          </modifiers>
        </selectionEntry>
        <selectionEntry type="model" name="Stormfiend" id="an">
          <constraints>
            <constraint type="min" value="1" scope="parent" id="ao"/>
            <constraint type="max" value="1" scope="parent" id="ap"/>
          </constraints>
          <selectionEntryGroups>
            <selectionEntryGroup name="Wargear Options" id="aq">
              <selectionEntries>
                <selectionEntry type="upgrade" name="Doomflayer Gauntlets" id="ar">
                  <selectionEntries>
                    <selectionEntry type="upgrade" name="Doomflayer Gauntlets" id="as">
                      <constraints>
                        <constraint type="min" value="1" scope="parent" id="at"/>
                        <constraint type="max" value="1" scope="parent" id="au"/>
                      </constraints>
                    </selectionEntry>
                  </selectionEntries>
                </selectionEntry>
                <selectionEntry type="upgrade" name="Shock Gauntlets" id="av">
                  <selectionEntries>
                    <selectionEntry type="upgrade" name="Shock Gauntlets" id="aw">
                      <constraints>
                        <constraint type="min" value="1" scope="parent" id="ax"/>
                        <constraint type="max" value="1" scope="parent" id="ay"/>
                      </constraints>
                    </selectionEntry>
                  </selectionEntries>
                </selectionEntry>
              </selectionEntries>
              <constraints>
                <constraint type="min" value="1" scope="parent" id="az"/>
                <constraint type="max" value="1" scope="parent" id="ba"/>
              </constraints>
            </selectionEntryGroup>
          </selectionEntryGroups>
          <modifiers>
            <modifier type="increment" value="1" field="ao">
              <repeats>
                <repeat value="1" repeats="1" scope="root-entry" childId="s"/>
              </repeats>
            </modifier>
            <modifier type="increment" value="1" field="ap">
              <repeats>
                <repeat value="1" repeats="1" scope="root-entry" childId="s"/>
              </repeats>
            </modifier>
          </modifiers>
        </selectionEntry>
      </selectionEntries>
    </selectionEntry>`;

/* break down and thoughts on implementation:
<se type="unit" name="Stormfiends" id="a">
  <ses>
    <se type="model" name="Stormfiend" id="b">
      <segs>
        <seg>
          <ses>
            <se type="upgrade" name="Ratling Cannons and Clubbing Blows" id="f">
              <ses>
                <se type="upgrade" name="Ratling Cannons" id="g">
                  <!-- constraint min 1 max 1 -->
                </se>
                <se type="upgrade" name="Clubbing Blows" id="j">
                  <!-- constraint min 1 max 1 -->
                </se>
              </ses>
              <!-- constraint min 1 max 1 -->
            </se>
            <se type="upgrade" name="Grinderfists" id="m">
              <ses>
                <se type="upgrade" name="Grinderfists" id="n">
                </se>
              </ses>
            </se>
          </ses>
        </seg>
      </segs>
    </se>
    <se type="model" name="Stormfiend" id="t">
    </se>
    <se type="model" name="Stormfiend" id="an">
    </se>
  </ses>
</se>

we get 3 separate model entries each is named the same thats why we need to use the id to differentiate them

each model in the unit has its own constraints and modifiers for unit size.
the each are size 1 and increase by 1 for reinforcements.

because each variant is its on se we don't have to have complex mutually exclusive constraints.

instead we do min/max 1 scope=parent for everything meaning it.

I guess the trick to consider is that options inside of an seg are always mutually exclusive (at least for our needs).

We don't really care about the nested breakdown of the options inside of the and options. I'm not sure how we would decide to stop at this point.

unit:
  models:
    - id: b
      name: Stormfiend
      weapons:
        - id: f
          name: Ratling Cannons and Clubbing Blows
          max: 1
        - id: m
          name: Grinderfists
      count: 1
    - id: t
      name: Stormfiend
      weapons:
        - id: x
          name: Warpfire Projectors and Clubbing Blows
          max: 1
        - id: ae
          name: Windlaunchers and Clubbing Blows
      count: 1
    - id: an
      name: Stormfiend
      weapons:
        - id: ar
          name: Doomflayer Gauntlets
          max: 1
        - id: av
          name: Shock Gauntlets
      count: 1

all these weapon options are mutually exclusive but the parsing would recognize them as
both default they way we've though about it so far min/max 1 scope=parent

for thunderers we could determine if something was mutually exclusive by checkeing melee/ranged weapons.
I don't think that works here.

We talked about seg being a shortuct for determing things that are mutually exclusive.
if that's the case we just choose one of the options to have a max and the other to be the default.

we'll just decide it's the first entry.

for Doomflayer Guantlets and Shock Guantlets the previous rule of mutually exclusive between melee and ranged works since they're both melee. But it's still in an seg so both rules apply.
*/
