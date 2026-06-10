# 消息中心前端 — 任务节点

每个任务都是独立可交付的单元，按顺序执行。每次交互只处理一个任务。

---

## T1 — API 封装

**文件**：`src/api/messageCenter.ts`

实现四个函数：

```ts
getMyMessages(page?: number, limit?: number): ApiPromise<MessageItem[]>
getUnreadCount(): ApiPromise<{ unreadCount: number }>
markRead(messageId: string): ApiPromise<MarkResult>
markUnread(messageId: string): ApiPromise<MarkResult>
```

类型定义内联在同一文件：

```ts
interface MessageItem {
  messageId: string
  title: string
  content: string
  url: string | null
  read: boolean
  seen: boolean
  createdAt: string
}

interface MarkResult {
  messageId: string
  read: boolean
  unreadCount: number
}
```

使用 `createAxios`，路径前缀 `/api/message-center`。

**完成标准**：文件可 import，TypeScript 类型完整，无运行时逻辑。

---

## T2 — Pinia Store

**文件**：`src/stores/messageCenter.ts`

State / getters / actions 如 fe-plan.md §7 所述。

关键点：
- `filtered(filter, query)` getter：前端过滤，不额外请求
- `unreadByFilter` getter：计算各 filter 的未读数（`all / unread / read`）
- `markRead / markUnread`：乐观更新本地 `read` 状态，然后调用 API，API 返回后同步 `unreadCount`
- `bulkMark(ids, read)`：并发调用，全部 settled 后更新
- `fetchMessages`：调用 `getMyMessages(0, 100)`，结果写入 `messages`
- `fetchUnreadCount`：调用 `getUnreadCount()`

注册到 `src/stores/index.ts`（追加导出，不修改其他内容）。

**完成标准**：store 可在 Vue devtools 中观察，`fetchMessages` 后 `messages` 有数据。

---

## T3 — McEmpty 组件

**文件**：`src/views/backend/messageCenter/components/McEmpty.vue`

Props：`filter: string`，`query: string`

根据 filter / query 渲染不同图标 + 文案（参照原型 `EmptyState`）：

| 条件 | 图标 | 标题 | 副文本 |
|---|---|---|---|
| `query` 非空 | 搜索 | 未找到匹配的消息 | 试试更换关键词 |
| `filter='unread'` | 勾选 | 全部已读 | 太棒了… |
| `filter='favorites'` | 星星 | 收藏夹即将上线 | 后续可在此… |
| 默认 | 信封 | 暂无消息 | 这里还没有任何通知 |

使用 Element Plus 图标或 SVG inline，样式自包含。

**完成标准**：四种状态均可渲染，无外部依赖。

---

## T4 — McSidebar 组件

**文件**：`src/views/backend/messageCenter/components/McSidebar.vue`

Props：
```ts
active: string            // 当前激活的 filter id
collapsed: boolean        // 折叠状态
unreadByFilter: Record<string, number>
onSelect: (id: string) => void
```

导航分组（硬编码，不依赖 API）：

```
分组 1（无标签）: 全部消息 / 未读消息 / 已读消息
分组 2（更多）: 收藏夹（保留占位，disabled + "即将上线" tag）
```

注意：原型中的 `workflow / announcement / permission` 分类过滤**不实现**，因 API 不返回 `category` 字段。

折叠时：只显示图标，未读用小红点表示。
展开时：显示图标 + 文字 + 未读数角标。

**完成标准**：点击项触发 `onSelect`，角标响应 store 计算值。

---

## T5 — McDetail 组件

**文件**：`src/views/backend/messageCenter/components/McDetail.vue`

Props：
```ts
msg: MessageItem | null
onToggleRead: (id: string) => void
onOpenPage: (url: string) => void
onClose: () => void
```

