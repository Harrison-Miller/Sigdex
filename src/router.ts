import { createRouter, createWebHistory } from 'vue-router';
import ArmyListView from './views/ArmyListView.vue';
import UnitListView from './views/UnitListView.vue';
import UnitDetailView from './views/UnitDetailView.vue';

const routes = [
  { path: '/', name: 'Armies', component: ArmyListView },
  { path: '/army/:army', name: 'UnitList', component: UnitListView, props: true },
  { path: '/army/:army/unit/:unit', name: 'UnitDetail', component: UnitDetailView, props: true },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
