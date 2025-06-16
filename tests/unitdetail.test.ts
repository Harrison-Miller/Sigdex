// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';

// Mock before importing SUT and dependencies
vi.mock('../src/army', async () => {
  const actual = await import('../src/army');
  return {
    ...actual,
    loadArmy: vi.fn().mockResolvedValue({ units: [actual.MOCK_UNIT] }),
  };
});

describe('UnitDetailView', () => {
  let UnitDetailView: any;
  let MOCK_UNIT: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Import after mock is set up
    UnitDetailView = (await import('../src/views/UnitDetailView.vue')).default;
    MOCK_UNIT = (await import('../src/army')).MOCK_UNIT;
  });

  it('renders unit details when unit is found', async () => {
    const wrapper = mount(UnitDetailView, {
      props: {
        army: 'Gloomspite Gitz',
        unit: MOCK_UNIT, // Pass the full unit object
      },
      global: {
        stubs: ['BackButton', 'FavoriteToggle', 'StatCircle', 'WeaponTable', 'AbilityCard', 'KeywordsBar'],
      },
    });
    await flushPromises();
    expect(wrapper.text()).toContain(MOCK_UNIT.name);
    expect(wrapper.text()).toContain('Melee Weapons');
    expect(wrapper.text()).toContain('Ranged Weapons');
    expect(wrapper.text()).toContain('Abilities');
    expect(wrapper.text()).toContain('Keywords');
  });

  it('shows error message if unit is missing', async () => {
    const wrapper = mount(UnitDetailView, {
      props: {
        army: 'Gloomspite Gitz',
        unit: 'Nonexistent Unit',
      },
      global: {
        stubs: ['BackButton', 'FavoriteToggle', 'StatCircle', 'WeaponTable', 'AbilityCard', 'KeywordsBar'],
      },
    });
    await flushPromises();
    expect(wrapper.text()).toContain('Unit data is missing or incomplete');
  });
});
