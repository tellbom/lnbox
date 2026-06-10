// ui.jsx — small shared UI primitives
// Exposes (to window): Badge, ToastStack, UserAvatar

// Pill count badge (unread counts on sidebar / header)
function Badge({ count, tone = 'blue', muted = false }) {
  if (!count) return null;
  const cls = 'badge' + (tone === 'plain' ? ' badge--plain' : '') + (muted ? ' badge--muted' : '');
  return <span className={cls}>{count > 99 ? '99+' : count}</span>;
}

// User avatar — initials in a quiet circle
function UserAvatar({ size = 30 }) {
  return (
    <div className="avatar" style={{ width: size, height: size }} title="周晓东 · 196045">
      <span>周</span>
    </div>
  );
}

// Toasts — appear bottom-center, auto-dismiss handled by parent
function ToastStack({ toasts }) {
  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          {t.icon ? <span className="toast__icon"><window.Icon name={t.icon} size={16} /></span> : null}
          <span className="toast__msg">{t.msg}</span>
          {t.action ? (
            <button className="toast__action" onClick={t.action.onClick}>{t.action.label}</button>
          ) : null}
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { Badge, ToastStack, UserAvatar });
