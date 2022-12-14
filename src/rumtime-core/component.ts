import { shallowReadonly } from '../reactivity/reactive'
import { proxyRefs } from '../reactivity'
import { emit } from './componentEmit'
import { initProps } from './componentProps'
import { PublicInstanceProxyHandlers } from './componentPublicInstance'
import { initSlots } from './componentSlots'
export function createComponentInstance(vnode, parent) {
  const component = {
    vnode,
    type: vnode.type, // 为了后续后续组件方便,重定义挂载到实例上
    next: null,
    setupState: {}, // state
    props: null, // props
    provides: parent?.provides ? parent.provides : {}, // 注入数据,如果父组件provides时就注入为父组件的值，如果没有就是初始化
    parent, // 父组件
    isMounted: false,
    subTree: {},
    slots: {}, // slots
    emit: () => { } // emit事件
  }
  // 初始化时,绑定emit传递当前组件实例作为instance参数
  component.emit = emit.bind(null, component) as any
  return component
}
// instance = component
export function setupComponent(instance) {
  // TODO
  initProps(instance, instance.vnode.props) // 挂载props
  initSlots(instance, instance.vnode.children)
  // 初始化有状态组件
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {
  // 获取组件
  const Component = instance.type
  // 挂载setup代理对象,在hrender函数中可以使用this.msg获取
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers)

  const { setup } = Component
  if (setup) {
    // getCurrentInstance() 只能在setup中使用
    setCurrentInstance(instance)
    // 调用setup函数 -> function ? object
    // 调用setup时将props组件实例上的props传递进去
    // 使用shallowReadonly包裹setup返回值,让其是浅层不可修改的
    // 将组件实例的emit传递到setup中
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit
    })
    // 当切换下一个组件前要置空
    setCurrentInstance(null)
    handlerSetupResult(instance, setupResult)
  }
}

function handlerSetupResult(instance, setupResult) {
  // TODO
  // is Function

  if (typeof setupResult === 'object') {
    // 如果是对象，挂载到组件实例上
    instance.setupState = proxyRefs(setupResult)
  }
  // 保证finishrender一定有值 
  finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
  // 看看当前组件有没有render
  const Component = instance.type

  instance.render = Component.render
  // 如果组件render存在
  // if (Component.render) {

  // }
}

// 当前组件实例
let currentInstance = null
export function getCurrentInstance() {
  return currentInstance
}
// 抽成函数赋值，方便调试
function setCurrentInstance(instance) {
  currentInstance = instance
}