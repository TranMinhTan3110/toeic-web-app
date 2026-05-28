const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    /* Đồng bộ palette với auth (auth.css) */
    --or1: #FF6B35;
    --or2: #FF8C42;
    --or3: #FFB347;
    --or-dk: #E05A25;
    --bg: #FFF7F2;
    --bg-secondary: #ffffff;
    --text: #1C1C1E;
    --text-secondary: #3A3A3C;
    --text-tertiary: #8A8A8E;
    --accent: var(--or1);
    --accent-soft: rgba(255, 107, 53, 0.12);
    --accent-glow: rgba(255, 107, 53, 0.28);
    --border: rgba(255, 107, 53, 0.14);
    --border-strong: rgba(255, 107, 53, 0.22);
    --glass: rgba(255, 255, 255, 0.82);
    --glass-border: rgba(255, 212, 187, 0.65);
    --shadow: 0 8px 32px rgba(255, 107, 53, 0.08);
    --shadow-md: 0 16px 48px rgba(255, 107, 53, 0.12);
    --shadow-accent: 0 8px 32px rgba(255, 107, 53, 0.2);
    --sidebar-w: 260px;
    --sidebar-collapsed: 72px;
    --header-h: 64px;
    --radius: 16px;
    --radius-sm: 10px;
    --radius-xs: 6px;
    --green: #00c896;
    --green-soft: rgba(0,200,150,0.12);
    --blue: #3b82f6;
    --blue-soft: rgba(59,130,246,0.12);
    --orange: #f97316;
    --orange-soft: rgba(249,115,22,0.12);
    --red: #ef4444;
    --red-soft: rgba(239,68,68,0.12);
    --transition: 0.22s cubic-bezier(0.4,0,0.2,1);
  }

  [data-theme="dark"] {
    --bg: #1C1C2E;
    --bg-secondary: #252538;
    --text: #FFF7F2;
    --text-secondary: #C8C8CC;
    --text-tertiary: #8A8A8E;
    --border: rgba(255, 140, 66, 0.12);
    --border-strong: rgba(255, 140, 66, 0.22);
    --glass: rgba(28, 28, 46, 0.88);
    --glass-border: rgba(255, 140, 66, 0.15);
    --shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
    --shadow-md: 0 16px 48px rgba(0, 0, 0, 0.45);
  }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    color: var(--text);
    overflow: hidden;
  }

  .admin-root {
    display: flex; height: 100vh; overflow: hidden;
    background:
      radial-gradient(ellipse at 18% 8%, rgba(255, 179, 71, 0.22) 0%, transparent 52%),
      radial-gradient(ellipse at 82% 88%, rgba(255, 107, 53, 0.14) 0%, transparent 48%),
      var(--bg);
    transition: background var(--transition);
  }

  /* ─── SIDEBAR ─── */
  .sidebar {
    position: fixed; left: 0; top: 0; bottom: 0; z-index: 100;
    width: var(--sidebar-w);
    background: var(--glass);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-right: 1px solid var(--glass-border);
    display: flex; flex-direction: column;
    transition: width var(--transition);
    overflow: hidden;
  }
  .sidebar.collapsed { width: var(--sidebar-collapsed); }

  .sidebar-brand {
    display: flex; align-items: center; gap: 12px;
    padding: 20px 18px; min-height: var(--header-h);
    border-bottom: 1px solid var(--border);
    text-decoration: none; overflow: hidden; white-space: nowrap;
  }
  .brand-icon {
    width: 36px; height: 36px; flex-shrink: 0;
    background: linear-gradient(135deg, var(--or1), var(--or-dk));
    border-radius: 10px; display: flex; align-items: center; justify-content: center;
    box-shadow: var(--shadow-accent);
  }
  .brand-text { overflow: hidden; }
  .brand-title {
    font-weight: 800; font-size: 15px;
    color: var(--text); letter-spacing: -0.3px; line-height: 1.1;
    white-space: nowrap;
  }
  .brand-sub {
    font-size: 10px; font-weight: 500; color: var(--accent);
    letter-spacing: 1.5px; text-transform: uppercase; white-space: nowrap;
  }

  .sidebar-nav { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 12px 0; }
  .sidebar-nav::-webkit-scrollbar { width: 0; }

  .nav-section-label {
    font-size: 10px; font-weight: 600; letter-spacing: 1.8px;
    text-transform: uppercase; color: var(--text-tertiary);
    padding: 8px 20px 4px; white-space: nowrap; overflow: hidden;
    transition: opacity var(--transition);
  }
  .sidebar.collapsed .nav-section-label { opacity: 0; }

  .nav-item {
    display: flex; align-items: center; gap: 12px;
    padding: 0 12px; margin: 2px 8px; height: 44px;
    border-radius: var(--radius-sm); cursor: pointer; position: relative;
    text-decoration: none; color: var(--text-secondary);
    transition: all var(--transition); white-space: nowrap; overflow: hidden;
    font-size: 14px; font-weight: 400;
  }
  .nav-item:hover { background: var(--accent-soft); color: var(--accent); }
  .nav-item.active {
    background: var(--accent-soft); color: var(--accent); font-weight: 500;
  }
  .nav-item.active::before {
    content: ''; position: absolute; left: -8px; top: 50%; transform: translateY(-50%);
    width: 3px; height: 20px; background: var(--accent);
    border-radius: 0 3px 3px 0;
  }
  .nav-icon { width: 20px; height: 20px; flex-shrink: 0; }
  .nav-label { flex: 1; transition: opacity var(--transition); }
  .sidebar.collapsed .nav-label { opacity: 0; }
  .nav-badge {
    background: var(--accent); color: white; font-size: 10px; font-weight: 700;
    padding: 1px 6px; border-radius: 20px; flex-shrink: 0;
    transition: opacity var(--transition);
  }
  .sidebar.collapsed .nav-badge { opacity: 0; }

  .sidebar-footer {
    border-top: 1px solid var(--border); padding: 12px;
  }
  .collapse-btn {
    display: flex; align-items: center; justify-content: center;
    width: 100%; height: 40px; border-radius: var(--radius-sm);
    background: var(--border); border: none; cursor: pointer;
    color: var(--text-secondary); transition: all var(--transition);
  }
  .collapse-btn:hover { background: var(--accent-soft); color: var(--accent); }

  /* ─── MAIN WRAPPER ─── */
  .main-wrapper {
    flex: 1; display: flex; flex-direction: column;
    margin-left: var(--sidebar-w);
    transition: margin-left var(--transition);
    overflow: hidden; height: 100vh;
  }
  .main-wrapper.collapsed { margin-left: var(--sidebar-collapsed); }

  /* ─── HEADER ─── */
  .header {
    height: var(--header-h); display: flex; align-items: center; gap: 16px;
    padding: 0 24px; flex-shrink: 0;
    background: var(--glass);
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    position: sticky; top: 0; z-index: 50;
  }
  .breadcrumb {
    display: flex; align-items: center; gap: 6px;
    font-size: 13px; color: var(--text-secondary);
  }
  .breadcrumb-sep { color: var(--text-tertiary); }
  .breadcrumb-current {
    color: var(--text); font-weight: 500;
  }

  .header-search {
    flex: 1; max-width: 380px; position: relative;
  }
  .header-search input {
    width: 100%; height: 38px; padding: 0 16px 0 40px;
    background: var(--bg); border: 1px solid var(--border);
    border-radius: 30px; font-size: 13px; color: var(--text);
    font-family: 'DM Sans', sans-serif;
    transition: all var(--transition); outline: none;
  }
  .header-search input:focus {
    border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft);
  }
  .header-search input::placeholder { color: var(--text-tertiary); }
  .search-icon {
    position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
    color: var(--text-tertiary); pointer-events: none;
  }

  .header-actions { display: flex; align-items: center; gap: 8px; margin-left: auto; }

  .icon-btn {
    width: 38px; height: 38px; border-radius: var(--radius-sm);
    border: 1px solid var(--border); background: transparent;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--text-secondary);
    transition: all var(--transition); position: relative;
  }
  .icon-btn:hover { background: var(--accent-soft); border-color: var(--accent); color: var(--accent); }

  .notif-dot {
    position: absolute; top: 6px; right: 6px;
    width: 8px; height: 8px; background: var(--accent); border-radius: 50%;
    border: 2px solid var(--bg-secondary);
  }

  .profile-btn {
    display: flex; align-items: center; gap: 10px;
    padding: 5px 10px 5px 5px; border-radius: 30px;
    border: 1px solid var(--border); background: transparent;
    cursor: pointer; transition: all var(--transition);
  }
  .profile-btn:hover { background: var(--accent-soft); border-color: var(--accent); }
  .avatar {
    width: 30px; height: 30px; border-radius: 50%;
    background: linear-gradient(135deg, var(--or1), var(--or-dk));
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; color: white; flex-shrink: 0;
  }
  .profile-info { text-align: left; }
  .profile-name { font-size: 13px; font-weight: 500; color: var(--text); line-height: 1.2; }
  .profile-role { font-size: 10px; color: var(--accent); font-weight: 500; }

  /* ─── DROPDOWNS ─── */
  .dropdown-wrapper { position: relative; }
  .dropdown {
    position: absolute; top: calc(100% + 8px); right: 0;
    background: var(--bg-secondary); border: 1px solid var(--border);
    border-radius: var(--radius); box-shadow: var(--shadow-md);
    z-index: 200; overflow: hidden; min-width: 240px;
    animation: dropIn 0.18s ease;
  }
  @keyframes dropIn { from { opacity:0; transform: translateY(-8px) scale(0.97); } to { opacity:1; transform: translateY(0) scale(1); } }

  .notif-dropdown { min-width: 320px; }
  .dropdown-header {
    padding: 14px 16px 10px;
    border-bottom: 1px solid var(--border);
    font-size: 13px; font-weight: 600; font-family: 'Syne', sans-serif;
    display: flex; align-items: center; justify-content: space-between;
  }
  .notif-item {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 12px 16px; border-bottom: 1px solid var(--border);
    cursor: pointer; transition: background var(--transition);
  }
  .notif-item:hover { background: var(--accent-soft); }
  .notif-item:last-child { border-bottom: none; }
  .notif-icon {
    width: 32px; height: 32px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .notif-text { font-size: 12px; line-height: 1.5; }
  .notif-title { font-weight: 500; color: var(--text); }
  .notif-time { color: var(--text-tertiary); margin-top: 2px; font-size: 11px; }

  .profile-dropdown { min-width: 200px; }
  .profile-dropdown-header { padding: 14px 16px; border-bottom: 1px solid var(--border); }
  .dropdown-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 16px; cursor: pointer; font-size: 13px;
    color: var(--text-secondary); transition: all var(--transition);
  }
  .dropdown-item:hover { background: var(--accent-soft); color: var(--accent); }
  .dropdown-item.danger { color: var(--red); }
  .dropdown-item.danger:hover { background: var(--red-soft); }
  .dropdown-item svg { width: 16px; height: 16px; }
  .dropdown-divider { height: 1px; background: var(--border); margin: 4px 0; }

  /* ─── CONTENT ─── */
  .content-area {
    flex: 1; overflow-y: auto; padding: 28px;
    scroll-behavior: smooth;
  }
  .content-area::-webkit-scrollbar { width: 6px; }
  .content-area::-webkit-scrollbar-track { background: transparent; }
  .content-area::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 3px; }

  .page-header { margin-bottom: 28px; }
  .page-title {
    font-weight: 800; font-size: 26px;
    color: var(--text); letter-spacing: -0.5px;
  }
  .page-subtitle { font-size: 14px; color: var(--text-secondary); margin-top: 4px; }

  /* ─── CARDS ─── */
  .card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius); padding: 20px;
    transition: all var(--transition);
  }
  .card:hover { border-color: var(--border-strong); box-shadow: var(--shadow); }
  .card-glass {
    background: var(--glass); backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--glass-border);
  }

  .stat-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-bottom: 24px; }
  .stat-card {
    background: var(--bg-secondary); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 20px; position: relative; overflow: hidden;
    transition: all var(--transition); cursor: default;
  }
  .stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: var(--border-strong); }
  .stat-card::before {
    content: ''; position: absolute; top: -30px; right: -30px;
    width: 100px; height: 100px; border-radius: 50%;
    opacity: 0.06; transition: opacity var(--transition);
  }
  .stat-card:hover::before { opacity: 0.1; }
  .stat-card.purple::before { background: var(--accent); }
  .stat-card.green::before { background: var(--green); }
  .stat-card.blue::before { background: var(--blue); }
  .stat-card.orange::before { background: var(--orange); }

  .stat-icon {
    width: 40px; height: 40px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 14px;
  }
  .stat-icon.purple { background: var(--accent-soft); color: var(--accent); }
  .stat-icon.green { background: var(--green-soft); color: var(--green); }
  .stat-icon.blue { background: var(--blue-soft); color: var(--blue); }
  .stat-icon.orange { background: var(--orange-soft); color: var(--orange); }
  .stat-value { font-size: 28px; font-weight: 800; color: var(--text); line-height: 1; }
  .stat-label { font-size: 13px; color: var(--text-secondary); margin-top: 4px; }
  .stat-trend {
    display: flex; align-items: center; gap: 4px;
    font-size: 12px; font-weight: 500; margin-top: 8px;
  }
  .stat-trend.up { color: var(--green); }
  .stat-trend.down { color: var(--red); }

  .chart-row { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 24px; }
  .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .card-title { font-size: 15px; font-weight: 700; color: var(--text); }
  .card-action {
    font-size: 12px; color: var(--accent); cursor: pointer; font-weight: 500;
    background: var(--accent-soft); padding: 4px 10px; border-radius: 20px;
    transition: all var(--transition); border: none;
  }
  .card-action:hover { background: var(--accent); color: white; }

  /* Mini chart bars */
  .mini-chart { display: flex; align-items: flex-end; gap: 6px; height: 80px; }
  .bar {
    flex: 1; border-radius: 4px 4px 0 0;
    background: var(--accent-soft); transition: all var(--transition);
    cursor: pointer; position: relative; min-width: 0;
  }
  .bar:hover { background: var(--accent); }
  .bar.active { background: var(--accent); }

  /* Premium Tooltip for chart bars */
  .bar::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: calc(100% + 6px);
    left: 50%;
    transform: translateX(-50%) translateY(4px);
    background: var(--text);
    color: var(--bg);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: var(--shadow-md);
    z-index: 10;
  }
  .bar::before {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(4px);
    border-width: 4px;
    border-style: solid;
    border-color: var(--text) transparent transparent transparent;
    opacity: 0;
    pointer-events: none;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 10;
  }
  .bar:hover::after, .bar:hover::before {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }

  /* Progress bars */
  .progress-list { display: flex; flex-direction: column; gap: 14px; }
  .progress-item { }
  .progress-header { display: flex; justify-content: space-between; margin-bottom: 6px; }
  .progress-label { font-size: 13px; color: var(--text-secondary); }
  .progress-val { font-size: 13px; font-weight: 600; color: var(--text); }
  .progress-track { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 3px; transition: width 0.6s ease; }

  /* Activity list */
  .activity-list { display: flex; flex-direction: column; gap: 0; }
  .activity-item {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 0; border-bottom: 1px solid var(--border);
  }
  .activity-item:last-child { border-bottom: none; }
  .activity-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .activity-info { flex: 1; }
  .activity-text { font-size: 13px; color: var(--text); line-height: 1.4; }
  .activity-time { font-size: 11px; color: var(--text-tertiary); margin-top: 2px; }

  /* Badges */
  .badge {
    display: inline-flex; align-items: center;
    padding: 2px 8px; border-radius: 20px;
    font-size: 11px; font-weight: 600; flex-shrink: 0;
  }
  .badge.purple { background: var(--accent-soft); color: var(--accent); }
  .badge.green { background: var(--green-soft); color: var(--green); }
  .badge.blue { background: var(--blue-soft); color: var(--blue); }
  .badge.orange { background: var(--orange-soft); color: var(--orange); }
  .badge.red { background: var(--red-soft); color: var(--red); }

  /* Table */
  .table-wrapper { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  thead tr { border-bottom: 2px solid var(--border); }
  th {
    padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 600;
    color: var(--text-tertiary); letter-spacing: 0.5px; text-transform: uppercase;
    white-space: nowrap;
  }
  td { padding: 12px; border-bottom: 1px solid var(--border); color: var(--text-secondary); }
  tbody tr:hover { background: var(--accent-soft); }
  tbody tr:last-child td { border-bottom: none; }
  .td-main { color: var(--text); font-weight: 500; }

  /* Action buttons */
  .action-btns { display: flex; gap: 6px; }
  .btn-icon-sm {
    width: 28px; height: 28px; border-radius: var(--radius-xs);
    display: flex; align-items: center; justify-content: center;
    border: 1px solid var(--border); background: transparent;
    cursor: pointer; color: var(--text-tertiary); transition: all var(--transition);
  }
  .btn-icon-sm:hover.edit { background: var(--blue-soft); border-color: var(--blue); color: var(--blue); }
  .btn-icon-sm:hover.delete { background: var(--red-soft); border-color: var(--red); color: var(--red); }

  /* ─── BUTTONS ─── */
  .btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 9px 16px; border-radius: var(--radius-sm); font-size: 13px;
    font-weight: 500; cursor: pointer; border: none; transition: all var(--transition);
    font-family: 'DM Sans', sans-serif;
  }
  .btn-primary {
    background: var(--accent); color: white;
    box-shadow: 0 4px 14px var(--accent-glow);
  }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px var(--accent-glow); }
  .btn-secondary {
    background: var(--bg); border: 1px solid var(--border); color: var(--text-secondary);
  }
  .btn-secondary:hover { border-color: var(--accent); color: var(--accent); }

  .toolbar { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
  .toolbar-search {
    flex: 1; min-width: 200px; height: 36px; padding: 0 12px 0 36px;
    background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius-sm);
    font-size: 13px; color: var(--text); font-family: 'DM Sans', sans-serif; outline: none;
    transition: all var(--transition);
  }
  .toolbar-search:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
  .toolbar-search-wrap { position: relative; flex: 1; min-width: 200px; }

  /* ─── AI CONFIG ─── */
  .ai-config-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .config-item { margin-bottom: 16px; }
  .config-label { font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; letter-spacing: 0.3px; }
  .config-input {
    width: 100%; height: 38px; padding: 0 12px;
    background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius-sm);
    font-size: 13px; color: var(--text); font-family: 'DM Sans', sans-serif; outline: none;
    transition: all var(--transition);
  }
  .config-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
  .config-slider { width: 100%; accent-color: var(--accent); cursor: pointer; }
  .config-toggle {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 14px; background: var(--bg); border: 1px solid var(--border);
    border-radius: var(--radius-sm); cursor: pointer; transition: all var(--transition);
  }
  .config-toggle:hover { border-color: var(--accent); }
  .toggle-switch {
    width: 42px; height: 22px; background: var(--border-strong); border-radius: 11px;
    position: relative; transition: background var(--transition);
  }
  .toggle-switch.on { background: var(--accent); }
  .toggle-knob {
    width: 16px; height: 16px; background: white; border-radius: 50%;
    position: absolute; top: 3px; left: 3px; transition: left var(--transition);
    box-shadow: 0 1px 4px rgba(0,0,0,0.2);
  }
  .toggle-switch.on .toggle-knob { left: 23px; }

  /* ─── EMPTY STATES ─── */
  .empty-state { text-align: center; padding: 60px 20px; color: var(--text-tertiary); }
  .empty-icon { margin: 0 auto 16px; opacity: 0.3; }
  .empty-title { font-size: 16px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; }
  .empty-desc { font-size: 13px; }

  /* ─── USER CARDS ─── */
  .user-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }
  .user-card {
    background: var(--bg-secondary); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 20px; text-align: center;
    transition: all var(--transition); cursor: pointer;
  }
  .user-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); border-color: var(--border-strong); }
  .user-avatar {
    width: 56px; height: 56px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; font-weight: 700; color: white; margin: 0 auto 12px;
  }
  .user-name { font-weight: 600; font-size: 14px; color: var(--text); margin-bottom: 2px; }
  .user-email { font-size: 12px; color: var(--text-tertiary); margin-bottom: 10px; }
  .user-stats { display: flex; gap: 12px; justify-content: center; font-size: 12px; }
  .user-stat { text-align: center; }
  .user-stat-val { font-weight: 700; color: var(--text); font-size: 15px; }
  .user-stat-lbl { color: var(--text-tertiary); }

  /* ─── VOCAB ─── */
  .vocab-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }
  .vocab-card {
    background: var(--bg-secondary); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 16px;
    transition: all var(--transition); cursor: pointer;
  }
  .vocab-card:hover { border-color: var(--accent); box-shadow: 0 4px 20px var(--accent-soft); }
  .vocab-word { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: var(--text); margin-bottom: 2px; }
  .vocab-pos { font-size: 11px; font-weight: 600; color: var(--accent); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px; }
  .vocab-meaning { font-size: 13px; color: var(--text-secondary); margin-bottom: 8px; line-height: 1.5; }
  .vocab-level { display: flex; gap: 3px; }
  .level-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--border-strong); }
  .level-dot.filled { background: var(--accent); }

  /* ─── EXAM ─── */
  .exam-list { display: flex; flex-direction: column; gap: 12px; }
  .exam-card {
    background: var(--bg-secondary); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 18px 20px;
    display: flex; align-items: center; gap: 16px;
    transition: all var(--transition); cursor: pointer;
  }
  .exam-card:hover { border-color: var(--border-strong); box-shadow: var(--shadow); }
  .exam-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .exam-info { flex: 1; }
  .exam-name { font-weight: 600; font-size: 14px; color: var(--text); margin-bottom: 3px; }
  .exam-meta { font-size: 12px; color: var(--text-tertiary); display: flex; gap: 14px; }
  .exam-stat { display: flex; align-items: center; gap: 4px; }

  /* ─── ANIMATIONS ─── */
  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .page-enter { animation: fadeSlideIn 0.3s ease forwards; }

  /* Shimmer Loading Effect */
  .shimmer {
    background: linear-gradient(90deg, var(--border) 25%, var(--border-strong) 50%, var(--border) 75%);
    background-size: 200% 100%;
    animation: shimmerLoading 1.6s infinite linear;
  }
  @keyframes shimmerLoading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* ─── RESPONSIVE ─── */
  @media (max-width: 900px) {
    .stat-grid { grid-template-columns: repeat(2,1fr); }
    .chart-row { grid-template-columns: 1fr; }
    .ai-config-grid { grid-template-columns: 1fr; }
    .user-grid { grid-template-columns: repeat(2,1fr); }
    .vocab-grid { grid-template-columns: repeat(2,1fr); }
  }
  @media (max-width: 600px) {
    .sidebar { transform: translateX(-100%); }
    .sidebar.mobile-open { transform: translateX(0); }
    .main-wrapper { margin-left: 0 !important; }
    .stat-grid { grid-template-columns: 1fr 1fr; }
    .user-grid { grid-template-columns: 1fr; }
    .vocab-grid { grid-template-columns: 1fr; }
    .content-area { padding: 16px; }
    .header { padding: 0 14px; gap: 10px; }
    .header-search { display: none; }
  }
`;

export default CSS;
