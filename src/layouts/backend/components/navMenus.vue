<template>
    <div class="nav-menus" :class="configStore.layout.layoutMode">
        <!-- 管理员信息 -->
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
                <!-- Apple-style profile trigger -->
                <div class="admin-trigger" :class="{ 'is-open': state.currentNavMenu == 'adminInfo' }">
                    <el-avatar class="admin-trigger__avatar" :size="30" :src="fullUrl(adminInfo.avatar)">
                        {{ adminInitial }}
                    </el-avatar>
                    <span class="admin-trigger__name">{{ adminInfo.nickname }}</span>
                    <span class="admin-trigger__chevron">
                        <el-icon :size="12"><ArrowDown /></el-icon>
                    </span>
                </div>
            </template>

            <!-- Profile Card -->
            <div class="profile-card">
                <div class="profile-card__hero">
                    <el-avatar class="profile-card__avatar" :size="52" :src="fullUrl(adminInfo.avatar)">
                        {{ adminInitial }}
                    </el-avatar>
                    <div class="profile-card__info">
                        <div class="profile-card__name">{{ adminInfo.nickname }}</div>
                        <div v-if="adminInfo.userid" class="profile-card__id">{{ adminInfo.userid }}</div>
                    </div>
                </div>
                <div class="profile-card__divider" />
                <div class="profile-card__actions">
                    <button class="profile-card__btn profile-card__btn--secondary" @click="onAdminInfo">
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
import { ElMessage } from 'element-plus'
import screenfull from 'screenfull'
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowDown } from '@element-plus/icons-vue'
import Config from './config.vue'
import { logout } from '/@/api/backend/index'
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

const { t } = useI18n()

const adminInfo    = useAdminInfo()
const configStore  = useConfig()
const terminal     = useTerminal()
const siteConfig   = useSiteConfig()

const state = reactive({
    isFullScreen: false,
    currentNavMenu: '',
    showLayoutDrawer: false,
    showAdminInfoPopover: false,
})

// 用户名首字母，头像加载失败时作 fallback
const adminInitial = computed(() => {
    const name = adminInfo.nickname || adminInfo.username || '?'
    return name.charAt(0).toUpperCase()
})

const onCurrentNavMenu = (status: boolean, name: string) => {
    state.currentNavMenu = status ? name : ''
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
    if (type == 'storage' || type == 'all') {
        const adminInfoData = Local.get(ADMIN_INFO)
        const baAccount = Local.get(BA_ACCOUNT)
        Session.clear()
        Local.clear()
        Local.set(ADMIN_INFO, adminInfoData)
        Local.set(BA_ACCOUNT, baAccount)
        if (type == 'storage') return
    }
}

const onFullScreen = () => {
    if (!screenfull.isEnabled) {
        ElMessage.warning(t('layouts.Full screen is not supported'))
        return false
    }
    screenfull.toggle()
    screenfull.onchange(() => {
        state.isFullScreen = screenfull.isFullscreen
    })
}
</script>

<style scoped lang="scss">
.nav-menus {
    display: flex;
    align-items: center;
    height: 100%;
    margin-left: auto;
    background-color: v-bind('configStore.getColorVal("headerBarBackground")');
}

/* ── Profile Trigger ───────────────────────────────────────────────── */
.admin-trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 36px;
    padding: 0 12px 0 6px;
    margin-right: 8px;
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
    font-size: 13px;
    font-weight: 600;
    background: #d2d2d7;
    color: #1d1d1f;
}

.admin-trigger__name {
    font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
    font-size: 13.5px;
    font-weight: 500;
    letter-spacing: -0.01em;
    color: v-bind('configStore.getColorVal("headerBarTabColor")');
    white-space: nowrap;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
}

.admin-trigger__chevron {
    color: v-bind('configStore.getColorVal("headerBarTabColor")');
    opacity: 0.45;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    transition: transform 0.18s;
}

.admin-trigger.is-open .admin-trigger__chevron {
    transform: rotate(180deg);
}
</style>

<!-- Profile Card 弹出层（非 scoped，作用于 teleport 出的 popper） -->
<style lang="scss">
.admin-info-box.el-popover {
    padding: 0 !important;
    border-radius: 14px !important;
    border: 1px solid rgba(0, 0, 0, 0.08) !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
    overflow: hidden;
}

.profile-card {
    padding: 20px 16px 0;

    &__hero {
        display: flex;
        align-items: center;
        gap: 14px;
        padding-bottom: 16px;
    }

    &__avatar {
        flex-shrink: 0;
        font-size: 20px;
        font-weight: 600;
        background: #d2d2d7;
        color: #1d1d1f;
    }

    &__info {
        display: flex;
        flex-direction: column;
        gap: 3px;
        min-width: 0;
    }

    &__name {
        font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
        font-size: 15px;
        font-weight: 600;
        color: #1d1d1f;
        letter-spacing: -0.15px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    &__id {
        font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
        font-size: 12px;
        color: #86868b;
        letter-spacing: 0;
        white-space: nowrap;
    }

    &__divider {
        height: 1px;
        background: #f0f0f0;
        margin: 0 -16px;
    }

    &__actions {
        display: flex;
        gap: 8px;
        padding: 12px 0;
    }

    &__btn {
        flex: 1;
        height: 34px;
        border-radius: 8px;
        border: 1px solid #e3e3e6;
        font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
        font-size: 13px;
        font-weight: 500;
        letter-spacing: -0.01em;
        cursor: pointer;
        transition: background 0.12s, transform 0.08s;

        &:active { transform: scale(0.96); }

        &--secondary {
            background: #fff;
            color: #1d1d1f;

            &:hover { background: #f5f5f7; }
        }

        &--danger {
            background: #fff;
            color: #d70015;
            border-color: rgba(215, 0, 21, 0.2);

            &:hover { background: rgba(215, 0, 21, 0.05); }
        }
    }
}
</style>
