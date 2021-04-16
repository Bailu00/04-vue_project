<template>
  <!-- 再外层必须放一个根容器进行包裹 -->
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>活动管理</el-breadcrumb-item>
      <el-breadcrumb-item>活动列表</el-breadcrumb-item>
      <el-breadcrumb-item>活动详情</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 搜索与添加区域 -->

      <el-row :gutter="20">
        <el-col :span="7">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <!-- @click="getUserList"点击按钮，发起查询请求 -->
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <!-- 用户列表区 ，data表示为当前数据指定数据源，stripe斑马纹，隔行变色-->
      <el-table :data="userList" border stripe>
        <el-table-column type="index"></el-table-column>
        <!-- label指定这一列的标题，prop用来指定这一列所需要渲染的是哪一个数据项，表示第一条的username渲染到了姓名这一列中 -->
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <!-- 作用域插槽，接收了scope，那么scope.row对应的是这一行的所有数据
            作用域插槽会覆盖prop -->
            <!-- {{ scope.row }} -->
            <!-- v-model双向数据绑定，可以将开关和数据状态进行关联， -->
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChange(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!--template内部要有slot-scope="scope"，由于报错，暂时放在外面 -->
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- 角色分配按钮 -->
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域，@size-change：事件处理函数，切换每页显示多少条的菜单。 @current-change表示页码值发生切换，触发第二个函数
       current-page绑定当前页。page-sizes="[1, 2, 5, 10]为数组，提供了几项，在下拉菜单中就可以看到几项。
       page-size当前情况下每页显示几条数据。layout为字符串，用于指定页面上需要展现那些功能组件  -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="10"
      >
      </el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <!--:visible.sync="addDialogVisible" 属性绑定，用来控制对话框的显示和隐藏；before-close 关闭前触发的事件 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 内部主题区 -->
      <!-- :model数据绑定对象； :rules验证规则对象； ref引用对象-->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="70px"
      >
        <!-- prop指定具体的校验规则，校验规则一定在addFormRules进行具体的字段定义，
      v-model数据的双向绑定，绑定到addForm表单数据对象上，
      也就是说今后咱们数据的所有数据都会自动同步到addForm中 -->
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户的对话框,ref为表单引用 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="70px"
      >
        <!-- disabled为禁用状态 -->
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色的对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @close="setRoleDialogClosed"
    >
      <p>当前的用户：{{ userInfo.username }}</p>
      <p>当前的角色：{{ userInfo.role_name }}</p>
      <!-- v-model="value"将用户选定的值，双向同步到data数据中；
      每一个选项都需要手动的for循环，自动生成出来；
      每一个for循环中，可以通过:label来指定你所能看到的这个名词；
       :value指你选中之后，真正选中的value值-->
      <p>
        分配新角色：
        <el-select v-model="selectedRoleId" placeholder="请选择">
          <el-option
            v-for="item in roleList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  // data代表当前组件的数据
  data() {
    // 验证邮箱的规则,每个规则中都有三个参数，分别为：rule,待校验的value,callback
    var checkEmail = (rule, value, callback) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([A-Za-z0-9_-])+@([A-Za-z0-9_-])+(\.[A-Za-z0-9_-])+/;
      //test检验是否合法
      if (regEmail.test(value)) {
        //合法邮箱
        return callback();
      }
      //非法邮箱
      callback(new Error("请输入合法的邮箱"));
    };
    //验证手机号的规则，
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^1(3|4|5|6|7|8|9)\d{9}$/;
      if (regMobile.test(value)) {
        //合法手机号
        return callback();
      }
      //不合法手机号
      callback(new Error("请输入合法的手机号"));
    };
    return {
      //获取用户列表的参数对象
      queryInfo: {
        query: "", //搜索关键字
        pagenum: 1, //pagenum表示当前的页数,默认为第一页
        pagesize: 2, //每页显示两行数据
      },
      userList: [],
      total: 0,
      addDialogVisible: false, //控制添加用户对话框的显示与隐藏
      editDialogVisible: false, //控制修改对话框的显示与隐藏
      deleteDialogVisible: false, //控制删除对话框的显示与隐藏
      editForm: {}, //查询到的用户数据对象
      //添加用户的表单数据
      addForm: {
        username: "",
        password: "",
        mail: "",
        mobile: "",
      },
      //分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      userInfo: "", //需要被分配角色的用户信息
      roleList: "", //获得所有角色的数据列表
      selectedRoleId:"",  //已选中的角色id值
      //添加表单的验证规则对象
      addFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 5, message: "长度在 3 到 5 个字符", trigger: "blur" },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "长度在 6 到 15 个字符",
            trigger: "blur",
          },
        ],
        email: [
          // 第一个规则，判断是否输入邮箱
          { required: true, message: "请输入邮箱", trigger: "blur" },
          //第二个规则，判断输入邮箱是否合法
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
      editFormRules: {
        email: [
          // 第一个规则，判断是否输入邮箱
          { required: true, message: "请输入邮箱", trigger: "blur" },
          //第二个规则，判断输入邮箱是否合法
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
    };
  },
  //生命周期函数
  created() {
    // this调用getUserList函数
    this.getUserList();
  },
  //定义当前组件的事件，函数
  methods: {
    async getUserList() {
      // 此次请求携带参数,get参数替换为this.queryInfo, 在页面创建期间，
      //数据请求，1、声明周期中创建函数/2、调用函数，3、
      //get请求的第一个参数为：请求地址，第二个参数为get 参数，包含三个属性，query: pagenum,pagesize. 注意参数单词不要写错
      //

      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo,
      });
      // console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("获取用户列表失败");
      } //错误消息在meta的msg上
      //判断成功后，将获取到的值赋给相应的数
      this.userList = res.data.users;
      this.total = res.data.total;
    },
    //监听pagesize改变的事件
    handleSizeChange(newSize) {
      // console.log(newSize);
      // 当每页显示几条发生变化是，我们需要重新请求数据
      this.queryInfo.pagesize = newSize;
      // 直接调用请求数据的方法
      this.getUserList();
    },
    //监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      // console.log(newPage);
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    //监听switch开关状态的改变,uId 是动态数据，
    //为了拼接一些动态参数，将单引号修改为模板字符串，反引号,
    //users/:uId/state/:type ,前面有冒号：，表示为变量
    async userStateChange(userinfo) {
      // console.log(userinfo);
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      );
      if (res.meta.status !== 200) {
        // 更新失败，数据库重置失败，但是页面已经修改，所以需要重置回去
        userinfo.mg_state = !userinfo.mg_state;
        return this.$message.error("更新用户状态失败");
      }
      this.$message.success("更新用户状态成功");
    },
    //监听添加用户对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    //监听修改用户对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    //点击按钮，添加新用户
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        //如果验证失败，则return出去,valid接收校验结果
        if (!valid) return;
        //如果验证成功，可以发起添加用户的网络请求
        const { data: res } = await this.$http.post("users", this.addForm);
        console.log(res);
        if (res.meta.status !== 201) {
          this.$message.error("添加用户失败！");
        }
        this.$message.success("添加用户成功！");
        //隐藏添加用户的对话框
        this.addDialogVisible = false;
        //新增完成后，刷新列表，重新获取列表
        this.getUserList();
      });
    },
    //修改用户信息并提交
    editUserInfo() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;
        //验证通过，发起数据的用户请求,修改的所有数据从editForm中取出就好
        const { data: res } = await this.$http.put(
          `users/` + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile,
          }
        );
        if (res.meta.status !== 200) {
          this.$message.error("更新用户失败！");
        }
        //提示跟新成功
        this.$message.success("更新用户成功！");
        //更新成功后，关闭对话框
        this.editDialogVisible = false;
        //新增完成后，刷新列表，重新获取列表
        this.getUserList();
      });
    },
    //显示编辑用户的对话框
    async showEditDialog(id) {
      // console.log(id);
      //id拿到，通过id调用API接口，获取信息，动态数据用反引号，字符串拼接
      const { data: res } = await this.$http.get(`users/` + id);
      if (res.meta.status !== 200) {
        this.$message.error("查询用户消息失败");
      }
      this.$message.success("查询用户消息成功！");
      //查询到的数据，保存到data上供页面使用,赋值
      this.editForm = res.data;

      this.editDialogVisible = true;
    },
    //根据id删除对应的用户信息
    async removeUserById(id) {
      console.log(id);
      // 弹框询问用户是否删除数据，this.$confirm的返回值是promise
      const confirmResult = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      //如果用户确认删除，则返回值为字符串confirm。
      //如果取消删除，则返回值为字符串cancel，用catch捕获这个消息,返回err的这个消息
      // console.log(confirmResult)
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除");
      }
      const { data: res } = await this.$http.delete(`users/` + id);
      if (res.meta.status !== 200) {
        return this.$message.error("删除用户失败");
      }
      return this.$message.success("删除用户成功!"), this.getUserList();
    },
    //展示分配角色的对话框
    async setRole(userInfo) {
      this.userInfo = userInfo;
      //在展示对话框之前，获取所有角色的列表
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("列表获取失败");
      }
      this.roleList = res.data;
      this.setRoleDialogVisible = true;
    },
    //点击按钮，分配角色
    async saveRoleInfo(){
      // 先判断有无选择一个新的角色
      if(!this.selectedRoleId){
        return this.$message.error("请选择要分配的角色")
      }
      // 如果有选中，则保存这个角色
      const {data:res} = await this.$http.put(`users/${this.userInfo.id}/role`,{rid: this.selectedRoleId})
      if(res.meta.status !== 200){
        this.$message.error("更新角色失败")
      }
      this.$message.success("更新角色成功")
      //刷新当前的用户列表
      this.getUserList()
      
      this.setRoleDialogVisible = false
    },
    //监听分配角色对话框的关闭事件
    setRoleDialogClosed(){
      this.selectedRoleId = ""
      this.userInfo = {}
    }
  },
};
</script>

<style lang="less" scoped>
</style>