<template>
    <el-aside
        v-if="!navTabs.state.tabFullScreen"
        :class="'layout-aside-' + config.layout.layoutMode + ' ' + (config.layout.shrink ? 'shrink' : '')"
    >
        <Logo v-if="config.layout.menuShowTopBar" />
        <MenuVerticalChildren v-if="config.layout.layoutMode == 'Double'" />
        <MenuVertical v-else />
    </el-aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Logo from '/@/layouts/backend/components/logo.vue'
import MenuVertical from '/@/layouts/backend/components/menus/menuVertical.vue'
import MenuVerticalChildren from '/@/layouts/backend/components/menus/menuVerticalChildren.vue'
import { useConfig } from '/@/stores/config'
import { useNavTabs } from '/@/stores/navTabs'

const config = useConfig()
const navTabs = useNavTabs()

const menuWidth = computed(() => config.menuWidth())
</script>

<style scoped lang="scss">
.layout-aside-Default {
    background: var(--ba-bg-color-overlay);
    margin: 16px 0 16px 16px;
    height: calc(100vh - 32px - 50px); /* subtract header 50px for Default mode */
    box-shadow: var(--el-box-shadow-light);
    border-radius: var(--el-border-radius-base);
    overflow: hidden;
    transition: width 0.3s ease;
    width: v-bind(menuWidth);
}

/*
 * Classic / Double: header is now outside the body-wrapper column,
 * so aside height = full remaining viewport after the 50px header.
 */
.layout-aside-Classic,
.layout-aside-Double {
    background: v-bind('config.getColorVal("menuBackground")');
    margin: 0;
    height: calc(100vh - 50px);
    overflow: hidden;
    transition: width 0.3s ease;
    width: v-bind(menuWidth);
}

.shrink {
    position: fixed;
    top: 50px; /* offset below the full-width header */
    left: 0;
    z-index: 9999999;
}
</style>
