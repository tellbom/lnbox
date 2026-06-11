import { ref, computed, watch, onMounted } from 'vue'
import { useMcStore } from '/@/stores/messageCenter'

const PAGE = 20

/**
 * 三个消息中心页面共用的逻辑
 * @param filter 'all' | 'unread' | 'read'
 */
export function useMcPage(filter: 'all' | 'unread' | 'read') {
    const mcStore = useMcStore()

    // ── UI 状态 ───────────────────────────────────────────────────────────────
    const query        = ref('')
    const activeId     = ref<string | null>(null)
    const selectedIds  = ref(new Set<string>())
    const density      = ref<'comfortable' | 'compact'>('comfortable')
    const visibleCount = ref(PAGE)

    // ── 过滤 + 分页 ───────────────────────────────────────────────────────────
    const filteredMessages = computed(() => mcStore.filtered(filter, query.value))
    const shownMessages    = computed(() => filteredMessages.value.slice(0, visibleCount.value))
    const hasMore          = computed(() => filteredMessages.value.length > visibleCount.value)
    const totalCount       = computed(() => filteredMessages.value.length)
    const filteredUnread   = computed(() => filteredMessages.value.filter((m) => !m.read).length)
    const activeMsg        = computed(() => mcStore.messages.find((m) => m.messageId === activeId.value) ?? null)

    watch(query, () => {
        visibleCount.value = PAGE
        selectedIds.value  = new Set()
        activeId.value     = null
    })

    // ── 消息操作 ──────────────────────────────────────────────────────────────
    const onOpen = (id: string) => {
        activeId.value = id
        const msg = mcStore.messages.find((m) => m.messageId === id)
        if (msg && !msg.read) mcStore.markRead(id)
    }

    const onToggleRead = (id: string) => {
        const msg = mcStore.messages.find((m) => m.messageId === id)
        if (!msg) return
        if (msg.read) {
            mcStore.markUnread(id)
            pushToast('已标记为未读')
        } else {
            mcStore.markRead(id)
            pushToast('已标记为已读')
        }
    }

    const onOpenPage = (url: string) => {
        if (url.startsWith('http')) {
            window.open(url, '_blank', 'noopener')
        } else {
            window.open(url, '_blank')
        }
    }

    // ── 选择 ──────────────────────────────────────────────────────────────────
    const onToggleSelect = (id: string) => {
        const next = new Set(selectedIds.value)
        if (next.has(id)) next.delete(id); else next.add(id)
        selectedIds.value = next
    }

    const onSelectAll = () => {
        selectedIds.value = new Set(shownMessages.value.map((m) => m.messageId))
    }

    const onClearSelection = () => {
        selectedIds.value = new Set()
    }

    // ── 批量操作 ──────────────────────────────────────────────────────────────
    const onBulkMark = async (read: boolean) => {
        const ids = [...selectedIds.value]
        if (!ids.length) return

        const snapshot = new Map(
            ids.map((id) => {
                const msg = mcStore.messages.find((m) => m.messageId === id)
                return [id, msg?.read ?? read]
            })
        )

        onClearSelection()
        await mcStore.bulkMark(ids, read)

        pushToast(`已将 ${ids.length} 条标记为${read ? '已读' : '未读'}`, () => {
            ids.forEach((id) => {
                const was = snapshot.get(id)
                if (was === undefined || was === read) return
                if (read) mcStore.markUnread(id); else mcStore.markRead(id)
            })
        })
    }

    // ── 无限滚动 ──────────────────────────────────────────────────────────────
    const onReachEnd = () => {
        visibleCount.value = Math.min(visibleCount.value + PAGE, filteredMessages.value.length)
    }

    // ── Toast ──────────────────────────────────────────────────────────────────
    interface Toast { id: number; msg: string; undo?: () => void }
    const toasts = ref<Toast[]>([])
    let toastSeq = 0

    function pushToast(msg: string, undo?: () => void) {
        const id = ++toastSeq
        toasts.value = [...toasts.value.slice(-2), { id, msg, undo }]
        setTimeout(() => { toasts.value = toasts.value.filter((t) => t.id !== id) }, 3400)
    }

    // ── 重试 ──────────────────────────────────────────────────────────────────
    const reload = () => {
        mcStore.fetchMessages()
        mcStore.fetchUnreadCount()
    }

    // ── 初始化 ────────────────────────────────────────────────────────────────
    onMounted(() => {
        mcStore.fetchMessages()
        mcStore.fetchUnreadCount()
    })

    return {
        mcStore,
        // UI state
        query,
        activeId,
        selectedIds,
        density,
        // computed
        shownMessages,
        hasMore,
        totalCount,
        filteredUnread,
        activeMsg,
        // handlers
        onOpen,
        onToggleRead,
        onOpenPage,
        onToggleSelect,
        onSelectAll,
        onClearSelection,
        onBulkMark,
        onReachEnd,
        reload,
        toasts,
    }
}
