import { h } from '../../lib/ab-mini-vue-esm.js'
export const App = {
	render() {
		return h('div', { id: 'root' }, [
			h('p', { class: 'red' }, 'hi' + this.msg),
			h('p', { class: 'blue' }, 'blue')
		])
	},
	setup() {
		return {
			msg: '改变代理对象'
		}
	}
}
