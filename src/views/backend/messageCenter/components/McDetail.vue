<template>
    <aside class="mc-detail" :class="{ 'mc-detail--empty': !msg }">
        <template v-if="!msg">
            <div class="mc-detail__placeholder">
                <div class="mc-detail__ph-ic">
                    <el-icon :size="34">
                        <Message />
                    </el-icon>
                </div>
                <div class="mc-detail__ph-title">选择一条消息查看详情</div>
                <div class="mc-detail__ph-sub">
                    在左侧列表中选择任意通知，<br />
                    即可在此查看完整内容并跳转到相关业务页面。
                </div>
            </div>
        </template>

        <template v-else>
            <div class="mc-detail__bar">
                <div class="mc-detail__bar-time">{{ fullTime(msg.createdAt) }}</div>
                <div class="mc-detail__bar-actions">
                    <button
                        class="mc-iconbtn"
                        type="button"
                        :title="msg.read ? '标记为未读' : '标记为已读'"
                        @click="emit('toggleRead', msg.messageId)"
                    >
                        <el-icon :size="15">
                            <component :is="msg.read ? Message : Finished" />
                        </el-icon>
                        <span>{{ msg.read ? '标为未读' : '标为已读' }}</span>
                    </button>
                    <button class="mc-iconbtn mc-iconbtn--sq" type="button" title="关闭" @click="emit('close')">
                        <el-icon :size="15">
                            <Close />
                        </el-icon>
                    </button>
                </div>
            </div>

            <div class="mc-detail__scroll">
                <div class="mc-detail__head">
                    <div class="mc-detail__status">
                        <span class="mc-statuschip" :class="msg.read ? 'mc-statuschip--read' : 'mc-statuschip--unread'">
                            <span class="mc-statuschip__dot" />
                            {{ msg.read ? '已读' : '未读' }}
                        </span>
                    </div>
                    <h1 class="mc-detail__title">{{ msg.title }}</h1>
                </div>

                <dl class="mc-detail__meta">
                    <div class="mc-detail__meta-row">
                        <dt>
                            <el-icon :size="14">
                                <Clock />
                            </el-icon>
                            创建时间
                        </dt>
                        <dd>{{ fullTime(msg.createdAt) }}</dd>
                    </div>

                    <div class="mc-detail__meta-row">
                        <dt>
                            <el-icon :size="14">
                                <Message />
                            </el-icon>
                            发送方
                        </dt>
                        <dd>{{ msg.sourceSystem || '-' }}</dd>
                    </div>

                    <div class="mc-detail__meta-row">
                        <dt>
                            <el-icon :size="14">
                                <component :is="msg.read ? Select : View" />
                            </el-icon>
                            当前状态
                        </dt>
                        <dd>{{ msg.read ? '已读' : '未读' }}</dd>
                    </div>
                </dl>

                <div class="mc-detail__divider" />

                <div class="mc-detail__content" v-html="renderedContent" />
            </div>

            <div v-if="msg.url" class="mc-detail__foot">
                <div class="mc-detail__foot-url">
                    <span class="mc-detail__foot-label">关联页面</span>
                    <code class="mc-detail__foot-path">{{ msg.url }}</code>
                </div>
                <button class="mc-btn-primary" type="button" @click="emit('openPage', msg.url)">
                    打开相关页面
                    <el-icon :size="14">
                        <TopRight />
                    </el-icon>
                </button>
            </div>
        </template>
    </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Clock, Close, Finished, Message, Select, TopRight, View } from '@element-plus/icons-vue'
import MarkdownIt from 'markdown-it'
import type { MessageItem } from '/@/api/messageCenter'

const props = defineProps<{
    msg: MessageItem | null
}>()

const emit = defineEmits<{
    toggleRead: [messageId: string]
    openPage: [url: string]
    close: []
}>()

const markdown = new MarkdownIt({
    html: false,
    linkify: true,
    breaks: true,
    typographer: false,
})

