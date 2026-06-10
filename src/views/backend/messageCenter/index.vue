<template>
    <div class="mc-page">
        <header class="mc-hdr">
            <div class="mc-hdr__brand">
                <div class="mc-hdr__mark">
                    <el-icon :size="18">
                        <Bell />
                    </el-icon>
                </div>
                <span class="mc-hdr__title">消息中心</span>
            </div>

            <div class="mc-hdr__search" :class="{ 'is-focused': searchFocused }">
                <span class="mc-hdr__search-ic">
                    <el-icon :size="16">
                        <Search />
                    </el-icon>
                </span>
                <input
                    v-model="query"
                    class="mc-hdr__search-input"
                    type="text"
                    placeholder="搜索消息标题或内容"
                    @focus="searchFocused = true"
                    @blur="searchFocused = false"
                />
                <button v-if="query" class="mc-hdr__search-clear" type="button" @click="query = ''">
                    <el-icon :size="13">
                        <Close />
                    </el-icon>
                </button>
            </div>

            <div class="mc-hdr__right">
                <div class="mc-hdr__bell" :title="`${mcStore.unreadCount} 条未读`">
                    <el-icon :size="20">
                        <Bell />
                    </el-icon>
                    <span v-if="mcStore.unreadCount" class="mc-hdr__bell-badge">
                        {{ mcStore.unreadCount > 99 ? '99+' : mcStore.unreadCount }}
                    </span>
                </div>
                <div class="mc-hdr__user">
                    <div class="mc-avatar">{{ userInitial }}</div>
                    <div class="mc-hdr__user-meta">
                        <span class="mc-hdr__user-name">{{ adminInfo.username || '用户' }}</span>
                        <span class="mc-hdr__user-sub">{{ adminInfo.userid || '-' }}</span>
                    </div>
                </div>
            </div>
        </header>

        <div class="mc-body" v-loading="mcStore.loading">
            <div v-if="mcStore.loadError" class="mc-error">
                <el-icon :size="28">
                    <WarningFilled />
                </el-icon>
                <span>消息加载失败</span>
                <el-button size="small" @click="reload">重试</el-button>
            </div>

            <template v-else>
                <McSidebar :active="filter" :collapsed="sidebarCollapsed" :unread-by-filter="mcStore.unreadByFilter" @select="onFilterSelect" />

                <McList
                    :filter="filter"
                    :messages="shownMessages"
                    :total-count="totalCount"
                    :unread-count="filteredUnread"
                    :active-id="activeId"
                    :selected-ids="selectedIds"
                    :query="query"
                    :density="density"
                    :has-more="hasMore"
                    @open="onOpen"
                    @toggle-select="onToggleSelect"
                    @select-all="onSelectAll"
                    @clear-selection="onClearSelection"
                    @bulk-read="onBulkMark(true)"
                    @bulk-unread="onBulkMark(false)"
                    @reach-end="onReachEnd"
                />

                <McDetail :msg="activeMsg" @toggle-read="onToggleRead" @open-page="onOpenPage" @close="activeId = null" />
            </template>
        </div>

        <div class="mc-toast-stack" aria-live="polite">
            <div v-for="toast in toasts" :key="toast.id" class="mc-toast">
                <span class="mc-toast__msg">{{ toast.msg }}</span>
                <button v-if="toast.undo" class="mc-toast__action" type="button" @click="runToastUndo(toast)">撤销</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Bell, Close, Search, WarningFilled } from '@element-plus/icons-vue'
import { useAdminInfo } from '/@/stores/adminInfo'
import { useMcStore } from '/@/stores/messageCenter'
import McDetail from './components/McDetail.vue'
import McList from './components/McList.vue'
import McSidebar from './components/McSidebar.vue'

const PAGE = 20

const adminInfo = useAdminInfo()
const mcStore = useMcStore()

const filter = ref('all')
const query = ref('')
const activeId = ref<string | null>(null)
const selectedIds = ref(new Set<string>())
const density = ref<'comfortable' | 'compact'>('comfortable')
const sidebarCollapsed = ref(false)
const searchFocused = ref(false)
const visibleCount = ref(PAGE)

