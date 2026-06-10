<template>
    <section class="mc-list">
        <div class="mc-list__toolbar">
            <div class="mc-list__heading">
                <h1 class="mc-list__title">{{ FILTER_TITLES[filter] || '消息' }}</h1>
                <span class="mc-list__count">
                    <template v-if="query">{{ messages.length }} 条匹配结果</template>
                    <template v-else>{{ totalCount }} 条</template>
                    <span v-if="!query && unreadCount" class="mc-list__count-unread"> · {{ unreadCount }} 未读</span>
                </span>
            </div>
            <div class="mc-list__tools">
                <button class="mc-tbtn" type="button" @click="allVisibleSelected ? onClearSelection() : onSelectAll()">
                    <el-icon :size="14">
                        <component :is="allVisibleSelected ? CircleCheck : Grid" />
                    </el-icon>
                    <span>{{ allVisibleSelected ? '取消全选' : '全选' }}</span>
                </button>
            </div>
        </div>

        <div class="mc-bulkbar" :class="{ 'is-open': selectedIds.size > 0 }">
            <div class="mc-bulkbar__inner">
                <span class="mc-bulkbar__count">已选 <b>{{ selectedIds.size }}</b> 项</span>
                <div class="mc-bulkbar__actions">
                    <button class="mc-tbtn" type="button" @click="onBulkRead()">
                        <el-icon :size="14">
                            <Finished />
                        </el-icon>
                        <span>标记已读</span>
                    </button>
                    <button class="mc-tbtn" type="button" @click="onBulkUnread()">
                        <el-icon :size="14">
                            <Message />
                        </el-icon>
                        <span>标记未读</span>
                    </button>
                    <button class="mc-tbtn mc-tbtn--ghost" type="button" @click="onClearSelection()">
                        <el-icon :size="14">
                            <Close />
                        </el-icon>
                        <span>取消</span>
                    </button>
                </div>
            </div>
        </div>

        <div ref="scrollEl" class="mc-list__scroll">
            <McEmpty v-if="messages.length === 0" :filter="filter" :query="query" />

            <template v-else>
                <div v-for="group in groups" :key="group.key" class="mc-grp">
                    <div class="mc-grp__head">
                        <span class="mc-grp__label">{{ BUCKET_LABELS[group.key] }}</span>
                        <span class="mc-grp__line" />
                        <span class="mc-grp__num">{{ group.items.length }}</span>
                    </div>

                    <div
                        v-for="msg in group.items"
                        :key="msg.messageId"
                        class="mc-row"
                        :class="{
                            'is-active': activeId === msg.messageId,
                            'is-unread': !msg.read,
                            'is-selected': selectedIds.has(msg.messageId),
                            'mc-row--compact': density === 'compact',
                        }"
                        @click="onOpen(msg.messageId)"
                    >
                        <div class="mc-row__rail" @click.stop="onToggleSelect(msg.messageId)">
                            <button class="mc-row__check" :class="{ 'is-on': selectedIds.has(msg.messageId) }" type="button" tabindex="-1">
                                <el-icon v-if="selectedIds.has(msg.messageId)" :size="11">
                                    <Check />
                                </el-icon>
                            </button>
                            <span v-if="!msg.read" class="mc-row__dot" />
                        </div>

                        <div class="mc-row__body">
                            <div class="mc-row__top">
                                <span class="mc-row__title">{{ msg.title }}</span>
                                <span class="mc-row__time">{{ formatTime(msg.createdAt) }}</span>
                            </div>
                            <div v-if="density !== 'compact'" class="mc-row__preview">
                                {{ preview(msg.content) }}
                            </div>
                        </div>
                    </div>
                </div>

                <div ref="sentinelEl" class="mc-list__sentinel" />

                <div v-if="hasMore" class="mc-list__more">
                    <span class="mc-spinner" />
                    加载更多消息...
                </div>
                <div v-else class="mc-list__end">已显示全部消息</div>
            </template>
        </div>
    </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Check, CircleCheck, Close, Finished, Grid, Message } from '@element-plus/icons-vue'
import type { MessageItem } from '/@/api/messageCenter'
import McEmpty from './McEmpty.vue'

const props = defineProps<{
    filter: string
    messages: MessageItem[]
    totalCount: number
    unreadCount: number
    activeId: string | null
    selectedIds: Set<string>
    query: string
    density: 'comfortable' | 'compact'
    hasMore: boolean
}>()

