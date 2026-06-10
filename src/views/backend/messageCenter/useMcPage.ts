import { computed, onMounted, ref, watch } from 'vue'
import { useAdminInfo } from '/@/stores/adminInfo'
import { useMcStore } from '/@/stores/messageCenter'

const PAGE = 20

export type MessageFilter = 'all' | 'unread' | 'read'

interface Toast {
    id: number
    msg: string
    undo?: () => void
}

export function useMcPage(filter: MessageFilter) {
    const adminInfo = useAdminInfo()
    const mcStore = useMcStore()

    const query = ref('')
    const activeId = ref<string | null>(null)
    const selectedIds = ref(new Set<string>())
    const density = ref<'comfortable' | 'compact'>('comfortable')
    const searchFocused = ref(false)
    const visibleCount = ref(PAGE)
    const toasts = ref<Toast[]>([])
    let toastSeq = 0

    const userInitial = computed(() => {
        const name = adminInfo.username || adminInfo.userid || '?'
        return name.charAt(0).toUpperCase()
    })

    const filteredMessages = computed(() => mcStore.filtered(filter, query.value))
    const shownMessages = computed(() => filteredMessages.value.slice(0, visibleCount.value))
    const hasMore = computed(() => filteredMessages.value.length > visibleCount.value)
    const totalCount = computed(() => filteredMessages.value.length)
    const filteredUnread = computed(() => filteredMessages.value.filter((message) => !message.read).length)
    const activeMsg = computed(() => mcStore.messages.find((message) => message.messageId === activeId.value) ?? null)

    watch(query, () => {
        visibleCount.value = PAGE
        selectedIds.value = new Set()
        activeId.value = null
    })

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

    return {
        mcStore,
        adminInfo,
        query,
        activeId,
        selectedIds,
        density,
        searchFocused,
        userInitial,
        shownMessages,
        hasMore,
        totalCount,
        filteredUnread,
        activeMsg,
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
        runToastUndo,
    }
}
