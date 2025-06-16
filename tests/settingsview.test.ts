import { mount } from '@vue/test-utils';
import SettingsView from '../src/views/SettingsView.vue';

describe('SettingsView', () => {
  it('renders and shows version', () => {
    const wrapper = mount(SettingsView, { global: { stubs: ['router-link'] } });
    expect(wrapper.text()).toContain('Settings');
    expect(wrapper.text()).toMatch(/Version:/);
  });

  it('can update GITHUB_BASE_URL and GITHUB_REPO', async () => {
    const wrapper = mount(SettingsView, { global: { stubs: ['router-link'] } });
    const baseUrlInput = wrapper.find('input[placeholder="https://raw.githubusercontent.com"]');
    const repoInput = wrapper.find('input[placeholder="BSData/age-of-sigmar-4th"]');
    await baseUrlInput.setValue('https://test.url');
    await baseUrlInput.trigger('change');
    await repoInput.setValue('Test/Repo');
    await repoInput.trigger('change');
    expect(localStorage.getItem('GITHUB_BASE_URL')).toBe('https://test.url');
    expect(localStorage.getItem('GITHUB_REPO')).toBe('Test/Repo');
  });

  it('clears BSData and Favorites from localStorage', async () => {
    localStorage.setItem('armyData:foo', 'bar');
    localStorage.setItem('armyDataTimestamp:foo', 'baz');
    localStorage.setItem('favorites:army', 'qux');
    const wrapper = mount(SettingsView, { global: { stubs: ['router-link'] } });
    await wrapper.find('button').trigger('click'); // Back button
    await wrapper.findAll('button')[1].trigger('click'); // Clear BSData
    expect(localStorage.getItem('armyData:foo')).toBeNull();
    expect(localStorage.getItem('armyDataTimestamp:foo')).toBeNull();
    await wrapper.findAll('button')[2].trigger('click'); // Clear Favorites
    expect(localStorage.getItem('favorites:army')).toBeNull();
  });
});
