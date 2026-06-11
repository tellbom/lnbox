<template>
    <div class="layout-logo" :class="{ 'is-collapsed': config.layout.menuCollapse }">

        <!-- ── 展开态 ──────────────────────────────────────────────── -->
        <template v-if="!config.layout.menuCollapse">
            <div class="lc-card">
                <!-- 卡片顶行 -->
                <div class="lc-card__top">
                    <!-- 图标区：用 siteName 首字母生成品牌色块 -->
                    <div class="lc-brand-icon">
                        <span class="lc-brand-icon__letter">{{ brandLetter }}</span>
                    </div>

                    <div class="lc-card__info">
                        <div class="lc-card__name">{{ siteConfig.siteName }}</div>
                        <div class="lc-card__sub">消息中心</div>
                    </div>

                    <Icon
                        v-if="config.layout.layoutMode !== 'Streamline'"
                        @click="onMenuCollapse"
                        name="fa fa-dedent"
                        :color="config.getColorVal('menuActiveColor')"
                        size="14"
                        class="lc-fold"
                    />
                </div>

                <!-- 卡片底行：统计数据 -->
                <div class="lc-card__stats">
                    <div class="lc-stat">
                        <span class="lc-stat__val">{{ todayCount }}</span>
                        <span class="lc-stat__key">今日消息</span>
                    </div>
                    <div class="lc-stat__divider" />
                    <div class="lc-stat" :class="{ 'lc-stat--active': mcStore.unreadCount > 0 }">
                        <span class="lc-stat__val">{{ mcStore.unreadCount }}</span>
                        <span class="lc-stat__key">未读</span>
                    </div>
                </div>
            </div>
        </template>

        <!-- ── 折叠态 ──────────────────────────────────────────────── -->
        <template v-else>
            <div class="lc-collapsed-icon">
                <span class="lc-brand-icon lc-brand-icon--sm">
                    <span class="lc-brand-icon__letter">{{ brandLetter }}</span>
                </span>
                <span v-if="mcStore.unreadCount > 0" class="lc-collapsed-badge">
                    {{ mcStore.unreadCount > 9 ? '9+' : mcStore.unreadCount }}
                </span>
            </div>
            <Icon
                v-if="config.layout.layoutMode !== 'Streamline'"
                @click="onMenuCollapse"
                name="fa fa-indent"
                :color="config.getColorVal('menuActiveColor')"
                size="14"
                class="lc-unfold"
            />
        </template>

    </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
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

const brandLetter = computed(() => {
    return (siteConfig.siteName || 'lnbox').charAt(0).toUpperCase()
})

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

onMounted(() => {
    if (!mcStore.messages.length) mcStore.fetchMessages()
    mcStore.fetchUnreadCount()
})
</script>

<style scoped lang="scss">
/* ── 外壳 ─────────────────────────────────────────────────────────── */
.layout-logo {
    width: 100%;
    height: 100px;
    box-sizing: border-box;
    padding: 12px 14px;
    display: flex;
    align-items: center;
    background: v-bind('config.layout.layoutMode !== "Streamline" ? config.getColorVal("menuTopBarBackground") : "transparent"');
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);

    &.is-collapsed {
        flex-direction: column;
        justify-content: center;
        gap: 6px;
        padding: 12px 0;
    }
}

/* ── 卡片主体（展开态） ────────────────────────────────────────────── */
.lc-card {
    width: 100%;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(0, 0, 0, 0.07);
    padding: 10px 12px 9px;
    display: flex;
    flex-direction: column;
    gap: 9px;
    box-sizing: border-box;
    backdrop-filter: blur(8px);
}

/* ── 顶行 ─────────────────────────────────────────────────────────── */
.lc-card__top {
    display: flex;
    align-items: center;
    gap: 9px;
}

/* 品牌色块图标 */
.lc-brand-icon {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    background: linear-gradient(135deg, #0066cc 0%, #2997ff 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &--sm {
        width: 26px;
        height: 26px;
        border-radius: 7px;
    }
}

.lc-brand-icon__letter {
    font-size: 14px;
    font-weight: 700;
    color: #ffffff;
    line-height: 1;
    letter-spacing: -0.3px;
}

.lc-card__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
}

.lc-card__name {
    font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: -0.15px;
    color: v-bind('config.getColorVal("menuColor")');
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.3;
}

.lc-card__sub {
    font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
    font-size: 11px;
    font-weight: 400;
    color: v-bind('config.getColorVal("menuColor")');
    opacity: 0.45;
    letter-spacing: 0;
    line-height: 1.3;
}

.lc-fold {
    flex-shrink: 0;
    cursor: pointer;
    opacity: 0.35;
    transition: opacity 0.15s;
    &:hover { opacity: 0.8; }
}

/* ── 底行统计 ─────────────────────────────────────────────────────── */
.lc-card__stats {
    display: flex;
    align-items: center;
    gap: 0;
    padding-top: 2px;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.lc-stat {
    display: flex;
    align-items: baseline;
    gap: 4px;
    flex: 1;

    &--active .lc-stat__val {
        color: #0066cc;
    }
}

.lc-stat__val {
    font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
    font-size: 17px;
    font-weight: 600;
    letter-spacing: -0.3px;
    line-height: 1;
    color: v-bind('config.getColorVal("menuColor")');
    transition: color 0.2s;
}

.lc-stat__key {
    font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
    font-size: 11px;
    font-weight: 400;
    color: v-bind('config.getColorVal("menuColor")');
    opacity: 0.45;
    letter-spacing: 0;
    line-height: 1;
    white-space: nowrap;
}

.lc-stat__divider {
    width: 1px;
    height: 22px;
    background: rgba(0, 0, 0, 0.08);
    margin: 0 14px;
    flex-shrink: 0;
}

/* ── 折叠态 ───────────────────────────────────────────────────────── */
.lc-collapsed-icon {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.lc-collapsed-badge {
    position: absolute;
    top: -5px;
    right: -7px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: 99px;
    background: #0066cc;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    line-height: 16px;
    text-align: center;
    border: 1.5px solid v-bind('config.getColorVal("menuTopBarBackground")');
    box-sizing: border-box;
}

.lc-unfold {
    cursor: pointer;
    opacity: 0.5;
    transition: opacity 0.15s;
    &:hover { opacity: 1; }
}
</style>
