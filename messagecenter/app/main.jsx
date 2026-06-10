// main.jsx — App: state, filtering, interactions, tweaks, render
// Depends on: data, icons, ui, nav, list, detail, tweaks-panel (all on window)

const { useState, useEffect, useMemo, useCallback, useRef } = React;
const PAGE = 18;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "sidebarCollapsed": false,
  "density": "comfortable",
  "accent": "#0066cc"
}/*EDITMODE-END*/;

function categoryOf(m) { return m.category; }

function App() {
  const {
    MESSAGES, SYSTEMS, Header, Sidebar, ListPane, DetailPane, ToastStack,
    useTweaks, TweaksPanel, TweakSection, TweakToggle, TweakRadio, TweakColor,
  } = window;

  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const [messages, setMessages] = useState(() => MESSAGES.map((m) => ({ ...m })));
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [visible, setVisible] = useState(PAGE);
  const [toasts, setToasts] = useState([]);
  const toastSeq = useRef(0);

  // Apply accent color to the document
  useEffect(() => {
    document.documentElement.style.setProperty('--accent', t.accent || '#0066cc');
  }, [t.accent]);

  // ---- Toasts --------------------------------------------------------------
  const pushToast = useCallback((msg, opts = {}) => {
    const id = ++toastSeq.current;
    setToasts((prev) => [...prev.slice(-2), { id, msg, ...opts }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), opts.duration || 3400);
  }, []);

  // ---- Derived: filtered + searched ---------------------------------------
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return messages.filter((m) => {
      if (filter === 'unread' && m.read) return false;
      if (filter === 'read' && !m.read) return false;
      if (['workflow', 'announcement', 'permission'].includes(filter) && categoryOf(m) !== filter) return false;
      if (filter === 'favorites') return false;
      if (q) {
        const sysName = SYSTEMS[m.systemId].name.toLowerCase();
        const hay = (m.title + ' ' + m.content + ' ' + sysName + ' ' + m.businessType).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [messages, filter, query, SYSTEMS]);

  const shown = useMemo(() => filtered.slice(0, visible), [filtered, visible]);
  const hasMore = filtered.length > visible;

  // Reset pagination + selection when the view changes
  useEffect(() => { setVisible(PAGE); setSelectedIds(new Set()); }, [filter, query]);

  // ---- Counts for sidebar badges ------------------------------------------
  const unreadByFilter = useMemo(() => {
    const c = { all: 0, unread: 0, workflow: 0, announcement: 0, permission: 0 };
    for (const m of messages) {
      if (!m.read) {
        c.all++; c.unread++;
        if (c[m.category] !== undefined) c[m.category]++;
      }
    }
    return c;
  }, [messages]);
  const totalUnread = unreadByFilter.all;

  const totalCount = useMemo(() => {
    if (filter === 'favorites') return 0;
    if (filter === 'unread') return messages.filter((m) => !m.read).length;
    if (filter === 'read') return messages.filter((m) => m.read).length;
    if (['workflow', 'announcement', 'permission'].includes(filter)) return messages.filter((m) => m.category === filter).length;
    return messages.length;
  }, [messages, filter]);
  const filterUnread = useMemo(() => filtered.filter((m) => !m.read).length, [filtered]);

  const activeMsg = useMemo(() => messages.find((m) => m.id === activeId) || null, [messages, activeId]);

  // ---- Mutations -----------------------------------------------------------
  const setRead = useCallback((ids, read) => {
    const set = new Set(ids);
    setMessages((prev) => prev.map((m) => (set.has(m.id) ? { ...m, read } : m)));
  }, []);

  const openMessage = useCallback((id) => { setActiveId(id); }, []);

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => setSelectedIds(new Set(shown.map((m) => m.id))), [shown]);
  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const bulkSet = useCallback((read) => {
    const ids = [...selectedIds];
    if (!ids.length) return;
    const prevStates = new Map(ids.map((id) => [id, messages.find((m) => m.id === id)?.read]));
    setRead(ids, read);
    clearSelection();
    pushToast(`已将 ${ids.length} 条标记为${read ? '已读' : '未读'}`, {
      icon: read ? 'envelopeOpen' : 'envelope',
      action: { label: '撤销', onClick: () => {
        setMessages((prev) => prev.map((m) => (prevStates.has(m.id) ? { ...m, read: prevStates.get(m.id) } : m)));
        setToasts([]);
      } },
    });
  }, [selectedIds, messages, setRead, clearSelection, pushToast]);

  const toggleRead = useCallback((id) => {
    const m = messages.find((x) => x.id === id);
    if (!m) return;
    setRead([id], !m.read);
    pushToast(`已标记为${!m.read ? '已读' : '未读'}`, { icon: !m.read ? 'envelopeOpen' : 'envelope' });
  }, [messages, setRead, pushToast]);

  const openPage = useCallback((m) => {
    if (!m.read) setRead([m.id], true);
    pushToast(`正在打开关联页面 ${m.url}`, { icon: 'external' });
  }, [setRead, pushToast]);

  const onReachEnd = useCallback(() => setVisible((v) => Math.min(v + PAGE, filtered.length)), [filtered.length]);

  return (
    <div className={'app' + (t.sidebarCollapsed ? ' app--side-collapsed' : '')}>
      <Header
        totalUnread={totalUnread}
        query={query}
        onQuery={setQuery}
      />
      <div className="app__body">
        <Sidebar
          collapsed={t.sidebarCollapsed}
          active={filter}
          onSelect={(f) => { setFilter(f); setActiveId(null); }}
          unreadByFilter={unreadByFilter}
        />
        <ListPane
          filter={filter}
          messages={shown}
          totalCount={totalCount}
          unreadCount={filterUnread}
          activeId={activeId}
          selectedIds={selectedIds}
          onOpen={openMessage}
          onToggleSelect={toggleSelect}
          onSelectAll={selectAll}
          onClearSelection={clearSelection}
          onBulkRead={() => bulkSet(true)}
          onBulkUnread={() => bulkSet(false)}
          query={query}
          density={t.density}
          hasMore={hasMore}
          onReachEnd={onReachEnd}
        />
        <DetailPane
          msg={activeMsg}
          onToggleRead={toggleRead}
          onOpenPage={openPage}
          onClose={() => setActiveId(null)}
        />
      </div>

      <ToastStack toasts={toasts} />

      <TweaksPanel>
        <TweakSection label="布局" />
        <TweakToggle label="收起侧边栏" value={t.sidebarCollapsed} onChange={(v) => setTweak('sidebarCollapsed', v)} />
        <TweakRadio label="列表密度" value={t.density} options={['comfortable', 'compact']}
          onChange={(v) => setTweak('density', v)} />
        <TweakSection label="主题" />
        <TweakColor label="强调色" value={t.accent}
          options={['#0066cc', '#1d1d1f', '#7a5cff', '#1f8a5b']}
          onChange={(v) => setTweak('accent', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