const defaultLinkOpen = markdown.renderer.rules.link_open
markdown.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    token.attrSet('target', '_blank')
    token.attrSet('rel', 'noopener noreferrer')
    return defaultLinkOpen ? defaultLinkOpen(tokens, idx, options, env, self) : self.renderToken(tokens, idx, options)
}

const renderedContent = computed(() => {
    return props.msg?.content ? markdown.render(props.msg.content) : ''
})

function fullTime(iso: string): string {
    const date = new Date(iso)
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const pad = (value: number) => String(value).padStart(2, '0')

    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${days[date.getDay()]} ${pad(date.getHours())}:${pad(
        date.getMinutes()
    )}`
}
</script>

<style scoped>
.mc-detail {
    display: flex;
    flex-shrink: 0;
    flex-direction: column;
    width: 480px;
    min-height: 0;
    background: #ffffff;
    border-left: 1px solid #efeff1;
}

.mc-detail--empty {
    background: #fafafc;
}

.mc-detail__placeholder {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    justify-content: center;
    padding: 40px;
    text-align: center;
}

.mc-detail__ph-ic {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 78px;
    height: 78px;
    color: #86868b;
    background: #ffffff;
    border: 1px solid #e3e3e6;
    border-radius: 50%;
}

.mc-detail__ph-title {
    color: #1d1d1f;
    font-size: 17px;
    font-weight: 600;
}

.mc-detail__ph-sub {
    color: #86868b;
    font-size: 13.5px;
    line-height: 1.7;
}

.mc-detail__bar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: space-between;
    height: 64px;
    padding: 0 26px;
    border-bottom: 1px solid #efeff1;
}

.mc-detail__bar-time {
    color: #86868b;
    font-size: 13px;
}

.mc-detail__bar-actions {
    display: flex;
    gap: 8px;
}

.mc-iconbtn {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    height: 34px;
    padding: 0 13px;
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

.mc-iconbtn:hover {
    background: #f5f5f7;
}

.mc-iconbtn:active {
    transform: scale(0.96);
}

.mc-iconbtn--sq {
    justify-content: center;
    width: 34px;
    padding: 0;
}

.mc-detail__scroll {
    flex: 1;
    min-height: 0;
    padding: 28px 30px;
    overflow-y: auto;
}

.mc-detail__head {
    margin-bottom: 24px;
}

.mc-detail__status {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 15px;
}

.mc-statuschip {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    height: 25px;
    padding: 0 11px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0;
    border-radius: 99px;
}

.mc-statuschip__dot {
    width: 6px;
    height: 6px;
    background: currentColor;
    border-radius: 50%;
}

.mc-statuschip--unread {
    color: #0066cc;
    background: color-mix(in srgb, #0066cc 13%, #ffffff);
}

.mc-statuschip--read {
    color: #65656b;
    background: #ececf0;
}

.mc-detail__title {
    margin: 0;
    color: #1d1d1f;
    font-size: 27px;
    font-weight: 600;
    line-height: 1.22;
    letter-spacing: 0;
}

.mc-detail__meta {
    margin: 0;
}

.mc-detail__meta-row {
    display: flex;
    align-items: center;
    padding: 9px 0;
    border-bottom: 1px solid #f5f5f7;
}

.mc-detail__meta-row:last-child {
    border-bottom: none;
}

.mc-detail__meta-row dt {
    display: flex;
    flex-shrink: 0;
    gap: 7px;
    align-items: center;
    width: 100px;
    margin: 0;
    color: #86868b;
    font-size: 13px;
}

.mc-detail__meta-row dd {
    margin: 0;
    color: #1d1d1f;
    font-size: 14px;
    font-weight: 450;
}

.mc-detail__divider {
    height: 1px;
    margin: 20px 0 24px;
    background: #efeff1;
}

.mc-detail__content {
    color: #2c2c2f;
    font-size: 16px;
    line-height: 1.72;
    letter-spacing: 0;
    overflow-wrap: anywhere;
}

.mc-detail__content :deep(*) {
    box-sizing: border-box;
}

.mc-detail__content :deep(p) {
    margin: 0 0 14px;
}

.mc-detail__content :deep(p:last-child) {
    margin-bottom: 0;
}

.mc-detail__content :deep(h1),
.mc-detail__content :deep(h2),
.mc-detail__content :deep(h3),
.mc-detail__content :deep(h4) {
    margin: 22px 0 10px;
    color: #1d1d1f;
    font-weight: 650;
    line-height: 1.3;
    letter-spacing: 0;
}

.mc-detail__content :deep(h1:first-child),
.mc-detail__content :deep(h2:first-child),
.mc-detail__content :deep(h3:first-child),
.mc-detail__content :deep(h4:first-child) {
    margin-top: 0;
}

.mc-detail__content :deep(h1) {
    font-size: 22px;
}

.mc-detail__content :deep(h2) {
    font-size: 20px;
}

.mc-detail__content :deep(h3) {
    font-size: 18px;
}

.mc-detail__content :deep(h4) {
    font-size: 16px;
}

.mc-detail__content :deep(ul),
.mc-detail__content :deep(ol) {
    margin: 0 0 14px;
    padding-left: 22px;
}

.mc-detail__content :deep(li + li) {
    margin-top: 4px;
}

.mc-detail__content :deep(a) {
    color: #0066cc;
    text-decoration: none;
}

.mc-detail__content :deep(a:hover) {
    text-decoration: underline;
}

.mc-detail__content :deep(blockquote) {
    margin: 16px 0;
    padding: 10px 14px;
    color: #65656b;
    background: #f5f5f7;
    border-left: 3px solid #c7c7cc;
    border-radius: 6px;
}

.mc-detail__content :deep(code) {
    padding: 2px 5px;
    color: #1d1d1f;
    font-family: 'SF Mono', ui-monospace, 'JetBrains Mono', Menlo, Consolas, monospace;
    font-size: 0.9em;
    background: #f5f5f7;
    border-radius: 5px;
}

.mc-detail__content :deep(pre) {
    margin: 16px 0;
    padding: 14px 16px;
    overflow-x: auto;
    background: #1f2328;
    border-radius: 8px;
}

.mc-detail__content :deep(pre code) {
    padding: 0;
    color: #f5f5f7;
    background: transparent;
    border-radius: 0;
}

.mc-detail__content :deep(table) {
    width: 100%;
    margin: 16px 0;
    border-collapse: collapse;
    font-size: 14px;
}

.mc-detail__content :deep(th),
.mc-detail__content :deep(td) {
    padding: 8px 10px;
    text-align: left;
    border: 1px solid #e3e3e6;
}

.mc-detail__content :deep(th) {
    font-weight: 600;
    background: #f5f5f7;
}

.mc-detail__content :deep(hr) {
    height: 1px;
    margin: 22px 0;
    background: #efeff1;
    border: 0;
}

.mc-detail__foot {
    display: flex;
    flex-shrink: 0;
    gap: 18px;
    align-items: center;
    justify-content: space-between;
    padding: 18px 26px;
    background: #ffffff;
    border-top: 1px solid #efeff1;
}

.mc-detail__foot-url {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
}

.mc-detail__foot-label {
    color: #86868b;
    font-size: 11px;
}

.mc-detail__foot-path {
    display: block;
    max-width: 240px;
    padding: 4px 9px;
    overflow: hidden;
    color: #37373a;
    font-family: 'SF Mono', ui-monospace, 'JetBrains Mono', Menlo, Consolas, monospace;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
    background: #f5f5f7;
    border-radius: 6px;
}

.mc-btn-primary {
    display: inline-flex;
    flex-shrink: 0;
    gap: 8px;
    align-items: center;
    height: 44px;
    padding: 0 22px;
    color: #ffffff;
    font-size: 15px;
    font-weight: 450;
    letter-spacing: 0;
    cursor: pointer;
    background: #0066cc;
    border: none;
    border-radius: 9999px;
    transition:
        filter 0.12s,
        transform 0.08s;
}

.mc-btn-primary:hover {
    filter: brightness(1.06);
}

.mc-btn-primary:active {
    transform: scale(0.96);
}
</style>