const emit = defineEmits<{
    open: [id: string]
    toggleSelect: [id: string]
    selectAll: []
    clearSelection: []
    bulkRead: []
    bulkUnread: []
    reachEnd: []
}>()

const onOpen = (id: string) => emit('open', id)
const onToggleSelect = (id: string) => emit('toggleSelect', id)
const onSelectAll = () => emit('selectAll')
const onClearSelection = () => emit('clearSelection')
const onBulkRead = () => emit('bulkRead')
const onBulkUnread = () => emit('bulkUnread')

const FILTER_TITLES: Record<string, string> = {
    all: '全部消息',
    unread: '未读消息',
    read: '已读消息',
    favorites: '收藏夹',
}

const BUCKET_LABELS: Record<string, string> = {
    today: '今天',
    yest: '昨天',
    week: '本周',
    earlier: '更早',
}

const BUCKET_ORDER = ['today', 'yest', 'week', 'earlier']
const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

const allVisibleSelected = computed(() => props.messages.length > 0 && props.messages.every((message) => props.selectedIds.has(message.messageId)))

const groups = computed(() => {
    const map: Record<string, { key: string; items: MessageItem[] }> = {}

    for (const message of props.messages) {
        const key = dateBucket(message.createdAt)
        if (!map[key]) map[key] = { key, items: [] }
        map[key].items.push(message)
    }

    return BUCKET_ORDER.map((key) => map[key]).filter(Boolean)
})

function sameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function dateBucket(iso: string): string {
    const now = new Date()
    const date = new Date(iso)

    if (sameDay(date, now)) return 'today'

    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    if (sameDay(date, yesterday)) return 'yest'

    if ((now.getTime() - date.getTime()) / 86400000 < 7) return 'week'
    return 'earlier'
}

function formatTime(iso: string): string {
    const now = new Date()
    const date = new Date(iso)
    const diffMin = Math.round((now.getTime() - date.getTime()) / 60000)

    if (diffMin < 1) return '刚刚'
    if (diffMin < 60) return `${diffMin} 分钟前`

    if (sameDay(date, now)) {
        const hour = date.getHours()
        const ampm = hour < 12 ? '上午' : '下午'
        const displayHour = hour % 12 || 12
        const minute = String(date.getMinutes()).padStart(2, '0')
        return `${ampm} ${displayHour}:${minute}`
    }

    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    if (sameDay(date, yesterday)) return '昨天'

    const diffDay = Math.floor((now.getTime() - date.getTime()) / 86400000)
    if (diffDay < 7) return WEEKDAYS[date.getDay()]
    if (date.getFullYear() === now.getFullYear()) return `${date.getMonth() + 1}月${date.getDate()}日`
    return `${date.getFullYear()}年${date.getMonth() + 1}月`
}

function preview(content: string): string {
    return content.replace(/\n+/g, ' ').slice(0, 90)
}

const scrollEl = ref<HTMLElement | null>(null)
const sentinelEl = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

function setupObserver() {
    observer?.disconnect()
    observer = null

    if (!sentinelEl.value) return

    observer = new IntersectionObserver(
        (entries) => {
            if (entries[0].isIntersecting && props.hasMore) emit('reachEnd')
        },
        {
            root: scrollEl.value,
            threshold: 0.1,
        }
    )

    observer.observe(sentinelEl.value)
}

onMounted(() => {
    nextTick(setupObserver)
})

onBeforeUnmount(() => {
    observer?.disconnect()
})

watch(
    () => props.messages.length,
    () => {
        nextTick(setupObserver)
    }
)
</script>

<style scoped>
.mc-list {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 340px;
    min-height: 0;
    background: #ffffff;
    border-right: 1px solid #e3e3e6;
}

.mc-list__toolbar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    height: 66px;
    padding: 0 24px;
    border-bottom: 1px solid #efeff1;
}

.mc-list__heading {
    display: flex;
    flex-direction: column;
    gap: 3px;
}

.mc-list__title {
    margin: 0;
    color: #1d1d1f;
    font-size: 21px;
    font-weight: 600;
    letter-spacing: 0;
}

.mc-list__count {
    color: #86868b;
    font-size: 12.5px;
    white-space: nowrap;
}

.mc-list__count-unread {
    color: #0066cc;
    font-weight: 500;
}

.mc-list__tools,
.mc-bulkbar__actions {
    display: flex;
    gap: 8px;
}

