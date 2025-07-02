import { createRouter, createWebHistory } from 'vue-router';
import ArmyListView from './views/ArmyListView.vue';
import UnitListView from './views/UnitListView.vue';
import UnitDetailView from './views/UnitDetailView.vue';
import SettingsView from './views/SettingsView.vue';
import ManifestationLoreView from './views/ManifestationLoreView.vue';
import ListBuilderView from './views/ListBuilderView.vue';
import BuilderSettings from './modules/builder/views/BuilderSettings.vue';
import BuilderUnitSettings from './modules/builder/views/BuilderUnitSettings.vue';

const routes = [
  { path: '/', name: 'Armies', component: ArmyListView },
  { path: '/army/:army', name: 'UnitList', component: UnitListView, props: true },
  { path: '/army/:army/unit/:unit', name: 'UnitDetail', component: UnitDetailView, props: true },
  {
    path: '/manifestation/:lore',
    name: 'ManifestationLore',
    component: ManifestationLoreView,
    props: true,
  },
  { path: '/settings', name: 'Settings', component: SettingsView },
  {
    path: '/list/:id',
    name: 'ListBuilder',
    component: ListBuilderView,
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
    path: '/list/:id/regiment/:regimentIdx/pick',
    name: 'UnitPicker',
    component: () => import('./views/UnitPickerView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
