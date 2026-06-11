<template>
    <div class="mc-page">
        <div class="mc-body" v-loading="mcStore.loading">
            <div v-if="mcStore.loadError" class="mc-error">
                <el-icon :size="28"><WarningFilled /></el-icon>
                <span>消息加载失败</span>
                <el-button size="small" @click="reload">重试</el-button>
            </div>

            <template v-else>
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

                <McDetail
                    :msg="activeMsg"
                    @toggle-read="onToggleRead"
                    @open-page="onOpenPage"
                    @close="activeId = null"
                />
            </template>
        </div>

        <div class="mc-toast-stack" aria-live="polite">
            <div v-for="t in toasts" :key="t.id" class="mc-toast">
                <span class="mc-toast__msg">{{ t.msg }}</span>
                <button v-if="t.undo" class="mc-toast__action" @click="t.undo()">撤销</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { WarningFilled } from '@element-plus/icons-vue'
import { useMcPage } from './useMcPage'
import McList   from './components/McList.vue'
import McDetail from './components/McDetail.vue'

const {
    mcStore,
    query, activeId, selectedIds, density,
    shownMessages, hasMore, totalCount, filteredUnread, activeMsg,
    onOpen, onToggleRead, onOpenPage,
    onToggleSelect, onSelectAll, onClearSelection,
    onBulkMark, onReachEnd, reload, toasts,
} = useMcPage('unread')
</script>

<style scoped src="./mc-page.css" />
