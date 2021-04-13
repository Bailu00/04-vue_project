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
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

//设置拦截器axios.interceptors属性中有一个成员叫request请求，
//axios.interceptors.request叫请求拦截器。通过use函数为请求拦截器挂载一个回调函数.
//只要向服务器axios发了一次数据请求，必然在发送请求期间优先调用回调函数，
//请求到达服务器之间，先会调用回调函数，对请求做一下预处理。return config 表示为请求头已经做了一次预处理
//请求被处理之后，才会被发送到服务器，进行真正的处理

//请求拦截器相当于预处理过程，预处理这次请求
axios.interceptors.request.use( config => {
  //为请求头对象，添加token验证Authorization字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  //必须在最后return config
  return config
})
//包挂载到vue原型对象上,http为ajax请求
Vue.prototype.$http = axios


new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
