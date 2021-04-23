<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 放一行，行里面再放一列，列里面放按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>

      <!-- 表格区 -->
      <!-- data属性时表格的数据源， -->
      <tree-table
        class="tree-table"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!--是否有效， slot-scope接收这一行的数据 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- 排序，slot-scope接收作用域插槽里面的数据 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            size="mini"
            type="success"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <template slot="opt">
          <el-button size="mini" type="primary" icon="el-icon-edit"
            >编辑</el-button
          >
          <el-button size="mini" type="danger" icon="el-icon-delete"
            >删除</el-button
          >
        </template>
      </tree-table>

      <!-- 分页功能 -->
      <!-- :page-size表示页面显示几条数据,layout表示当前的分页区域总共有几部分组成，total查询到的总数 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="hanleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>

      <!-- 添加分类的对话框 -->
      <el-dialog
        title="添加分类"
        :visible.sync="addCateDialogVisible"
        width="50%"
        @close="addCateDialogClosed"
      >
        <!-- 添加分类的表单 -->
        <el-form
          :model="addCateForm"
          :rules="addCateFormRules"
          ref="addCateFormRef"
          label-width="100px"
          @click="getParentCateList"
        >
          <el-form-item label="分类名称:" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <!-- 父级分类，删除Prop,不需要有验证规则 -->
          <el-form-item label="父级分类:">
            <!-- 级联选择器，options用来指定的数据源，expand-trigger通过鼠标覆盖来展示子菜单
            props用来指定配置对象，v-model将选定的值，双向绑定到data中，必须是一个数组
            （v-model="selectedKeys"将选定的值，全都绑定到selectedKeys中）
            @change 只要级联选择器的选中项发生了变化，即立刻出发这个函数 -->
            <el-cascader
              expand-trigger="hover"
              :options="parentCateList"
              :props="cascaderProps"
              v-model="selectedKeys"
              @change="parentCateChange"
            ></el-cascader>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="addCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 商品数据分类列表的查询条件,请求参数
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 3,
      },
      //商品分类的数据列表，默认为空
      cateList: [],
      // 总数据条数
      total: 0,
      columns: [
        { label: "分类名称", prop: "cat_name" },
        {
          label: "是否有效",
          prop: "cat_pid",
          // 表示将当前页定义为模板列
          type: "template",
          // 表示当前页使用的模板名称
          template: "isok",
        },
        {
          label: "排序",
          prop: "cat_level",
          // 表示将当前页定义为模板列
          type: "template",
          // 表示当前页使用的模板名称
          template: "order",
        },
        {
          label: "操作",
          type: "template",
          template: "opt",
        },
      ],
      //控制添加分类弹框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加的分类名称
        cat_name: "",
        // 父级分类的id
        cat_pid: 0,
        // 分类默认要添加的是一级分类
        cat_level: 0,
      },
      // 添加分类表单的验证规则对象
      addCateFormRules: {
        // 将要添加的分类名称
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器的配置对象,value指定具体选中那个值的属性
      // label指定看到的数据属性，children指定父子嵌套用的那个属性
      cascaderProps: {
        value: "cat_id ",
        label: "cat_name",
        children: "children",
      },
      // 选中的父级分类的id数组
      selectedKeys: [],
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 获取商品分类数据,this.$http.get("请求路径",查询参数)由于是get请求，
    //所以查询参数中放对象，对象中由parames指向查询参数,
    // 请求成功之后返回一个结果，为promise对象；用async和 await 简化这次异步操作
    // 从返回的数据对象中，用解构赋值，将data属性解构出来，用：重命名为res
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.querInfo
      });
      // 下面检测请求是否成功
      if (res.meta.status !== 200) {
        return this.$message.error("商品分类清单获取失败");
      }
      // 为数据列表赋值给看cateList
      this.cateList = res.data.result;
      // 为总数据条数赋值tatal
      this.total = res.data.total;
    },
    // 监听pagesize (当前显示几条数据)改变
    handleSizeChange(newSize) {
      // 只要拿到最新的pagesize，理解赋值给querInfo中的pagesize
      this.querInfo.pagesize = newSize;
      // pagesize改变之后，立即需要刷新数据
      this.getCateList();
    },
    // 监听 currentpage 当前页码的改变
    hanleCurrentChange(newPage) {
      // 将最新的页码进行赋值
      this.querInfo.pagenum = newPage;
      // 页码改变后，立即刷新数据
      this.getCateList();
    },
    // 点击按钮，展示添加分类的对话框
    showAddCateDialog() {
      // 先获取父级别分类的数据列表
      this.getParentCateList();
      // 再展示出对话框
      this.addCateDialogVisible = true;
    },
    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 },
      });
      if (res.meta.status !== 200) {
        return this.$message.error("父级分类获取失败");
      }
      this.parentCateList = res.data;
      console.log(this.parentCateList);
    },
    // 选择项发生变化触发这个函数
    parentCateChange() {
      console.log(this.selectedKeys);
    },
    // 监听对话框的关闭事件，重置表单数据，所以拿到的是表单的引用
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields();
      //清空联级选择器,请空数组
      this.selectedKeys = [];
      //将表单中的cat_level和cat_id 也清空
      this.addCateForm.cat_level = 0;
      this.addCateForm.cat_pid = 0;
    },
    // 点击按钮，添加新的分类
    addCate() {
      // 拿到表单引用，进行预验证
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          "categories",
          this.addCateForm
        );
        if (res.meta.status !== 200) {
          return this.$message.error("添加分类失败")
        }
        this.$message.success("添加分类成功")
        this.getCateList()
        this.addCateDialogVisible = false
      });
    },
  },
};
</script>
<style Lang="less" scoped>
.tree-table {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>