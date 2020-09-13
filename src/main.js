import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@mdi/font/css/materialdesignicons.css'
import { VueMaskDirective } from 'v-mask'
import Ads from 'vue-google-adsense'

Vue.use(require('vue-script2'))
Vue.use(Ads.Adsense)
Vue.use(Ads.InArticleAdsense)
Vue.use(Ads.InFeedAdsense)
Vue.config.productionTip = false
Vue.directive('mask', VueMaskDirective);

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
