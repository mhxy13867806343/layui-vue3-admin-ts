/**
 * Mock：移动端排行榜
 *
 * - GET /api/mobile-rank?period=week|month|all
 */
import { guard, ok, parseQuery, type MockMethod } from './_utils'
import { mobileRanks, type RankPeriod } from './_data/mobile-ranks'

const mobileRankMocks: MockMethod[] = [
  {
    url: '/api/mobile-rank',
    method: 'get',
    response: guard((req): unknown => {
      const q = parseQuery(req.url) as { period?: string }
      const period = ((q.period as RankPeriod) || 'week') as RankPeriod
      const list = mobileRanks[period] || mobileRanks.week
      return ok(list)
    }),
  },
]

export default mobileRankMocks
