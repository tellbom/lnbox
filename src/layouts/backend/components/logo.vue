<template>
    <div class="layout-logo" :class="{ 'is-collapsed': config.layout.menuCollapse }">

        <!-- ── 展开态 ────────────────────────────────────────────────── -->
        <template v-if="!config.layout.menuCollapse">

            <!-- 顶行：logo + 站点名 + 折叠按钮 -->
            <div class="lc-top">
                <div class="lc-icon-wrap">
                    <img class="lc-logo" src="~assets/logo.png" alt="logo" />
                </div>
                <div class="lc-title" :style="{ color: config.getColorVal('menuColor') }">
                    {{ siteConfig.siteName }}
                </div>
                <Icon
                    v-if="config.layout.layoutMode !== 'Streamline'"
                    @click="onMenuCollapse"
                    name="fa fa-dedent"
                    :color="config.getColorVal('menuActiveColor')"
                    size="15"
                    class="lc-fold"
                />
            </div>

            <!-- 底行：统计 pill 胶囊 -->
            <div class="lc-pills">
                <!-- 今日消息 -->
                <div class="lc-pill">
                    <span class="lc-pill__num">{{ todayCount }}</span>
                    <span class="lc-pill__label">今日</span>
                </div>

                <!-- 分割点 -->
                <span class="lc-sep" />

                <!-- 未读 -->
                <div class="lc-pill" :class="{ 'lc-pill--blue': mcStore.unreadCount > 0 }">
                    <span class="lc-pill__num">{{ mcStore.unreadCount }}</span>
                    <span class="lc-pill__label">未读</span>
                </div>
            </div>

        </template>

        <!-- ── 折叠态 ─────────────────────────────────────────────────── -->
        <template v-else>
            <Icon
                v-if="config.layout.layoutMode !== 'Streamline'"
                @click="onMenuCollapse"
                name="fa fa-indent"
                :color="config.getColorVal('menuActiveColor')"
                size="16"
                class="lc-unfold"
            />
            <!-- 未读红点 -->
            <span v-if="mcStore.unreadCount > 0" class="lc-collapsed-dot" />
        </template>

    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConfig } from '/@/stores/config'
import { useSiteConfig } from '/@/stores/siteConfig'
import { useMcStore } from '/@/stores/messageCenter'
import { closeShade } from '/@/utils/pageShade'
import { Session } from '/@/utils/storage'
import { BEFORE_RESIZE_LAYOUT } from '/@/stores/constant/cacheKey'
import { setNavTabsWidth } from '/@/utils/layout'

const config     = useConfig()
const siteConfig = useSiteConfig()
const mcStore    = useMcStore()

/** 今日消息数：从本地 messages 派生，不发额外请求 */
const todayCount = computed<number | string>(() => {
    if (!mcStore.messages.length) return '–'
    const now = new Date()
    return mcStore.messages.filter((m) => {
        const d = new Date(m.createdAt)
        return (
            d.getFullYear() === now.getFullYear() &&
            d.getMonth()    === now.getMonth()    &&
            d.getDate()     === now.getDate()
        )
    }).length
})

const onMenuCollapse = () => {
    if (config.layout.shrink && !config.layout.menuCollapse) closeShade()
    config.setLayout('menuCollapse', !config.layout.menuCollapse)
    Session.set(BEFORE_RESIZE_LAYOUT, {
        layoutMode:   config.layout.layoutMode,
        menuCollapse: config.layout.menuCollapse,
    })
    setTimeout(() => setNavTabsWidth(), 350)
}
</script>

<style scoped lang="scss">
/* ── 容器 ───────────────────────────────────────────────────────────── */
.layout-logo {
    width: 100%;
    height: 100px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 10px;
    box-sizing: border-box;
    padding: 0 16px;
    background: v-bind('config.layout.layoutMode !== "Streamline" ? config.getColorVal("menuTopBarBackground") : "transparent"');
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);

    /* 折叠态 */
    &.is-collapsed {
        align-items: center;
        justify-content: center;
        gap: 6px;
        position: relative;
    }
}

/* ── 顶行 ───────────────────────────────────────────────────────────── */
.lc-top {
    display: flex;
    align-items: center;
    gap: 9px;
    width: 100%;
}

.lc-icon-wrap {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    border-radius: 7px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}

.lc-logo {
    width: 28px;
    height: 28px;
    object-fit: contain;
}

.lc-title {
    flex: 1;
    font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: -0.224px; /* DESIGN.md caption-strong */
    line-height: 1.29;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.lc-fold {
    flex-shrink: 0;
    cursor: pointer;
    opacity: 0.4;
    transition: opacity 0.12s;
    &:hover { opacity: 0.85; }
}

/* ── 统计 pills ─────────────────────────────────────────────────────── */
.lc-pills {
    display: flex;
    align-items: center;
    gap: 10px;
}

/*
 * 每个 pill 是「数字 + 标签」水平排列的轻量信息单元。
 * 遵循 DESIGN.md fine-print (12px / 400 / -0.12px) 规格。
 * 不用边框、不用阴影（DESIGN.md: Don't add shadows to cards/buttons）。
 */
.lc-pill {
    display: flex;
    align-items: baseline;
    gap: 3px;
}

.lc-pill__num {
    font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: -0.224px;
    line-height: 1;
    color: v-bind('config.getColorVal("menuColor")');
    opacity: 0.9;
}

.lc-pill__label {
    font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
    font-size: 12px;
    font-weight: 400;
    letter-spacing: -0.12px; /* DESIGN.md fine-print */
    line-height: 1;
    color: v-bind('config.getColorVal("menuColor")');
    opacity: 0.45;
}

/* 未读数字高亮：Action Blue (#0066cc) */
.lc-pill--blue .lc-pill__num {
    color: #0066cc;
    opacity: 1;
}

/* 分割点 */
.lc-sep {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: v-bind('config.getColorVal("menuColor")');
    opacity: 0.2;
    flex-shrink: 0;
}

/* ── 折叠态 ─────────────────────────────────────────────────────────── */
.lc-unfold {
    cursor: pointer;
}

.lc-collapsed-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #0066cc;
    flex-shrink: 0;
}
</style>
