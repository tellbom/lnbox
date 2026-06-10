// nav.jsx — Header (top bar) + Sidebar (filters)
// Exposes (to window): Header, Sidebar, NAV_GROUPS

const NAV_GROUPS = [
  {
    items: [
      { id: 'all',    label: '全部消息', icon: 'inbox' },
      { id: 'unread', label: '未读消息', icon: 'dot' },
      { id: 'read',   label: '已读消息', icon: 'check' },
    ],
  },
  {
    label: '分类',
    items: [
      { id: 'workflow',     label: '工作流通知', icon: 'flow' },
      { id: 'announcement', label: '系统公告',   icon: 'news' },
      { id: 'permission',   label: '权限通知',   icon: 'shield' },
    ],
  },
  {
    label: '更多',
    items: [
      { id: 'favorites', label: '收藏夹', icon: 'star', reserved: true },
    ],
  },
];

function Header({ totalUnread, query, onQuery }) {
  const { Icon, UserAvatar, Badge } = window;
  return (
    <header className="hdr">
      <div className="hdr__brand">
        <div className="hdr__mark"><Icon name="bell" size={19} /></div>
        <div className="hdr__titles">
          <span className="hdr__title">消息中心</span>
        </div>
      </div>

      <div className="hdr__search">
        <span className="hdr__search-ic"><Icon name="search" size={17} /></span>
        <input
          className="hdr__search-input"
          type="text"
          placeholder="搜索消息、来源或业务类型"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
        />
        {query ? (
          <button className="hdr__search-clear" onClick={() => onQuery('')} aria-label="清除">
            <Icon name="close" size={14} />
          </button>
        ) : null}
      </div>

      <div className="hdr__right">
        <button className="hdr__bell" title={totalUnread + ' 条未读'}>
          <Icon name="bell" size={20} />
          {totalUnread ? <span className="hdr__bell-badge">{totalUnread > 99 ? '99+' : totalUnread}</span> : null}
        </button>
        <div className="hdr__user">
          <UserAvatar size={30} />
          <div className="hdr__user-meta">
            <span className="hdr__user-name">周晓东</span>
            <span className="hdr__user-sub">196045</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function Sidebar({ collapsed, active, onSelect, unreadByFilter }) {
  const { Icon, Badge } = window;
  return (
    <nav className={'side' + (collapsed ? ' side--collapsed' : '')}>
      <div className="side__scroll">
        {NAV_GROUPS.map((group, gi) => (
          <div className="side__group" key={gi}>
            {group.label && !collapsed ? <div className="side__group-label">{group.label}</div> : null}
            {group.label && collapsed ? <div className="side__group-rule" /> : null}
            {group.items.map((it) => {
              const isActive = active === it.id;
              const count = unreadByFilter[it.id] || 0;
              return (
                <button
                  key={it.id}
                  className={'side__item' + (isActive ? ' is-active' : '') + (it.reserved ? ' is-reserved' : '')}
                  onClick={() => { if (!it.reserved) onSelect(it.id); }}
                  title={collapsed ? it.label : (it.reserved ? '即将上线' : '')}
                >
                  <span className="side__ic"><Icon name={it.icon} size={19} /></span>
                  {!collapsed ? <span className="side__label">{it.label}</span> : null}
                  {it.reserved ? (
                    !collapsed ? <span className="side__soon">即将上线</span> : null
                  ) : (
                    !collapsed
                      ? <Badge count={count} />
                      : (count ? <span className="side__dot" /> : null)
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </nav>
  );
}

Object.assign(window, { Header, Sidebar, NAV_GROUPS });
