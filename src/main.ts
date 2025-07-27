import { createApp, watch } from 'vue';
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
  faGear,
} from '@fortawesome/free-solid-svg-icons';

import { faDiscord, faGithub } from '@fortawesome/free-brands-svg-icons';

import { registerSuperJSONClasses } from './superjson'; // Adjust the import path as necessary
import { useDark, useStorage } from '@vueuse/core';
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
  faCircleExclamation,
  faGear
);

useDark();

const fancyText = useStorage('fancyText', true);
watch(fancyText, (newValue) => {
  document.documentElement.style.setProperty(
    '--fancy-font',
    newValue ? 'Metamorphous' : 'inherit'
  );
});

const app = createApp(App);
app.component('FontAwesomeIcon', FontAwesomeIcon);
app.use(router).mount('#app');
