<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 搜索栏，通过:span定义起搜索表单的宽度; -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable>
            <el-button slot="append" icon="el-icon-search" @click="getOrderLsit"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 获取商品列表表单数据,:data绑定数据源，prop指定对应的属性 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column
          label="订单价格"
          prop="order_price"
          width="120px"
        ></el-table-column>
        <el-table-column label="是否付款" prop="pay_status" width="120px">
          <template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.pay_status === '0'"
              >未付款</el-tag
            >
            <el-tag type="success" v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="是否发货"
          prop="is_send"
          width="120px"
        ></el-table-column>
        <el-table-column label="下单时间" prop="create_time" width="250px">
          <template slot-scope="scope">
            <!-- 通过过滤器，显示成所需要的事件表示方式, scope.row指这一行的数据；竖线|调用全局过滤器 -->
            {{ scope.row.update_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <template>
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showBox"
            ></el-button>
            <el-button
              size="mini"
              type="success"
              icon="el-icon-location"
              @click="showProgressBox"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[8, 15, 20, 30]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 修改地址弹框; 关闭对话框重置对话框，@close -->
    <el-dialog
      title="修改地址"
      :visible.sync="addressVisible"
      width="50%"
      @close="addressDialogClosed"
    >
      <el-form
        :model="addressForm"
        :rules="addressFormRules"
        ref="addressFormRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-input v-model="addressForm.address1"></el-input>

          <!-- 将input改造成级联选择器; :options指定数据源；v-model指当前选定的值双向绑定到哪里 -->
          <!-- <el-cascader :options="cityData" v-model="addressForm.address1">
          </el-cascader> -->
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 展示物流进度的对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
      
      <!-- 时间线 -->
      <!-- <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >
          {{ activity.context}}
        </el-timeline-item>
      </el-timeline> -->

    </el-dialog>
  </div>
</template>
<script>
// import cityData from './cityData.js'

export default {
  data() {
    return {
      // 查询对象，query为查询条件
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 8,
      },
      // 获得商品数据列表
      orderList: [],
      total: 0,
      // 控制修改地址弹框的显示和隐藏
      addressVisible: false,
      // 修改地址的数据,注意为对象
      addressForm: {
        // address1为级联选择器，应该定义为数组
        address1: [],
        address2: "",
      },
      // 修改地址的验证规则
      addressFormRules: {
        address1: [
          { required: true, message: "请选择省市区/县", trigger: "blur" },
        ],
        address2: [
          { required: true, message: "请输入详细地址", trigger: "blur" },
        ],
      },
      // 如果属性名和属性值一样，如：cityData:cityData，则写成下面即可
      // cityData

      // 控制物流进度弹框的显示和隐藏
      progressVisible: false,
      progressInfo: [],
    };
  },
  created() {
    // 创建获得商品数据列表函数
    this.getOrderLsit();
  },
  methods: {
    async getOrderLsit() {
      const { data: res } = await this.$http.get("orders", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("商品数据列表获取失败");
      }
      this.$message.success("商品数据列表获取成功");
      console.log(res);
      this.orderList = res.data.goods;
      this.total = res.data.total;
    },
    // 改变size时触发的函数
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrderLsit();
    },
    // 改变页码时触发的函数
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getOrderLsit();
    },
    // 展示修改地址的对话框
    showBox() {
      this.addressVisible = true;
    },
    // 监听修改地址弹框关闭的事件，重置弹框
    addressDialogClosed() {
      this.$refs.addressFormRef.resetFields();
    },
    // 展示物料进度对话框
    // async
    showProgressBox() {
      // 展示对话框之前应先获得物料数据，请求数据
      // const {data:res} = await this.$http.get(`/kuaidi/1106975712662`)
      // if(res.meta.status !== 200){
      //   return this.$message.error("物流进度请求失败")
      // }
      // this.progressInfo = res.data
      // console.log(this.progressInfo)

      this.progressVisible = true;
    },
  },
};
</script>
<style Lang="less" scoped>
/* 导入时间线的对应样式 */
/* @import '../../plugins/timeline/timeline.css';
@import '../../plugins/timeline-item/timeline-item.css'; */

</style>