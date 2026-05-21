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
            path: 'libs/format-demo',
            name: 'ExampleFormatDemo',
            component: () => import('@/views/example/libs/format-demo.vue'),
            meta: { title: 'Format 工具库' },
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
          {
            path: 'advanced/rich-editor',
            name: 'ExampleRichEditor',
            component: () => import('@/views/example/advanced/rich-editor.vue'),
            meta: { title: '富文本编辑器' },
          },
          {
            path: 'advanced/ai-chat',
            name: 'ExampleAiChat',
            component: () => import('@/views/example/advanced/ai-chat.vue'),
            meta: { title: 'AI 对话' },
          },
          {
            path: 'advanced/third-party',
            name: 'ExampleThirdParty',
            component: () => import('@/views/example/advanced/third-party.vue'),
            meta: { title: '第三方绑定' },
          },
          {
            path: 'advanced/payment',
            name: 'ExamplePayment',
            component: () => import('@/views/example/advanced/payment.vue'),
            meta: { title: '支付方式' },
          },
          {
            path: 'advanced/websocket',
            name: 'ExampleWebSocket',
            component: () => import('@/views/example/advanced/websocket.vue'),
            meta: { title: 'WebSocket' },
          },
          {
            path: 'advanced/calendar',
            name: 'ExampleCalendar',
            component: () => import('@/views/example/advanced/calendar.vue'),
            meta: { title: '日历' },
          },
          {
            path: 'advanced/visualization',
            name: 'ExampleVisualization',
            component: () => import('@/views/example/advanced/visualization.vue'),
            meta: { title: '可视化图形' },
          },
          {
            path: 'advanced/threejs',
            name: 'ExampleThreejs',
            component: () => import('@/views/example/advanced/threejs.vue'),
            meta: { title: 'Three.js 3D' },
          },
          {
            path: 'advanced/print',
            name: 'ExamplePrint',
            component: () => import('@/views/example/advanced/print.vue'),
            meta: { title: '打印' },
          },
          {
            path: 'advanced/version-update',
            name: 'ExampleVersionUpdate',
            component: () => import('@/views/example/advanced/version-update.vue'),
            meta: { title: '版本更新' },
          },
          {
            path: 'advanced/feedback',
            name: 'ExampleFeedback',
            component: () => import('@/views/example/advanced/feedback.vue'),
            meta: { title: '问题反馈' },
          },
          {
            path: 'advanced/video',
            name: 'ExampleVideo',
            component: () => import('@/views/example/advanced/video.vue'),
            meta: { title: '视频播放器' },
          },
          {
            path: 'advanced/mobile-rank',
            name: 'ExampleMobileRank',
            component: () => import('@/views/example/advanced/mobile-rank.vue'),
            meta: { title: '移动端排行榜' },
          },
          {
            path: 'advanced/qrcode-config',
            name: 'ExampleQrcodeConfig',
            component: () => import('@/views/example/advanced/qrcode-config.vue'),
            meta: { title: '二维码配置' },
          },
          {
            path: 'advanced/dynamic-feed',
            name: 'ExampleDynamicFeed',
            component: () => import('@/views/example/advanced/dynamic-feed.vue'),
            meta: { title: '多端动态' },
          },
          {
            path: 'advanced/comment-system',
            name: 'ExampleCommentSystem',
            component: () => import('@/views/example/advanced/comment-system.vue'),
            meta: { title: '评论系统' },
          },
          {
            path: 'advanced/waterfall-layout',
            name: 'ExampleWaterfallLayout',
            component: () => import('@/views/example/advanced/waterfall-layout.vue'),
            meta: { title: '瀑布流布局' },
          },
          {
            path: 'advanced/flash-sale',
            name: 'ExampleFlashSale',
            component: () => import('@/views/example/advanced/flash-sale.vue'),
            meta: { title: '秒杀活动' },
          },
          {
            path: 'advanced/tabbar-config',
            name: 'ExampleTabbarConfig',
            component: () => import('@/views/example/advanced/tabbar-config.vue'),
            meta: { title: '底部导航配置' },
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
            path: '200',
            name: 'Success200',
            component: () => import('@/views/error/200.vue'),
            meta: { title: '200 操作成功' },
          },
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
          {
            path: 'dict',
            name: 'SystemDict',
            component: () => import('@/views/system/dict/index.vue'),
            meta: { title: '字典管理', permission: 'dict:view' },
          },
          {
            path: 'version',
            name: 'SystemVersion',
            component: () => import('@/views/system/version/index.vue'),
            meta: { title: '版本管理', permission: 'version:view' },
          },
          {
            path: 'settings',
            name: 'SystemSettings',
            component: () => import('@/views/system/settings/index.vue'),
            meta: { title: '系统设置', permission: 'settings:view' },
          },
          {
            path: 'keys',
            name: 'SystemKeys',
            component: () => import('@/views/system/keys/index.vue'),
            meta: { title: '密钥管理', permission: 'keys:view' },
          },
          {
            path: 'audit-log',
            name: 'SystemAuditLog',
            component: () => import('@/views/system/audit-log/index.vue'),
            meta: { title: '操作日志', permission: 'audit:view' },
          },
        ],
      },
    ],
  },
]
