<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <el-row :gutter="20">
        <!-- :span表示占位, row 中的gutter用来修饰两个元素之间的距离 -->
        <el-col :span="8">
          <!-- 将文本输入框里的数据和查询里面的query做数据绑定-->
          <!--clearable实现清空的效果, 当点击清空按钮时，触发一个清空事件 -->
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <!-- 点击搜索按钮，就应该调用 getGoodsList() ; slot="append"为扩展出去的搜索图框-->
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 获取商品列表的表单数据 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="95px"
        ></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="140px">
          <template slot-scope="scope">
            <!-- 竖线（|）为调动过滤器 -->
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit"></el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeById(scope.row.goods_id)"></el-button>
          </template>          
        </el-table-column>
      </el-table>

      <!-- 分页功能 -->
      <!-- :page-size表示页面显示几条数据,layout表示当前的分页区域总共有几部分组成，total查询到的总数 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 40]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      >
      </el-pagination>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 查询参数对象，商品列表的查询条件，请求参数，query为搜索关键字
      queryInfo:{
        query:"",
        pagenum:1,
        pagesize:5
      },
    // 获得的商品列表，默认为空数组
      goodsList:[],
      // 总数据条数
      total:0
    };
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    // 根据分页获取对应的数据列表
    async getGoodsList(){
    const {data:res} = await  this.$http.get("goods",{params: this.queryInfo})
    if(res.meta.status !== 200){
      return this.$message.error("商品列表请求失败")
    }
    this.$message.success("商品列表请求成功！")
    console.log(res)
    // 将商品列表进行赋值
    this.goodsList = res.data.goods
    // 为总数据条数赋值
    this.total = res.data.total
    },
    handleSizeChange(newSize){
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    handleCurrentChange(newPage){
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    // .catch(err => err) 为捕获取消的行为，将取消的结果也return出去； async和await简化操作，简化后返回字符串。
    async removeById(id){
       const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if(confirmResult !== 'confirm'){
          return this.$message.error("取消删除")
        }
        const {data:res} = await this.$http.delete(`goods/${id}`)
        if(res.meta.status !== 200){
          return this.$message.error("删除失败")
        }
        this.$message.success("删除成功")
        this.getGoodsList()
    },
    // 添加商品页,$router路由导航对象的调用.push函数挑战到指定的路由页面
    goAddPage(){
      this.$router.push("/goods/add")
    }
  },
};
</script>
<style Lang="less" scoped>
</style>