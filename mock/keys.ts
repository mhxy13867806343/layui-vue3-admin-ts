/**
 * Mock：密钥管理模块
 *
 * 接口列表：
 * - GET  /api/keys       获取所有第三方服务密钥
 * - PUT  /api/keys       批量保存密钥（按 id 局部更新 field1Value/field2Value）
 */
import { guard, ok, parseBody, type MockMethod } from './_utils'
import { apiKeyServices, type ApiKeyService } from './_data/keys'

const keysMocks: MockMethod[] = [
  // ===== 获取所有密钥 =====
  {
    url: '/api/keys',
    method: 'get',
    response: guard((): unknown => {
      return ok(apiKeyServices)
    }),
  },

  // ===== 批量保存密钥 =====
  {
    url: '/api/keys',
    method: 'put',
    response: guard((req): unknown => {
      const body = parseBody<{ keys: ApiKeyService[] }>(req)
      if (body.keys && Array.isArray(body.keys)) {
        for (const incoming of body.keys) {
          const target = apiKeyServices.find((k) => k.id === incoming.id)
          if (target) {
            if (typeof incoming.field1Value === 'string') target.field1Value = incoming.field1Value
            if (typeof incoming.field2Value === 'string') target.field2Value = incoming.field2Value
          }
        }
      }
      return ok(apiKeyServices, '保存成功')
    }),
  },
]

export default keysMocks
