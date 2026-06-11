<template>
    <div class="nav-bar">
        <!-- 菜单折叠时的展开按钮（shrink 模式） -->
        <div v-if="config.layout.shrink && config.layout.menuCollapse" class="unfold">
            <Icon @click="onMenuCollapse" name="fa fa-indent" :color="config.getColorVal('menuActiveColor')" size="18" />
        </div>

        <!-- 系统标题 -->
        <div class="nav-brand">
            <div class="nav-brand__icon-wrap">
                <img class="nav-brand__icon" :src="messageCenterIcon" alt="消息中心" />
            </div>
            <span class="nav-brand__name">消息中心</span>
        </div>

        <!-- 标签页 -->
        <NavTabs v-if="!config.layout.shrink" ref="layoutNavTabsRef" />

        <!-- 右侧用户区 -->
        <NavMenus />
    </div>
</template>

<script setup lang="ts">
import { useConfig } from '/@/stores/config'
import NavTabs from '/@/layouts/backend/components/navBar/tabs.vue'
import { layoutNavTabsRef } from '/@/stores/refs'
import NavMenus from '../navMenus.vue'
import { showShade } from '/@/utils/pageShade'
import messageCenterIcon from '/@/assets/icons/messagecenter.png'

const config = useConfig()

const onMenuCollapse = () => {
    showShade('ba-aside-menu-shade', () => {
        config.setLayout('menuCollapse', true)
    })
    config.setLayout('menuCollapse', false)
}
</script>

<style scoped lang="scss">
/* ── Header 主体：渐变背景 ──────────────────────────────────────────── */
.nav-bar {
    display: flex;
    align-items: center;
    height: 50px;
    width: 100%;
    position: relative;
    overflow: hidden;

    /*
     * 流行渐变方案：极浅蓝紫 → 纯白
     * 亮色模式下产生"光晕从左透进"的质感，
     * 不遮盖文字，不干扰 tab 交互，只是背景层次。
     */
    background: linear-gradient(
        105deg,
        rgba(0, 102, 204, 0.07) 0%,
        rgba(41, 151, 255, 0.04) 30%,
        v-bind('config.getColorVal("headerBarBackground")') 65%
    );
    border-bottom: 1px solid rgba(0, 102, 204, 0.10);

    /* 深色模式下换用更暗的渐变 */
    &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
            105deg,
            rgba(41, 151, 255, 0.06) 0%,
            transparent 50%
        );
        pointer-events: none;
        opacity: v-bind('config.layout.isDark ? 1 : 0');
        transition: opacity 0.3s;
    }

    /* ── Tab 区域 ──────────────────────────────────────────────────── */
    :deep(.nav-tabs) {
        display: flex;
        height: 100%;
        position: relative;
        z-index: 1;

        .ba-nav-tab {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 18px;
            cursor: pointer;
            z-index: 1;
            height: 100%;
            user-select: none;
            color: v-bind('config.getColorVal("headerBarTabColor")');
            font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
            font-size: 13.5px;
            font-weight: 400;
            letter-spacing: -0.01em;
            transition: color 0.15s, background 0.15s;

            .close-icon {
                padding: 2px;
                margin: 2px 0 0 6px;
                opacity: 0;
                transition: opacity 0.15s;
            }

            &:hover .close-icon { opacity: 0.5; }

            .close-icon:hover {
                background: rgba(0, 0, 0, 0.06);
                color: #1d1d1f !important;
                border-radius: 50%;
                opacity: 1;
            }

            &.active {
                color: v-bind('config.getColorVal("headerBarTabActiveColor")');
                font-weight: 600;
                .close-icon { opacity: 0.45; }
            }

            &:hover {
                background-color: rgba(0, 102, 204, 0.05);
            }
        }

        /* 激活下划线：渐变蓝线，更有设计感 */
        .nav-tabs-active-box {
            position: absolute;
            height: 2px;
            bottom: 0;
            background: linear-gradient(90deg, #0066cc, #2997ff);
            transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
            border-radius: 2px 2px 0 0;
        }
    }
}

/* ── 系统标题区 ──────────────────────────────────────────────────────── */
.nav-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 18px 0 20px;
    flex-shrink: 0;
    height: 100%;
    position: relative;
    z-index: 1;

    /* 右侧竖向分隔线 */
    &::after {
        content: '';
        position: absolute;
        right: 0;
        top: 14px;
        bottom: 14px;
        width: 1px;
        background: linear-gradient(
            to bottom,
            transparent,
            rgba(0, 102, 204, 0.18) 30%,
            rgba(0, 102, 204, 0.18) 70%,
            transparent
        );
    }
}

/* 消息中心品牌图标 */
.nav-brand__icon-wrap {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    overflow: hidden;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(0, 102, 204, 0.28);
}

.nav-brand__icon {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
}

.nav-brand__name {
    font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: -0.2px;
    color: v-bind('config.getColorVal("headerBarTabColor")');
    white-space: nowrap;
}

/* ── shrink 模式展开按钮 ────────────────────────────────────────────── */
.unfold {
    align-self: center;
    padding-left: var(--ba-main-space);
    position: relative;
    z-index: 1;
}
</style>
