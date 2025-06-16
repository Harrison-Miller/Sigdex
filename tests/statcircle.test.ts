// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import StatCircle from '../src/components/StatCircle.vue';

describe('StatCircle', () => {
  it('displays a number value', () => {
    const wrapper = mount(StatCircle, { props: { value: 5, label: 'Control' } });
    expect(wrapper.text()).toContain('5');
    expect(wrapper.text()).toContain('Control');
  });

  it('displays a string value', () => {
    const wrapper = mount(StatCircle, { props: { value: '4+', label: 'Save' } });
    expect(wrapper.text()).toContain('4+');
    expect(wrapper.text()).toContain('Save');
  });

  it('displays dash for undefined', () => {
    const wrapper = mount(StatCircle, { props: { value: undefined, label: 'Control' } });
    expect(wrapper.text()).toContain('-');
  });

  it('displays dash for null', () => {
    const wrapper = mount(StatCircle, { props: { value: null, label: 'Control' } });
    expect(wrapper.text()).toContain('-');
  });

  it('displays dash for empty string', () => {
    const wrapper = mount(StatCircle, { props: { value: '', label: 'Control' } });
    expect(wrapper.text()).toContain('-');
  });

  it('displays dash for dash string', () => {
    const wrapper = mount(StatCircle, { props: { value: '-', label: 'Control' } });
    expect(wrapper.text()).toContain('-');
  });
});
