// @vitest-environment jsdom
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import KeywordsBar from '../src/components/KeywordsBar.vue';

describe('KeywordsBar', () => {
  it('renders no bar if keywords is empty', () => {
    const wrapper = mount(KeywordsBar, { props: { keywords: [] } });
    expect(wrapper.find('.keywords-bar').exists()).toBe(false);
  });

  it('renders keywords as chips', () => {
    const keywords = ['HERO', 'MOONCLAN', 'INFANTRY'];
    const wrapper = mount(KeywordsBar, { props: { keywords } });
    const chips = wrapper.findAll('.keyword');
    expect(chips).toHaveLength(keywords.length);
    expect(chips.map(c => c.text())).toEqual(keywords);
  });
});
