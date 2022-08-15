import { createRender } from '../rumtime-core'


// 自定义节点创建
function createElement(vnode) {
  return document.createElement(vnode)
}

//自定义属性挂载
function patchProp(el, key, val) {
  // 事件已on开头 类似 onClick
  const isOn = /^on[A-z]/.test(key)
  if (isOn) {
    const event = key.slice(2).toLowerCase()
    el.addEventListener(event, val)
  }
  el.setAttribute(key, val)
}

// 自定义挂载
function insert(el, container) {
  container.append(el)
}


const render = createRender({
  createElement,
  patchProp,
  insert
})


export function createApp(rootComponent: any) {
  return render.createApp(rootComponent)
}

export * from '../rumtime-core'