// data.jsx — mock data + helpers for the Message Center
// Exposes (to window): NOW, SYSTEMS, MESSAGES, formatTime, fullTime, dateBucket, BUCKET_ORDER

// Fixed "now" so the relative timestamps are deterministic (current date: 2026-06-09)
const NOW = new Date('2026-06-09T10:32:00');

// ---- Source systems --------------------------------------------------------
// category drives the sidebar filters: workflow / announcement / permission
const SYSTEMS = {
  workflow: { id: 'workflow', name: '工作流中心',  category: 'workflow',     glyph: 'flow' },
  portal:   { id: 'portal',   name: '门户系统',    category: 'announcement', glyph: 'portal' },
  system:   { id: 'system',   name: '系统运维',    category: 'announcement', glyph: 'gear' },
  news:     { id: 'news',     name: '资讯中心',    category: 'announcement', glyph: 'news' },
  rbac:     { id: 'rbac',     name: '权限中心',    category: 'permission',   glyph: 'shield' },
};

// ---- Content pools ---------------------------------------------------------
const POOL = {
  workflow: [
    { type: '待办任务', title: '您有一条新的工作流待办任务',
      content: '「2026 年度设备检验审批」流程已流转至您处，当前环节为「部门负责人审批」。请于 6 月 12 日 18:00 前完成处理，逾期将自动催办上级。\n\n发起人：李明（设备管理部）\n关联单据：QC-2026-0613\n优先级：高' },
    { type: '审批通过', title: '流程审批已通过',
      content: '您提交的「差旅费用报销 BX-20260603」已通过财务复核，核定金额 ¥4,280.00，款项预计将于 3 个工作日内到账。\n\n复核人：王芳（财务共享中心）\n备注：发票已查验，行程单据完整。' },
    { type: '流程驳回', title: '您的流程申请已被驳回',
      content: '「采购申请 PR-20260528」已被上级驳回。\n\n驳回原因：本次申请金额超出本季度部门预算限额，请核减后重新提交，或附预算调整说明。\n驳回人：张伟（采购管理部）' },
    { type: '催办提醒', title: '待办任务催办提醒',
      content: '「合同会签 HT-20260601」已超过标准处理时限 2 小时仍未处理，系统已自动向您发起催办，请尽快前往处理以免影响后续环节。' },
    { type: '流程抄送', title: '一条流程已抄送给您',
      content: '「新员工入职审批 RZ-20260605」已审批完成并抄送给您知悉，无需您操作。入职人员：陈晓（研发中心），报到日期：6 月 15 日。' },
    { type: '待办任务', title: '请确认本月考勤异常申诉',
      content: '系统检测到您 5 月共有 2 条考勤异常记录待确认。请在 6 月 10 日前完成申诉或确认，逾期将按缺勤处理。' },
  ],
  portal: [
    { type: '版本更新', title: '门户系统已更新至 v3.8.0',
      content: '本次更新内容：\n· 全新「消息中心」模块上线，统一汇聚各业务系统通知\n· 优化首页加载性能，平均提速 40%\n· 修复了若干已知问题并提升整体稳定性\n\n如在使用中遇到问题，请联系信息技术部。' },
    { type: '系统通知', title: '门户首页布局已调整',
      content: '为提升信息获取效率，门户首页「我的待办」与「常用应用」位置已对调。您可在「个人设置 — 首页定制」中自定义模块顺序。' },
  ],
  system: [
    { type: '系统维护', title: '系统例行维护通知',
      content: '为保障系统稳定运行，门户及各业务系统将于 6 月 14 日（周日）22:00 至次日 02:00 进行例行维护升级。\n\n维护期间以下功能将暂停使用：\n· 在线审批\n· 报表导出\n· 单点登录\n\n请提前安排相关工作，由此带来的不便敬请谅解。' },
    { type: '系统升级', title: '数据库将进行版本升级',
      content: '生产环境数据库将于 6 月 16 日凌晨进行版本升级，预计耗时 1 小时。升级期间系统只读，不影响日常查询，请勿在此时间段提交数据。' },
    { type: '系统维护', title: '机房网络割接通知',
      content: '运维部将于 6 月 11 日 00:00–01:00 对核心交换机进行割接，期间可能出现短暂网络抖动，连接将自动恢复，无需人工干预。' },
  ],
  news: [
    { type: '公司新闻', title: '2026 年第二季度经营简报发布',
      content: '集团二季度实现营业收入同比增长 14%，主营业务毛利率稳中有升。详细经营数据与分析已在资讯中心发布，欢迎查阅全文。' },
    { type: '公告', title: '关于开展年中安全生产检查的通知',
      content: '根据集团统一部署，将于 6 月 15 日至 6 月 30 日开展年中安全生产专项检查。请各部门对照检查清单完成自查，并于 6 月 28 日前提交自查报告。' },
    { type: '公司新闻', title: '公司荣获「年度智能制造示范企业」',
      content: '在日前举办的行业评选中，公司凭借智能工厂建设成果荣获「年度智能制造示范企业」称号。感谢全体同仁的共同努力。' },
  ],
  rbac: [
    { type: '权限变更', title: '您的系统权限已变更',
      content: '您已被授予「生产管理系统 — 数据导出」权限。\n\n授权人：系统管理员\n生效时间：即时生效\n如非本人申请，请立即联系权限管理员核实。' },
    { type: '角色调整', title: '您的角色已调整',
      content: '您在「OA 协同办公」中的角色已由「普通用户」调整为「部门管理员」。新增权限包括部门成员管理、流程发起与统计报表查看，将在您下次登录后生效。' },
    { type: '账号安全', title: '检测到新设备登录',
      content: '您的账号于 6 月 8 日 23:14 在一台新设备（Windows · Chrome · IP 10.12.34.56）成功登录。\n\n若为本人操作，请忽略本消息；若非本人操作，请立即修改密码并联系信息安全部。' },
    { type: '权限回收', title: '部分权限即将到期',
      content: '您的「临时财务查询」权限将于 6 月 20 日到期并自动回收。如需延期，请通过权限中心重新发起申请并说明事由。' },
  ],
};

