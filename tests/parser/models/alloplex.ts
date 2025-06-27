export const alloplexConstraints = `
<selectionEntry type="unit" name="Akhelian Allopex" id="a">
      <selectionEntries>
        <selectionEntry type="model" name="Akhelian Allopex" id="b">
          <selectionEntries>
            <selectionEntry type="upgrade" name="Barbed Hooks and Blades" id="c">
              <constraints>
                <constraint type="min" value="1" scope="parent" id="d"/>
                <constraint type="max" value="1" scope="parent" id="e"/>
              </constraints>
            </selectionEntry>
            <selectionEntry type="upgrade" name="Allopex’s Ferocious Bite" id="f">
              <constraints>
                <constraint type="min" value="1" scope="parent" id="g"/>
                <constraint type="max" value="1" scope="parent" id="h"/>
              </constraints>
            </selectionEntry>
          </selectionEntries>
          <constraints>
            <constraint type="min" value="1" scope="parent" id="i"/>
            <constraint type="max" value="1" scope="parent" id="j"/>
          </constraints>
          <selectionEntryGroups>
            <selectionEntryGroup name="Wargear Options" id="k" flatten="true">
              <selectionEntries>
                <selectionEntry type="upgrade" name="Razorshell Harpoon" id="l">
                  <selectionEntries>
                    <selectionEntry type="upgrade" name="Razorshell Harpoon" id="m">
                      <constraints>
                        <constraint type="max" value="1" scope="parent" id="n"/>
                        <constraint type="min" value="1" scope="parent" id="o"/>
                      </constraints>
                    </selectionEntry>
                  </selectionEntries>
                  <constraints>
                    <constraint type="max" value="1" scope="parent" id="p"/>
                  </constraints>
                </selectionEntry>
                <selectionEntry type="upgrade" name="Retarius Net Launcher" id="q">
                  <constraints>
                    <constraint type="max" value="1" scope="parent" id="r"/>
                  </constraints>
                  <selectionEntries>
                    <selectionEntry type="upgrade" name="Retarius Net Launcher" id="s">
                      <constraints>
                        <constraint type="max" value="1" scope="parent" id="t"/>
                        <constraint type="min" value="1" scope="parent" id="u"/>
                      </constraints>
                    </selectionEntry>
                  </selectionEntries>
                </selectionEntry>
              </selectionEntries>
              <constraints>
                <constraint type="min" value="1" scope="parent" id="v"/>
                <constraint type="max" value="1" scope="parent" id="w"/>
              </constraints>
            </selectionEntryGroup>
          </selectionEntryGroups>
        </selectionEntry>
      </selectionEntries>
    </selectionEntry>`;