const userInitial = computed(() => {
    const name = adminInfo.username || adminInfo.userid || '?'
    return name.charAt(0).toUpperCase()
})

const filteredMessages = computed(() => mcStore.filtered(filter.value, query.value))
const shownMessages = computed(() => filteredMessages.value.slice(0, visibleCount.value))
const hasMore = computed(() => filteredMessages.value.length > visibleCount.value)
const totalCount = computed(() => filteredMessages.value.length)
const filteredUnread = computed(() => filteredMessages.value.filter((message) => !message.read).length)
const activeMsg = computed(() => mcStore.messages.find((message) => message.messageId === activeId.value) ?? null)

watch([filter, query], () => {
    visibleCount.value = PAGE
    selectedIds.value = new Set()
    activeId.value = null
})

function onFilterSelect(id: string) {
    filter.value = id
    activeId.value = null
}

function onOpen(id: string) {
    activeId.value = id

    const message = mcStore.messages.find((item) => item.messageId === id)
    if (message && !message.read) {
        mcStore.markRead(id)
    }
}

function onToggleRead(id: string) {
    const message = mcStore.messages.find((item) => item.messageId === id)
    if (!message) return

    if (message.read) {
        mcStore.markUnread(id)
        pushToast('已标记为未读')
    } else {
        mcStore.markRead(id)
        pushToast('已标记为已读')
    }
}

function onOpenPage(url: string) {
    if (/^https?:\/\//i.test(url)) {
        window.open(url, '_blank', 'noopener')
        return
    }

    window.open(url, '_blank')
}

function onToggleSelect(id: string) {
    const next = new Set(selectedIds.value)
    if (next.has(id)) {
        next.delete(id)
    } else {
        next.add(id)
    }
    selectedIds.value = next
}

function onSelectAll() {
    selectedIds.value = new Set(shownMessages.value.map((message) => message.messageId))
}

function onClearSelection() {
    selectedIds.value = new Set()
}

async function onBulkMark(read: boolean) {
    const ids = [...selectedIds.value]
    if (!ids.length) return

    const snapshot = new Map<string, boolean>()
    for (const id of ids) {
        const message = mcStore.messages.find((item) => item.messageId === id)
        if (message) snapshot.set(id, message.read)
    }

    onClearSelection()
    await mcStore.bulkMark(ids, read)

    pushToast(`已将 ${ids.length} 条标记为${read ? '已读' : '未读'}`, () => {
        for (const [id, wasRead] of snapshot) {
            const message = mcStore.messages.find((item) => item.messageId === id)
            if (!message || message.read === wasRead) continue

            if (wasRead) {
                mcStore.markRead(id)
            } else {
                mcStore.markUnread(id)
            }
        }
    })
}

function onReachEnd() {
    visibleCount.value = Math.min(visibleCount.value + PAGE, filteredMessages.value.length)
}

interface Toast {
    id: number
    msg: string
    undo?: () => void
}

const toasts = ref<Toast[]>([])
let toastSeq = 0

function pushToast(msg: string, undo?: () => void) {
    const id = ++toastSeq
    toasts.value = [...toasts.value.slice(-2), { id, msg, undo }]

    window.setTimeout(() => {
        toasts.value = toasts.value.filter((toast) => toast.id !== id)
    }, 3400)
}

function runToastUndo(toast: Toast) {
    toast.undo?.()
    toasts.value = toasts.value.filter((item) => item.id !== toast.id)
}

function reload() {
    mcStore.fetchMessages()
    mcStore.fetchUnreadCount()
}

onMounted(() => {
    mcStore.fetchMessages()
    mcStore.fetchUnreadCount()
})
</script>

<style scoped>
.mc-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif;
    background: #ffffff;
    -webkit-font-smoothing: antialiased;
}

.mc-hdr {
    position: relative;
    z-index: 30;
    display: flex;
    flex-shrink: 0;
    gap: 20px;
    align-items: center;
    height: 60px;
    padding: 0 22px;
    background: rgba(255, 255, 255, 0.92);
    border-bottom: 1px solid #e3e3e6;
    backdrop-filter: saturate(180%) blur(20px);
}

