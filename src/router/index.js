import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'

Vue.use(VueRouter)

// export default new Router ({
//   routes: [
//     {path:'/', redirect:'/login'},
//     {path:'/login', component:Login},
//     {path:'/Home', component:Home}
//   ]
// })

const router = new VueRouter({
  routes: [
  {path:'/', redirect:'/login'},
  {path:'/login', component:Login},
  {path:'/Home', component:Home}
]
})

//挂载路由导航守卫
//为router调用一个beforeEach函数，beforeEach接收一个回调函数，回调函数中有三个参数(to,from,next)
//to代表将要访问的路径，from代表从哪个路径跳转过来，
//next是一个函数，表示放行；next()表示直接放行，next('/login')强制跳转

// router.beforeEach((to, from, next) => {
//   if(to.path === '/login') return next(); //登陆也不需要做权限控制，直接放行

  //如果没有被return出去，表示用户访问的不是登陆页，而是有权限的页面，先拿到taken，
  //根据是否有taken再决定是否发生强制跳转
  //获得taken值
//   const takenstr = window.sessionStorage.getItem('taken')
//   if(!takenstr) return next('/login')
//   next()
// })

export default router


