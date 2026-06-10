// list.jsx — message list pane: toolbar, bulk bar, date groups, rows, infinite scroll
// Exposes (to window): ListPane

const FILTER_TITLES = {
  all: '全部消息', unread: '未读消息', read: '已读消息',
  workflow: '工作流通知', announcement: '系统公告', permission: '权限通知',
  favorites: '收藏夹',
};

function MessageRow({ msg, isActive, isSelected, anySelected, onOpen, onToggleSelect, density }) {
  const { Icon, SystemGlyph, formatTime, SYSTEMS } = window;
  const sys = SYSTEMS[msg.systemId];
  const unread = !msg.read;
  return (
    <div
      className={
        'row' +
        (isActive ? ' is-active' : '') +
        (unread ? ' is-unread' : '') +
        (isSelected ? ' is-selected' : '') +
        (density === 'compact' ? ' row--compact' : '')
      }
      onClick={() => onOpen(msg.id)}
    >
      <div className="row__rail" onClick={(e) => { e.stopPropagation(); onToggleSelect(msg.id); }}>
        <button
          className={'row__check' + (isSelected ? ' is-on' : '')}
          aria-label={isSelected ? '取消选择' : '选择'}
        >
          {isSelected ? <Icon name="check" size={13} sw={2.2} /> : null}
        </button>
        {unread ? <span className="row__dot" /> : null}
      </div>

      <div className="row__body">
        <div className="row__top">
          <span className="row__title">{msg.title}</span>
          <span className="row__time">{formatTime(msg.createdAt)}</span>
        </div>
        {density !== 'compact' ? (
          <div className="row__preview">{msg.preview}</div>
        ) : null}
        <div className="row__meta">
          <span className="row__sys"><SystemGlyph systemId={msg.systemId} size={14} /> {sys.name}</span>
          <span className="row__sep">·</span>
          <span className="row__btype">{msg.businessType}</span>
        </div>
      </div>
    </div>
  );
}

function ListPane({
  filter, messages, totalCount, unreadCount, activeId, selectedIds,
  onOpen, onToggleSelect, onSelectAll, onClearSelection, onBulkRead, onBulkUnread,
  query, density, hasMore, onReachEnd,
}) {
  const { Icon, BUCKET_ORDER, dateBucket } = window;
  const scrollRef = React.useRef(null);
  const anySelected = selectedIds.size > 0;

  // Infinite scroll
  const handleScroll = React.useCallback((e) => {
    const el = e.currentTarget;
    if (hasMore && el.scrollHeight - el.scrollTop - el.clientHeight < 320) onReachEnd();
  }, [hasMore, onReachEnd]);

  // Group visible messages by date bucket (messages already sorted newest-first)
  const groups = [];
  const byKey = {};
  for (const m of messages) {
    const k = dateBucket(m.createdAt);
    if (!byKey[k]) { byKey[k] = { key: k, items: [] }; groups.push(byKey[k]); }
    byKey[k].items.push(m);
  }
  const bucketLabel = Object.fromEntries(BUCKET_ORDER.map((b) => [b.key, b.label]));

  const allVisibleSelected = messages.length > 0 && messages.every((m) => selectedIds.has(m.id));

  return (
    <section className="list">
      <div className="list__toolbar">
        <div className="list__heading">
          <h1 className="list__title">{FILTER_TITLES[filter] || '消息'}</h1>
          <span className="list__count">
            {query ? messages.length + ' 条匹配结果' : totalCount + ' 条'}
            {!query && unreadCount ? <span className="list__count-unread"> · {unreadCount} 未读</span> : null}
          </span>
        </div>
        <div className="list__tools">
          <button
            className="tbtn"
            onClick={allVisibleSelected ? onClearSelection : onSelectAll}
            title={allVisibleSelected ? '取消全选' : '全选'}
          >
            <Icon name="filterCheck" size={16} />
            <span>{allVisibleSelected ? '取消全选' : '全选'}</span>
          </button>
        </div>
      </div>

      <div className={'bulkbar' + (anySelected ? ' is-open' : '')}>
        <div className="bulkbar__inner">
          <span className="bulkbar__count">已选 <b>{selectedIds.size}</b> 项</span>
          <div className="bulkbar__actions">
            <button className="tbtn" onClick={onBulkRead}><Icon name="envelopeOpen" size={16} /><span>标记已读</span></button>
            <button className="tbtn" onClick={onBulkUnread}><Icon name="envelope" size={16} /><span>标记未读</span></button>
            <button className="tbtn tbtn--ghost" onClick={onClearSelection}><Icon name="close" size={15} /><span>取消</span></button>
          </div>
        </div>
      </div>

      <div className="list__scroll" ref={scrollRef} onScroll={handleScroll}>
        {messages.length === 0 ? (
          <EmptyState filter={filter} query={query} />
        ) : (
          <>
            {groups.map((g) => (
              <div className="grp" key={g.key}>
                <div className="grp__head">
                  <span className="grp__label">{bucketLabel[g.key]}</span>
                  <span className="grp__line" />
                  <span className="grp__num">{g.items.length}</span>
                </div>
                {g.items.map((m) => (
                  <MessageRow
                    key={m.id}
                    msg={m}
                    isActive={activeId === m.id}
                    isSelected={selectedIds.has(m.id)}
                    anySelected={anySelected}
                    onOpen={onOpen}
                    onToggleSelect={onToggleSelect}
                    density={density}
                  />
                ))}
              </div>
            ))}
            {hasMore ? (
              <div className="list__more"><span className="spinner" />加载更多消息…</div>
            ) : (
              <div className="list__end">已显示全部消息</div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function EmptyState({ filter, query }) {
  const { Icon } = window;
  let icon = 'inbox', title = '暂无消息', sub = '这里还没有任何通知。';
  if (query) { icon = 'search'; title = '未找到匹配的消息'; sub = '试试更换关键词，或清除搜索条件。'; }
  else if (filter === 'unread') { icon = 'check'; title = '全部已读'; sub = '太棒了，您已处理完所有未读消息。'; }
  else if (filter === 'favorites') { icon = 'star'; title = '收藏夹即将上线'; sub = '后续可在此集中查看您收藏的重要通知。'; }
  return (
    <div className="empty">
      <div className="empty__ic"><Icon name={icon} size={30} /></div>
      <div className="empty__title">{title}</div>
      <div className="empty__sub">{sub}</div>
    </div>
  );
}

Object.assign(window, { ListPane });
