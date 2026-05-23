import React from 'react';
import { useState } from "react";
import { Zap } from "lucide-react";

export default function AIPage() {
  const [temp, setTemp] = useState(0.7);
  const [tokens, setTokens] = useState(2048);
  const [toggles, setToggles] = useState({
    autoGen:   true,
    autoTag:   false,
    smartHint: true,
    analytics: true,
  });

  const toggle = k => setToggles(p => ({ ...p, [k]: !p[k] }));

  return (
    <div className="page-enter">
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 className="page-title">Cấu hình AI</h1>
            <p className="page-subtitle">Điều chỉnh tham số mô hình AI và tính năng thông minh</p>
          </div>
          <button className="btn btn-primary"><Zap size={15} />Lưu cấu hình</button>
        </div>
      </div>

      <div className="ai-config-grid">
        {/* Model params */}
        <div className="card">
          <div className="card-header"><span className="card-title">🤖 Tham số Mô hình</span></div>

          <div className="config-item">
            <div className="config-label">Model Engine</div>
            <select className="config-input" style={{ cursor: "pointer" }}>
              <option>GPT-4o (OpenAI)</option>
              <option>Claude 3.5 Sonnet (Anthropic)</option>
              <option>Gemini 1.5 Pro (Google)</option>
            </select>
          </div>

          <div className="config-item">
            <div className="config-label">API Key</div>
            <input type="password" className="config-input" value="sk-••••••••••••••••••••••••••••" readOnly />
          </div>

          <div className="config-item">
            <div className="config-label">Temperature: <strong>{temp.toFixed(1)}</strong></div>
            <input
              type="range" min={0} max={2} step={0.1} value={temp}
              onChange={e => setTemp(+e.target.value)}
              className="config-slider" style={{ width: "100%", marginTop: 8 }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-tertiary)", marginTop: 4 }}>
              <span>Chính xác (0)</span><span>Sáng tạo (2)</span>
            </div>
          </div>

          <div className="config-item">
            <div className="config-label">Max Tokens: <strong>{tokens.toLocaleString()}</strong></div>
            <input
              type="range" min={256} max={8192} step={256} value={tokens}
              onChange={e => setTokens(+e.target.value)}
              className="config-slider" style={{ width: "100%", marginTop: 8 }}
            />
          </div>

          <div className="config-item">
            <div className="config-label">System Prompt</div>
            <textarea
              className="config-input" rows={4}
              style={{ height: "auto", padding: "10px 12px", resize: "vertical" }}
              defaultValue="Bạn là trợ lý AI chuyên tạo câu hỏi TOEIC chất lượng cao theo chuẩn ETS. Hãy tạo câu hỏi rõ ràng, tự nhiên và phù hợp với ngữ cảnh thực tế..."
            />
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Feature toggles */}
          <div className="card">
            <div className="card-header"><span className="card-title">⚡ Tính năng AI</span></div>
            {[
              { key: "autoGen",   label: "Tự động tạo câu hỏi", desc: "AI tự sinh câu hỏi theo Part được chọn"           },
              { key: "autoTag",   label: "Tự động gán nhãn",     desc: "Phân loại câu hỏi theo chủ đề & cấp độ"           },
              { key: "smartHint", label: "Gợi ý thông minh",     desc: "Cung cấp giải thích chi tiết cho người dùng"      },
              { key: "analytics", label: "AI Analytics",          desc: "Phân tích điểm yếu và đề xuất lộ trình học"       },
            ].map(({ key, label, desc }) => (
              <div key={key} className="config-toggle" style={{ marginBottom: 8 }} onClick={() => toggle(key)}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{label}</div>
                  <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 2 }}>{desc}</div>
                </div>
                <div className={`toggle-switch${toggles[key] ? " on" : ""}`}>
                  <div className="toggle-knob" />
                </div>
              </div>
            ))}
          </div>

          {/* AI stats */}
          <div className="card">
            <div className="card-header"><span className="card-title">📊 Trạng thái AI</span></div>
            {[
              { label: "Câu hỏi AI đã tạo",       val: "1,248", color: "var(--accent)" },
              { label: "Độ chính xác phân loại",   val: "94.2%", color: "var(--green)"  },
              { label: "Thời gian phản hồi TB",    val: "1.4s",  color: "var(--blue)"   },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
