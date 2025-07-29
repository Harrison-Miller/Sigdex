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
  faSkull,
  faRunning,
  faCrosshairs,
  faBullseye,
  faFistRaised,
  faBullhorn,
  faStar,
  faArrowLeft,
  faArrowUp,
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
  faArrowDown19,
  faArrowDownAZ
} from '@fortawesome/free-solid-svg-icons';

import { faDiscord, faGithub } from '@fortawesome/free-brands-svg-icons';

import { registerSuperJSONClasses } from './superjson'; // Adjust the import path as necessary
import { useDark, useStorage } from '@vueuse/core';
registerSuperJSONClasses();

// Add icons to the library
library.add(
  faShieldAlt,
  faSkull,
  faRunning,
  faCrosshairs,
  faBullseye,
  faFistRaised,
  faBullhorn,
  faStar,
  faArrowLeft,
  faArrowUp,
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
  faGear,
  faArrowDown19,
  faArrowDownAZ,
);

useDark();

const fancyText = useStorage('fancyText', true);
watch(
  fancyText,
  (newValue) => {
    document.documentElement.style.setProperty(
      '--fancy-font',
      newValue ? 'Metamorphous' : 'inherit'
    );
  },
  { immediate: true }
);

const app = createApp(App);
app.component('FontAwesomeIcon', FontAwesomeIcon);
app.use(router).mount('#app');
