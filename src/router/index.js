import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Right from '../components/power/Right.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/good/Cate.vue'
import Params from '../components/good/Params.vue'
import List from '../components/good/List.vue'
import Add from '../components/good/Add.vue'
import Order from '../components/order/Order.vue'
import Report from '../components/report/Report.vue'

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
  {
    path:'/Home', 
    component:Home, 
    redirect:'/welcome',
    children: [
      {path:'/welcome', component:Welcome},
      {path:'/users', component:Users},
      //path：路径，component指对应的文档
      {path:'/rights', component:Right},
      {path:'/roles', component:Roles},
      {path:'/categories', component:Cate},
      {path:'/params', component:Params},
      {path:'/goods', component:List},
      {path:'/goods/add', component:Add},
      {path:'/orders', component:Order},
      {path:'/reports', component:Report}
    ]
  }
]
})

//挂载路由导航守卫
//为router调用一个beforeEach函数，beforeEach接收一个回调函数，回调函数中有三个参数(to,from,next)
//to代表将要访问的路径，from代表从哪个路径跳转过来，
//next是一个函数，表示放行；next()表示直接放行，next('/login')强制跳转
 router.beforeEach((to, from, next) => {
   if (to.path === '/login') return next(); //to.path === '/login'表示用户要访问登录也，登陆也不需要做权限控制，直接放行

  //如果没有被return出去，表示用户访问的不是登陆页，而是有权限的页面，先拿到token，
  //根据是否有token再决定是否发生强制跳转
  //从sessionStorage 中获取保存的token 值
   const tokenstr = window.sessionStorage.getItem('token')
  //没有token，强制调转到登录页面
   if(!tokenstr) return next('/login')
   next()
 })

export default router


