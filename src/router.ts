import { createRouter, createWebHistory } from 'vue-router';
import Home from './views/Home.vue';
import UnitDetail from './modules/browser/views/UnitDetail.vue';
import UnitList from './modules/browser/views/UnitList.vue';
import ManifestationLore from './modules/browser/views/ManifestationLore.vue';
import Settings from './views/Settings.vue';
import ListBuilder from './modules/builder/views/ListBuilder.vue';
import ListExport from './modules/builder/views/ListExport.vue';
import BuilderSettings from './modules/builder/views/BuilderSettings.vue';
import BuilderUnitSettings from './modules/builder/views/BuilderUnitSettings.vue';
import UnitPicker from './modules/builder/views/UnitPicker.vue';
import ListImport from './modules/builder/views/ListImport.vue';
import RegimentOfRenown from './modules/browser/views/RegimentOfRenown.vue';

const routes = [
  {
    path: '/import',
    name: 'ListImport',
    component: ListImport,
  },
  { path: '/', name: 'Armies', component: Home },
  { path: '/army/:army', name: 'UnitList', component: UnitList, props: true },
  { path: '/army/:army/unit/:unit', name: 'UnitDetail', component: UnitDetail, props: true },
  {
    path: '/manifestation/:lore',
    name: 'ManifestationLore',
    component: ManifestationLore,
    props: true,
  },
  { path: '/settings', name: 'Settings', component: Settings },
  {
    path: '/list/:id',
    name: 'ListBuilder',
    component: ListBuilder,
    props: true,
  },
  {
    path: '/list/:id/export',
    name: 'ListExport',
    component: ListExport,
    props: true,
  },
  {
    path: '/list/:id/settings',
    name: 'BuilderSettings',
    component: BuilderSettings,
  },
  {
    path: '/list/:id/regiment/:regimentIdx/:unitIdx/settings',
    name: 'BuilderUnitSettings',
    component: BuilderUnitSettings,
  },
  {
    path: '/list/:id/regiment/:regimentIdx/pick/:filter',
    name: 'UnitPicker',
    component: UnitPicker,
  },
  {
    path: '/regiment-of-renown/:regiment',
    name: 'RegimentOfRenown',
    component: RegimentOfRenown,
  },
];

// --- Scroll position management ---
const scrollPositions = new Map<string, number>();

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, _, savedPosition) {
    // If using browser back/forward, restore saved position
    if (savedPosition) {
      return savedPosition;
    }
    // If we have a stored scroll position for this route, restore it
    const key = to.fullPath;
    if (scrollPositions.has(key)) {
      return { left: 0, top: scrollPositions.get(key) || 0 };
    }
    // Otherwise, scroll to top
    return { left: 0, top: 0 };
  },
});

// Save scroll position before navigating away, except for UnitPicker
router.beforeEach((to, from, next) => {
  // Don't save scroll position if leaving or entering UnitPicker
  if (to.name === 'UnitPicker' || from.name === 'UnitPicker') {
    next();
    return;
  }
  scrollPositions.set(from.fullPath, window.scrollY);
  next();
});

export default router;
