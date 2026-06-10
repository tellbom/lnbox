<template>
    <div class="mc-empty">
        <div class="mc-empty__icon">
            <el-icon :size="32">
                <component :is="icon" />
            </el-icon>
        </div>
        <div class="mc-empty__title">{{ title }}</div>
        <div class="mc-empty__sub">{{ sub }}</div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Message, Search, Select, Star } from '@element-plus/icons-vue'

const props = defineProps<{
    filter: string
    query: string
}>()

const normalizedQuery = computed(() => props.query.trim())

const icon = computed(() => {
    if (normalizedQuery.value) return Search
    if (props.filter === 'unread') return Select
    if (props.filter === 'favorites') return Star
    return Message
})

const title = computed(() => {
    if (normalizedQuery.value) return '未找到匹配的消息'
    if (props.filter === 'unread') return '全部已读'
    if (props.filter === 'favorites') return '收藏夹即将上线'
    return '暂无消息'
})

const sub = computed(() => {
    if (normalizedQuery.value) return '试试更换关键词，或清除搜索条件。'
    if (props.filter === 'unread') return '太棒了，您已处理完所有未读消息。'
    if (props.filter === 'favorites') return '后续可在此集中查看您收藏的重要通知。'
    return '这里还没有任何通知。'
})
</script>

<style scoped>
.mc-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 24px;
    text-align: center;
    color: var(--wf-ink-3, #7a7a7a);
    user-select: none;
}

.mc-empty__icon {
    margin-bottom: 16px;
    opacity: 0.35;
}

.mc-empty__title {
    margin-bottom: 6px;
    color: var(--wf-ink, #1d1d1f);
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0;
}

.mc-empty__sub {
    max-width: 260px;
    color: var(--wf-ink-3, #7a7a7a);
    font-size: 13px;
    line-height: 1.5;
}
</style>
