import { h, renderSlots, getCurrentInstance } from '../../lib/ab-mini-vue-esm.js'
export const Slots = {
	name: 'Slots',
	setup(props) {
		const instance = getCurrentInstance()
		console.log(instance)
	},
	render() {
		const foo = h('p', {}, 'foo')

		// 普通插槽
		// return h('div', {}, [foo, renderSlots(this.$slots)])
		// 具名插槽
		// return h('div', {}, [
		// 	renderSlots(this.$slots, 'header'),
		// 	foo,
		// 	renderSlots(this.$slots, 'footer')
		// ])
		// 作用域插槽
		return h('div', {}, [
			renderSlots(this.$slots, 'header', {
				title: '这是作用域插槽标题'
			}),
			foo,
			renderSlots(this.$slots, 'footer')
		])
	}
}
