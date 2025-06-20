export const squigHerdConstraints = `
<selectionEntry type="unit" name="Squig Herd" id="a">
      <selectionEntries>
        <selectionEntry type="model" name="Cave Squig" id="b">
          <selectionEntries>
            <selectionEntry type="upgrade" name="Fang-filled Gob" id="c">
              <constraints>
                <constraint type="min" value="1" scope="parent" id="d"/>
                <constraint type="max" value="1" scope="parent" id="e"/>
              </constraints>
            </selectionEntry>
          </selectionEntries>
          <constraints>
            <constraint type="min" value="10" scope="parent" id="f"/>
            <constraint type="max" value="10" scope="parent" id="g"/>
          </constraints>
          <modifiers>
            <modifier type="increment" value="10" field="f">
              <repeats>
                <repeat value="1" repeats="1" scope="a" childId="g"/>
              </repeats>
            </modifier>
            <modifier type="increment" value="10" field="g">
              <repeats>
                <repeat value="1" repeats="1" scope="a" childId="g"/>
              </repeats>
            </modifier>
          </modifiers>
        </selectionEntry>
        <selectionEntry type="model" name="Squig Herder" id="h">
          <selectionEntries>
            <selectionEntry type="upgrade" name="Squig Prodder" id="i">
              <constraints>
                <constraint type="min" value="1" scope="parent" id="j"/>
                <constraint type="max" value="1" scope="parent" id="k"/>
              </constraints>
            </selectionEntry>
          </selectionEntries>
          <constraints>
            <constraint type="min" value="2" scope="parent" id="l"/>
            <constraint type="max" value="2" scope="parent" id="m"/>
          </constraints>
          <modifiers>
            <modifier type="increment" value="2" field="l">
              <repeats>
                <repeat value="1" repeats="1" scope="a" childId="g"/>
              </repeats>
            </modifier>
            <modifier type="increment" value="2" field="m">
              <repeats>
                <repeat value="1" repeats="1" scope="a" childId="g"/>
              </repeats>
            </modifier>
          </modifiers>
        </selectionEntry>
      </selectionEntries>
    </selectionEntry>`;

/* break down and thoughts on implementation:
<se type="entry" name="Squig Herd" id="a">
  <!-- model groups -->
  <ses>
  <se type="model" name="Cave Squig" id="b">
     <!-- weapons -->
    <ses>
      <se type="upgrade" name="Fang-filled Gob" id="c">
        <cs>
          <c type="min" value="1" scope="parent"/>
          <c type="max" value="1" scope="parent"/>
        </cs>
      </se>
    </ses>
    <!-- model count -->
    <cs>
      <c type="min" value="10" scope="parent"/>
    </cs>
  </se>
  <se type="model" name="Squig Herder" id="h">
    <!-- weapons -->
    <ses>
      <se type="upgrade" name="Squig Prodder" id="i">
        <cs>
          <c type="min" value="1" scope="parent"/>
          <c type="max" value="1" scope="parent"/>
        </cs>
      </se>
    </ses>
    <!-- model count -->
    <cs>
      <c type="min" value="2" scope="parent"/>
    </cs>
  </se>
  </ses>
</se>

the model constraints section describes the number of models in the group.
the min and max will always be the same. The modifiers section below just explains to BS that the unit can be reinforced (doubling its size once).
when implementing we can safley ignore and just look for the constraint min with scope = parent inside of the model group.

in the squig herd example the weapon constraints are not relevant, but they say 1.
i.e) but the result should be each cave squig has 1 fang-filled gob and each squig herder has 1 squig prodder. I'll have to look at other examples to see if this is always the case.

so when the min/max=1 that means each model of count has 1 of that weapon.

a unit is composed of multiple groups of models.
each model group has a count (the number of models in the group).
unit:
  models:
  - id: b
    name: Cave Squig
    weapons:
    - id: c
      name: Fang-filled Gob
    count: 10
  - id: h
    name: Squig Herder
    weapons:
    - id: i
      name: Squig Prodder
    count: 2

*/
