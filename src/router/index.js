import Vue from 'vue'
import Router from 'vue-router'
import VideoOverlay from '@/components/VideoOverlay'
import Config from '@/components/Config'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/video_overlay.html',
      name: 'VideoOverlay',
      component: VideoOverlay
    },
    {
      path: '/config.html',
      name: 'Config',
      component: Config
    }
  ],
  mode: 'history'
})
