# 消息中心前端 — 实施计划

## 1. 目标

将原型文件（`*.jsx` / `消息中心.html`）转化为符合现有 Vue3 项目框架的生产级页面。
UI 风格参照 DESIGN.md（Apple 设计系统），交互参照原型，数据源严格遵循 `API_Backend_README.md`，架构规则遵循 `CLAUDE.md`。

---

## 2. 边界约束

| 约束 | 说明 |
|---|---|
| 只读功能 | 不实现 `POST /send`，消息发送由后端业务系统负责 |
| 字段忠实 | API 只返回 `messageId / title / content / url / read / seen / createdAt`，不虚构 `systemId / category / businessType` 等字段 |
| 条件渲染 | `url` 存在时才显示"打开相关页面"按钮；`seen` 可选展示 |
| 框架规范 | Vue3 + `<script setup>` + `createAxios`，遵循现有文件命名和目录约定 |
| 设计语言 | Apple 设计系统：`#0066cc` 主色、SF Pro 字体、无装饰阴影、细分割线 |

---

## 3. 架构设计

```
src/
  views/backend/
    messageCenter/
      index.vue            ← 页面入口（布局组装、状态管理）
      components/
        McSidebar.vue      ← 左侧导航（全部/未读/已读/收藏）
        McList.vue         ← 中栏列表（工具栏 + 分组行 + 无限滚动）
        McDetail.vue       ← 右侧详情（元信息 + 内容 + 跳转按钮）
        McEmpty.vue        ← 空状态占位
  api/
    messageCenter.ts       ← API 封装（my / unread-count / read / unread）
  stores/
    messageCenter.ts       ← Pinia store（消息列表、未读计数、加载状态）
```

路由注册为动态菜单路由，路径由后端 RBAC 下发（无需修改静态路由文件）。

---

## 4. 数据流

```
onMounted
  → fetchMessages()        GET /api/message-center/my?page=0&limit=100
  → fetchUnreadCount()     GET /api/message-center/unread-count

用户点击消息行
  → 若 read=false → markRead(messageId)   POST .../read
  → 更新本地 store 中 read 状态
  → unreadCount -= 1

用户点击"标记未读"
  → markUnread(messageId)  POST .../unread
  → 更新本地 store
  → unreadCount += 1

批量操作（全选已选中 → 标记已读/未读）
  → 串行/并发调用 markRead / markUnread
  → 全部完成后刷新本地状态
```

---

## 5. 组件职责

### `index.vue`
- 持有全局状态（当前过滤器、选中消息 ID、批量选择集合、搜索词）
- 组装三栏布局：`McSidebar` + `McList` + `McDetail`
- 承接 store actions 调用

### `McSidebar.vue`
- 渲染导航分组：全部 / 未读 / 已读 / （预留：收藏）
- 展示每个过滤项的未读角标（来自 store 计算）
- 支持折叠模式（`collapsed` prop）

### `McList.vue`
- 工具栏：标题 + 条数 + 全选按钮
- 批量操作栏（选中项 > 0 时浮现）：已读 / 未读 / 取消
- 按日期分组（今天 / 昨天 / 本周 / 更早）
- 每行：未读圆点 + 标题 + 相对时间 + 内容预览（comfortable 密度）
- 无限滚动加载（`IntersectionObserver`）
- 空状态 → `McEmpty`

### `McDetail.vue`
- 空状态提示（未选中时）
- 选中后显示：标题 / 创建时间 / 状态 chip / 完整内容
- 操作栏：标记已读/未读（切换）
- 底部：关联页面 + "打开"按钮（仅当 `msg.url` 存在时渲染）

### `McEmpty.vue`
- 根据 `filter` 和 `query` 渲染不同图标 + 文案

---

## 6. API 层

`src/api/messageCenter.ts`：

```ts
getMyMessages(page, limit)      → GET /api/message-center/my
getUnreadCount()                → GET /api/message-center/unread-count
markRead(messageId)             → POST /api/message-center/messages/{id}/read
markUnread(messageId)           → POST /api/message-center/messages/{id}/unread
```

全部使用 `createAxios`（复用项目现有的 Bearer token 注入、统一错误弹窗）。

---

## 7. Store 设计

`src/stores/messageCenter.ts`（Pinia）：

```ts
state: {
  messages: MessageItem[]    // 本地完整列表
  unreadCount: number
  loading: boolean
  loadError: boolean
}

getters:
  filtered(filter, query)    // 前端过滤（无需额外请求）
  unreadByFilter             // 侧边栏角标计算

actions:
  fetchMessages()
  fetchUnreadCount()
  markRead(id)               // 乐观更新 + API 调用
  markUnread(id)
  bulkMark(ids, read)
```

**设计说明**：API 每次返回全量最新 100 条，本地做过滤/搜索，不做分页状态同步。这符合 Novu 的消息量级和现有 API 的 `limit=100` 设计。

---

## 8. 样式策略

- 使用 `<style scoped>` CSS，变量复用 `--wf-*` 设计令牌（已在框架中定义）
- 颜色语义映射：
  - `--wf-primary` → `#0066cc`（Action Blue）
  - `--wf-canvas` → `#ffffff`
  - `--wf-bg` → `#f5f5f7`（parchment）
  - `--wf-ink` → `#1d1d1f`
- 三栏布局采用 CSS Grid，列宽 `220px 380px 1fr`
- 过渡动画：仅 sidebar 折叠用 `transition: width 0.2s`，其余无动效（遵循 DESIGN.md "不加装饰"原则）

---

## 9. 不在范围内

- 实时推送（WebSocket / SSE）
- 消息发送 UI
- 收藏夹功能（保留占位，标注"即将上线"）
- 管理员视角（查看他人消息）
- 分类过滤（`workflow / announcement / permission`）—— API 不返回 `category` 字段，不做此过滤