// ---- Generate message list -------------------------------------------------
// Simple seeded RNG for reproducible mock data
function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function buildMessages() {
  const rng = makeRng(20260609);
  const sysKeys = Object.keys(POOL);
  const out = [];

  // Time buckets: [label, minOffsetMin, maxOffsetMin, count, unreadProbability]
  const buckets = [
    ['today',  5,      9 * 60,        9,  0.78],
    ['yest',   26 * 60, 40 * 60,      8,  0.42],
    ['week',   2 * 1440, 6 * 1440,    17, 0.16],
    ['earlier', 7 * 1440, 110 * 1440, 32, 0.04],
  ];

  let n = 0;
  for (const [, lo, hi, count, unreadP] of buckets) {
    for (let i = 0; i < count; i++) {
      const sysKey = sysKeys[Math.floor(rng() * sysKeys.length)];
      const sys = SYSTEMS[sysKey];
      const pool = POOL[sysKey];
      const tpl = pool[Math.floor(rng() * pool.length)];
      const offset = Math.floor(lo + rng() * (hi - lo)); // minutes ago
      const createdAt = new Date(NOW.getTime() - offset * 60000);
      const read = rng() > unreadP;
      const seq = 1000 + n;
      out.push({
        id: 'msg_' + seq,
        title: tpl.title,
        content: tpl.content,
        preview: tpl.content.replace(/\n+/g, ' ').slice(0, 90),
        url: '/' + sysKey + '/detail/' + seq,
        systemId: sys.id,
        category: sys.category,
        businessType: tpl.type,
        read,
        createdAt,
      });
      n++;
    }
  }
  // Sort newest first
  out.sort((a, b) => b.createdAt - a.createdAt);
  return out;
}

const MESSAGES = buildMessages();

// ---- Time helpers ----------------------------------------------------------
const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function pad(n) { return n < 10 ? '0' + n : '' + n; }
function clockCN(d) {
  const h = d.getHours();
  const ampm = h < 12 ? '上午' : '下午';
  let hh = h % 12; if (hh === 0) hh = 12;
  return ampm + ' ' + hh + ':' + pad(d.getMinutes());
}

// Compact relative time for list rows
function formatTime(d) {
  const diffMin = Math.round((NOW - d) / 60000);
  if (diffMin < 1) return '刚刚';
  if (diffMin < 60) return diffMin + ' 分钟前';
  if (sameDay(d, NOW)) return clockCN(d);
  const yest = new Date(NOW); yest.setDate(NOW.getDate() - 1);
  if (sameDay(d, yest)) return '昨天';
  const diffDay = Math.floor((NOW - d) / 86400000);
  if (diffDay < 7) return WEEKDAYS[d.getDay()];
  if (d.getFullYear() === NOW.getFullYear()) return (d.getMonth() + 1) + '月' + d.getDate() + '日';
  return d.getFullYear() + '年' + (d.getMonth() + 1) + '月';
}

// Full timestamp for the detail panel
function fullTime(d) {
  return d.getFullYear() + '年' + (d.getMonth() + 1) + '月' + d.getDate() + '日 ' +
    WEEKDAYS[d.getDay()] + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

// Which date-group bucket a message belongs to
const BUCKET_ORDER = [
  { key: 'today',   label: '今天' },
  { key: 'yest',    label: '昨天' },
  { key: 'week',    label: '本周' },
  { key: 'earlier', label: '更早' },
];
function dateBucket(d) {
  if (sameDay(d, NOW)) return 'today';
  const yest = new Date(NOW); yest.setDate(NOW.getDate() - 1);
  if (sameDay(d, yest)) return 'yest';
  const diffDay = Math.floor((NOW - d) / 86400000);
  if (diffDay < 7) return 'week';
  return 'earlier';
}

Object.assign(window, { NOW, SYSTEMS, MESSAGES, formatTime, fullTime, dateBucket, BUCKET_ORDER });
