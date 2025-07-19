import { createApp } from 'vue';
import './style.css';
import './style/helpers.css';
import App from './App.vue';
import router from './router';
// Font Awesome imports
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faShieldAlt,
  faBolt,
  faRunning,
  faCrosshairs,
  faBullseye,
  faFistRaised,
  faBullhorn,
  faStar,
  faArrowLeft,
  faStop,
  faEllipsisV,
  faDiamond,
  faTrash,
  faCheck,
  faTriangleExclamation,
  faFileArrowDown,
  faCopy,
  faEye,
  faClone,
  faCircleExclamation,
} from '@fortawesome/free-solid-svg-icons';

import { faDiscord, faGithub } from '@fortawesome/free-brands-svg-icons';

import { registerSuperJSONClasses } from './superjson'; // Adjust the import path as necessary
import { useDark } from '@vueuse/core';
registerSuperJSONClasses();

// Add icons to the library
library.add(
  faShieldAlt,
  faBolt,
  faRunning,
  faCrosshairs,
  faBullseye,
  faFistRaised,
  faBullhorn,
  faStar,
  faArrowLeft,
  faStop,
  faEllipsisV,
  faDiamond,
  faTrash,
  faCheck,
  faTriangleExclamation,
  faFileArrowDown,
  faCopy,
  faEye,
  faClone,
  faDiscord,
  faGithub,
  faCircleExclamation
);

useDark();

const app = createApp(App);
app.component('FontAwesomeIcon', FontAwesomeIcon);
app.use(router).mount('#app');