.mc-tbtn {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    height: 32px;
    padding: 0 12px;
    color: #37373a;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0;
    cursor: pointer;
    background: #ffffff;
    border: 1px solid #e3e3e6;
    border-radius: 8px;
    transition:
        background 0.12s,
        transform 0.08s;
}

.mc-tbtn:hover {
    background: #f5f5f7;
}

.mc-tbtn:active {
    transform: scale(0.96);
}

.mc-tbtn--ghost {
    background: transparent;
    border-color: transparent;
}

.mc-bulkbar {
    flex-shrink: 0;
    max-height: 0;
    overflow: hidden;
    background: color-mix(in srgb, #0066cc 5%, #ffffff);
    border-bottom: 1px solid #efeff1;
    transition: max-height 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}

.mc-bulkbar.is-open {
    max-height: 60px;
}

.mc-bulkbar__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 52px;
    padding: 0 24px;
}

.mc-bulkbar__count {
    color: #37373a;
    font-size: 13.5px;
}

.mc-bulkbar__count b {
    color: #0066cc;
    font-weight: 600;
}

.mc-list__scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
}

.mc-grp {
    position: relative;
}

.mc-grp__head {
    position: sticky;
    top: 0;
    z-index: 2;
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 15px 24px 9px;
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.95) 70%, rgba(255, 255, 255, 0));
    backdrop-filter: blur(2px);
}

.mc-grp__label,
.mc-grp__num {
    color: #86868b;
    font-size: 12px;
}

.mc-grp__label {
    font-weight: 600;
    letter-spacing: 0.05em;
}

.mc-grp__line {
    flex: 1;
    height: 1px;
    background: #efeff1;
}

.mc-row {
    position: relative;
    display: flex;
    padding: 13px 24px;
    cursor: pointer;
    border-bottom: 1px solid #f5f5f7;
    transition: background 0.12s;
}

.mc-row:hover {
    background: #fafafb;
}

.mc-row.is-active {
    background: color-mix(in srgb, #0066cc 9%, #ffffff);
}

.mc-row.is-selected {
    background: color-mix(in srgb, #0066cc 5%, #ffffff);
}

.mc-row.is-active::before {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 3px;
    content: '';
    background: #0066cc;
}

.mc-row--compact {
    padding: 9px 24px;
}

.mc-row__rail {
    position: relative;
    flex-shrink: 0;
    width: 30px;
}

.mc-row__dot {
    position: absolute;
    top: 5px;
    left: 3px;
    width: 8px;
    height: 8px;
    background: #0066cc;
    border-radius: 50%;
    transition: opacity 0.12s;
}

.mc-row__check {
    position: absolute;
    top: 1px;
    left: -1px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    padding: 0;
    color: #ffffff;
    cursor: pointer;
    background: #ffffff;
    border: 1.5px solid #e3e3e6;
    border-radius: 5px;
    opacity: 0;
    transition:
        opacity 0.12s,
        background 0.12s,
        border-color 0.12s;
}

.mc-row:hover .mc-row__check,
.mc-row__check.is-on {
    opacity: 1;
}

.mc-row:hover .mc-row__dot,
.mc-row.is-selected .mc-row__dot {
    opacity: 0;
}

.mc-row__check.is-on {
    background: #0066cc;
    border-color: #0066cc;
}

.mc-row__body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
}

.mc-row__top {
    display: flex;
    gap: 12px;
    align-items: baseline;
}

.mc-row__title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    color: #65656b;
    font-size: 14.5px;
    font-weight: 400;
    letter-spacing: 0;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.mc-row.is-unread .mc-row__title {
    color: #1d1d1f;
    font-weight: 600;
}

.mc-row__time {
    flex-shrink: 0;
    color: #86868b;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
}

.mc-row__preview {
    overflow: hidden;
    color: #9a9aa0;
    font-size: 13px;
    line-height: 1.4;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.mc-list__sentinel {
    height: 1px;
}

.mc-list__more {
    display: flex;
    gap: 9px;
    align-items: center;
    justify-content: center;
    padding: 20px;
    color: #86868b;
    font-size: 13px;
}

.mc-list__end {
    padding: 22px;
    color: #86868b;
    font-size: 12px;
    letter-spacing: 0.02em;
    text-align: center;
}

.mc-spinner {
    flex-shrink: 0;
    width: 15px;
    height: 15px;
    border: 2px solid #efeff1;
    border-top-color: #0066cc;
    border-radius: 50%;
    animation: mc-spin 0.7s linear infinite;
}

@keyframes mc-spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
