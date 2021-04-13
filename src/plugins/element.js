import Vue from 'vue'
// import { Button } from 'element-ui'
// import { Form, FormItem } from 'element-ui'
// import {Input} from 'element-ui' //大括号表示按需导入
// import {Message} from 'element-ui' //导入弹框提示组件


//按需导入 
import {
  Button,
  Form, 
  FormItem, 
  Input, 
  Message, 
  Container, 
  Header, 
  Aside, 
  Main,
  Menu,
  MenuItem,
  MenuItemGroup,
  Submenu,
  Breadcrumb,
  BreadcrumbItem,
  Card,
  Row,
  Col,
  Table,
  TableColumn, 
  Switch,
  Tooltip,
  Pagination,
  Dialog,
  MessageBox 
} from 'element-ui'

// 全局注册
Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Menu)
Vue.use(MenuItem)
Vue.use(MenuItemGroup)
Vue.use(Submenu)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Card)
Vue.use(Row)
Vue.use(Col)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Switch)
Vue.use(Tooltip)
Vue.use(Pagination)
Vue.use(Dialog)
//message的配置方式和其他不一样，需要进行全局挂载,后面的Message为组件=将弹框组件挂载到Vue的原型对象上
//这样每个组件都可以通过this访问到$message,只要访问到$message就可以进行弹框提示
Vue.prototype.$message = Message

// MessageBox全局挂载
Vue.prototype.$confirm = MessageBox.confirm
