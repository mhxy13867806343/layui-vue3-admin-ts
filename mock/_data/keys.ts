/**
 * 密钥管理 Mock 数据
 *
 * 10 个第三方服务的密钥配置，每个服务包含 2 个字段。
 * 字段值默认为空字符串，用户可在密钥管理页填写并保存。
 */

export interface ApiKeyService {
  id: number
  /** 服务编码 */
  code: string
  /** 服务名称 */
  name: string
  /** 服务描述 */
  description: string
  /** 服务图标 class */
  icon: string
  /** 字段 1 标签 */
  field1Label: string
  /** 字段 1 值 */
  field1Value: string
  /** 字段 1 是否为机密 */
  field1Secret: boolean
  /** 字段 2 标签 */
  field2Label: string
  /** 字段 2 值 */
  field2Value: string
  /** 字段 2 是否为机密 */
  field2Secret: boolean
}

/** 兼容旧版 ApiKey 类型（不再使用，保留导出避免外部 import 报错） */
export interface ApiKey {
  id: number
  name: string
  value: string
}

export const apiKeyServices: ApiKeyService[] = [
  {
    id: 1,
    code: 'wechat-mp',
    name: '微信小程序',
    description: '用于微信小程序登录、消息推送等服务',
    icon: 'layui-icon-login-wechat',
    field1Label: 'AppID',
    field1Value: '',
    field1Secret: false,
    field2Label: 'AppSecret',
    field2Value: '',
    field2Secret: true,
  },
  {
    id: 2,
    code: 'wechat-oa',
    name: '微信公众号',
    description: '用于公众号文章、消息、菜单等管理',
    icon: 'layui-icon-login-wechat',
    field1Label: 'AppID',
    field1Value: '',
    field1Secret: false,
    field2Label: 'AppSecret',
    field2Value: '',
    field2Secret: true,
  },
  {
    id: 3,
    code: 'alipay',
    name: '支付宝',
    description: '用于支付宝支付、扫码、网页登录等',
    icon: 'layui-icon-rmb',
    field1Label: 'AppID',
    field1Value: '',
    field1Secret: false,
    field2Label: '商户私钥',
    field2Value: '',
    field2Secret: true,
  },
  {
    id: 4,
    code: 'aliyun',
    name: '阿里云',
    description: '用于阿里云 OSS、SMS、CDN 等服务',
    icon: 'layui-icon-cloud',
    field1Label: 'AccessKey ID',
    field1Value: '',
    field1Secret: false,
    field2Label: 'AccessKey Secret',
    field2Value: '',
    field2Secret: true,
  },
  {
    id: 5,
    code: 'tencent-cloud',
    name: '腾讯云',
    description: '用于腾讯云 COS、SMS、人脸识别等服务',
    icon: 'layui-icon-cloud',
    field1Label: 'SecretId',
    field1Value: '',
    field1Secret: false,
    field2Label: 'SecretKey',
    field2Value: '',
    field2Secret: true,
  },
  {
    id: 6,
    code: 'qiniu',
    name: '七牛云',
    description: '用于七牛云对象存储、CDN 等服务',
    icon: 'layui-icon-cloud',
    field1Label: 'AccessKey',
    field1Value: '',
    field1Secret: false,
    field2Label: 'SecretKey',
    field2Value: '',
    field2Secret: true,
  },
  {
    id: 7,
    code: 'jpush',
    name: '极光推送',
    description: '用于消息推送、即时通讯等服务',
    icon: 'layui-icon-notice',
    field1Label: 'AppKey',
    field1Value: '',
    field1Secret: false,
    field2Label: 'Master Secret',
    field2Value: '',
    field2Secret: true,
  },
  {
    id: 8,
    code: 'amap',
    name: '高德地图',
    description: '用于地图、定位、导航、POI 检索等',
    icon: 'layui-icon-location',
    field1Label: 'Key',
    field1Value: '',
    field1Secret: false,
    field2Label: 'Secret',
    field2Value: '',
    field2Secret: true,
  },
  {
    id: 9,
    code: 'sms',
    name: '短信服务',
    description: '用于发送验证码、通知短信等',
    icon: 'layui-icon-cellphone-fine',
    field1Label: 'AccessKey',
    field1Value: '',
    field1Secret: false,
    field2Label: 'SecretKey',
    field2Value: '',
    field2Secret: true,
  },
  {
    id: 10,
    code: 'github-oauth',
    name: 'GitHub OAuth',
    description: '用于 GitHub 第三方登录',
    icon: 'layui-icon-website',
    field1Label: 'Client ID',
    field1Value: '',
    field1Secret: false,
    field2Label: 'Client Secret',
    field2Value: '',
    field2Secret: true,
  },
]

/** 兼容旧版扁平结构（保留以避免外部引用断裂） */
export const apiKeys: ApiKey[] = []
