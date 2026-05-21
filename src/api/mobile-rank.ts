/**
 * 移动端排行榜 API
 */
import { http } from '@/utils/http'
import type { RankPeriod, RankUser } from '../../mock/_data/mobile-ranks'

export type { RankPeriod, RankUser }

export const getMobileRank = (period: RankPeriod) =>
  http.get<RankUser[]>('/mobile-rank', { params: { period } })
