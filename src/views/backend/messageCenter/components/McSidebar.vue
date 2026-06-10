<template>
    <nav class="mc-side" :class="{ 'mc-side--collapsed': collapsed }">
        <div class="mc-side__scroll">
            <div class="mc-side__group">
                <button
                    v-for="item in mainItems"
                    :key="item.id"
                    class="mc-side__item"
                    :class="{ 'is-active': active === item.id }"
                    type="button"
                    @click="onSelect(item.id)"
                >
                    <span class="mc-side__ic">
                        <el-icon :size="18">
                            <component :is="item.icon" />
                        </el-icon>
                    </span>
                    <span v-if="!collapsed" class="mc-side__label">{{ item.label }}</span>
                    <span v-if="!collapsed && unreadByFilter[item.id]" class="mc-side__badge">
                        {{ unreadByFilter[item.id] > 99 ? '99+' : unreadByFilter[item.id] }}
                    </span>
                    <span v-if="collapsed && unreadByFilter[item.id]" class="mc-side__dot" />
                </button>
            </div>

            <div class="mc-side__group">
                <div v-if="!collapsed" class="mc-side__group-label">更多</div>
                <div v-else class="mc-side__group-rule" />
                <button class="mc-side__item is-reserved" type="button" disabled>
                    <span class="mc-side__ic">
                        <el-icon :size="18">
                            <Star />
                        </el-icon>
                    </span>
                    <span v-if="!collapsed" class="mc-side__label">收藏夹</span>
                    <span v-if="!collapsed" class="mc-side__soon">即将上线</span>
                </button>
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { Message, Select, Star, View } from '@element-plus/icons-vue'

defineProps<{
    active: string
    collapsed: boolean
    unreadByFilter: Record<string, number>
}>()

const emit = defineEmits<{
    select: [id: string]
}>()

const onSelect = (id: string) => emit('select', id)

const mainItems = [
    { id: 'all', label: '全部消息', icon: Message },
    { id: 'unread', label: '未读消息', icon: View },
    { id: 'read', label: '已读消息', icon: Select },
]
</script>

<style scoped>
.mc-side {
    display: flex;
    flex-shrink: 0;
    flex-direction: column;
    width: 220px;
    overflow: hidden;
    background: var(--wf-bg, #f5f5f7);
    border-right: 1px solid var(--wf-border, #e3e3e6);
    transition: width 0.24s cubic-bezier(0.4, 0, 0.2, 1);
}

.mc-side--collapsed {
    width: 60px;
}

.mc-side__scroll {
    flex: 1;
    padding: 16px 10px;
    overflow-x: hidden;
    overflow-y: auto;
}

.mc-side__group {
    margin-bottom: 14px;
}

.mc-side__group-label {
    margin: 4px 0 6px;
    padding: 0 10px;
    color: var(--wf-ink-3, #86868b);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.02em;
}

.mc-side__group-rule {
    height: 1px;
    margin: 8px 6px;
    background: var(--wf-border, #e3e3e6);
}

.mc-side__item {
    position: relative;
    display: flex;
    gap: 10px;
    align-items: center;
    width: 100%;
    height: 38px;
    padding: 0 10px;
    color: var(--wf-ink-2, #37373a);
    font-size: 14px;
    font-weight: 450;
    letter-spacing: 0;
    white-space: nowrap;
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 9px;
    transition:
        background 0.12s,
        color 0.12s;
}

.mc-side__item:hover:not(.is-reserved) {
    background: rgba(0, 0, 0, 0.045);
}

.mc-side__item.is-active {
    color: #0066cc;
    font-weight: 600;
    background: color-mix(in srgb, #0066cc 9%, #ffffff);
}

.mc-side__item.is-reserved {
    cursor: default;
    opacity: 0.5;
}

.mc-side--collapsed .mc-side__item {
    justify-content: center;
    padding: 0;
}

.mc-side__ic {
    display: flex;
    flex-shrink: 0;
    color: inherit;
    opacity: 0.9;
}

.mc-side__item.is-active .mc-side__ic {
    opacity: 1;
}

.mc-side__label {
    flex: 1;
    overflow: hidden;
    text-align: left;
    text-overflow: ellipsis;
}

.mc-side__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    margin-left: auto;
    color: var(--wf-ink-2, #37373a);
    font-size: 12px;
    font-weight: 600;
    line-height: 1;
    background: rgba(0, 0, 0, 0.07);
    border-radius: 99px;
}

.mc-side__item.is-active .mc-side__badge {
    color: #0066cc;
    background: color-mix(in srgb, #0066cc 16%, #ffffff);
}

.mc-side__soon {
    margin-left: auto;
    color: var(--wf-ink-3, #86868b);
    font-size: 11px;
    font-weight: 400;
}

.mc-side__dot {
    position: absolute;
    top: 8px;
    right: 12px;
    width: 7px;
    height: 7px;
    background: #0066cc;
    border-radius: 50%;
}
</style>
