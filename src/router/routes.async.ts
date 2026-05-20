import type { RouteRecordRaw } from 'vue-router'

export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Root',
    component: () => import('@/layouts/BasicLayout.vue'),
    redirect: '/dashboard',
    meta: { title: '首页' },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '仪表盘', icon: 'layui-icon-home', permission: 'dashboard:view' },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/index.vue'),
        meta: { title: '个人中心', hidden: true },
      },
      {
        path: 'profile/change-password',
        name: 'ChangePassword',
        component: () => import('@/views/profile/change-password.vue'),
        meta: { title: '修改密码', hidden: true },
      },

      // ===== 示例模块 =====
      {
        path: 'example',
        name: 'Example',
        meta: { title: '示例', icon: 'layui-icon-component' },
        children: [
          {
            path: 'components/button',
            name: 'ExampleButton',
            component: () => import('@/views/example/components/button.vue'),
            meta: { title: 'Button' },
          },
          {
            path: 'components/form',
            name: 'ExampleForm',
            component: () => import('@/views/example/components/form.vue'),
            meta: { title: 'Form' },
          },
          {
            path: 'components/table',
            name: 'ExampleTable',
            component: () => import('@/views/example/components/table.vue'),
            meta: { title: 'Table' },
          },
          {
            path: 'hooks/use-table',
            name: 'ExampleUseTable',
            component: () => import('@/views/example/hooks/use-table.vue'),
            meta: { title: 'useTable' },
          },
          {
            path: 'hooks/use-dict',
            name: 'ExampleUseDict',
            component: () => import('@/views/example/hooks/use-dict.vue'),
            meta: { title: 'useDict' },
          },
          {
            path: 'hooks/use-download',
            name: 'ExampleUseDownload',
            component: () => import('@/views/example/hooks/use-download.vue'),
            meta: { title: 'useDownload' },
          },
          {
            path: 'libs/charts',
            name: 'ExampleCharts',
            component: () => import('@/views/example/libs/charts.vue'),
            meta: { title: 'Charts (echarts)' },
          },
          {
            path: 'libs/dayjs',
            name: 'ExampleDayjs',
            component: () => import('@/views/example/libs/dayjs.vue'),
            meta: { title: 'Dayjs' },
          },
          {
            path: 'libs/upload',
            name: 'ExampleUpload',
            component: () => import('@/views/example/libs/upload.vue'),
            meta: { title: '上传 / Excel' },
          },
          {
            path: 'libs/lodash',
            name: 'ExampleLodash',
            component: () => import('@/views/example/libs/lodash.vue'),
            meta: { title: 'Lodash' },
          },
          {
            path: 'advanced/dynamic-form',
            name: 'ExampleDynamicForm',
            component: () => import('@/views/example/advanced/dynamic-form.vue'),
            meta: { title: '动态表单' },
          },
          {
            path: 'advanced/integration',
            name: 'ExampleIntegration',
            component: () => import('@/views/example/advanced/integration.vue'),
            meta: { title: '第三方库集成' },
          },
        ],
      },

      // ===== 权限演示 =====
      {
        path: 'permission',
        name: 'Permission',
        meta: { title: '权限演示', icon: 'layui-icon-vercode' },
        children: [
          {
            path: 'button',
            name: 'PermissionButton',
            component: () => import('@/views/permission-demo/button.vue'),
            meta: { title: '按钮权限' },
          },
          {
            path: 'page',
            name: 'PermissionPage',
            component: () => import('@/views/permission-demo/page.vue'),
            meta: { title: '页面权限', permission: 'dashboard:view' },
          },
        ],
      },

      // ===== 异常页 =====
      {
        path: 'error',
        name: 'Error',
        meta: { title: '异常页', icon: 'layui-icon-face-cry' },
        children: [
          {
            path: '400',
            name: 'Error400',
            component: () => import('@/views/error/400.vue'),
            meta: { title: '400 错误请求' },
          },
          {
            path: '403',
            name: 'Error403Page',
            component: () => import('@/views/error/403.vue'),
            meta: { title: '403 无权限' },
          },
          {
            path: '404',
            name: 'Error404Page',
            component: () => import('@/views/error/404.vue'),
            meta: { title: '404 找不到' },
          },
          {
            path: '500',
            name: 'Error500Page',
            component: () => import('@/views/error/500.vue'),
            meta: { title: '500 服务异常' },
          },
        ],
      },

      // ===== 系统管理 =====
      {
        path: 'system',
        name: 'System',
        meta: { title: '系统管理', icon: 'layui-icon-set' },
        children: [
          {
            path: 'user',
            name: 'SystemUser',
            component: () => import('@/views/system/user/index.vue'),
            meta: { title: '用户管理', permission: 'user:view' },
          },
          {
            path: 'role',
            name: 'SystemRole',
            component: () => import('@/views/system/role/index.vue'),
            meta: { title: '角色管理', permission: 'role:view' },
          },
          {
            path: 'menu',
            name: 'SystemMenu',
            component: () => import('@/views/system/menu/index.vue'),
            meta: { title: '菜单管理', permission: 'menu:view' },
          },
        ],
      },
    ],
  },
]
