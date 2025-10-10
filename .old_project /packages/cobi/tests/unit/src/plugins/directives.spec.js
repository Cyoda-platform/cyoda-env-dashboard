import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import { defineComponent } from 'vue';
import SlashDirectives from '../../../../src/plugins/directives';

describe('SlashDirectives', () => {
  const RemoveSlashComponent = defineComponent({
    template: `
      <div v-remove-slash:inputValue>
        <input v-model="inputValue">
      </div>
    `,
    data() {
      return {
        inputValue: '',
      };
    },
  });

  const AddSlashComponent = defineComponent({
    template: `
      <div v-add-slash:inputValue>
        <input v-model="inputValue">
      </div>
    `,
    data() {
      return {
        inputValue: '',
      };
    },
  });

  const globalPlugins = {
    install(app) {
      app.use(SlashDirectives);
    },
  };

  describe('remove-slash directive', () => {
    it('removes trailing slash on blur', async () => {
      const wrapper = mount(RemoveSlashComponent, {
        global: {
          plugins: [globalPlugins],
        },
      });

      const input = wrapper.find('input');

      await input.setValue('test/');

      await input.trigger('blur');

      expect(wrapper.vm.inputValue).toBe('test');
    });

    it('does not modify value without trailing slash', async () => {
      const wrapper = mount(RemoveSlashComponent, {
        global: {
          plugins: [globalPlugins],
        },
      });

      const input = wrapper.find('input');

      await input.setValue('test');
      await input.trigger('blur');

      expect(wrapper.vm.inputValue).toBe('test');
    });

    it('handles multiple trailing slashes', async () => {
      const wrapper = mount(RemoveSlashComponent, {
        global: {
          plugins: [globalPlugins],
        },
      });

      const input = wrapper.find('input');

      await input.setValue('test///');
      await input.trigger('blur');

      expect(wrapper.vm.inputValue).toBe('test//');
    });
  });

  describe('add-slash directive', () => {
    it('adds leading slash on blur when missing', async () => {
      const wrapper = mount(AddSlashComponent, {
        global: {
          plugins: [globalPlugins],
        },
      });

      const input = wrapper.find('input');

      await input.setValue('test');
      await input.trigger('blur');

      expect(wrapper.vm.inputValue).toBe('/test');
    });

    it('does not modify value that already has leading slash', async () => {
      const wrapper = mount(AddSlashComponent, {
        global: {
          plugins: [globalPlugins],
        },
      });

      const input = wrapper.find('input');

      await input.setValue('/test');
      await input.trigger('blur');

      expect(wrapper.vm.inputValue).toBe('/test');
    });

    it('does not modify empty value', async () => {
      const wrapper = mount(AddSlashComponent, {
        global: {
          plugins: [globalPlugins],
        },
      });

      const input = wrapper.find('input');

      await input.setValue('');
      await input.trigger('blur');

      expect(wrapper.vm.inputValue).toBe('');
    });
  });
});
