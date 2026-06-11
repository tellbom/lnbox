<template>
    <div class="stat-grid">
        <div
            v-for="card in cards"
            :key="card.key"
            class="stat-card"
            :class="`stat-card--${card.color}`"
        >
            <div class="stat-card__top">
                <span class="stat-card__label">{{ card.label }}</span>
                <span class="stat-card__icon-wrap">
                    <el-icon :size="18"><component :is="card.icon" /></el-icon>
                </span>
            </div>
            <div class="stat-card__value">
                <span v-if="loading" class="stat-card__skeleton" />
                <span v-else class="stat-card__num">{{ card.value }}</span>
            </div>
            <div class="stat-card__foot">{{ card.desc }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Message, View, Bell, Link } from '@element-plus/icons-vue'

const props = defineProps<{
    total:     number
    unread:    number
    today:     number
    withUrl:   number
    loading:   boolean
}>()

const cards = computed(() => [
    {
        key:   'total',
        label: '全部消息',
        value: props.total,
        desc:  '最近 100 条',
        icon:  Message,
        color: 'blue',
    },
    {
        key:   'unread',
        label: '未读消息',
        value: props.unread,
        desc:  props.unread > 0 ? '待处理' : '全部已读',
        icon:  Bell,
        color: props.unread > 0 ? 'orange' : 'green',
    },
    {
        key:   'today',
        label: '今日新增',
        value: props.today,
        desc:  '今天收到的消息',
        icon:  View,
        color: 'purple',
    },
    {
        key:   'withUrl',
        label: '含跳转链接',
        value: props.withUrl,
        desc:  '可跳转到业务页面',
        icon:  Link,
        color: 'teal',
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
    background: #ffffff;
    border: 1px solid #e3e3e6;
    border-radius: 14px;
    padding: 20px 22px 18px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    transition: border-color 0.15s, box-shadow 0.15s;

    &:hover {
        border-color: #c8c8cc;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    }
}

.stat-card__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.stat-card__label {
    font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
    font-size: 13px;
    font-weight: 400;
    color: #86868b;
    letter-spacing: -0.01em;
}

.stat-card__icon-wrap {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

/* color variants */
.stat-card--blue  .stat-card__icon-wrap { background: rgba(0, 102, 204, 0.10); color: #0066cc; }
.stat-card--orange .stat-card__icon-wrap { background: rgba(255, 149, 0, 0.10);  color: #e07400; }
.stat-card--green  .stat-card__icon-wrap { background: rgba(52, 199, 89, 0.12);  color: #1a8a2e; }
.stat-card--purple .stat-card__icon-wrap { background: rgba(88, 86, 214, 0.10);  color: #5856d6; }
.stat-card--teal   .stat-card__icon-wrap { background: rgba(90, 200, 250, 0.14); color: #007aab; }

.stat-card__value {
    min-height: 46px;
    display: flex;
    align-items: flex-end;
}

.stat-card__num {
    font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
    font-size: 42px;
    font-weight: 600;
    line-height: 1;
    letter-spacing: -1px;
    color: #1d1d1f;
    font-feature-settings: "tnum" 1;
}

.stat-card--orange .stat-card__num { color: #e07400; }
.stat-card--green  .stat-card__num { color: #1a8a2e; }

.stat-card__skeleton {
    display: block;
    width: 80px;
    height: 42px;
    border-radius: 8px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 400% 100%;
    animation: shimmer 1.4s infinite;
}

.stat-card__foot {
    font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
    font-size: 12px;
    color: #86868b;
    letter-spacing: -0.01em;
}

@keyframes shimmer {
    0%   { background-position: 100% 0; }
    100% { background-position: -100% 0; }
}

@media (max-width: 1200px) {
    .stat-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
