<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="" />
      </div>
      <!-- 表单区域 -->
      <el-form
        ref="loginFormRfef"
        :model="loginForm"
        :rules="loginFormRules"
        label-width="0px"
        class="login_form"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            prefix-icon="el-icon-s-custom"
          ></el-input>
        </el-form-item>
        <!-- 密码,type="password"表示为密码类型的属性 -->
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            prefix-icon="el-icon-s-check"
            type="password"
          ></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登陆</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return{
      //这是登陆表单的数据绑定对象
      loginForm:{
        username:'admin',  //默认为空
        password:'123456'
      },
      //这是表单的验证规则对象
      loginFormRules:{
        username: [
        { required: true, message: '请输入登录名称', trigger: 'blur' },
        { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 10, message: '长度在 6 到 10 个字符', trigger: 'blur' }
        ]
    }
    }   
  },
  methods:{
    //点击重置按钮，重置登陆表单
    resetLoginForm(){
      this.$refs.loginFormRfef.resetFields();
    },
    login() {
      // validate接收一个回调函数从而获得验证结果,valid为判断结果，为Boolean值，当只有一个参数时，小括号可以取消
      //如果为false不发起请求，如果为true可以发起登陆请求
      this.$refs.loginFormRfef.validate(async valid => {
        if(!valid) return;
        //判断成功发起请求,通过this可以访问到原型上的$http,通过它可以发起请求，请求方法是post请求，括号中(请求地址，请求参数,一般为对象)
        //如果请求服务器，必须保证API服务器处于运行中状态，保证数据库启动后，运行API接口
        //this.$http.post("login",this.loginForm) ：调用post方法就会请求login这个地址，
        //这个地址携带一些参数，登陆的表单数据
        
        // const result = this.$http.post("login",this.loginForm) 
        // console.log(result);  //结果为promise

        //如果某个方法返回结果为promise，可以通过async await简化promise操作，await只能用在被async修饰的方法中
        //故需要将紧挨着await的方法修饰成异步的async方法，兼容函数前面加async
        // const result = await this.$http.post("login", this.loginForm);
        // console.log(result);  

        //结果为具体的响应对象，包含6个属性，这6个属性时axios帮我们封装好的，其中data才是服务器返回的真实数据
        //可以从对象身上将data属性解构赋值出来，{data：res} data属性，重命名为res
        const {data:res} = await this.$http.post("login", this.loginForm);
        // console.log(res); //res为真实的服务器数据

         if(res.meta.status !== 200) return this.$message.error("登陆失败"); // error表示弹出错误的提示框
         this.$message.success("登陆成功");

        //1.将登陆成功之后的taken，保存到客户端的sessionStorage中
        //1.1 项目中除了登陆之外的其他API接口，必须在登陆之后才能访问,taken是登陆后服务器颁发给我们的令牌/身份认证信息
        //在访问时，携带taken，一定可以访问成功，localStorage，是持久化的存储机制，而sessionStorage是回话期间的存储机制
        //taken只在当前网站打开时生效，故存储在sessionStorage中
        //1.2 token 只应在当前网站打开期间生效，所以讲taken保存在sessionStorage中
        //将taken保存到sessionstorage中,(括号值为键值对,taken为键，res.data.taken为值)
          window.sessionStorage.setItem("token", res.data.token)

        //2.通过编程式导航调转到后台主页$router.push方法，路由地址是/home
         this.$router.push("/home")
        
        
      })
    }
  }
};
</script>

<style Lang="less" scoped>
.login_container {
  background-color: #2b2b4b;
  height: 100%;
}
.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px; /*圆角边框 */
  position: absolute; /*这样才可以调整位置 */
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%); /*位移*/
}
/* 语法嵌套 */
.avatar_box {
  height: 130px;
  width: 130px;
  border: solid 1px #eee;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 0 10px #ddd; /* 阴影 */
  position: absolute; /*这样才可以调整位置 */
  left: 50%;
  transform: translate(-50%, -50%); /*位移,百分比是根据盒子的高度来移动的*/
  background-color: #fff;
}
img {
  width: 100%;
  height: 100%;
  border-radius: 50%; /* 倒圆角 */
  background-color: #eee;
}
.btns {
  display: flex;
  justify-content: flex-end;
}
.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
</style>


