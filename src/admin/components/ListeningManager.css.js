const LISTENING_CSS = `
  .lm-wrap *,
  .lm-wrap *::before,
  .lm-wrap *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .lm-wrap {
    --surface:      #ffffff;
    --surface2:     #FFF8F4;
    --text:         var(--text, #1C1C1E);
    --text2:        var(--text-secondary, #3A3A3C);
    --border:       rgba(255, 107, 53, 0.22);
    --border-strong:rgba(255, 107, 53, 0.38);
    --accent:       var(--or1, #FF6B35);
    --accent-light: rgba(255, 107, 53, 0.12);
    --radius:       14px;
    --font:         'DM Sans', sans-serif;
    font-family: var(--font);
    color: var(--text);
  }

  /* ── Khung ngoài ── */
  .lm-top-panel {
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: var(--radius);
    padding: 18px 20px;
    margin-bottom: 16px;
    box-shadow: 0 4px 20px rgba(255, 107, 53, 0.07);
  }
  .lm-page-header {
    display: flex; align-items: center; gap: 14px;
  }
  .lm-page-title {
    font-family: 'Syne', sans-serif;
    font-size: 22px; font-weight: 800; color: var(--text);
    letter-spacing: -0.3px;
  }
  .lm-page-sub { font-size: 13px; color: var(--text2); margin-top: 4px; }

  .lm-tabs-panel {
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: var(--radius);
    padding: 10px 12px 0;
    margin-bottom: 16px;
    box-shadow: 0 2px 12px rgba(255, 107, 53, 0.05);
  }
  .lm-tabs {
    display: flex; gap: 8px;
    border-bottom: none;
    margin-bottom: 0;
  }
  .lm-tab {
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
  }
  .lm-tab:hover {
    color: var(--accent);
    background: var(--accent-light);
    border-color: var(--border);
  }
  .lm-tab.active {
    color: var(--accent);
    background: var(--accent-light);
    border-color: var(--border-strong);
    border-bottom-color: var(--surface);
    box-shadow: 0 -2px 0 var(--accent) inset;
  }

  .lm-content-panel {
    background: transparent;
  }

  /* ── Buttons ── */
  .lm-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 8px;
    font-size: 13px; font-weight: 500; cursor: pointer;
    border: none; transition: all 0.15s; font-family: var(--font);
  }
  .lm-btn svg { width: 14px; height: 14px; flex-shrink: 0; }
  .lm-btn-primary {
    background: var(--accent); color: #fff;
    box-shadow: 0 4px 14px rgba(255, 107, 53, 0.25);
  }
  .lm-btn-primary:hover { opacity: 0.92; transform: translateY(-1px); }
  .lm-btn-ghost {
    background: var(--surface);
    color: var(--text2);
    border: 1.5px solid var(--border);
  }
  .lm-btn-ghost:hover {
    background: var(--accent-light);
    color: var(--accent);
    border-color: var(--border-strong);
  }
  .lm-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  /* ── Layout 2 cột ── */
  .lm-two-col {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 20px; align-items: start;
  }
  @media (max-width: 960px) {
    .lm-two-col { grid-template-columns: 1fr; }
  }

  /* ── Card chính ── */
  .lm-card {
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: var(--radius);
    padding: 20px 22px;
    box-shadow: 0 6px 28px rgba(255, 107, 53, 0.08);
  }
  .lm-card-head {
    padding-bottom: 14px;
    margin-bottom: 18px;
    border-bottom: 1.5px solid var(--border);
  }
  .lm-card-title {
    font-family: 'Syne', sans-serif;
    font-size: 16px; font-weight: 700; color: var(--text);
  }
  .lm-card-desc {
    font-size: 12.5px; color: var(--text2); margin-top: 4px;
  }

  /* ── Section khung con ── */
  .lm-section {
    background: var(--surface2);
    border: 1.5px solid var(--border);
    border-radius: 12px;
    padding: 16px 18px;
    margin-bottom: 14px;
  }
  .lm-section:last-of-type { margin-bottom: 0; }
  .lm-section-title {
    font-size: 11px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.08em;
    color: var(--accent);
    margin-bottom: 14px;
    padding-bottom: 8px;
    border-bottom: 1px dashed var(--border);
  }

  /* ── Form ── */
  .lm-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .lm-form-group { margin-bottom: 16px; }
  .lm-label {
    display: block; font-size: 11.5px; font-weight: 700;
    color: var(--text2); margin-bottom: 6px;
    text-transform: uppercase; letter-spacing: 0.06em;
  }
  .lm-input, .lm-select, .lm-textarea {
    width: 100%; padding: 10px 12px;
    border: 1.5px solid var(--border); border-radius: 8px;
    font-size: 13.5px; background: #fff; color: var(--text);
    font-family: var(--font); transition: all 0.15s; outline: none;
  }
  .lm-input:focus, .lm-select:focus, .lm-textarea:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.15);
  }
  .lm-textarea { resize: vertical; min-height: 72px; }
  .lm-select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23FF6B35' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    padding-right: 32px;
  }

  .lm-upload {
    border: 2px dashed var(--border-strong);
    border-radius: 10px; padding: 22px;
    text-align: center; cursor: pointer;
    background: #fff;
    transition: all 0.15s; color: var(--text2);
  }
  .lm-upload:hover {
    border-color: var(--accent);
    background: var(--accent-light); color: var(--accent);
  }
  .lm-upload svg { width: 24px; height: 24px; margin: 0 auto 8px; display: block; }
  .lm-upload p { font-size: 13px; }
  .lm-upload .lm-hint { font-size: 11px; margin-top: 4px; opacity: 0.85; }

  .lm-audio-player {
    background: #fff; border: 1.5px solid var(--border);
    border-radius: 10px; padding: 10px 14px;
    display: flex; align-items: center; gap: 10px; margin-top: 10px;
  }
  .lm-play-btn {
    width: 34px; height: 34px; border-radius: 50%;
    background: var(--accent); border: none;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; flex-shrink: 0;
  }
  .lm-play-btn svg { width: 14px; height: 14px; color: #fff; }
  .lm-audio-bar {
    flex: 1; height: 4px; background: var(--border);
    border-radius: 2px; overflow: hidden;
  }
  .lm-audio-progress {
    height: 100%; background: var(--accent);
    width: 35%; border-radius: 2px;
  }
  .lm-audio-time { font-size: 12px; color: var(--text2); white-space: nowrap; }

  .lm-option-row {
    display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
  }
  .lm-option-letter {
    width: 30px; height: 30px; border-radius: 50%;
    border: 1.5px solid var(--border-strong);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; flex-shrink: 0;
    color: var(--text2); background: #fff;
    transition: all 0.15s;
  }
  .lm-option-letter.correct {
    border-color: var(--accent);
    background: var(--accent-light); color: var(--accent);
  }
  .lm-answer-radio { accent-color: var(--accent); cursor: pointer; width: 16px; height: 16px; }

  .lm-ai-btn {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 12px; font-weight: 600; padding: 6px 12px;
    border-radius: 8px; background: var(--accent-light);
    color: var(--accent); border: 1.5px solid var(--border);
    cursor: pointer; transition: all 0.15s; font-family: var(--font);
  }
  .lm-ai-btn:hover { border-color: var(--accent); }
  .lm-ai-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .lm-spinning { animation: lm-spin 1s linear infinite; }
  @keyframes lm-spin { to { transform: rotate(360deg); } }

  .lm-label-row {
    display: flex; align-items: center;
    justify-content: space-between; margin-bottom: 6px;
  }
  .lm-form-actions {
    display: flex; gap: 10px; justify-content: flex-end;
    margin-top: 18px; padding-top: 16px;
    border-top: 1.5px solid var(--border);
  }

  /* ── Preview cột phải ── */
  .lm-preview-wrap {
    background: var(--surface);
    border: 1.5px solid var(--border);
    border-radius: var(--radius);
    padding: 18px;
    box-shadow: 0 6px 28px rgba(255, 107, 53, 0.08);
    position: sticky; top: 20px;
  }
  .lm-preview-wrap .lm-card-head {
    margin-bottom: 14px; padding-bottom: 12px;
  }
  .lm-preview {
    background: var(--surface2);
    border: 1.5px solid var(--border);
    border-radius: 12px; padding: 14px;
  }
  .lm-preview-title {
    font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.1em;
    color: var(--text2); margin-bottom: 12px;
  }
  .lm-preview-media {
    background: #fff; border-radius: 10px; padding: 16px;
    margin-bottom: 12px; min-height: 110px;
    display: flex; align-items: center; justify-content: center;
    border: 1.5px dashed var(--border-strong);
    color: var(--text2); font-size: 13px;
  }
  .lm-preview-card {
    background: #fff; border-radius: 10px;
    padding: 14px; border: 1.5px solid var(--border);
    margin-bottom: 10px;
  }
  .lm-preview-q {
    font-size: 13px; font-weight: 600; color: var(--text);
    margin-bottom: 12px; line-height: 1.5;
  }
  .lm-preview-opt {
    padding: 9px 12px; border-radius: 8px;
    border: 1.5px solid var(--border);
    font-size: 12px; margin-bottom: 8px;
    background: #fff; color: var(--text);
    transition: all 0.15s;
  }
  .lm-preview-opt.selected {
    border-color: var(--accent);
    background: var(--accent-light);
    color: var(--accent); font-weight: 500;
  }
  .lm-preview-explanation {
    padding: 12px; background: #fff;
    border-radius: 10px; border: 1.5px solid var(--border);
  }
  .lm-preview-explanation-label {
    font-size: 10px; font-weight: 700;
    color: var(--accent); margin-bottom: 6px;
    text-transform: uppercase; letter-spacing: 0.06em;
  }
  .lm-preview-explanation-text {
    font-size: 12px; color: var(--text); line-height: 1.6;
    white-space: pre-wrap;
  }

  /* ── Group Part 3–4 ── */
  .lm-group-card {
    background: var(--surface2);
    border: 1.5px solid var(--border-strong);
    border-radius: 12px; padding: 18px; margin-bottom: 16px;
  }
  .lm-group-header {
    font-size: 14px; font-weight: 700; color: var(--text);
    margin-bottom: 14px; padding-bottom: 10px;
    border-bottom: 1px dashed var(--border);
    display: flex; align-items: center; justify-content: space-between;
  }
  .lm-sub-q {
    background: #fff; border: 1.5px solid var(--border);
    border-radius: 10px; padding: 14px; margin-bottom: 10px;
  }
  .lm-sub-q-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 10px;
  }
  .lm-sub-q-label { font-size: 12px; font-weight: 700; color: var(--accent); }
  .lm-sub-q-count {
    font-weight: 600; font-size: 13px; color: var(--text);
    margin-bottom: 12px;
  }
`;

export default LISTENING_CSS;
