<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddDialog">
            添加角色
          </el-button>
        </el-col>
      </el-row>

      <!-- 角色列表数据 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- 栅格系统布局组件一级权限在el-row中,如果索引为0就加边框，如果索引不为0就不加 -->
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : 'bdbottom', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限,大概占据5列 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">
                  {{ item1.authName }}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环 嵌套渲染二级权限 .添加下划线动态绑定类名，里面加数组-->
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>
              {{ scope.row }}
              </pre> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <!-- 图标尺寸太大，设置图标尺寸，size ,这些按钮在一行显示，设置宽度-->
            <el-button size="mini" type="primary" icon="el-icon-edit"
              >编辑</el-button
            >
            <el-button size="mini" type="danger" icon="el-icon-delete"
              >删除</el-button
            >
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
        
      </el-table>
    </el-card>

    <el-dialog
      title="添加角色"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisiable"
      width="70%"
      @close="setRightDialogClosed"
    >
      <!--树型控件， :data="rightsList"数据绑定，为整个树提供了数据源，
    真正展示还需要:props指定属性绑定对象，为整棵树指定数据展示的字段，
     -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      >
      </el-tree>

      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisiable = false">取 消</el-button>
        <el-button type="primary" @click="allotRights"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      //所有角色列表数据
      rolesList: [],
      // 所有权限的数据
      rightsList: [],
      addDialogVisible: false, //控制弹框的显示和隐藏
      setRightDialogVisiable: false, //控制分配权限弹框的显示和隐藏
      addForm: {
        roleName: "",
        roleDesc: "",
      },
      // 树型件的属性绑定对象，label看到的是哪个属性对应的值，
      // children父子节点通过哪个属性来嵌套
      treeProps: {
        label: "authName",
        children: "children",
      },
      // 默认选中的节点id值
      defKeys: [],
      //当前即将分配权限的角色id
      roleId:"",
      addFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          {
            min: 2,
            max: 15,
            message: "长度在 2 到 15 个字符",
            trigger: "blur",
          },
        ],
      },
    };
  },
  created() {
    this.getrolesList();
  },
  methods: {
    //获取所有角色的列表
    async getrolesList() {
      const { data: res } = await this.$http.get("roles");
      // console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色失败");
      }
      this.rolesList = res.data;
    },
    showAddDialog() {
      this.addDialogVisible = true;
    },
    addRoles() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        //如果验证通过，发送axios请求
        // const a=await this.$http.post("roles", this.addForm);
        const { data: res } = await this.$http.post("roles", this.addForm);
        if (res.meta.status !== 201) {
        return this.$message.error("添加角色失败");
        }
        // this.$message.success("添加角色成功");
        //新增完成后，刷新列表，重新获取列表
        this.getrolesList();
        //隐藏添加用户的对话框
        this.addDialogVisible = false;
      });
    },
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    //根据Id删除对应的用户
    async removeRightById(role, rightId) {
      //弹框提示用户是否要删除
      const confirmResult = await this.$confirm(
        "此操作将永久删除该文件, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      if (confirmResult !== "confirm") {
        return this.$message.info("取消了删除！");
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除权限失败");
      }
      role.children = res.data; //为了避免关闭窗口，重新为权限赋值即可
      // this.getrolesList();  //需要从新刷新，获取
    },
    //展示分配权限对话框
    async showSetRightDialog(role) {
      this.roleId = role.id
      // 在Boolean变成true之前，获取到所有权限的数据
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200) {
        this.$message.error("权限获取失败");
      }
      //获取到的权限数据保存到data中
      this.rightsList = res.data;
      console.log(this.rightsList);

      // 递归获取三级节点的id
      this.getLeafKeys(role, this.defKeys);

      this.setRightDialogVisiable = true;
    },
    //通过递归的形式，获取角色下所有三级权限的id,并保持到defKeys数组中，
    //需要一个节点判断是否是三级节点，同时也需要一个数组保存
    getLeafKeys(node, arr) {
      //如果当前节点不包含children属性，则是三级节点
      if (!node.children) {
        return arr.push(node.id);
      }
      //进一步通过递归获取当前的三级节点,每循环一次获得一个item
      node.children.forEach(item => 
        this.getLeafKeys(item, arr));
    },
    //监听分配权限对话框的关闭事件
    setRightDialogClosed(){
      this.defKeys = []
    },
    //点击为角色分配权限,(...为展开运算符)，获得所有选中和半选中的值
    async allotRights(){
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]

      // 修改为以，拼接的字符串,下面为拼接
      const idStr = keys.join(",")
      //拼接好后，发起请求
      const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
      if(res.meta.status !== 200){
        this.$message.error("权限分配失败")
      }
      
        this.$message.success("权限分配成功")
        console.log("aaaa")
        this.getrolesList()
        this.setRightDialogVisiable = false
    }
  },
};
</script>
<style Lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>