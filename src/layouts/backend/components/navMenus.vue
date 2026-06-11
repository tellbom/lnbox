<template>
    <div class="nav-menus" :class="configStore.layout.layoutMode">

        <!-- 管理员信息 ── Apple-style Profile Trigger -->
        <el-popover
            v-if="siteConfig.userInitialize"
            @show="onCurrentNavMenu(true, 'adminInfo')"
            @hide="onCurrentNavMenu(false, 'adminInfo')"
            placement="bottom-end"
            :hide-after="0"
            :width="240"
            trigger="click"
            popper-class="admin-info-box"
            v-model:visible="state.showAdminInfoPopover"
        >
            <template #reference>
                <div class="admin-trigger" :class="{ 'is-open': state.currentNavMenu === 'adminInfo' }">
                    <el-avatar class="admin-trigger__avatar" :size="28" :src="fullUrl(adminInfo.avatar)">
                        {{ adminInitial }}
                    </el-avatar>
                    <span class="admin-trigger__name">{{ adminInfo.nickname }}</span>
                    <svg class="admin-trigger__chevron" :class="{ 'is-open': state.currentNavMenu === 'adminInfo' }"
                        width="10" height="6" viewBox="0 0 10 6" fill="none">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5"
                            stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            </template>

            <!-- Profile Card -->
            <div class="profile-card">
                <div class="profile-card__hero">
                    <el-avatar class="profile-card__avatar" :size="48" :src="fullUrl(adminInfo.avatar)">
                        {{ adminInitial }}
                    </el-avatar>
                    <div class="profile-card__meta">
                        <div class="profile-card__name">{{ adminInfo.nickname }}</div>
                        <div v-if="adminInfo.userid" class="profile-card__id">{{ adminInfo.userid }}</div>
                    </div>
                </div>
                <div class="profile-card__rule" />
                <div class="profile-card__actions">
                    <button class="profile-card__btn profile-card__btn--ghost" @click="onAdminInfo">
                        {{ t('layouts.personal data') }}
                    </button>
                    <button class="profile-card__btn profile-card__btn--danger" @click="onLogout">
                        {{ t('layouts.cancellation') }}
                    </button>
                </div>
            </div>
        </el-popover>

        <Config />
        <TerminalVue />
    </div>
</template>

<script lang="ts" setup>
import { ElMessage, type PopoverInstance } from 'element-plus'
import screenfull from 'screenfull'
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Config from './config.vue'
import { logout } from '/@/api/backend/index'
import { postClearCache } from '/@/api/common'
import TerminalVue from '/@/components/terminal/index.vue'
import { editDefaultLang } from '/@/lang'
import router from '/@/router'
import { useAdminInfo } from '/@/stores/adminInfo'
import { useConfig } from '/@/stores/config'
import { ADMIN_INFO, BA_ACCOUNT } from '/@/stores/constant/cacheKey'
import { useSiteConfig } from '/@/stores/siteConfig'
import { useTerminal } from '/@/stores/terminal'
import { fullUrl } from '/@/utils/common'
import { routePush } from '/@/utils/router'
import { Local, Session } from '/@/utils/storage'
import { hotUpdateState, reloadServer } from '/@/utils/vite'

const { t } = useI18n()

const adminInfo   = useAdminInfo()
const configStore = useConfig()
const terminal    = useTerminal()
const siteConfig  = useSiteConfig()
const reloadHotServerPopover = ref<PopoverInstance>()

const state = reactive({
    isFullScreen: false,
    currentNavMenu: '',
    showLayoutDrawer: false,
    showAdminInfoPopover: false,
})

/** 头像 fallback 首字母 */
const adminInitial = computed(() => {
    const name = adminInfo.nickname || adminInfo.username || '?'
    return name.charAt(0).toUpperCase()
})

const onCurrentNavMenu = (status: boolean, name: string) => {
    state.currentNavMenu = status ? name : ''
}

const onHotServerOpt = (opt: 'reload' | 'cancel') => {
    if (opt === 'cancel') {
        reloadHotServerPopover.value?.hide()
    } else {
        reloadServer('manual')
    }
}

const onFullScreen = () => {
    if (!screenfull.isEnabled) {
        ElMessage.warning(t('layouts.Full screen is not supported'))
        return false
    }
    screenfull.toggle()
    screenfull.onchange(() => { state.isFullScreen = screenfull.isFullscreen })
}

const onAdminInfo = () => {
    state.showAdminInfoPopover = false
    routePush({ name: 'routine/adminInfo' })
}

const onLogout = () => {
    logout().then(() => {
        Local.remove(ADMIN_INFO)
        router.go(0)
    })
}

