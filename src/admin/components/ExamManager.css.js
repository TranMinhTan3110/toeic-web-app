const EXAM_CSS = `
  .em-wrap *,
  .em-wrap *::before,
  .em-wrap *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .em-wrap {
    --surface:      #ffffff;
    --surface2:     #FFF8F4;
    --surface-dark: #1E1B4B;
    --text:         var(--text, #1C1C1E);
    --text2:        var(--text-secondary, #3A3A3C);
    --border:       rgba(255, 107, 53, 0.22);
    --border-strong:rgba(255, 107, 53, 0.38);
    --accent:       #FF6B35;
    --accent-light: rgba(255, 107, 53, 0.12);
    --blue:         #007AFF;
    --blue-soft:    rgba(0, 122, 255, 0.1);
    --green:        #34C759;
    --green-soft:   rgba(52, 199, 89, 0.1);
    --red:          #FF3B30;
    --red-soft:     rgba(255, 59, 48, 0.1);
    --radius:       16px;
    --font:         'Outfit', 'DM Sans', sans-serif;
    font-family: var(--font);
    color: var(--text);
  }

  .em-top-panel {
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: var(--radius);
    padding: 20px 24px;
    margin-bottom: 20px;
    box-shadow: 0 4px 24px rgba(255, 107, 53, 0.06);
  }
  .em-page-header {
    display: flex; align-items: center; justify-content: space-between; gap: 14px;
  }
  .em-header-left {
    display: flex; align-items: center; gap: 14px;
  }
  .em-page-title {
    font-size: 22px; font-weight: 800; color: var(--text);
    letter-spacing: -0.5px;
  }
  .em-page-sub { font-size: 13.5px; color: var(--text2); margin-top: 4px; }

  /* ── Buttons ── */
  .em-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 20px; border-radius: 10px;
    font-size: 13.5px; font-weight: 600; cursor: pointer;
    border: none; transition: all 0.2s ease; font-family: var(--font);
  }
  .em-btn svg { width: 15px; height: 15px; flex-shrink: 0; }
  .em-btn-primary {
    background: var(--accent); color: #fff;
    box-shadow: 0 4px 14px rgba(255, 107, 53, 0.25);
  }
  .em-btn-primary:hover { opacity: 0.95; transform: translateY(-1px); }
  .em-btn-ghost {
    background: var(--surface);
    color: var(--text2);
    border: 1.5px solid var(--border);
  }
  .em-btn-ghost:hover {
    background: var(--accent-light);
    color: var(--accent);
    border-color: var(--border-strong);
  }
  .em-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }

  /* ── Layout grid ── */
  .em-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    margin-bottom: 24px;
  }
  @media (max-width: 1024px) {
    .em-layout { grid-template-columns: 1fr; }
  }

  /* ── Card ── */
  .em-card {
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: var(--radius);
    padding: 24px;
    box-shadow: 0 6px 28px rgba(255, 107, 53, 0.07);
    margin-bottom: 24px;
  }
  .em-card-head {
    padding-bottom: 16px;
    margin-bottom: 20px;
    border-bottom: 1.5px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .em-card-title {
    font-size: 17px; font-weight: 750; color: var(--text);
  }
  .em-card-desc {
    font-size: 13px; color: var(--text2); margin-top: 4px;
  }

  /* ── Form ── */
  .em-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .em-form-group { margin-bottom: 16px; }
  .em-form-group.full { grid-column: span 2; }
  .em-label {
    display: block; font-size: 12px; font-weight: 750;
    color: var(--text2); margin-bottom: 8px;
    text-transform: uppercase; letter-spacing: 0.05em;
  }
  .em-input, .em-select, .em-textarea {
    width: 100%; padding: 11px 14px;
    border: 1.5px solid var(--border); border-radius: 10px;
    font-size: 14px; background: #fff; color: var(--text);
    font-family: var(--font); transition: all 0.15s; outline: none;
  }
  .em-input:focus, .em-select:focus, .em-textarea:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.12);
  }
  .em-textarea { resize: vertical; min-height: 80px; }
  
  .em-select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23FF6B35' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 36px;
  }

  /* ── Drag and Drop Zones ── */
  .em-dropzone {
    border: 2px dashed var(--border-strong);
    border-radius: 12px; padding: 28px 20px;
    text-align: center; cursor: pointer;
    background: #fff;
    transition: all 0.2s ease; color: var(--text2);
    min-height: 140px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .em-dropzone:hover, .em-dropzone.dragging {
    border-color: var(--accent);
    background: var(--accent-light); color: var(--accent);
  }
  .em-dropzone svg { width: 32px; height: 32px; margin-bottom: 10px; opacity: 0.8; }
  .em-dropzone p { font-size: 14px; font-weight: 500; }
  .em-dropzone .em-hint { font-size: 12px; margin-top: 6px; opacity: 0.8; }

  /* ── Media Files Manager List ── */
  .em-media-list {
    margin-top: 16px;
    max-height: 250px;
    overflow-y: auto;
    border: 1.5px solid var(--border);
    border-radius: 10px;
    background: var(--surface2);
  }
  .em-media-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-bottom: 1px solid var(--border);
    font-size: 13px;
  }
  .em-media-item:last-child { border-bottom: none; }
  .em-media-info {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
    overflow: hidden;
  }
  .em-media-name {
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .em-media-size {
    font-size: 11px;
    color: var(--text2);
    margin-left: 8px;
    flex-shrink: 0;
  }
  .em-media-status {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: 12px;
    font-size: 12px;
    font-weight: 600;
  }
  .em-status-success { color: var(--green); }
  .em-status-pending { color: var(--blue); }
  .em-status-error { color: var(--red); }

  /* ── Verification Badge Dashboard ── */
  .em-badge-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    margin-bottom: 20px;
  }
  .em-badge-card {
    background: var(--surface2);
    border: 1.5px solid var(--border);
    border-radius: 12px;
    padding: 16px;
    text-align: center;
    border-top: 3px solid var(--border-strong);
  }
  .em-badge-card.success { border-top-color: var(--green); }
  .em-badge-card.warning { border-top-color: var(--accent); }
  .em-badge-card.danger { border-top-color: var(--red); }
  
  .em-badge-val {
    font-size: 26px; font-weight: 800; margin-bottom: 4px;
  }
  .em-badge-label {
    font-size: 12.5px; font-weight: 600; color: var(--text2);
  }

  /* ── Tab Part Filter for Preview ── */
  .em-part-tabs {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    padding-bottom: 8px;
    border-bottom: 1.5px solid var(--border);
    margin-bottom: 16px;
  }
  .em-part-tab {
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
    background: transparent;
    border: 1.5px solid transparent;
    color: var(--text2);
    white-space: nowrap;
    transition: all 0.2s;
  }
  .em-part-tab:hover {
    background: var(--accent-light);
    color: var(--accent);
  }
  .em-part-tab.active {
    background: var(--accent-light);
    color: var(--accent);
    border-color: var(--accent);
  }

  /* ── Preview Table ── */
  .em-preview-table-wrap {
    border: 1.5px solid var(--border);
    border-radius: 10px;
    overflow: hidden;
    background: #fff;
  }
  .em-preview-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13.5px;
    text-align: left;
  }
  .em-preview-table th {
    background: var(--surface2);
    padding: 12px 14px;
    font-weight: 750;
    color: var(--text);
    border-bottom: 1.5px solid var(--border);
  }
  .em-preview-table td {
    padding: 12px 14px;
    border-bottom: 1px solid var(--border);
    vertical-align: middle;
  }
  .em-preview-table tr:last-child td { border-bottom: none; }
  .em-preview-table tr:hover { background: rgba(255, 107, 53, 0.02); }

  /* ── Progress Loader Modal ── */
  .em-modal-overlay {
    position: fixed; inset: 0;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    z-index: 99999;
  }
  .em-modal {
    background: #fff;
    width: 100%; maxWidth: 480px;
    border-radius: var(--radius);
    padding: 28px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.15);
    text-align: center;
  }
  .em-progress-bar {
    width: 100%; height: 8px;
    background: var(--border);
    border-radius: 4px;
    overflow: hidden;
    margin: 20px 0;
  }
  .em-progress-fill {
    height: 100%;
    background: var(--accent);
    width: 0%;
    transition: width 0.3s ease;
  }
  .em-modal-title { font-size: 18px; font-weight: 750; margin-bottom: 8px; }
  .em-modal-subtitle { font-size: 13px; color: var(--text2); }

  .em-q-badge {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 700;
  }
  .em-q-badge.listening { background: var(--blue-soft); color: var(--blue); }
  .em-q-badge.reading { background: var(--accent-light); color: var(--accent); }
`;

export default EXAM_CSS;
