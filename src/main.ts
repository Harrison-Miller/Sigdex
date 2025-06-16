import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router';
// Font Awesome imports
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faShieldAlt, faBolt, faRunning, faCrosshairs, faBullseye, faFistRaised, faBullhorn, faStar, faArrowLeft, faStop } from '@fortawesome/free-solid-svg-icons';

// Add icons to the library
library.add(faShieldAlt, faBolt, faRunning, faCrosshairs, faBullseye, faFistRaised, faBullhorn, faStar, faArrowLeft, faStop);

const app = createApp(App);
app.component('font-awesome-icon', FontAwesomeIcon);
app.use(router).mount('#app');
