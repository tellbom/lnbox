<template>
    <div class="recent-card">
        <div class="recent-card__header">
            <div>
                <div class="recent-card__title">最近消息</div>
                <div class="recent-card__sub">最新 {{ items.length }} 条通知</div>
            </div>
        </div>

        <!-- 骨架 -->
        <div v-if="loading" class="recent-card__body">
            <div v-for="i in 5" :key="i" class="recent-skeleton-row">
                <div class="recent-skeleton-dot" />
                <div class="recent-skeleton-lines">
                    <div class="recent-skeleton-line" style="width: 65%" />
                    <div class="recent-skeleton-line" style="width: 40%; margin-top: 6px" />
                </div>
            </div>
        </div>

        <!-- 空态 -->
        <div v-else-if="items.length === 0" class="recent-card__empty">
            <el-icon :size="26"><Message /></el-icon>
            <span>暂无消息</span>
        </div>

        <!-- 列表 -->
        <div v-else class="recent-card__body">
            <div
                v-for="msg in items"
                :key="msg.messageId"
                class="recent-row"
                :class="{ 'recent-row--unread': !msg.read }"
                @click="emit('open', msg.messageId)"
            >
                <span class="recent-row__dot" :class="!msg.read ? 'is-unread' : 'is-read'" />
                <div class="recent-row__body">
                    <div class="recent-row__title">{{ msg.title }}</div>
                    <div class="recent-row__preview">{{ preview(msg.content) }}</div>
                </div>
                <div class="recent-row__right">
                    <span class="recent-row__time">{{ relTime(msg.createdAt) }}</span>
                    <span v-if="msg.url" class="recent-row__link-icon">
                        <el-icon :size="11"><Link /></el-icon>
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Message, Link } from '@element-plus/icons-vue'
import type { MessageItem } from '/@/api/messageCenter'

defineProps<{
    items:   MessageItem[]
    loading: boolean
}>()

const emit = defineEmits<{ open: [messageId: string] }>()

function preview(content: string): string {
    return content.replace(/\n+/g, ' ').slice(0, 60)
}

function relTime(iso: string): string {
    const diff = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
    if (diff < 1)   return '刚刚'
    if (diff < 60)  return `${diff} 分钟前`
    if (diff < 1440) return `${Math.floor(diff / 60)} 小时前`
    return `${Math.floor(diff / 1440)} 天前`
}
</script>

<style scoped lang="scss">
.recent-card {
    background: #ffffff;
    
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
    padding: 20px 22px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 100%;
    box-sizing: border-box;
}

.recent-card__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-shrink: 0;
}

.recent-card__title {
    font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: #1d1d1f;
    letter-spacing: -0.2px;
}

.recent-card__sub {
    font-size: 12px;
    color: #86868b;
    margin-top: 2px;
}

.recent-card__body {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
}

.recent-card__empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: #86868b;
    font-size: 13px;
    min-height: 120px;
}

/* ── 消息行 ─────────────────────────────────────────────────────────── */
.recent-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 11px 0;
    border-bottom: 1px solid #f5f5f7;
    cursor: pointer;
    transition: background 0.12s;
    border-radius: 6px;
    padding-left: 6px;
    padding-right: 6px;

    &:last-child { border-bottom: none; }
    &:hover { background: #fafafa; }

    &--unread .recent-row__title { font-weight: 600; color: #1d1d1f; }
}

.recent-row__dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 5px;

    &.is-unread { background: #0066cc; }
    &.is-read   { background: #d2d2d7; }
}

.recent-row__body {
    flex: 1;
    min-width: 0;
}

.recent-row__title {
    font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
    font-size: 14px;
    font-weight: 400;
    color: #65656b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    letter-spacing: -0.01em;
}

.recent-row__preview {
    font-size: 12px;
    color: #9a9aa0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 3px;
    line-height: 1.4;
}

.recent-row__right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    flex-shrink: 0;
}

.recent-row__time {
    font-size: 11px;
    color: #86868b;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
}

.recent-row__link-icon {
    color: #0066cc;
    opacity: 0.6;
    display: flex;
}

/* ── 骨架屏 ─────────────────────────────────────────────────────────── */
.recent-skeleton-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 6px;
    border-bottom: 1px solid #f5f5f7;

    &:last-child { border-bottom: none; }
}

.recent-skeleton-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #e8e8e8;
    margin-top: 5px;
    flex-shrink: 0;
}

.recent-skeleton-lines { flex: 1; }

.recent-skeleton-line {
    height: 12px;
    border-radius: 6px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 400% 100%;
    animation: shimmer 1.4s infinite;
}

@keyframes shimmer {
    0%   { background-position: 100% 0; }
    100% { background-position: -100% 0; }
}
</style>
