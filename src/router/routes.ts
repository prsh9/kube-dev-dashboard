import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '/namespace', component: () => import('pages/DisplayNamespace.vue') },
      { path: '/deployment', component: () => import('pages/DisplayDeployment.vue') },
      { path: '/pod', component: () => import('pages/DisplayPodData.vue') },
      { path: '/svc', component: () => import('pages/DisplaySvcData.vue') },
      { path: '/setting', component: () => import('pages/SettingsPage.vue') },
      { path: '/log', component: () => import('pages/LogGroups.vue') },
      { path: '/console', component: () => import('pages/ConsoleGroups.vue') },
      { path: '/', redirect: '/pod' },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
