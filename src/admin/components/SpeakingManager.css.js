const SPEAKING_CSS = `
  .sm-wrap *,
  .sm-wrap *::before,
  .sm-wrap *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .sm-wrap {
    --surface:      #ffffff;
    --surface2:     #F3FDF9;
    --text:         var(--text, #1C1C1E);
    --text2:        var(--text-secondary, #3A3A3C);
    --border:       rgba(16, 185, 129, 0.2);
    --border-strong:rgba(16, 185, 129, 0.38);
    --accent:       var(--green, #10B981);
    --accent-light: rgba(16, 185, 129, 0.1);
    --radius:       14px;
    --font:         'DM Sans', sans-serif;
    font-family: var(--font);
    color: var(--text);
  }

  /* ── Khung ngoài ── */
  .sm-top-panel {
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: var(--radius);
    padding: 18px 20px;
    margin-bottom: 16px;
    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.05);
  }
  .sm-page-header {
    display: flex; align-items: center; gap: 14px;
  }
  .sm-page-title {
    font-size: 22px; font-weight: 800; color: var(--text);
    letter-spacing: -0.3px;
  }
  .sm-page-sub { font-size: 13px; color: var(--text2); margin-top: 4px; }

  .sm-tabs-panel {
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: var(--radius);
    padding: 10px 12px 0;
    margin-bottom: 16px;
    box-shadow: 0 2px 12px rgba(16, 185, 129, 0.03);
  }
  .sm-tabs {
    display: flex; gap: 8px;
    border-bottom: none;
    margin-bottom: 0;
    overflow-x: auto;
  }
  .sm-tab {
    padding: 10px 18px;
    font-size: 13px; font-weight: 600;
    color: var(--text2);
    cursor: pointer;
    border: 1.5px solid transparent;
    border-radius: 10px 10px 0 0;
    margin-bottom: 0;
    background: transparent;
    transition: all 0.15s;
    font-family: var(--font);
    white-space: nowrap;
  }
  .sm-tab:hover {
    color: var(--accent);
    background: var(--accent-light);
    border-color: var(--border);
  }
  .sm-tab.active {
    color: var(--accent);
    background: var(--accent-light);
    border-color: var(--border-strong);
    border-bottom-color: var(--surface);
    box-shadow: 0 -2px 0 var(--accent) inset;
  }

  .sm-content-panel {
    background: transparent;
  }

  /* ── Buttons ── */
  .sm-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 8px;
    font-size: 13px; font-weight: 500; cursor: pointer;
    border: none; transition: all 0.15s; font-family: var(--font);
  }
  .sm-btn svg { width: 14px; height: 14px; flex-shrink: 0; }
  .sm-btn-primary {
    background: var(--accent); color: #fff;
    box-shadow: 0 4px 14px rgba(16, 185, 129, 0.25);
  }
  .sm-btn-primary:hover { opacity: 0.92; transform: translateY(-1px); }
  .sm-btn-ghost {
    background: var(--surface);
    color: var(--text2);
    border: 1.5px solid var(--border);
  }
  .sm-btn-ghost:hover {
    background: var(--accent-light);
    color: var(--accent);
    border-color: var(--border-strong);
  }
  .sm-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  /* ── Layout 2 cột ── */
  .sm-two-col {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 20px; align-items: start;
  }
  @media (max-width: 960px) {
    .sm-two-col { grid-template-columns: 1fr; }
  }

  /* ── Card chính ── */
  .sm-card {
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: var(--radius);
    padding: 20px 22px;
    box-shadow: 0 6px 28px rgba(16, 185, 129, 0.05);
  }
  .sm-card-head {
    padding-bottom: 14px;
    margin-bottom: 18px;
    border-bottom: 1.5px solid var(--border);
  }
  .sm-card-title {
    font-size: 16px; font-weight: 700; color: var(--text);
  }
  .sm-card-desc {
    font-size: 12.5px; color: var(--text2); margin-top: 4px;
  }

  /* ── Section khung con ── */
  .sm-section {
    background: var(--surface2);
    border: 1.5px solid var(--border);
    border-radius: 12px;
    padding: 16px 18px;
    margin-bottom: 14px;
  }
  .sm-section:last-of-type { margin-bottom: 0; }
  .sm-section-title {
    font-size: 11px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.08em;
    color: var(--accent);
    margin-bottom: 14px;
    padding-bottom: 8px;
    border-bottom: 1px dashed var(--border);
  }

  /* ── Form ── */
  .sm-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .sm-form-group { margin-bottom: 16px; }
  .sm-label {
    display: block; font-size: 11.5px; font-weight: 700;
    color: var(--text2); margin-bottom: 6px;
    text-transform: uppercase; letter-spacing: 0.06em;
  }
  .sm-input, .sm-select, .sm-textarea {
    width: 100%; padding: 10px 12px;
    border: 1.5px solid var(--border); border-radius: 8px;
    font-size: 13.5px; background: #fff; color: var(--text);
    font-family: var(--font); transition: all 0.15s; outline: none;
  }
  .sm-input:focus, .sm-select:focus, .sm-textarea:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
  }
  .sm-textarea { resize: vertical; min-height: 72px; }
  .sm-select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2310B981' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    padding-right: 32px;
  }

  .sm-upload {
    border: 2px dashed var(--border-strong);
    border-radius: 10px; padding: 22px;
    text-align: center; cursor: pointer;
    background: #fff;
    transition: all 0.15s; color: var(--text2);
  }
  .sm-upload:hover {
    border-color: var(--accent);
    background: var(--accent-light); color: var(--accent);
  }
  .sm-upload svg { width: 24px; height: 24px; margin: 0 auto 8px; display: block; }
  .sm-upload p { font-size: 13px; }
  .sm-upload .sm-hint { font-size: 11px; margin-top: 4px; opacity: 0.85; }

  .sm-audio-player {
    background: #fff; border: 1.5px solid var(--border);
    border-radius: 10px; padding: 10px 14px;
    display: flex; align-items: center; gap: 10px; margin-top: 10px;
  }
  .sm-play-btn {
    width: 34px; height: 34px; border-radius: 50%;
    background: var(--accent); border: none;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; flex-shrink: 0;
  }
  .sm-play-btn svg { width: 14px; height: 14px; color: #fff; }
  .sm-audio-bar {
    flex: 1; height: 4px; background: var(--border);
    border-radius: 2px; overflow: hidden;
  }
  .sm-audio-progress {
    height: 100%; background: var(--accent);
    width: 0%; border-radius: 2px;
  }
  .sm-audio-time { font-size: 12px; color: var(--text2); white-space: nowrap; }

  .sm-option-row {
    display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
  }
  .sm-option-letter {
    width: 30px; height: 30px; border-radius: 50%;
    border: 1.5px solid var(--border-strong);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; flex-shrink: 0;
    color: var(--text2); background: #fff;
    transition: all 0.15s;
  }
  .sm-option-letter.correct {
    border-color: var(--accent);
    background: var(--accent-light); color: var(--accent);
  }
  .sm-answer-radio { accent-color: var(--accent); cursor: pointer; width: 16px; height: 16px; }

  .sm-ai-btn {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 12px; font-weight: 600; padding: 6px 12px;
    border-radius: 8px; background: var(--accent-light);
    color: var(--accent); border: 1.5px solid var(--border);
    cursor: pointer; transition: all 0.15s; font-family: var(--font);
  }
  .sm-ai-btn:hover { border-color: var(--accent); }
  .sm-ai-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .sm-spinning { animation: sm-spin 1s linear infinite; }
  @keyframes sm-spin { to { transform: rotate(360deg); } }

  .sm-label-row {
    display: flex; align-items: center;
    justify-content: space-between; margin-bottom: 6px;
  }
  .sm-form-actions {
    display: flex; gap: 10px; justify-content: flex-end;
    margin-top: 18px; padding-top: 16px;
    border-top: 1.5px solid var(--border);
  }

  /* ── Preview cột phải ── */
  .sm-preview-wrap {
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: var(--radius);
    padding: 18px;
    box-shadow: 0 6px 28px rgba(16, 185, 129, 0.05);
    position: sticky; top: 20px;
  }
  .sm-preview-wrap .sm-card-head {
    margin-bottom: 14px; padding-bottom: 12px;
  }
  .sm-preview {
    background: var(--surface2);
    border: 1.5px solid var(--border);
    border-radius: 12px; padding: 14px;
  }
  .sm-preview-title {
    font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.1em;
    color: var(--text2); margin-bottom: 12px;
  }
  .sm-preview-media {
    background: #fff; border-radius: 10px; padding: 16px;
    margin-bottom: 12px; min-height: 110px;
    display: flex; align-items: center; justify-content: center;
    border: 1.5px dashed var(--border-strong);
    color: var(--text2); font-size: 13px;
  }
  .sm-preview-card {
    background: #fff; border-radius: 10px;
    padding: 14px; border: 1.5px solid var(--border);
    margin-bottom: 10px;
  }
  .sm-preview-q {
    font-size: 13px; font-weight: 600; color: var(--text);
    margin-bottom: 12px; line-height: 1.5;
  }
  .sm-preview-opt {
    padding: 9px 12px; border-radius: 8px;
    border: 1.5px solid var(--border);
    font-size: 12px; margin-bottom: 8px;
    background: #fff; color: var(--text);
    transition: all 0.15s;
  }
  .sm-preview-opt.selected {
    border-color: var(--accent);
    background: var(--accent-light);
    color: var(--accent); font-weight: 500;
  }
  .sm-preview-explanation {
    padding: 12px; background: #fff;
    border-radius: 10px; border: 1.5px solid var(--border);
  }
  .sm-preview-explanation-label {
    font-size: 10px; font-weight: 700;
    color: var(--accent); margin-bottom: 6px;
    text-transform: uppercase; letter-spacing: 0.06em;
  }
  .sm-preview-explanation-text {
    font-size: 12px; color: var(--text); line-height: 1.6;
    white-space: pre-wrap;
  }

  /* ── Group & Repeating Elements ── */
  .sm-group-card {
    background: var(--surface2);
    border: 1.5px solid var(--border-strong);
    border-radius: 12px; padding: 18px; margin-bottom: 16px;
  }
  .sm-group-header {
    font-size: 14px; font-weight: 700; color: var(--text);
    margin-bottom: 14px; padding-bottom: 10px;
    border-bottom: 1px dashed var(--border);
    display: flex; align-items: center; justify-content: space-between;
  }
  .sm-sub-q {
    background: #fff; border: 1.5px solid var(--border);
    border-radius: 10px; padding: 14px; margin-bottom: 10px;
  }
  .sm-sub-q-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 10px;
  }
  .sm-sub-q-label { font-size: 12px; font-weight: 700; color: var(--accent); }
  .sm-sub-q-count {
    font-weight: 600; font-size: 13px; color: var(--text);
    margin-bottom: 12px;
  }
  
  /* ── Keyword List ── */
  .sm-keyword-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 32px;
    gap: 8px;
    align-items: center;
    margin-bottom: 8px;
  }
`;

export default SPEAKING_CSS;
