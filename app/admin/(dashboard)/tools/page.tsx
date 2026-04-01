'use client';

import { useState, useRef } from 'react';
import { CARD, NAVY, TEXT, TEXT_MID, ERROR, neu } from '@/lib/theme';

interface ProgressLine {
  done?: number;
  total?: number;
  slug?: string;
  ok?: boolean;
  skipped?: boolean;
  error?: string;
  finished?: boolean;
  processed?: number;
  errors?: number;
  message?: string;
  variants?: number;
}

export default function ToolsPage() {
  const [running, setRunning] = useState(false);
  const [lines, setLines] = useState<ProgressLine[]>([]);
  const [summary, setSummary] = useState<ProgressLine | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  async function runProcessImages(force = false) {
    setRunning(true);
    setLines([]);
    setSummary(null);

    try {
      const res = await fetch('/admin/api/process-all-images/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force }),
      });

      if (!res.ok || !res.body) {
        setLines([{ error: `HTTP ${res.status}` }]);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const parts = buf.split('\n');
        buf = parts.pop() || '';
        for (const part of parts) {
          if (!part.trim()) continue;
          try {
            const line: ProgressLine = JSON.parse(part);
            if (line.finished) {
              setSummary(line);
            } else {
              setLines(prev => {
                const next = [...prev, line];
                // Keep last 200 lines only
                return next.length > 200 ? next.slice(-200) : next;
              });
              setTimeout(() => logRef.current?.scrollTo(0, logRef.current.scrollHeight), 10);
            }
          } catch { /* ignore parse errors */ }
        }
      }
    } catch (e) {
      setLines(prev => [...prev, { error: String(e) }]);
    } finally {
      setRunning(false);
    }
  }

  const btnStyle = (color: string, disabled: boolean): React.CSSProperties => ({
    padding: '0.6rem 1.2rem',
    background: disabled ? '#ccc' : color,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '0.9rem',
    ...neu,
  });

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ color: TEXT, fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        🛠 Admin Tools
      </h1>
      <p style={{ color: TEXT_MID, marginBottom: '2rem', fontSize: '0.9rem' }}>
        One-off maintenance operations. These run server-side with full credentials.
      </p>

      {/* Image Processing */}
      <div style={{ background: CARD, borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem', ...neu }}>
        <h2 style={{ color: TEXT, fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          🖼 Process Images to WebP
        </h2>
        <p style={{ color: TEXT_MID, fontSize: '0.875rem', marginBottom: '1rem', lineHeight: 1.5 }}>
          Generates optimized WebP variants (320–1920px) for all R2 images and stores them back in R2.
          After running, images are served directly from R2 CDN — no Vercel Fluid CPU needed.
          Safe to run multiple times (skips already-processed images).
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            style={btnStyle(NAVY, running)}
            disabled={running}
            onClick={() => runProcessImages(false)}
          >
            {running ? '⏳ Processing…' : '▶ Run (skip existing)'}
          </button>
          <button
            style={btnStyle(ERROR, running)}
            disabled={running}
            onClick={() => runProcessImages(true)}
          >
            🔁 Force re-process all
          </button>
        </div>

        {/* Progress log */}
        {lines.length > 0 && (
          <div
            ref={logRef}
            style={{
              marginTop: '1rem',
              background: '#0f1117',
              color: '#d4d4d4',
              fontFamily: 'monospace',
              fontSize: '0.78rem',
              padding: '0.75rem',
              borderRadius: 8,
              height: 300,
              overflowY: 'auto',
              lineHeight: 1.6,
            }}
          >
            {lines.map((line, i) => {
              if (line.message) return <div key={i} style={{ color: '#888' }}># {line.message}</div>;
              const icon = line.error ? '✗' : line.skipped ? '·' : '✓';
              const color = line.error ? '#f87171' : line.skipped ? '#6b7280' : '#4ade80';
              const detail = line.error
                ? ` ERR: ${line.error}`
                : line.skipped
                  ? ' (skipped)'
                  : line.variants ? ` → ${line.variants} variants` : '';
              return (
                <div key={i} style={{ color }}>
                  {icon} [{line.done}/{line.total}] {line.slug}{detail}
                </div>
              );
            })}
          </div>
        )}

        {/* Summary */}
        {summary && (
          <div style={{
            marginTop: '0.75rem',
            padding: '0.75rem 1rem',
            background: summary.errors ? '#fef2f2' : '#f0fdf4',
            borderRadius: 8,
            fontSize: '0.875rem',
            color: summary.errors ? ERROR : '#166534',
            fontWeight: 600,
          }}>
            ✅ Done — Processed: {summary.processed} | Skipped: {summary.skipped} | Errors: {summary.errors}
          </div>
        )}
      </div>
    </div>
  );
}
