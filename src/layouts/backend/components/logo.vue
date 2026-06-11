<template>
    <div class="layout-logo" :class="{ 'is-collapsed': config.layout.menuCollapse }">
        <!-- 展开态 -->
        <template v-if="!config.layout.menuCollapse">
            <div class="logo-row">
                <img class="logo-img" src="~assets/logo.png" alt="logo" />
                <div class="website-name" :style="{ color: config.getColorVal('menuColor') }">
                    {{ siteConfig.siteName }}
                </div>
                <Icon
                    v-if="config.layout.layoutMode != 'Streamline'"
                    @click="onMenuCollapse"
                    name="fa fa-dedent"
                    :color="config.getColorVal('menuActiveColor')"
                    size="16"
                    class="fold"
                />
            </div>
            <div class="logo-stats">
                <span class="logo-stats__item">
                    今日
                    <b>{{ todayCount }}</b>
                </span>
                <span class="logo-stats__dot">·</span>
                <span class="logo-stats__item">
                    未读
                    <b :class="{ 'is-blue': mcStore.unreadCount > 0 }">{{ mcStore.unreadCount }}</b>
                </span>
            </div>
        </template>

        <!-- 折叠态 -->
        <template v-else>
            <Icon
                v-if="config.layout.layoutMode != 'Streamline'"
                @click="onMenuCollapse"
                name="fa fa-indent"
                :color="config.getColorVal('menuActiveColor')"
                size="18"
                class="unfold"
            />
            <div v-if="mcStore.unreadCount > 0" class="logo-collapsed-dot" />
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

const config = useConfig()
const siteConfig = useSiteConfig()
const mcStore = useMcStore()

// 今日消息数：从本地 messages 派生，不发额外请求
const todayCount = computed(() => {
    if (!mcStore.messages.length) return '–'
    const now = new Date()
    const count = mcStore.messages.filter((m) => {
        const d = new Date(m.createdAt)
        return (
            d.getFullYear() === now.getFullYear() &&
            d.getMonth() === now.getMonth() &&
            d.getDate() === now.getDate()
        )
    }).length
    return count
})

const onMenuCollapse = function () {
    if (config.layout.shrink && !config.layout.menuCollapse) {
        closeShade()
    }
    config.setLayout('menuCollapse', !config.layout.menuCollapse)
    Session.set(BEFORE_RESIZE_LAYOUT, {
        layoutMode: config.layout.layoutMode,
        menuCollapse: config.layout.menuCollapse,
    })
    setTimeout(() => {
        setNavTabsWidth()
    }, 350)
}
</script>

<style scoped lang="scss">
.layout-logo {
    width: 100%;
    height: 100px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-sizing: border-box;
    padding: 0 14px;
    gap: 6px;
    background: v-bind('config.layout.layoutMode != "Streamline" ? config.getColorVal("menuTopBarBackground") : "transparent"');
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);

    &.is-collapsed {
        align-items: center;
        justify-content: center;
        gap: 8px;
        position: relative;
    }
}

.logo-row {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
}

.logo-img {
    width: 26px;
    height: 26px;
    flex-shrink: 0;
    border-radius: 6px;
}

.website-name {
    flex: 1;
    font-family: 'SF Pro Text', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.3;
    letter-spacing: -0.1px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.fold {
    flex-shrink: 0;
    cursor: pointer;
    opacity: 0.5;
    transition: opacity 0.12s;

    &:hover { opacity: 1; }
}

.unfold {
    cursor: pointer;
}

.logo-stats {
    display: flex;
    align-items: center;
    gap: 6px;
    padding-left: 2px;
}

.logo-stats__item {
    font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
    font-size: 12px;
    color: v-bind('config.getColorVal("menuColor")');
    opacity: 0.55;
    display: flex;
    align-items: center;
    gap: 3px;

    b {
        font-weight: 600;
        opacity: 1;
        color: v-bind('config.getColorVal("menuColor")');

        &.is-blue {
            color: #0066cc;
            opacity: 1;
        }
    }
}

.logo-stats__dot {
    font-size: 12px;
    color: v-bind('config.getColorVal("menuColor")');
    opacity: 0.3;
}

.logo-collapsed-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #0066cc;
    flex-shrink: 0;
}
</style>
