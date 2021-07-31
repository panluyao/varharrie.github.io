import 'virtual:windi.css';
import './style.css';

import { createI18n } from 'vue-i18n';
import { createRouter, createWebHistory } from 'vue-router';
import { createApp } from 'vue';
import App from './App.vue';

const i18n = createI18n({ legacy: false, locale: 'cn' });

const router = createRouter({
  history: createWebHistory(),
  routes: [],
});

const app = createApp(App);

app.use(i18n);
app.use(router);

app.mount('body');