两种状态：
1. `msg === null`：空占位（复用 placeholder 样式）
2. `msg` 存在：
   - 顶栏：创建时间 + [标为已读/未读按钮] + [关闭按钮]
   - 状态 chip：已读 / 未读（颜色区分）
   - 标题（`display-md` 级别字体）
   - 元信息区：创建时间（完整格式）、当前状态
   - 分割线
   - 正文内容（保留换行 `white-space: pre-wrap`）
   - 底栏（仅当 `msg.url` 存在时）：路径展示 + "打开相关页面"按钮

**完成标准**：`msg.url` 为 null/空时底栏不渲染，切换 read 状态时 chip 实时更新。

---

## T6 — McList 组件

**文件**：`src/views/backend/messageCenter/components/McList.vue`

Props：
```ts
filter: string
messages: MessageItem[]          // 已过滤后的当前页消息
totalCount: number
unreadCount: number
activeId: string | null
selectedIds: Set<string>
query: string
density: 'comfortable' | 'compact'
hasMore: boolean
onOpen: (id: string) => void
onToggleSelect: (id: string) => void
onSelectAll: () => void
onClearSelection: () => void
onBulkRead: () => void
onBulkUnread: () => void
onReachEnd: () => void
```

结构：
1. **工具栏**：标题（按 filter 显示）+ 条数/未读数 + 全选按钮
2. **批量操作栏**（选中项 > 0 时 slide-in）：已选 N 项 + 标记已读 + 标记未读 + 取消
3. **滚动区**：
   - 按 `dateBucket` 分组（今天/昨天/本周/更早）
   - 每行：未读圆点 + 选择框 + 标题 + 时间 + 预览（comfortable 密度）
   - `IntersectionObserver` 触底加载更多
4. 空状态 → `McEmpty`

行点击 → `onOpen`；左侧 rail 点击 → `onToggleSelect`（阻止冒泡）。

**完成标准**：分组正确，选择逻辑独立，批量栏动画流畅。

---

## T7 — 页面入口 index.vue

**文件**：`src/views/backend/messageCenter/index.vue`

职责：
- 初始化 store（`fetchMessages` + `fetchUnreadCount`）
- 持有本地 UI 状态：`filter / query / activeId / selectedIds / density / sidebarCollapsed / visibleCount`
- 组装三栏布局：`McSidebar` + `McList` + `McDetail`
- 处理所有事件回调（`onOpen / onToggleRead / onOpenPage / bulkMark` 等）
- 加载状态：骨架屏或 spinner（`v-loading`）
- 错误状态：重试按钮

布局：CSS Grid `220px 1fr auto`（detail 宽度固定 `min(420px, 38vw)`）。
在 `<1100px` 时 detail 隐藏（点击行时全屏覆盖）。

**完成标准**：页面可独立运行，三栏正常显示，过滤/搜索/标记读写均工作。

---

## T8 — 菜单角标集成

### 现状评估

经过对以下文件的逐一核查，框架**当前不支持菜单 badge**：

| 文件 | 结论 |
|---|---|
| `layouts/backend/container/classic.vue` | Classic 布局：`Aside` + `Header` + `Main`，无 badge 机制 |
| `layouts/backend/components/aside.vue` | 非 Double 模式一律使用 `MenuVertical`，无 badge |
| `layouts/backend/components/menus/menuVertical.vue` | 只渲染 `el-menu` + `MenuTree`，无 badge |
| `layouts/backend/components/menus/menuTree.vue` | 每个 `el-menu-item` 只有 `Icon` + `span.menu-title`，**无 badge 插槽** |
| `stores/navTabs.ts` | `tabsViewRoutes` 的 `RouteRecordRaw.meta` 无 badge/unread 字段 |

### 最小改动方案

**整体策略**：不修改 RBAC 数据结构、不新增静态菜单、不破坏现有菜单渲染逻辑。
仅在 `menuTree.vue` 的叶子菜单项 `slot` 中追加 badge，并由消息中心 store 驱动数值。

**修改 `menuTree.vue`（唯一改动文件）**

在叶子 `el-menu-item` 的 `default slot` 内，在 `span.menu-title` 之后追加一个条件 badge：

