<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!--2、 为 ECharts 准备一个具备大小（宽高）的 DOM -->
    <div id="main" style="width: 750px;height:400px;"></div>
    </el-card>
  </div>
</template>
<script>
// 1、导入Echarts
// import echarts from 'echarts'
import * as echarts from 'echarts';
import _ from 'lodash'

export default {
  data() {
    return {
      // 需要合并的数据
       options: {
          title: {
            text: '用户来源'
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              label: {
                backgroundColor: '#E9EEF3'
              }
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: [
            {
              boundaryGap: false
            }
          ],
          yAxis: [
            {
              type: 'value'
            }
          ]
        }
    }
  },
  created(){},
  // 初始化图标必须在页面上的DOM结构被渲染完毕之后，才能进行初始化，在DOM完成之后才会执行，这个函数就是mounted，
  //此时，页面上的元素已经被渲染完毕
  async mounted(){
    //3、基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'))

// 获取折线图数据
    const {data:res} = await this.$http.get("reports/type/1")
    if(res.meta.status !== 200) {
      this.$message.error("获取折线数据失败");
    }

    // 4、准备数据和配置项
    // 使用lodash提供的merge函数，将服务器返回的data数据和自己拷贝的options进行合并得到新的对象，
    // 最终将合并的结果result交给图标展示
    const result = _.merge(res.data, this.options)

    // 5、展示数据
    myChart.setOption(result);
  },
  methods:{

  }
}
</script>
<style lang="less" scoped>

</style>