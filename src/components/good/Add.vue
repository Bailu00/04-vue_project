<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区 -->
    <el-card>
      <!-- 提示区域，将删除按钮隐藏，则用:closable="false", 注意双向绑定 -->
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      ></el-alert>
      <!-- 步骤条,将向数组的字符串转为数字，直接-0即可
      核心实现思路：将el-steps和el-tabs两个组件，共用同一个数据项。 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- Tab栏区域,注意left里面要用单引号包括-->
      <!-- v-model双向数据绑定 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormForm"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <!-- type="number"规定永远只能输入数字 -->
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!--1.8.2  :options指定数据源，props:级联选择器的配置项，v-model指向双向绑定的数组 -->
              <!-- v-model="value" :options="options"  :props="cateProps" -->

              <el-cascader
                :props="{
                  expandTrigger: 'hover',
                  label: 'cat_name',
                  value: 'cat_id',
                  children: 'children',
                }"
                :options="cateList"
                v-model="addForm.goods_cat"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项,v-for循环渲染 -->
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTabData"
              :key="item.attr_id"
            >
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  label="cb"
                  v-for="(cb, i) in item.attr_vals"
                  :key="i"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              label="item.attr_name"
              v-for="item in onlyTabData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action 表示图片要上传到的后台API地址; :on-preview用来指定预览事件
            list-type指定当前预览组件的呈现方式-->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headersObj"
              :on-success="handleSucccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">
                只能上传jpg/png文件，且不超过500kb
              </div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addForm.goods_introduce">
            </quill-editor> 
            <!-- 添加商品按钮 -->
            <el-button type="primary" class="btnAdd">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog
      title="图片预览"
      :visible.sync="previewVisible"
      width="50%"
    >
      <img :src="previewPath" alt="" class="previewImg">
    </el-dialog>
  </div>
</template>
<script>
import _ from 'lodash'

export default {
  data() {
    return {
      activeIndex: "0",
      // 添加商品的表单数据对象
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类数组
        goods_cat: [],
        // 图片的数组
        pics: [],
        // 商品的详情描述
        goods_introduce:"",
        attrs: []
      },
      // 检验规则
      addFormRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
        ],
        goods_cat: [
          { required: true, message: "请选择商品分类", trigger: "blur" },
        ],
      },
      // 商品数据分类列表
      cateList: [],

      cateProps: {
        label: "cat_name", //表示看到的是哪个属性
        value: "cat_id", //代表选中的是谁的值
        children: "children", //指定哪个属性实现父子节点的嵌套
      },
      // 动态参数列表数据
      manyTabData: [],
      // 静态属性列表数据
      onlyTabData: [],
      // 上传图片的URL地址
      uploadURL: "http://127.0.0.1:8888/api/private/v1/upload",
      //图片上传组件的headers请求头对象
      headersObj: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      previewPath: "",
      previewVisible:false
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 获取所有商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品数据分类失败");
      }
      this.$message.success("获取商品数据分类成功");
      this.cateList = res.data;
    },
    // 级连选择器选中项变化，会触发这个函数
    handleChange() {
      console.log(this.addForm.goods_cat);
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
      }
    },
    beforeTabLeave(activeName, oldActiveName) {
      // console.log("即将离开的标签页名字" + oldActiveName)
      // console.log("即将进入的标签页名字" + activeName)
      // return false
      // 即将离开的名字是否为0 同时选中的商品分类的长度是否等于3，如果不等于直接return出去，如果等于，直接发送切换
      if (oldActiveName === 0 && this.addForm.goods_cat.length !== 3) {
        this.$message.error("请先选择商品分类！");
        return false;
      }
    },
    async tabClicked() {
      // console.log(this.activeIndex)
      // 证明访问的是动态参数面板
      if (this.activeIndex === "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: "many",
            },
          }
        );
        if (res.meta.status !== 200) {
          this.$message.error("获取动态参数类表失败");
        }
        console.log(res.data);
        // 将获取到的字符串转换为数组
        res.data.forEach((item) => {
          item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ");
        });
      }
      // else if (this.activeIndex === "2") {
      //   const { data: res } = await this.$http.get(
      //     `categories/${this.cateId}/attributes`,
      //     {
      //       params: {
      //         sel: "only",
      //       },
      //     }
      //   );
      //   if (res.meta.status !== 200) {
      //     this.$message.error("获取静态属性失败");
      //   }
      //   console.log(res.data);
      //   // 将获取到的字符串转换为数组
      //   this.onlyTabData = res.data
      // }
    },
    // 处理图片预览效果
    handlePreview(file) {
      console.log(file);
      this.previewPath = file.response.data.url;
      this.previewVisible = true
    },
    // 处理移除图片的操作
    handleRemove(file) {
      //1、 获取将要删除的图片的临时路径
      const filePath = file.response.data.tem_path;
      //2、从pics 数组中，找到这个图片对应的索引值, findIndex找到id并返回
      const i = this.addForm.pics.findIndex((x) => x.pic === filePath);
      //3、调用数组的splice方法，把图片信息对象，从pics数组中移除
      this.addForm.pics.splice(i, 1);
      console.log(this.addForm);
    },
    // 监听图片上传成功的事件，
    handleSucccess(response) {
      console.log(response);
      // 1.先拼接得到一个图片信息对象
      const picInfo = { pics: response.data.tmp_path };
      // 2、将图片信息对象push到pics数组中
      this.addForm.pics.push(picInfo);
      console.log(this.addForm);
    },
    async add(){
      this.$refs.addFormForm.validate(async valid => {
        if(!valid) {
          return this.$message.error("请填写必要的表单项")
        }
        // 执行添加的业务逻辑

        // lodash cloneDeep(obj)
        // addForm只供给页面上级联选择器表单元素进行双向数据绑定，
        // 如果操作使用form即可
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // const {data:res} = await this.$http.post("goods")
        // 处理动态参数
        this.manyTabData.forEach(item => {
          const newInfo = {attr_id:item.attr_id,
          attr_value:item.attr_vals.join(' ')}
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTabData.forEach(item => {
          const newInfo = {attr_id: item.attr_id, attr_value:item.attr_vals}
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        console.log(form)
        // 发起请求添加商品
        // 商品的名称，必须是唯一的
        const {data:res} = await this.$http.post("goods",form)
        if(res.meta.status !== 201) {
          this.$message.error("添加商品失败！")
        }
        this.$message.success("添加商品成功")
        // 变成式导航调转到商品列表页面
        this.$router.push("/goods")
      })
    }
  },
  computed: {
    cateId() {
      //如果包含3级分类，则索引为2的哪项直接return出去即可
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2];
      }
      return null;
    },
  },
};
</script>
<style Lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}

.previewImg {
  width: 100%;
}
.btnAdd {
  margin-top: 15px;
}

</style>