import { mount } from '@vue/test-utils';
import ArmyListView from '../src/views/ArmyListView.vue';
import { SIGDEX_VERSION } from '../src/version';

describe('ArmyListView', () => {
  it('displays the Sigdex version at the bottom', () => {
    const wrapper = mount(ArmyListView, {
      global: {
        stubs: ['FavoriteToggle', 'ListButton'],
        mocks: {
          $router: { push: jest.fn() }
        }
      }
    });
    const versionDiv = wrapper.find('.sigdex-version');
    expect(versionDiv.exists()).toBe(true);
    expect(versionDiv.text()).toContain(SIGDEX_VERSION);
  });
});
