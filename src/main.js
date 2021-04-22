import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
//导入全局样式表
import './assets/css/global.css'
// 先安装插件，将插件导入项目中，并采用Vue.component注册为全局可用的组件
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'

//axios 为包的时候这种挂载方式
import axios from 'axios'

// require styles 导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme


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

// 为 treetable进行全局注册
Vue.component('tree-table',TreeTable)

// 将富文本编辑器，注册为全局可用的组件
Vue.use(VueQuillEditor)

// 定义一个全局的过滤器,(第一个参数为过滤器的名字，过滤器处理函数 function(形参originVal为需要处理的时间数据){  }
Vue.filter('dateFormat', function(originVal){
 const dt = new Date(originVal)
 const y = dt.getFullYear()

//  加空表示变成字符串，后面表示不足多少位的话，用哪个字符串来填充
 const m = (dt.getMonth() + 1 + '').padStart(2,'0')
 const d = (dt.getDate() + '').padStart(2,'0')
 const hh = (dt.getHours() + '').padStart(2,'0')
 const mm = (dt.getMinutes() + '').padStart(2,'0')
 const ss = (dt.getSeconds() + '').padStart(2,'0')

// yyyy-mm-dd 
 return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
 })


new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
