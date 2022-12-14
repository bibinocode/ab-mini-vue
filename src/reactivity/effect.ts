import { extend } from '../shared'

let activeEffect: any
let shouldTrack: boolean
export class ReactiveEffect {
  private _fn: any
  public deps = []
  private active = true // 用于stop判断状态
  public scheduler: Function | undefined
  public onStop?: () => void
  constructor(fn: any, scheduler?: Function) {
    this._fn = fn
    this.scheduler = scheduler
  }
  run() {
    // 如果是stop状态,那么直接执行返回，不去做触发依赖
    if (!this.active) {
      return this._fn()
    }
    shouldTrack = true
    activeEffect = this
    const res = this._fn()
    // shouldTrack 关闭
    shouldTrack = false
    return res
  }
  stop() {
    // 给一个active状态,优化多次调用，实际上只是清空一次
    if (this.active) {
      clearEffect(this)
      if (this.onStop) {
        this.onStop()
      }
      this.active = false
    }
  }
}

// 清除 deps内的effact
function clearEffect(effect: any) {
  // 如果是stop就把属于自身的存储容器清空
  effect.deps.forEach((dep: any) => {
    dep.delete(effect)
    effect.deps.length = 0
  });
}

// 需要按照 {foo:1} -> 这样的键值对创建一个 map:[{foo:1}:[set{foo:[effect,effect1,effect2]}]]存储一个个effect
const targetMap = new Map()
export function track(target: any, key: string | symbol) {
  if (!isTracking()) return
  let depMps = targetMap.get(target)
  // 初始化,不存在就需要创建
  if (!depMps) {
    depMps = new Map()
    targetMap.set(target, depMps)
  }
  // target -> key -> effect
  let dep = depMps.get(key) as Set<any>
  if (!dep) {
    dep = new Set()
    depMps.set(key, dep)
  }
  trackEffects(dep)
}
export function trackEffects(dep: any) {
  // 如果已经存在了这个fn那么就不需要重复收集了
  if (dep.has(activeEffect)) return
  dep.add(activeEffect)
  // 反向收集dep,用于清空
  activeEffect.deps.push(dep)
}

export function isTracking() {
  // 如果是单纯对象的触发get操作时,并不会执行走到effect中，所以此时的activeEffect是undefined那么就不要收集
  // if (!activeEffect) return
  // 需不需要收集依赖
  // if (!shouldTrack) return
  return shouldTrack && activeEffect !== undefined
}

export function trigger(target: any, key: string | symbol) {
  // 从容器中取出target下key对应的所有的effect触发里面的fn
  const depMaps = targetMap.get(target)
  const deps = depMaps.get(key) as Set<any>
  triggerEffects(deps)
}

export function triggerEffects(deps: any) {
  for (const _effect of deps) {
    if (_effect.scheduler) {
      _effect.scheduler()
    } else {
      _effect.run()
    }
  }
}

export function effect(_fn: () => any, options: any = {}) {
  const _effect = new ReactiveEffect(_fn)
  // 将options的参数挂载到_effect实例上
  extend(_effect, options)
  _effect.run()
  // bind 用于指定effect的this
  const runner: any = _effect.run.bind(_effect)
  // 将effect挂载到runner上，方便stop查找
  runner.effect = _effect
  return runner
}

export function stop(runner: any) {
  runner.effect.stop()
}
