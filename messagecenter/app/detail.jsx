// detail.jsx — right-hand detail panel
// Exposes (to window): DetailPane

function DetailPane({ msg, onToggleRead, onOpenPage, onClose }) {
  const { Icon, SystemGlyph, SYSTEMS, fullTime } = window;

  if (!msg) {
    return (
      <aside className="detail detail--empty">
        <div className="detail__placeholder">
          <div className="detail__ph-ic"><Icon name="envelopeOpen" size={34} /></div>
          <div className="detail__ph-title">选择一条消息查看详情</div>
          <div className="detail__ph-sub">在左侧列表中选择任意通知，<br />即可在此查看完整内容并跳转到相关业务页面。</div>
        </div>
      </aside>
    );
  }

  const sys = SYSTEMS[msg.systemId];
  const unread = !msg.read;

  return (
    <aside className="detail">
      <div className="detail__bar">
        <div className="detail__bar-sys">
          <span className="detail__bar-glyph"><SystemGlyph systemId={msg.systemId} size={17} /></span>
          <span className="detail__bar-name">{sys.name}</span>
        </div>
        <div className="detail__bar-actions">
          <button className="iconbtn" onClick={() => onToggleRead(msg.id)} title={unread ? '标记为已读' : '标记为未读'}>
            <Icon name={unread ? 'envelopeOpen' : 'envelope'} size={18} />
            <span>{unread ? '标为已读' : '标为未读'}</span>
          </button>
          <button className="iconbtn iconbtn--sq" onClick={onClose} title="关闭">
            <Icon name="close" size={17} />
          </button>
        </div>
      </div>

      <div className="detail__scroll">
        <div className="detail__head">
          <div className="detail__status">
            <span className={'statuschip ' + (unread ? 'statuschip--unread' : 'statuschip--read')}>
              <span className="statuschip__dot" />{unread ? '未读' : '已读'}
            </span>
            <span className="btypechip">{msg.businessType}</span>
          </div>
          <h1 className="detail__title">{msg.title}</h1>
        </div>

        <dl className="detail__meta">
          <div className="detail__meta-row">
            <dt><Icon name="portal" size={15} /> 来源系统</dt>
            <dd>{sys.name}</dd>
          </div>
          <div className="detail__meta-row">
            <dt><Icon name="tag" size={15} /> 业务类型</dt>
            <dd>{msg.businessType}</dd>
          </div>
          <div className="detail__meta-row">
            <dt><Icon name="clock" size={15} /> 创建时间</dt>
            <dd>{fullTime(msg.createdAt)}</dd>
          </div>
          <div className="detail__meta-row">
            <dt><Icon name="dot" size={15} /> 当前状态</dt>
            <dd>{unread ? '未读' : '已读'}</dd>
          </div>
        </dl>

        <div className="detail__divider" />

        <div className="detail__content">{msg.content}</div>
      </div>

      <div className="detail__foot">
        <div className="detail__foot-url">
          <span className="detail__foot-label">关联页面</span>
          <code className="detail__foot-path">{msg.url}</code>
        </div>
        <button className="btn-primary" onClick={() => onOpenPage(msg)}>
          打开相关页面 <Icon name="external" size={16} />
        </button>
      </div>
    </aside>
  );
}

Object.assign(window, { DetailPane });
