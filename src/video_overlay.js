import Vue from 'vue'
import VideoOverlay from './components/VideoOverlay'
import router from './router'

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#video-overlay',
  router,
  components: { VideoOverlay },
  render: h => h(VideoOverlay)
})