const onClearCache = (type: string) => {
    if (type === 'storage' || type === 'all') {
        const adminInfoData = Local.get(ADMIN_INFO)
        const baAccount     = Local.get(BA_ACCOUNT)
        Session.clear()
        Local.clear()
        Local.set(ADMIN_INFO, adminInfoData)
        Local.set(BA_ACCOUNT, baAccount)
        if (type === 'storage') return
    }
    postClearCache(type).then(() => {})
}
</script>

<style scoped lang="scss">
/* ── 容器 ─────────────────────────────────────────────────────────── */
.nav-menus {
    display: flex;
    align-items: center;
    height: 100%;
    margin-left: auto;
    background-color: v-bind('configStore.getColorVal("headerBarBackground")');

    &.Default {
        border-radius: var(--el-border-radius-base);
        box-shadow: var(--el-box-shadow-light);
    }
}

/* ── Apple Profile Trigger ────────────────────────────────────────── */
.admin-trigger {
    display: flex;
    align-items: center;
    gap: 7px;
    height: 34px;
    padding: 0 12px 0 5px;
    margin-right: 10px;
    border-radius: 99px;
    cursor: pointer;
    transition: background 0.14s;
    user-select: none;
    border: 1px solid transparent;

    &:hover,
    &.is-open {
        background: v-bind('configStore.getColorVal("headerBarHoverBackground")');
        border-color: rgba(0, 0, 0, 0.07);
    }
}

.admin-trigger__avatar {
    flex-shrink: 0;
    font-size: 12px;
    font-weight: 600;
    /*
     * Fallback color when no avatar image.
     * surface-chip-translucent from DESIGN.md: #d2d2d7
     */
    background: #d2d2d7;
    color: #1d1d1f;
}

.admin-trigger__name {
    /* DESIGN.md caption-strong: 14px / 600 / -0.224px */
    font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: -0.01em;
    color: v-bind('configStore.getColorVal("headerBarTabColor")');
    white-space: nowrap;
    max-width: 110px;
    overflow: hidden;
    text-overflow: ellipsis;
}

.admin-trigger__chevron {
    flex-shrink: 0;
    color: v-bind('configStore.getColorVal("headerBarTabColor")');
    opacity: 0.4;
    transition: transform 0.18s cubic-bezier(0.4, 0, 0.2, 1);

    &.is-open { transform: rotate(180deg); }
}
</style>

<!-- Profile Card popover — non-scoped so it applies to teleported popper -->
<style lang="scss">
.admin-info-box.el-popover {
    padding: 0 !important;
    border-radius: 14px !important;
    border: 1px solid rgba(0, 0, 0, 0.08) !important;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.10) !important;
    overflow: hidden;
}

.profile-card {
    padding: 18px 16px 0;

    &__hero {
        display: flex;
        align-items: center;
        gap: 12px;
        padding-bottom: 16px;
    }

    &__avatar {
        flex-shrink: 0;
        font-size: 18px;
        font-weight: 600;
        background: #d2d2d7; /* surface-chip-translucent */
        color: #1d1d1f;
    }

    &__meta {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 3px;
    }

    &__name {
        /* DESIGN.md body-strong: 17px / 600 / -0.374px */
        font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
        font-size: 15px;
        font-weight: 600;
        letter-spacing: -0.374px;
        color: #1d1d1f;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    &__id {
        /* DESIGN.md fine-print: 12px / 400 / -0.12px */
        font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
        font-size: 12px;
        font-weight: 400;
        letter-spacing: -0.12px;
        color: #86868b;
    }

    &__rule {
        height: 1px;
        background: #f0f0f0; /* divider-soft */
        margin: 0 -16px;
    }

    &__actions {
        display: flex;
        gap: 8px;
        padding: 12px 0;
    }

    &__btn {
        flex: 1;
        height: 32px;
        border-radius: 8px; /* rounded.sm per DESIGN.md */
        border: 1px solid #e0e0e0; /* hairline */
        /* DESIGN.md button-utility: 14px / 400 / -0.224px */
        font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
        font-size: 14px;
        font-weight: 400;
        letter-spacing: -0.224px;
        cursor: pointer;
        /* DESIGN.md: transform: scale(0.95) on active */
        transition: background 0.12s, transform 0.08s;

        &:active { transform: scale(0.95); }

        &--ghost {
            background: #ffffff;
            color: #1d1d1f;
            &:hover { background: #f5f5f7; } /* canvas-parchment */
        }

        &--danger {
            background: #ffffff;
            color: #d70015;
            border-color: rgba(215, 0, 21, 0.18);
            &:hover { background: rgba(215, 0, 21, 0.04); }
        }
    }
}
</style>
