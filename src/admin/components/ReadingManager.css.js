const READING_CSS = `
  .rm-wrap *,
  .rm-wrap *::before,
  .rm-wrap *::after { box-sizing: border-box; }

  .rm-wrap {
    --rm-accent: var(--accent, #8b5cf6);
    --rm-accent-soft: var(--accent-soft, rgba(139, 92, 246, 0.12));
    --rm-surface: #ffffff;
    --rm-surface-2: #faf8ff;
    --rm-border: rgba(139, 92, 246, 0.24);
    --rm-border-strong: rgba(139, 92, 246, 0.42);
    --rm-text: var(--text, #1c1c1e);
    --rm-text-2: var(--text-secondary, #52525b);
    --rm-muted: var(--text-tertiary, #71717a);
    --rm-radius: 14px;
    color: var(--rm-text);
  }

  .rm-top-panel,
  .rm-tabs-panel,
  .rm-card,
  .rm-preview-wrap {
    background: var(--rm-surface);
    border: 1.5px solid var(--rm-border);
    border-radius: var(--rm-radius);
    box-shadow: 0 6px 24px rgba(139, 92, 246, 0.08);
  }

  .rm-top-panel { padding: 18px 20px; margin-bottom: 16px; }
  .rm-page-header { display: flex; align-items: center; gap: 14px; }
  .rm-page-title { font-size: 22px; font-weight: 800; margin: 0; color: var(--rm-text); }
  .rm-page-sub { font-size: 13px; color: var(--rm-muted); margin: 4px 0 0; }

  .rm-tabs-panel { padding: 10px 12px 0; margin-bottom: 16px; }
  .rm-tabs { display: flex; gap: 8px; overflow-x: auto; }
  .rm-tab {
    min-height: 42px;
    padding: 10px 16px;
    border: 1.5px solid transparent;
    border-radius: 10px 10px 0 0;
    background: transparent;
    color: var(--rm-text-2);
    cursor: pointer;
    font-size: 13px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
  }
  .rm-tab:hover,
  .rm-tab.active {
    color: var(--rm-accent);
    background: var(--rm-accent-soft);
    border-color: var(--rm-border-strong);
  }
  .rm-tab.active { box-shadow: 0 -2px 0 var(--rm-accent) inset; }

  .rm-two-col {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 380px;
    gap: 20px;
    align-items: start;
  }
  @media (max-width: 1060px) {
    .rm-two-col { grid-template-columns: 1fr; }
  }

  .rm-card,
  .rm-preview-wrap { padding: 20px 22px; }
  .rm-card-head {
    border-bottom: 1.5px solid var(--rm-border);
    padding-bottom: 14px;
    margin-bottom: 18px;
  }
  .rm-card-title { margin: 0; font-size: 16px; font-weight: 800; color: var(--rm-text); }
  .rm-card-desc { margin: 4px 0 0; font-size: 12.5px; color: var(--rm-muted); }

  .rm-section {
    background: var(--rm-surface-2);
    border: 1.5px solid var(--rm-border);
    border-radius: 12px;
    padding: 16px 18px;
    margin-bottom: 14px;
  }
  .rm-section-title {
    padding-bottom: 8px;
    margin-bottom: 14px;
    border-bottom: 1px dashed var(--rm-border);
    color: var(--rm-accent);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .rm-form-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
  @media (max-width: 760px) {
    .rm-form-row { grid-template-columns: 1fr; }
  }
  .rm-form-group { margin-bottom: 14px; }
  .rm-label {
    display: block;
    margin-bottom: 6px;
    color: var(--rm-text-2);
    font-size: 11.5px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .rm-input,
  .rm-select,
  .rm-textarea {
    width: 100%;
    border: 1.5px solid var(--rm-border);
    border-radius: 8px;
    padding: 10px 12px;
    background: #fff;
    color: var(--rm-text);
    font: inherit;
    font-size: 13.5px;
    outline: none;
  }
  .rm-input:focus,
  .rm-select:focus,
  .rm-textarea:focus {
    border-color: var(--rm-accent);
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
  }
  .rm-textarea { resize: vertical; min-height: 84px; line-height: 1.5; }
  .rm-select { cursor: pointer; }

  .rm-upload {
    min-height: 140px;
    border: 2px dashed var(--rm-border-strong);
    border-radius: 10px;
    background: #fff;
    color: var(--rm-text-2);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    overflow: hidden;
    padding: 16px;
    transition: all 0.2s ease;
  }
  .rm-upload:hover { border-color: var(--rm-accent); background: var(--rm-accent-soft); color: var(--rm-accent); }
  .rm-upload img { max-width: 100%; max-height: 160px; object-fit: contain; border-radius: 8px; }

  .rm-btn {
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
  .rm-btn svg { width: 14px; height: 14px; flex-shrink: 0; }
  .rm-btn-primary { background: var(--rm-accent); color: #fff; box-shadow: 0 4px 14px rgba(139, 92, 246, 0.24); }
  .rm-btn-ghost { background: #fff; color: var(--rm-text-2); border: 1.5px solid var(--rm-border); }
  .rm-btn-danger { background: rgba(239, 68, 68, 0.1); color: #dc2626; border: 1.5px solid rgba(239, 68, 68, 0.25); }
  .rm-btn:hover { transform: translateY(-1px); }
  .rm-btn:disabled { opacity: 0.58; cursor: not-allowed; transform: none; }
  
  .rm-form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    border-top: 1.5px solid var(--rm-border);
    padding-top: 16px;
    margin-top: 18px;
  }

  /* Sub questions builder */
  .rm-sub-question-card {
    border: 1.5px solid var(--rm-border);
    border-radius: 10px;
    background: #fff;
    padding: 16px;
    margin-bottom: 12px;
  }
  .rm-sub-question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px dashed var(--rm-border);
    padding-bottom: 8px;
    margin-bottom: 12px;
  }
  .rm-sub-question-title {
    font-size: 13px;
    font-weight: 800;
    color: var(--rm-accent);
  }

  /* Options list spacing */
  .rm-options-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
  @media (max-width: 580px) {
    .rm-options-grid { grid-template-columns: 1fr; }
  }

  /* Live Preview Styles */
  .rm-preview-container {
    position: sticky;
    top: 20px;
    max-height: calc(100vh - 120px);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .rm-preview-passage {
    background: #fbfbfe;
    border: 1.5px solid var(--rm-border);
    border-radius: 10px;
    padding: 14px;
    font-size: 13px;
    line-height: 1.6;
    max-height: 220px;
    overflow-y: auto;
    white-space: pre-wrap;
    color: var(--rm-text-2);
  }
  .rm-preview-question {
    border: 1.5px solid #eaeaea;
    border-radius: 8px;
    background: #fff;
    padding: 12px;
    margin-bottom: 10px;
  }
  .rm-preview-question-text {
    font-weight: 700;
    font-size: 13px;
    margin-bottom: 8px;
  }
  .rm-preview-option {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--rm-text-2);
    padding: 6px 8px;
    border-radius: 6px;
    background: #fafafa;
    border: 1px solid #efefef;
    margin-bottom: 4px;
  }
  .rm-preview-option.correct {
    background: #ecfdf5;
    border-color: #a7f3d0;
    color: #047857;
    font-weight: 700;
  }

  .rm-toast {
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
  .rm-toast.success { background: #ecfdf5; border: 1px solid #10b981; color: #065f46; }
  .rm-toast.error { background: #fef2f2; border: 1px solid #ef4444; color: #991b1b; }
  .rm-toast.info { background: #fff7ed; border: 1px solid #fb923c; color: #9a3412; }

  .rm-spin { animation: rm-spin 1s linear infinite; }
  @keyframes rm-spin { to { transform: rotate(360deg); } }
`;

export default READING_CSS;
