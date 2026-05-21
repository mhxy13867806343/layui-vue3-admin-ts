// Feature: layui-vue-admin-system, Property 11: Template switching does not lose form state
import fc from 'fast-check'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, reactive, ref } from 'vue'
import AuthFrame from '@/views/auth/AuthFrame.vue'
import type { AuthTemplateKey } from '@/types/auth-template'

/**
 * **Validates: Requirements 18.4, 18.10**
 *
 * Property 11: Auth template 切换不丢失表单数据
 *
 * For any 表单当前值 formValue 与模板键序列 keys: AuthTemplateKey[]（任意排列、长度 ≥ 1），
 * 当 AuthFrame 接收 templateKey 依次切换为 keys[0], keys[1], ... 后，
 * <slot name="form" /> 内承载的表单持有的 formValue 必须保持不变
 * （即只切换模板壳，不重建表单组件状态）。
 */

const ALL_TEMPLATES: AuthTemplateKey[] = [
  'centered-card',
  'split-left-illustration',
  'split-right-illustration',
  'fullscreen-bg',
  'top-banner',
]

/** Arbitrary for AuthTemplateKey */
const arbTemplateKey = fc.constantFrom(...ALL_TEMPLATES)

/** Arbitrary for a non-empty sequence of template keys */
const arbTemplateSequence = fc.array(arbTemplateKey, { minLength: 1, maxLength: 10 })

/** Arbitrary for form state values (username + password) */
const arbFormState = fc.record({
  username: fc.string({ minLength: 0, maxLength: 20 }),
  password: fc.string({ minLength: 0, maxLength: 20 }),
})

/**
 * A simple form component that simulates LoginForm/RegisterForm behavior.
 * It holds reactive state initialized from props, mirroring how the real
 * form components work (reactive state set once in setup from defaults/storage).
 */
const TestForm = defineComponent({
  name: 'TestForm',
  props: {
    initialUsername: { type: String, default: '' },
    initialPassword: { type: String, default: '' },
  },
  setup(props) {
    const form = reactive({
      username: props.initialUsername,
      password: props.initialPassword,
    })
    return { form }
  },
  render() {
    return h('div', { class: 'test-form' }, [
      h('input', { class: 'input-username', value: this.form.username }),
      h('input', { class: 'input-password', value: this.form.password }),
    ])
  },
})

describe('Property 11: Template switching does not lose form state', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()

    // Mock window.matchMedia for jsdom (AuthFrame uses it for responsive detection)
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  it('form state is preserved across arbitrary template switches', async () => {
    await fc.assert(
      fc.asyncProperty(
        arbFormState,
        arbTemplateSequence,
        async (formState, templateSequence) => {
          const initialTemplate = templateSequence[0]

          const wrapper = mount(AuthFrame, {
            props: {
              mode: 'login',
              templateKey: initialTemplate,
            },
            slots: {
              form: () =>
                h(TestForm, {
                  initialUsername: formState.username,
                  initialPassword: formState.password,
                }),
            },
            global: {
              stubs: {
                AuthTemplateSelector: true,
              },
            },
          })

          await nextTick()

          // Verify initial form state is rendered
          const getFormValues = () => {
            const formComp = wrapper.findComponent(TestForm)
            if (!formComp.exists()) return null
            return {
              username: formComp.vm.form.username,
              password: formComp.vm.form.password,
            }
          }

          const initialValues = getFormValues()
          expect(initialValues).not.toBeNull()
          expect(initialValues!.username).toBe(formState.username)
          expect(initialValues!.password).toBe(formState.password)

          // Switch through all templates in the sequence
          for (let i = 1; i < templateSequence.length; i++) {
            await wrapper.setProps({ templateKey: templateSequence[i] })
            await nextTick()

            // After each switch, form state must be preserved
            const currentValues = getFormValues()
            expect(currentValues).not.toBeNull()
            expect(currentValues!.username).toBe(formState.username)
            expect(currentValues!.password).toBe(formState.password)
          }

          wrapper.unmount()
        },
      ),
      { numRuns: 100 },
    )
  })

  it('form data survives rapid template switching with register mode', async () => {
    await fc.assert(
      fc.asyncProperty(
        arbFormState,
        fc.array(arbTemplateKey, { minLength: 2, maxLength: 20 }),
        async (formState, sequence) => {
          const wrapper = mount(AuthFrame, {
            props: {
              mode: 'register',
              templateKey: sequence[0],
            },
            slots: {
              form: () =>
                h(TestForm, {
                  initialUsername: formState.username,
                  initialPassword: formState.password,
                }),
            },
            global: {
              stubs: {
                AuthTemplateSelector: true,
              },
            },
          })

          await nextTick()

          // Switch through the entire sequence
          for (let i = 1; i < sequence.length; i++) {
            await wrapper.setProps({ templateKey: sequence[i] })
            await nextTick()
          }

          // After all switches, form state must still be intact
          const formComp = wrapper.findComponent(TestForm)
          expect(formComp.exists()).toBe(true)
          expect(formComp.vm.form.username).toBe(formState.username)
          expect(formComp.vm.form.password).toBe(formState.password)

          wrapper.unmount()
        },
      ),
      { numRuns: 100 },
    )
  })

  it('template switch does not affect form visibility (form always present)', async () => {
    await fc.assert(
      fc.asyncProperty(
        arbTemplateKey,
        fc.array(arbTemplateKey, { minLength: 1, maxLength: 10 }),
        fc.constantFrom('login' as const, 'register' as const),
        async (startTemplate, switches, mode) => {
          const wrapper = mount(AuthFrame, {
            props: {
              mode,
              templateKey: startTemplate,
            },
            slots: {
              form: () => h(TestForm, { initialUsername: 'test', initialPassword: 'pass' }),
            },
            global: {
              stubs: {
                AuthTemplateSelector: true,
              },
            },
          })

          await nextTick()

          // Form must be present initially
          expect(wrapper.findComponent(TestForm).exists()).toBe(true)

          // After each switch, form must still be present
          for (const tpl of switches) {
            await wrapper.setProps({ templateKey: tpl })
            await nextTick()
            expect(wrapper.findComponent(TestForm).exists()).toBe(true)
          }

          wrapper.unmount()
        },
      ),
      { numRuns: 100 },
    )
  })
})
