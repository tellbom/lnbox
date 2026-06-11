<template>
    <div class="stat-grid">
        <div
            v-for="card in cards"
            :key="card.key"
            class="stat-card"
            :class="`stat-card--${card.color}`"
        >
            <!-- 顶部：图标 -->
            <div class="stat-card__icon-wrap">
                <el-icon :size="20"><component :is="card.icon" /></el-icon>
            </div>

            <!-- 数字 -->
            <div class="stat-card__value">
                <span v-if="loading" class="stat-card__skeleton" />
                <span v-else class="stat-card__num">{{ card.value }}</span>
            </div>

            <!-- 标签 + 描述 -->
            <div class="stat-card__label">{{ card.label }}</div>
            <div class="stat-card__desc">{{ card.desc }}</div>

            <!-- 装饰光晕 -->
            <div class="stat-card__glow" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Message, View, Bell, Link } from '@element-plus/icons-vue'

const props = defineProps<{
    total:   number
    unread:  number
    today:   number
    withUrl: number
    loading: boolean
}>()

const cards = computed(() => [
    {
        key: 'total', label: '全部消息', value: props.total,
        desc: '最近 100 条', icon: Message, color: 'blue',
    },
    {
        key: 'unread', label: '未读消息', value: props.unread,
        desc: props.unread > 0 ? '待处理' : '全部已读', icon: Bell,
        color: props.unread > 0 ? 'orange' : 'green',
    },
    {
        key: 'today', label: '今日新增', value: props.today,
        desc: '今天收到的消息', icon: View, color: 'purple',
    },
    {
        key: 'withUrl', label: '含跳转链接', value: props.withUrl,
        desc: '可跳转到业务页面', icon: Link, color: 'teal',
    },
])
</script>

<style scoped lang="scss">
.stat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
}

.stat-card {
    position: relative;
    overflow: hidden;
    border-radius: 16px;
    padding: 22px 22px 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: transform 0.18s, box-shadow 0.18s;
    cursor: default;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 28px rgba(0,0,0,0.12);
    }
}

/* ── 色彩主题 ──────────────────────────────────────────────────────── */
.stat-card--blue {
    background: linear-gradient(135deg, #0066cc 0%, #2997ff 100%);
    box-shadow: 0 4px 20px rgba(0, 102, 204, 0.30);
    .stat-card__icon-wrap { background: rgba(255,255,255,0.18); color: #fff; }
    .stat-card__num       { color: #fff; }
    .stat-card__label     { color: rgba(255,255,255,0.9); }
    .stat-card__desc      { color: rgba(255,255,255,0.6); }
    .stat-card__glow      { background: radial-gradient(circle at 80% 20%, rgba(255,255,255,0.14) 0%, transparent 60%); }
}

.stat-card--orange {
    background: linear-gradient(135deg, #e07400 0%, #ff9500 100%);
    box-shadow: 0 4px 20px rgba(224, 116, 0, 0.28);
    .stat-card__icon-wrap { background: rgba(255,255,255,0.18); color: #fff; }
    .stat-card__num       { color: #fff; }
    .stat-card__label     { color: rgba(255,255,255,0.9); }
    .stat-card__desc      { color: rgba(255,255,255,0.6); }
    .stat-card__glow      { background: radial-gradient(circle at 80% 20%, rgba(255,255,255,0.14) 0%, transparent 60%); }
}

.stat-card--green {
    background: linear-gradient(135deg, #1a8a2e 0%, #34c759 100%);
    box-shadow: 0 4px 20px rgba(52, 199, 89, 0.28);
    .stat-card__icon-wrap { background: rgba(255,255,255,0.18); color: #fff; }
    .stat-card__num       { color: #fff; }
    .stat-card__label     { color: rgba(255,255,255,0.9); }
    .stat-card__desc      { color: rgba(255,255,255,0.6); }
    .stat-card__glow      { background: radial-gradient(circle at 80% 20%, rgba(255,255,255,0.14) 0%, transparent 60%); }
}

.stat-card--purple {
    background: linear-gradient(135deg, #4a42c8 0%, #7c6fde 100%);
    box-shadow: 0 4px 20px rgba(88, 86, 214, 0.28);
    .stat-card__icon-wrap { background: rgba(255,255,255,0.18); color: #fff; }
    .stat-card__num       { color: #fff; }
    .stat-card__label     { color: rgba(255,255,255,0.9); }
    .stat-card__desc      { color: rgba(255,255,255,0.6); }
    .stat-card__glow      { background: radial-gradient(circle at 80% 20%, rgba(255,255,255,0.14) 0%, transparent 60%); }
}

.stat-card--teal {
    background: linear-gradient(135deg, #006b7a 0%, #00b5cc 100%);
    box-shadow: 0 4px 20px rgba(0, 181, 204, 0.26);
    .stat-card__icon-wrap { background: rgba(255,255,255,0.18); color: #fff; }
    .stat-card__num       { color: #fff; }
    .stat-card__label     { color: rgba(255,255,255,0.9); }
    .stat-card__desc      { color: rgba(255,255,255,0.6); }
    .stat-card__glow      { background: radial-gradient(circle at 80% 20%, rgba(255,255,255,0.14) 0%, transparent 60%); }
}

/* ── 子元素 ─────────────────────────────────────────────────────────── */
.stat-card__icon-wrap {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-bottom: 4px;
}

.stat-card__value {
    min-height: 52px;
    display: flex;
    align-items: flex-end;
}

.stat-card__num {
    font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
    font-size: 46px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -1.5px;
    font-feature-settings: "tnum" 1;
}

.stat-card__skeleton {
    display: block;
    width: 70px;
    height: 46px;
    border-radius: 8px;
    background: rgba(255,255,255,0.25);
    animation: pulse 1.4s ease-in-out infinite;
}

.stat-card__label {
    font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: -0.15px;
}

.stat-card__desc {
    font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
    font-size: 12px;
    letter-spacing: -0.01em;
}

/* 装饰光晕 */
.stat-card__glow {
    position: absolute;
    inset: 0;
    pointer-events: none;
}

@keyframes pulse {
    0%, 100% { opacity: 0.5; }
    50%       { opacity: 1; }
}

@media (max-width: 1200px) {
    .stat-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