.mc-hdr__brand {
    display: flex;
    flex-shrink: 0;
    gap: 12px;
    align-items: center;
}

.mc-hdr__mark {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    color: #ffffff;
    background: #1d1d1f;
    border-radius: 10px;
}

.mc-hdr__title {
    color: #1d1d1f;
    font-size: 19px;
    font-weight: 600;
    letter-spacing: 0;
}

.mc-hdr__search {
    display: flex;
    flex: 1;
    gap: 9px;
    align-items: center;
    max-width: 480px;
    height: 40px;
    padding: 0 14px;
    margin: 0 auto;
    background: #f5f5f7;
    border: 1px solid transparent;
    border-radius: 9999px;
    transition:
        background 0.16s,
        border-color 0.16s,
        box-shadow 0.16s;
}

.mc-hdr__search.is-focused {
    background: #ffffff;
    border-color: rgba(0, 0, 0, 0.12);
    box-shadow: 0 0 0 4px color-mix(in srgb, #0066cc 14%, transparent);
}

.mc-hdr__search-ic {
    display: flex;
    flex-shrink: 0;
    color: #86868b;
}

.mc-hdr__search-input {
    flex: 1;
    color: #1d1d1f;
    font-family: inherit;
    font-size: 14px;
    letter-spacing: 0;
    background: transparent;
    border: none;
    outline: none;
}

.mc-hdr__search-input::placeholder {
    color: #86868b;
}

.mc-hdr__search-clear {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    color: #65656b;
    cursor: pointer;
    background: rgba(0, 0, 0, 0.06);
    border: none;
    border-radius: 99px;
}

.mc-hdr__search-clear:hover {
    background: rgba(0, 0, 0, 0.12);
}

.mc-hdr__right {
    display: flex;
    flex-shrink: 0;
    gap: 14px;
    align-items: center;
}

.mc-hdr__bell {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    color: #37373a;
    cursor: default;
    background: transparent;
    border-radius: 10px;
}

.mc-hdr__bell-badge {
    position: absolute;
    top: 5px;
    right: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    color: #ffffff;
    font-size: 10px;
    font-weight: 700;
    line-height: 1;
    background: #0066cc;
    border: 2px solid #ffffff;
    border-radius: 99px;
}

.mc-hdr__user {
    display: flex;
    gap: 10px;
    align-items: center;
    padding-left: 6px;
}

.mc-avatar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    color: #1d1d1f;
    font-size: 13px;
    font-weight: 600;
    background: #d2d2d7;
    border-radius: 50%;
}

.mc-hdr__user-meta {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
}

.mc-hdr__user-name {
    color: #1d1d1f;
    font-size: 13px;
    font-weight: 600;
}

.mc-hdr__user-sub {
    color: #86868b;
    font-size: 11px;
}

.mc-body {
    position: relative;
    display: flex;
    flex: 1;
    min-height: 0;
}

.mc-error {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    justify-content: center;
    color: #86868b;
    font-size: 14px;
}

.mc-toast-stack {
    position: fixed;
    bottom: 28px;
    left: 50%;
    z-index: 200;
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
    pointer-events: none;
    transform: translateX(-50%);
}

.mc-toast {
    display: flex;
    gap: 10px;
    align-items: center;
    min-height: 44px;
    padding: 0 16px;
    color: #ffffff;
    font-size: 14px;
    letter-spacing: 0;
    pointer-events: auto;
    background: #1d1d1f;
    border-radius: 12px;
    box-shadow: 0 10px 34px rgba(0, 0, 0, 0.22);
    animation: mc-toast-in 0.26s cubic-bezier(0.2, 0.7, 0.2, 1);
}

.mc-toast__msg {
    padding: 11px 0;
}

.mc-toast__action {
    padding: 0 2px;
    margin-left: 4px;
    color: #2997ff;
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    background: transparent;
    border: none;
}

@keyframes mc-toast-in {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 1200px) {
    .mc-hdr__user-meta {
        display: none;
    }
}
</style>
