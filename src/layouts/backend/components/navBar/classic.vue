<template>
    <div class="nav-bar">
        <!-- 菜单折叠时的展开按钮（shrink 模式） -->
        <div v-if="config.layout.shrink && config.layout.menuCollapse" class="unfold">
            <Icon @click="onMenuCollapse" name="fa fa-indent" :color="config.getColorVal('menuActiveColor')" size="18" />
        </div>

        <!-- 系统标题：固定在标签页左侧 -->
        <div class="nav-brand">
            <el-icon class="nav-brand__icon" :size="16"><Bell /></el-icon>
            <span class="nav-brand__name">消息中心</span>
        </div>

        <!-- 标签页（路由 tab，RBAC 动态下发） -->
        <NavTabs v-if="!config.layout.shrink" ref="layoutNavTabsRef" />

        <!-- 右侧工具栏（用户信息等） -->
        <NavMenus />
    </div>
</template>

<script setup lang="ts">
import { useConfig } from '/@/stores/config'
import { Bell } from '@element-plus/icons-vue'
import NavTabs from '/@/layouts/backend/components/navBar/tabs.vue'
import { layoutNavTabsRef } from '/@/stores/refs'
import NavMenus from '../navMenus.vue'
import { showShade } from '/@/utils/pageShade'

const config = useConfig()

const onMenuCollapse = () => {
    showShade('ba-aside-menu-shade', () => {
        config.setLayout('menuCollapse', true)
    })
    config.setLayout('menuCollapse', false)
}
</script>

<style scoped lang="scss">
.nav-bar {
    display: flex;
    align-items: center;
    height: 50px;
    width: 100%;
    background-color: v-bind('config.getColorVal("headerBarBackground")');
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);

    :deep(.nav-tabs) {
        display: flex;
        height: 100%;
        position: relative;

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

            &:hover .close-icon {
                opacity: 0.5;
            }

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
                background-color: v-bind('config.getColorVal("headerBarHoverBackground")');
            }
        }

        .nav-tabs-active-box {
            position: absolute;
            height: 2px;
            bottom: 0;
            background-color: v-bind('config.getColorVal("headerBarTabActiveColor")');
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            border-radius: 2px 2px 0 0;
        }
    }
}

/* ── 系统标题 ─────────────────────────────────────────────────────── */
.nav-brand {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 0 16px 0 20px;
    flex-shrink: 0;
    border-right: 1px solid rgba(0, 0, 0, 0.06);
    height: 100%;
}

.nav-brand__icon {
    color: v-bind('config.getColorVal("headerBarTabColor")');
    opacity: 0.7;
    flex-shrink: 0;
}

.nav-brand__name {
    font-family: 'SF Pro Text', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: -0.15px;
    color: v-bind('config.getColorVal("headerBarTabColor")');
    white-space: nowrap;
}

/* ── 展开按钮（shrink 模式） ──────────────────────────────────────── */
.unfold {
    align-self: center;
    padding-left: var(--ba-main-space);
}
</style>
