import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import VueSocketIO from 'vue-socket.io';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';

Vue.use(ElementUI);
Vue.use(new VueSocketIO({
  debug: false,
  connection: "http://127.0.0.1:3000"
}))
Vue.config.productionTip = false;

new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app');
