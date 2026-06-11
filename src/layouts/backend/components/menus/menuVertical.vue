<template>
    <el-scrollbar ref="layoutMenuScrollbarRef" class="vertical-menus-scrollbar">
        <el-menu
            class="layouts-menu-vertical"
            :collapse-transition="false"
            :unique-opened="config.layout.menuUniqueOpened"
            :default-active="state.defaultActive"
            :collapse="config.layout.menuCollapse"
            ref="layoutMenuRef"
        >
            <MenuTree :menus="navTabs.state.tabsViewRoutes" />
        </el-menu>
    </el-scrollbar>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive } from 'vue'
import MenuTree from '/@/layouts/backend/components/menus/menuTree.vue'
import { useRoute, onBeforeRouteUpdate, type RouteLocationNormalizedLoaded } from 'vue-router'
import { layoutMenuRef, layoutMenuScrollbarRef } from '/@/stores/refs'
import { useConfig } from '/@/stores/config'
import { useNavTabs } from '/@/stores/navTabs'

const config = useConfig()
const navTabs = useNavTabs()
const route = useRoute()

const state = reactive({
    defaultActive: '',
})

const verticalMenusScrollbarHeight = computed(() => {
    /*
     * Layout after restructure:
     *   outer header  = 50px  (full-width, lives outside aside)
     *   logo card     = 100px (inside aside, when menuShowTopBar is true)
     * Default mode adds 32px margin on the aside.
     */
    const headerH = 50
    const logoH   = config.layout.menuShowTopBar ? 100 : 0

    if (config.layout.layoutMode === 'Default') {
        return `calc(100vh - ${headerH + 32 + logoH}px)`
    }
    return `calc(100vh - ${headerH + logoH}px)`
})

const currentRouteActive = (currentRoute: RouteLocationNormalizedLoaded) => {
    const tabView = navTabs.getTabsViewDataByRoute(currentRoute)
    if (tabView) {
        state.defaultActive = tabView.meta!.matched as string
    }
}

const verticalMenusScroll = () => {
    nextTick(() => {
        const activeMenu: HTMLElement | null = document.querySelector(
            '.el-menu.layouts-menu-vertical li.is-active'
        )
        if (!activeMenu) return false
        layoutMenuScrollbarRef.value?.setScrollTop(activeMenu.offsetTop)
    })
}

onMounted(() => {
    currentRouteActive(route)
    verticalMenusScroll()
})

onBeforeRouteUpdate((to) => {
    currentRouteActive(to)
})
</script>

<style>
.vertical-menus-scrollbar {
    height: v-bind(verticalMenusScrollbarHeight);
    background-color: v-bind('config.getColorVal("menuBackground")');
}

/* ── Apple-style menu items ─────────────────────────────────────────── */
.layouts-menu-vertical {
    border: 0;
    padding: 8px 0 30px;
    --el-menu-bg-color: v-bind('config.getColorVal("menuBackground")');
    --el-menu-text-color: v-bind('config.getColorVal("menuColor")');
    --el-menu-active-color: v-bind('config.getColorVal("menuActiveColor")');
    --ba-menu-active-bg: v-bind('config.getColorVal("menuActiveBackground")');
    font-family: 'SF Pro Text', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.layouts-menu-vertical .el-menu-item,
.layouts-menu-vertical .el-sub-menu__title {
    height: 42px;
    line-height: 42px;
    margin: 2px 10px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 400;
    letter-spacing: -0.01em;
    color: var(--el-menu-text-color);
    transition: background 0.12s, color 0.12s;
}

.layouts-menu-vertical .el-menu-item:hover,
.layouts-menu-vertical .el-sub-menu__title:hover {
    background-color: rgba(0, 0, 0, 0.045);
    color: var(--el-menu-active-color);
}

.layouts-menu-vertical .el-menu-item.is-active,
.layouts-menu-vertical .el-sub-menu.is-active > .el-sub-menu__title {
    background-color: var(--ba-menu-active-bg) !important;
    color: var(--el-menu-active-color) !important;
    font-weight: 600;
}

.layouts-menu-vertical.el-menu--collapse {
    width: 64px;
    padding: 8px 0 30px;
}

.layouts-menu-vertical.el-menu--collapse .el-menu-item,
.layouts-menu-vertical.el-menu--collapse .el-sub-menu__title {
    width: 44px;
    height: 42px;
    margin: 2px auto;
    padding: 0 !important;
    display: flex;
    align-items: center;
    justify-content: center;
}

.layouts-menu-vertical.el-menu--collapse .el-menu-item > .icon,
.layouts-menu-vertical.el-menu--collapse .el-sub-menu__title > .icon {
    margin: 0 !important;
    width: 20px !important;
    height: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.layouts-menu-vertical.el-menu--collapse .menu-title,
.layouts-menu-vertical.el-menu--collapse .menu-unread-badge,
.layouts-menu-vertical.el-menu--collapse .el-sub-menu__icon-arrow {
    display: none !important;
}
</style>
