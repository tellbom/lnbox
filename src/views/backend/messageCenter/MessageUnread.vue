<template>
    <div class="mc-page">
        <header class="mc-hdr">
            <div class="mc-hdr__brand">
                <div class="mc-hdr__mark">
                    <el-icon :size="18">
                        <Bell />
                    </el-icon>
                </div>
                <div class="mc-hdr__title">未读消息</div>
            </div>

            <label class="mc-hdr__search" :class="{ 'is-focused': searchFocused }">
                <span class="mc-hdr__search-ic">
                    <el-icon :size="16">
                        <Search />
                    </el-icon>
                </span>
                <input
                    v-model="query"
                    class="mc-hdr__search-input"
                    placeholder="搜索未读消息"
                    @focus="searchFocused = true"
                    @blur="searchFocused = false"
                />
                <button v-if="query" class="mc-hdr__search-clear" type="button" @click="query = ''">
                    <el-icon :size="13">
                        <Close />
                    </el-icon>
                </button>
            </label>

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
                        <span class="mc-hdr__user-name">{{ adminInfo.username || '未命名用户' }}</span>
                        <span class="mc-hdr__user-sub">{{ adminInfo.userid || '当前账号' }}</span>
                    </div>
                </div>
            </div>
        </header>

        <div class="mc-body" v-loading="mcStore.loading">
            <div v-if="mcStore.loadError" class="mc-error">
                <el-icon :size="32">
                    <WarningFilled />
                </el-icon>
                <span>消息加载失败</span>
                <el-button type="primary" @click="reload">重试</el-button>
            </div>
            <template v-else>
                <McSidebar :collapsed="false" />
                <McList
                    filter="unread"
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
import { Bell, Close, Search, WarningFilled } from '@element-plus/icons-vue'
import McDetail from './components/McDetail.vue'
import McList from './components/McList.vue'
import McSidebar from './components/McSidebar.vue'
import { useMcPage } from './useMcPage'

const {
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
} = useMcPage('unread')
</script>

<style scoped src="./mc-page.css"></style>
