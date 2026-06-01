const WRITING_CSS = `
  .wm-wrap *,
  .wm-wrap *::before,
  .wm-wrap *::after { box-sizing: border-box; }

  .wm-wrap {
    --wm-accent: var(--orange, #f97316);
    --wm-accent-soft: var(--orange-soft, rgba(249, 115, 22, 0.12));
    --wm-surface: #ffffff;
    --wm-surface-2: #fff8f2;
    --wm-border: rgba(249, 115, 22, 0.24);
    --wm-border-strong: rgba(249, 115, 22, 0.42);
    --wm-text: var(--text, #1c1c1e);
    --wm-text-2: var(--text-secondary, #52525b);
    --wm-muted: var(--text-tertiary, #71717a);
    --wm-radius: 14px;
    color: var(--wm-text);
  }

  .wm-top-panel,
  .wm-tabs-panel,
  .wm-card,
  .wm-preview-wrap {
    background: var(--wm-surface);
    border: 1.5px solid var(--wm-border);
    border-radius: var(--wm-radius);
    box-shadow: 0 6px 24px rgba(249, 115, 22, 0.08);
  }

  .wm-top-panel { padding: 18px 20px; margin-bottom: 16px; }
  .wm-page-header { display: flex; align-items: center; gap: 14px; }
  .wm-page-title { font-size: 22px; font-weight: 800; margin: 0; color: var(--wm-text); }
  .wm-page-sub { font-size: 13px; color: var(--wm-muted); margin: 4px 0 0; }

  .wm-tabs-panel { padding: 10px 12px 0; margin-bottom: 16px; }
  .wm-tabs { display: flex; gap: 8px; overflow-x: auto; }
  .wm-tab {
    min-height: 42px;
    padding: 10px 16px;
    border: 1.5px solid transparent;
    border-radius: 10px 10px 0 0;
    background: transparent;
    color: var(--wm-text-2);
    cursor: pointer;
    font-size: 13px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
  }
  .wm-tab:hover,
  .wm-tab.active {
    color: var(--wm-accent);
    background: var(--wm-accent-soft);
    border-color: var(--wm-border-strong);
  }
  .wm-tab.active { box-shadow: 0 -2px 0 var(--wm-accent) inset; }

  .wm-two-col {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 360px;
    gap: 20px;
    align-items: start;
  }
  @media (max-width: 1060px) {
    .wm-two-col { grid-template-columns: 1fr; }
  }

  .wm-card,
  .wm-preview-wrap { padding: 20px 22px; }
  .wm-card-head {
    border-bottom: 1.5px solid var(--wm-border);
    padding-bottom: 14px;
    margin-bottom: 18px;
  }
  .wm-card-title { margin: 0; font-size: 16px; font-weight: 800; color: var(--wm-text); }
  .wm-card-desc { margin: 4px 0 0; font-size: 12.5px; color: var(--wm-muted); }

  .wm-section {
    background: var(--wm-surface-2);
    border: 1.5px solid var(--wm-border);
    border-radius: 12px;
    padding: 16px 18px;
    margin-bottom: 14px;
  }
  .wm-section-title {
    padding-bottom: 8px;
    margin-bottom: 14px;
    border-bottom: 1px dashed var(--wm-border);
    color: var(--wm-accent);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .wm-form-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
  @media (max-width: 760px) {
    .wm-form-row { grid-template-columns: 1fr; }
  }
  .wm-form-group { margin-bottom: 14px; }
  .wm-label {
    display: block;
    margin-bottom: 6px;
    color: var(--wm-text-2);
    font-size: 11.5px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .wm-input,
  .wm-select,
  .wm-textarea {
    width: 100%;
    border: 1.5px solid var(--wm-border);
    border-radius: 8px;
    padding: 10px 12px;
    background: #fff;
    color: var(--wm-text);
    font: inherit;
    font-size: 13.5px;
    outline: none;
  }
  .wm-input:focus,
  .wm-select:focus,
  .wm-textarea:focus {
    border-color: var(--wm-accent);
    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.15);
  }
  .wm-textarea { resize: vertical; min-height: 84px; line-height: 1.5; }
  .wm-select { cursor: pointer; }

  .wm-upload {
    min-height: 154px;
    border: 2px dashed var(--wm-border-strong);
    border-radius: 10px;
    background: #fff;
    color: var(--wm-text-2);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    overflow: hidden;
    padding: 16px;
  }
  .wm-upload:hover { border-color: var(--wm-accent); background: var(--wm-accent-soft); color: var(--wm-accent); }
  .wm-upload img { width: 100%; max-height: 220px; object-fit: contain; border-radius: 8px; }
  .wm-upload-empty svg { margin-bottom: 8px; }
  .wm-upload-empty p { margin: 0; font-size: 13px; font-weight: 700; }
  .wm-upload-empty span { display: block; margin-top: 4px; font-size: 11px; color: var(--wm-muted); }
  .wm-file-name { margin: 8px 0 0; font-size: 11px; color: var(--wm-muted); word-break: break-word; }

  .wm-inline-list { display: flex; flex-direction: column; gap: 10px; }
  .wm-inline-row { display: flex; align-items: center; gap: 10px; }
  .wm-inline-row .wm-input { flex: 1; }

  .wm-btn {
    min-height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    border: 0;
    border-radius: 8px;
    padding: 8px 14px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 700;
    font-family: inherit;
    transition: transform 0.15s, opacity 0.15s, background 0.15s;
  }
  .wm-btn svg { width: 14px; height: 14px; flex-shrink: 0; }
  .wm-btn-primary { background: var(--wm-accent); color: #fff; box-shadow: 0 4px 14px rgba(249, 115, 22, 0.24); }
  .wm-btn-ghost { background: #fff; color: var(--wm-text-2); border: 1.5px solid var(--wm-border); }
  .wm-btn-danger { background: rgba(239, 68, 68, 0.1); color: #dc2626; border: 1.5px solid rgba(239, 68, 68, 0.25); }
  .wm-btn:hover { transform: translateY(-1px); }
  .wm-btn:disabled { opacity: 0.58; cursor: not-allowed; transform: none; }
  .wm-icon-btn {
    width: 32px;
    height: 32px;
    padding: 0;
    border-radius: 8px;
  }

  .wm-form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    border-top: 1.5px solid var(--wm-border);
    padding-top: 16px;
    margin-top: 18px;
  }

  .wm-preview {
    border: 1.5px solid var(--wm-border);
    border-radius: 12px;
    background: linear-gradient(180deg, #fff, var(--wm-surface-2));
    padding: 16px;
  }
  .wm-preview-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border-radius: 999px;
    padding: 5px 10px;
    background: var(--wm-accent-soft);
    color: var(--wm-accent);
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
  }
  .wm-preview-media {
    height: 180px;
    margin: 14px 0;
    border: 1.5px solid var(--wm-border);
    border-radius: 10px;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    color: var(--wm-muted);
  }
  .wm-preview-media img { width: 100%; height: 100%; object-fit: contain; }
  .wm-preview-title { font-size: 15px; font-weight: 800; color: var(--wm-text); margin: 12px 0 8px; }
  .wm-preview-text {
    white-space: pre-line;
    font-size: 13px;
    color: var(--wm-text-2);
    line-height: 1.55;
  }
  .wm-chip-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
  .wm-chip {
    border-radius: 999px;
    background: #fff;
    border: 1.5px solid var(--wm-border);
    color: var(--wm-accent);
    padding: 5px 10px;
    font-size: 12px;
    font-weight: 800;
  }
  .wm-answer-box {
    min-height: 112px;
    border: 1.5px solid var(--wm-border);
    border-radius: 10px;
    background: #fff;
    margin-top: 14px;
    padding: 12px;
    color: var(--wm-muted);
    font-size: 13px;
  }

  .wm-toast {
    position: fixed;
    top: 32px;
    right: 32px;
    z-index: 99999;
    max-width: 420px;
    border-radius: 10px;
    padding: 14px 16px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.16);
    font-size: 14px;
    font-weight: 700;
  }
  .wm-toast.success { background: #ecfdf5; border: 1px solid #10b981; color: #065f46; }
  .wm-toast.error { background: #fef2f2; border: 1px solid #ef4444; color: #991b1b; }
  .wm-toast.info { background: #fff7ed; border: 1px solid #fb923c; color: #9a3412; }

  .wm-spin { animation: wm-spin 1s linear infinite; }
  @keyframes wm-spin { to { transform: rotate(360deg); } }
`;

export default WRITING_CSS;
