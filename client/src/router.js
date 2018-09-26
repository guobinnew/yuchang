import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import NomView from './views/NomView.vue'
import Editor from './views/ScriptEditor.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/nomview',
      name: 'nomview',
      component: NomView
    },
    {
      path: '/scripteditor',
      name: 'scripteditor',
      component: Editor
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('./views/About.vue')
    }
  ]
})