```html
<el-menu-item :index="menu.path" :key="menu.path" @click="onClickMenu(menu)">
  <Icon v-if="showIcon" :name="getMenuIcon(menu)" color="currentColor" size="16px" />
  <span class="menu-title">{{ menu.meta?.title ? menu.meta?.title : $t('noTitle') }}</span>
  <!-- 消息中心角标：仅当路径匹配且有未读时渲染 -->
  <el-badge
    v-if="getMenuBadge(menu.path)"
    :value="getMenuBadge(menu.path)"
    :max="99"
    class="menu-badge"
  />
</el-menu-item>
```

`getMenuBadge(path)` 函数在 `<script setup>` 中实现：

```ts
import { useMcStore } from '/@/stores/messageCenter'

const mcStore = useMcStore()

// 仅对消息中心路径返回未读数，其余返回 0（不渲染 badge）
const getMenuBadge = (path: string): number => {
  if (!path.includes('message-center')) return 0
  return mcStore.unreadCount
}
```

同时在 `menuTree.vue` 的 `onMounted` 或消息中心 store 初始化时触发一次 `fetchUnreadCount()`。
具体时机：**由消息中心页面 `index.vue` 在 `onMounted` 中调用 `fetchUnreadCount()`**，store 状态自动传播到菜单，无需在 `menuTree` 内发起请求。

**样式（在 `menuTree.vue` 的 `<style scoped>`）**：

```scss
.menu-badge {
  margin-left: auto;
  flex-shrink: 0;
  :deep(.el-badge__content) {
    font-size: 11px;
    height: 18px;
    line-height: 18px;
    padding: 0 5px;
    border-radius: 9px;
    border: none;
    background-color: #0066cc;
  }
}
```

> `el-menu-item` 在 Classic 布局下已是 `display: flex; align-items: center`，`margin-left: auto` 可将 badge 推到右侧。

### 改动范围

| 文件 | 操作 | 变更量 |
|---|---|---|
| `src/layouts/backend/components/menus/menuTree.vue` | 追加 badge 渲染 + `getMenuBadge` 函数 | ~20 行 |
| `src/stores/messageCenter.ts` | T2 已建，`unreadCount` 为响应式状态，此处无需额外修改 | 0 行 |

不修改：RBAC 数据结构、navTabs store、aside、menuVertical、静态路由。

### 完成标准

- 消息中心菜单项右侧出现蓝色数字角标，数值与 `unreadCount` 一致
- 用户标记已读/未读后角标数值实时更新（响应式，无需刷新页面）
- 其他所有菜单项不受影响，无多余 badge 渲染
- 页面刷新后，进入消息中心页面 `onMounted` 重新拉取一次，角标恢复正确数值

---

## 任务依赖关系

```
T1 (API)
  └─ T2 (Store)
       ├─ T3 (McEmpty)   ← 无依赖，可并行
       ├─ T4 (McSidebar) ← 依赖 Store getter
       ├─ T5 (McDetail)  ← 依赖 MessageItem 类型
       └─ T6 (McList)    ← 依赖 T3 + MessageItem 类型
            └─ T7 (index.vue) ← 依赖 T2 T3 T4 T5 T6
                 └─ T8 (menuTree.vue 追加 badge)
```

---

## 文件清单（最终输出）

```
src/api/messageCenter.ts                                    ← 新建
src/stores/messageCenter.ts                                 ← 新建
src/views/backend/messageCenter/index.vue                   ← 新建
src/views/backend/messageCenter/components/McEmpty.vue      ← 新建
src/views/backend/messageCenter/components/McSidebar.vue    ← 新建
src/views/backend/messageCenter/components/McDetail.vue     ← 新建
src/views/backend/messageCenter/components/McList.vue       ← 新建
src/stores/index.ts                                         ← 追加一行导出
src/layouts/backend/components/menus/menuTree.vue           ← 追加 badge (~20行)
```

共 **9 个文件**，其中 7 个新建，2 个小幅追加。静态路由文件不涉及。
