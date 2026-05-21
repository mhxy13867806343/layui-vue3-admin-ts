/**
 * 移动端排行榜 Mock 数据
 *
 * 三个榜单：周榜 / 月榜 / 总榜，每榜 12 名用户。
 */

export interface RankUser {
  id: number
  name: string
  bio: string
  /** 头像背景色（用于绘制字母头像） */
  avatarColor: string
  followCount: number
  fansCount: number
  articleCount: number
  followed: boolean
}

const NICKNAMES_WEEK = [
  'astinlee', 'martsforever', '阳光奋斗的小青年', '王圣松', 'CandyPop', '冷月清风',
  '夜雨花落', 'CodeMaster', '程序员小张', '前端小白', 'DevCat', '热爱代码的鱼',
]

const NICKNAMES_MONTH = [
  'TechGuru', 'OpenSourceHero', '极客阿强', '编程小能手', 'JavaSenior', 'PythonLover',
  'VueDev', 'ReactFan', '后端老司机', 'DevOps小马', 'AI研究员', '区块链布道者',
]

const NICKNAMES_ALL = [
  '阮一峰', '尤雨溪粉丝', 'Linus追随者', '云原生专家', '架构师老王', 'Kubernetes专家',
  '分布式系统', '高并发挑战者', '全栈小白', '技术作家', '开源贡献者', 'CTO张三',
]

const BIOS = [
  '暂无简介', '略懂 Java', '烟花从侧面看还是圆的吗', '前端搬砖工', '热爱开源',
  '专注后端开发', 'Vue 全家桶', 'React 重度用户', 'Linux 爱好者', '关注架构与算法',
  '每天写一点点', 'Code is poetry', '保持好奇心', 'Stay hungry, stay foolish',
]

const COLORS = [
  '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#a855f7', '#ec4899',
  '#14b8a6', '#f97316', '#84cc16', '#06b6d4', '#8b5cf6', '#f43f5e',
]

function buildUsers(nicknames: string[], scaleFactor = 1): RankUser[] {
  return nicknames.map((name, i) => ({
    id: i + 1,
    name,
    bio: BIOS[Math.floor(Math.random() * BIOS.length)],
    avatarColor: COLORS[i % COLORS.length],
    followCount: Math.floor((Math.random() * 500 + 50) * scaleFactor),
    fansCount: Math.floor((Math.random() * 5000 + 200) * scaleFactor),
    articleCount: Math.floor((Math.random() * 200 + 10) * scaleFactor),
    followed: false,
  }))
}

export const mobileRanks: { week: RankUser[]; month: RankUser[]; all: RankUser[] } = {
  week: buildUsers(NICKNAMES_WEEK, 1),
  month: buildUsers(NICKNAMES_MONTH, 2),
  all: buildUsers(NICKNAMES_ALL, 5),
}

export type RankPeriod = 'week' | 'month' | 'all'
