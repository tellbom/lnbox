<template>
    <div class="mc-home">

        <!-- 欢迎行 -->
        <div class="mc-home__greeting">
            <div>
                <h1 class="mc-home__hello">{{ greeting }}，{{ adminInfo.nickname || adminInfo.userid }}</h1>
                <p class="mc-home__date">{{ todayLabel }}</p>
            </div>
            <el-button :loading="loading" size="small" @click="reload" plain>
                刷新数据
            </el-button>
        </div>

        <!-- 错误提示 -->
        <div v-if="loadError" class="mc-home__error">
            <el-icon :size="18"><WarningFilled /></el-icon>
            <span>数据加载失败</span>
            <el-button size="small" @click="reload">重试</el-button>
        </div>

        <!-- 统计卡片 -->
        <McHomeStatCards
            :total="stats.total"
            :unread="stats.unread"
            :today="stats.today"
            :with-url="stats.withUrl"
            :loading="loading"
        />

        <!-- 图表行：趋势 + 分布并排 -->
        <div class="mc-home__charts">
            <McHomeTrendChart :data="trendData" :loading="loading" />
            <McHomeDistChart  :read="stats.read" :unread="stats.unread" :loading="loading" />
        </div>

        <!-- 最近消息 -->
        <McHomeRecentList :items="recentMessages" :loading="loading" @open="onOpenMessage" />

    </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { WarningFilled } from '@element-plus/icons-vue'
import { useAdminInfo } from '/@/stores/adminInfo'
import { useMcStore } from '/@/stores/messageCenter'
import type { TrendPoint } from './home/McHomeTrendChart.vue'
import McHomeStatCards  from './home/McHomeStatCards.vue'
import McHomeTrendChart from './home/McHomeTrendChart.vue'
import McHomeDistChart  from './home/McHomeDistChart.vue'
import McHomeRecentList from './home/McHomeRecentList.vue'

const adminInfo = useAdminInfo()
const router    = useRouter()
const mcStore   = useMcStore()

// ── 原始数据 ──────────────────────────────────────────────────────────
const messages    = computed(() => mcStore.messages)
const unreadCount = computed(() => mcStore.unreadCount)
const loading     = computed(() => mcStore.loading)
const loadError   = computed(() => mcStore.loadError)

// ── 派生统计 ──────────────────────────────────────────────────────────
const stats = computed(() => {
    const total  = messages.value.length
    const unread = unreadCount.value
    const read   = Math.max(0, total - unread)
    const now    = new Date()
    const today  = messages.value.filter((m) => {
        const d = new Date(m.createdAt)
        return d.getFullYear() === now.getFullYear() &&
               d.getMonth()    === now.getMonth()    &&
               d.getDate()     === now.getDate()
    }).length
    const withUrl = messages.value.filter((m) => !!m.url).length
    return { total, unread, read, today, withUrl }
})

// ── 7 日趋势 ──────────────────────────────────────────────────────────
const trendData = computed<TrendPoint[]>(() => {
    const now = new Date()
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now)
        d.setDate(now.getDate() - (6 - i))
        const label = `${d.getMonth() + 1}/${d.getDate()}`
        const day = messages.value.filter((m) => {
            const md = new Date(m.createdAt)
            return md.getFullYear() === d.getFullYear() &&
                   md.getMonth()    === d.getMonth()    &&
                   md.getDate()     === d.getDate()
        })
        return { date: label, total: day.length, read: day.filter(m => m.read).length }
    })
})

// ── 最近 10 条 ────────────────────────────────────────────────────────
const recentMessages = computed(() =>
    [...messages.value]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
)

// ── 问候语 ────────────────────────────────────────────────────────────
const greeting = computed(() => {
    const h = new Date().getHours()
    if (h < 6)  return '夜深了'
    if (h < 12) return '早上好'
    if (h < 14) return '中午好'
    if (h < 18) return '下午好'
    return '晚上好'
})

const todayLabel = computed(() => {
    const d    = new Date()
    const days = ['周日','周一','周二','周三','周四','周五','周六']
    return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日 ${days[d.getDay()]}`
})

// ── API（父组件唯一入口）──────────────────────────────────────────────
async function reload() {
    await Promise.all([
        mcStore.fetchMessages(),
        mcStore.fetchUnreadCount(),
    ])
}

function onOpenMessage(_id: string) {
    router.push({ path: '/message-center/all' })
}

onMounted(reload)
</script>

<style scoped lang="scss">
.mc-home {
    /* 不设 height:100%，让内容自然撑开并滚动 */
    min-height: 100%;
    overflow-y: auto;
    /* 消除框架 el-main 已有的 padding，统一由这里控制 */
    padding: 24px 28px 48px;
    box-sizing: border-box;
    background: #f5f5f7;
    display: flex;
    flex-direction: column;
    gap: 20px;
    font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
}

.mc-home__greeting {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
}

.mc-home__hello {
    margin: 0;
    font-size: 26px;
    font-weight: 700;
    color: #1d1d1f;
    letter-spacing: -0.5px;
}

.mc-home__date {
    margin: 4px 0 0;
    font-size: 13px;
    color: #86868b;
}

.mc-home__error {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: #fff3f3;
    border: 1px solid rgba(215,0,21,0.15);
    border-radius: 10px;
    color: #d70015;
    font-size: 14px;
}

/* 图表行：趋势占主，分布占侧 */
.mc-home__charts {
    display: grid;
    grid-template-columns: 1fr 280px;
    gap: 16px;
}

@media (max-width: 1100px) {
    .mc-home__charts { grid-template-columns: 1fr; }
}
</style>
