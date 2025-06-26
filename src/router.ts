import { createRouter, createWebHistory } from 'vue-router';
import ArmyListView from './views/ArmyListView.vue';
import UnitListView from './views/UnitListView.vue';
import UnitDetailView from './views/UnitDetailView.vue';
import SettingsView from './views/SettingsView.vue';
import ManifestationLoreView from './views/ManifestationLoreView.vue';

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
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
