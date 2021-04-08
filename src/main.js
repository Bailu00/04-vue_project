import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
//导入全局样式表
import './assets/css/global.css'
//axios 为包的时候这种挂载方式
import axios from 'axios'

Vue.config.productionTip = false
//配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1'
//包挂载到vue原型对象上,http为ajax请求
Vue.prototype.$http = axios


new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
