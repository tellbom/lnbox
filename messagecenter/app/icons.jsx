// icons.jsx — monochrome line glyphs. Stroke = currentColor, 1.6px, 24px box.
// Exposes (to window): Icon, SystemGlyph

function Svg({ children, size = 20, sw = 1.6, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      {...rest}>
      {children}
    </svg>
  );
}

const PATHS = {
  // ---- Nav -----------------------------------------------------------------
  inbox: (
    <>
      <path d="M3 13h4l1.5 2.5h7L17 13h4" />
      <path d="M4.5 13 6 5.5h12L19.5 13v4.5a1.5 1.5 0 0 1-1.5 1.5H6a1.5 1.5 0 0 1-1.5-1.5z" />
    </>
  ),
  dot: (<><circle cx="12" cy="12" r="4.5" /></>),
  check: (<><path d="M4 12.5 9 17.5 20 6.5" /></>),
  star: (
    <path d="M12 4.5l2.2 4.6 5 .7-3.6 3.5.9 5L12 16l-4.4 2.3.9-5L4.9 9.8l5-.7z" />
  ),
  bell: (
    <>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </>
  ),
  search: (<><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" /></>),
  // ---- System glyphs -------------------------------------------------------
  flow: (
    <>
      <rect x="4" y="4" width="5" height="5" rx="1.2" />
      <rect x="15" y="15" width="5" height="5" rx="1.2" />
      <circle cx="6.5" cy="17.5" r="2.5" />
      <path d="M6.5 9v4a2 2 0 0 0 0 0" />
      <path d="M9 17.5h6" />
      <path d="M9 6.5h6.5a2 2 0 0 1 2 2V15" />
    </>
  ),
  portal: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <path d="M3.5 9h17" />
      <circle cx="6.5" cy="6.7" r=".5" fill="currentColor" />
      <circle cx="8.6" cy="6.7" r=".5" fill="currentColor" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4 18 18M18 6l-1.6 1.6M7.6 16.4 6 18" />
    </>
  ),
  news: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="1.6" />
      <path d="M7.5 9h9M7.5 12h9M7.5 15h5.5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.5l6.5 2.4v4.7c0 4.2-2.8 7-6.5 8.4-3.7-1.4-6.5-4.2-6.5-8.4V5.9z" />
      <path d="M9.3 12l1.9 1.9 3.6-3.8" />
    </>
  ),
  // ---- Detail / utility ----------------------------------------------------
  external: (<><path d="M14 5h5v5" /><path d="M19 5l-7 7" /><path d="M18 13.5V18a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 18V8.5A1.5 1.5 0 0 1 7 7h4.5" /></>),
  envelopeOpen: (<><path d="M4 10l8-5.5L20 10" /><path d="M4 10v8a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 18v-8l-8 5.5z" /></>),
  envelope: (<><rect x="4" y="6" width="16" height="12" rx="1.5" /><path d="M4.5 7.5 12 13l7.5-5.5" /></>),
  chevron: (<><path d="M9 6l6 6-6 6" /></>),
  collapse: (<><path d="M14 6l-6 6 6 6" /><path d="M19 6v12" /></>),
  expand: (<><path d="M10 6l6 6-6 6" /><path d="M5 6v12" /></>),
  close: (<><path d="M6 6l12 12M18 6 6 18" /></>),
  clock: (<><circle cx="12" cy="12" r="7.5" /><path d="M12 8v4.5l3 1.8" /></>),
  tag: (<><path d="M4 11V5.5A1.5 1.5 0 0 1 5.5 4H11l8.5 8.5a1.5 1.5 0 0 1 0 2.1l-5 5a1.5 1.5 0 0 1-2.1 0z" /><circle cx="8" cy="8" r="1.1" /></>),
  filterCheck: (<><path d="M4 7h16M6.5 12h11M10 17h4" /></>),
  trash: (<><path d="M5 7h14M9 7V5.2A1.2 1.2 0 0 1 10.2 4h3.6A1.2 1.2 0 0 1 15 5.2V7M7 7l.8 11.2A1.5 1.5 0 0 0 9.3 19.6h5.4a1.5 1.5 0 0 0 1.5-1.4L17 7" /></>),
};

function Icon({ name, size, sw, ...rest }) {
  return <Svg size={size} sw={sw} {...rest}>{PATHS[name] || null}</Svg>;
}

// Glyph for a system, looked up via SYSTEMS[systemId].glyph
function SystemGlyph({ systemId, size = 18, sw = 1.6, ...rest }) {
  const sys = window.SYSTEMS[systemId];
  return <Icon name={sys ? sys.glyph : 'inbox'} size={size} sw={sw} {...rest} />;
}

Object.assign(window, { Icon, SystemGlyph });
