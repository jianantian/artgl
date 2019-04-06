import Vue from 'vue'
import Router from 'vue-router'
import Viewer from './views/viewer.vue'
import ShaderEditor from './views/shader-editor.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Viewer
    },
    {
      path: '/shader',
      name: 'shader-editor',
      component: ShaderEditor
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/About.vue')
    }
  ]
})
