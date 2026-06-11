<template>
    <div class="mc-home">

        <!-- 欢迎行 -->
        <div class="mc-home__greeting">
            <div class="mc-home__greeting-text">
                <h1 class="mc-home__hello">{{ greeting }}，{{ adminInfo.nickname || adminInfo.userid }}</h1>
                <p class="mc-home__date">{{ todayLabel }}</p>
            </div>
            <el-button
                :loading="loading"
                size="small"
                @click="reload"
                plain
            >
                刷新数据
            </el-button>
        </div>

        <!-- 错误提示 -->
        <div v-if="loadError" class="mc-home__error">
            <el-icon :size="20"><WarningFilled /></el-icon>
            <span>数据加载失败</span>
            <el-button size="small" @click="reload">重试</el-button>
        </div>

        <!-- 统计卡片行 -->
        <McHomeStatCards
            :total="stats.total"
            :unread="stats.unread"
            :today="stats.today"
            :with-url="stats.withUrl"
            :loading="loading"
        />

        <!-- 图表行 -->
        <div class="mc-home__charts">
            <McHomeTrendChart
                :data="trendData"
                :loading="loading"
            />
            <McHomeDistChart
                :read="stats.read"
                :unread="stats.unread"
                :loading="loading"
            />
        </div>

        <!-- 最近消息 -->
        <McHomeRecentList
            :items="recentMessages"
            :loading="loading"
            @open="onOpenMessage"
        />

    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { WarningFilled } from '@element-plus/icons-vue'
import { useAdminInfo } from '/@/stores/adminInfo'
import { getMyMessages, getUnreadCount } from '/@/api/messageCenter'
import type { MessageItem } from '/@/api/messageCenter'
import type { TrendPoint } from './components/McHomeTrendChart.vue'
import McHomeStatCards  from './components/McHomeStatCards.vue'
import McHomeTrendChart from './components/McHomeTrendChart.vue'
import McHomeDistChart  from './components/McHomeDistChart.vue'
import McHomeRecentList from './components/McHomeRecentList.vue'

const adminInfo = useAdminInfo()
const router    = useRouter()

// ── 原始数据 ──────────────────────────────────────────────────────────
const messages   = ref<MessageItem[]>([])
const unreadCount = ref(0)
const loading    = ref(false)
const loadError  = ref(false)

// ── 派生统计（纯前端计算，不调用额外 API）────────────────────────────
const stats = computed(() => {
    const total   = messages.value.length
    const unread  = unreadCount.value
    const read    = Math.max(0, total - unread)

    const now = new Date()
    const today = messages.value.filter((m) => {
        const d = new Date(m.createdAt)
        return (
            d.getFullYear() === now.getFullYear() &&
            d.getMonth()    === now.getMonth()    &&
            d.getDate()     === now.getDate()
        )
    }).length

    const withUrl = messages.value.filter((m) => !!m.url).length

    return { total, unread, read, today, withUrl }
})

// ── 7 日趋势（按日聚合）──────────────────────────────────────────────
const trendData = computed<TrendPoint[]>(() => {
    const result: TrendPoint[] = []
    const now = new Date()

    for (let i = 6; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(now.getDate() - i)
        const label = `${d.getMonth() + 1}/${d.getDate()}`

        const day = messages.value.filter((m) => {
            const md = new Date(m.createdAt)
            return (
                md.getFullYear() === d.getFullYear() &&
                md.getMonth()    === d.getMonth()    &&
                md.getDate()     === d.getDate()
            )
        })

        result.push({
            date:  label,
            total: day.length,
            read:  day.filter((m) => m.read).length,
        })
    }
    return result
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
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${days[d.getDay()]}`
})

// ── API 调用（父组件唯一 API 入口）───────────────────────────────────
async function reload() {
    loading.value   = true
    loadError.value = false
    try {
        const [msgs, countRes] = await Promise.all([
            getMyMessages(0, 100),
            getUnreadCount(),
        ])
        messages.value    = msgs    ?? []
        unreadCount.value = countRes?.unreadCount ?? 0
    } catch {
        loadError.value = true
    } finally {
        loading.value = false
    }
}

// ── 点击最近消息跳转到全部消息页 ────────────────────────────────────
function onOpenMessage(_messageId: string) {
    router.push({ path: '/message-center/all' })
}

onMounted(reload)
</script>

<style scoped lang="scss">
.mc-home {
    height: 100%;
    overflow-y: auto;
    padding: 28px 32px 40px;
    box-sizing: border-box;
    background: #f5f5f7;
    display: flex;
    flex-direction: column;
    gap: 20px;
    font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
}

/* ── 欢迎行 ─────────────────────────────────────────────────────────── */
.mc-home__greeting {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding-bottom: 4px;
}

.mc-home__hello {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: #1d1d1f;
    letter-spacing: -0.4px;
    line-height: 1.2;
}

.mc-home__date {
    margin: 4px 0 0;
    font-size: 13px;
    color: #86868b;
    letter-spacing: -0.01em;
}

/* ── 错误提示 ────────────────────────────────────────────────────────── */
.mc-home__error {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 18px;
    background: #fff3f3;
    border: 1px solid rgba(215, 0, 21, 0.15);
    border-radius: 10px;
    color: #d70015;
    font-size: 14px;
}

/* ── 图表行 ──────────────────────────────────────────────────────────── */
.mc-home__charts {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 16px;
    min-height: 220px;
}

@media (max-width: 1100px) {
    .mc-home__charts {
        grid-template-columns: 1fr;
    }
}
</style>
