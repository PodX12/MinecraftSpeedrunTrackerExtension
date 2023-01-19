import Vue from 'vue'
import Config from './components/Config'
import router from './router'

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#config',
  router,
  components: { Config },
  render: h => h(Config)
})
