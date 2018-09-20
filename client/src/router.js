import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import NomView from './views/NomView.vue'
import Scratch from './views/Scratch.vue'

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
      path: '/scratch',
      name: 'scratch',
      component: Scratch
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('./views/About.vue')
    }
  ]
})
