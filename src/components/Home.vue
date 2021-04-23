<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <!-- div用于布局 -->
      <div>
        <img src="../assets/tofflon.png" alt="" />
        <span>后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200.99px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          :router="true"
          :default-active="activePath"
        >
          <!-- 也可以写成 :unique-opened = "true" 
          collapse-transition表示的是折叠展开动画-->


          <!-- 一级菜单 ,当index相同时，打开都打开，关闭都关闭，所以每一个submenu都需要有自己唯一的index值，
        id时唯一的，故设置为id.程序报错，报错原因，index只接收字符串，不接受数值. +'' 表示转换为字符串-->
          <!-- <el-submenu :index="item.id +''" v-for="item in menulist" :key="item.id"> 
            index 一定要绑定动态值-->

          <!-- 在激活导航时以 index 作为 path 进行路由跳转,而检查的path中，无'/'需要添加 -->
          <el-submenu
            :index="'/' + item.path"
            v-for="item in menulist"
            :key="item.id"
          >
            <!-- 一级菜单模板区 -->
            <template slot="title">
              <!-- 图标，图标不定死，没循环一次都有自己的id -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavstate('/' + subItem.path)"
            >
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>

      <!-- 右侧内容 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data(){
    return {
      //左侧菜单数据，默认为空
      menulist: [],

      iconsObj: {
        //图标，以id作为key，以图标作为值
        '125':'iconfont el-icon-s-flag',
        '103':'iconfont el-icon-user',
        '102':'iconfont el-icon-s-home',
        '101':'iconfont el-icon-s-help',
        '145':'iconfont el-icon-s-help',
      },
      //是否折叠,默认为不折叠
      isCollapse:false,
      //定义一个数据，保存激活的链接地址，默认为空，然后再进行一个动态绑定给default-active
      activePath:''
    }
  },
  //整个页面刚一加载，立即获取左侧菜单，行为区域定义生命周期函数
  created(){
    //调getMenuList来获取所有的左侧菜单
    this.getMenuList()
    //动态赋值，整个home组件一被创建的时候就立即从sessionStorage中将这个值取出，进行赋值
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout() {
      //清除sessionStorage
      window.sessionStorage.clear();
      //重定向到根路径
      this.$router.push("/login");
    },
    //获取所有的菜单,munus为请求地址,get请求返回值是promise，async await进行简化，解构赋值出data
    async getMenuList() {
      //获得数据
      const {data: res} = await this.$http.get('menus');
      console.log(res); //为了将获取的数据立即渲染出来，则挂载到data中
      //下面对表单进行赋值
      if(res.meta.status !== 200) return this.$message.error(res.meta.msg);//错误消息在meta的msg上
      this.menulist = res.data; //获取到所有左侧菜单的数据    
    },
    // 点击按钮，切换菜单的折叠与展开
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    //保存连接的激活状态(键，值)
    saveNavstate(activePath) {
      window.sessionStorage.setItem('activePath',activePath)
      //点击不同链接是，为activePath重新赋值
      this.activePath = activePath
    }
  },
};
</script>

<style Lang="less" scoped>
.home-container {
  height: 100%;
}

.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding: 0; /*左右贴边*/
  align-items: center; /*上下居中 */
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center; /*纵向居中 */
    span {
    margin-left: 15px;
    }
  } 
}
/* .el-header .div {
    display: flex;
    align-items: center;  /*纵向居中 */
/* } */

.el-aside {
  background-color: #333744;
  /* 边框对齐 */
  .el-menu {
    border-right: none;
  }
}

.el-main {
  background-color: #eaedfe;
}
img {
  width: 100px;
}
.iconfont {
  /* 图标和文本之间添加间距 */
  margin-right: 10px;
}
.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center; /* 图标居中 */
  letter-spacing: 0.2em; /*字符之间设置间距 */
  cursor: pointer; /* 鼠标放上去之后变成一个小手 */
}
</style>