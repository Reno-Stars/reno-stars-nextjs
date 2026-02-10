import { describe, it, expect } from 'vitest';
import { parseJsonResponse, AI_CONFIG } from '@/lib/ai/openai';

describe('parseJsonResponse', () => {
  it('parses plain JSON', () => {
    const input = '{"key": "value", "number": 42}';
    const result = parseJsonResponse<{ key: string; number: number }>(input);
    expect(result).toEqual({ key: 'value', number: 42 });
  });

  it('handles JSON wrapped in ```json code blocks', () => {
    const input = '```json\n{"key": "value"}\n```';
    const result = parseJsonResponse<{ key: string }>(input);
    expect(result).toEqual({ key: 'value' });
  });

  it('handles JSON wrapped in plain ``` code blocks', () => {
    const input = '```\n{"key": "value"}\n```';
    const result = parseJsonResponse<{ key: string }>(input);
    expect(result).toEqual({ key: 'value' });
  });

  it('handles JSON with leading/trailing whitespace', () => {
    const input = '  \n  {"key": "value"}  \n  ';
    const result = parseJsonResponse<{ key: string }>(input);
    expect(result).toEqual({ key: 'value' });
  });

  it('throws on invalid JSON', () => {
    const input = 'not valid json';
    expect(() => parseJsonResponse(input)).toThrow();
  });

  it('throws on incomplete code blocks', () => {
    const input = '```json\n{"key": "value"';
    expect(() => parseJsonResponse(input)).toThrow();
  });

  it('throws descriptive error for truncated responses', () => {
    // Simulates a response truncated mid-string (doesn't end with } or ])
    const input = '{"contentEn": "some content", "contentZh": "内容被截断在这';
    expect(() => parseJsonResponse(input)).toThrow('AI response was truncated');
  });

  it('handles nested objects', () => {
    const input = '{"outer": {"inner": "value"}}';
    const result = parseJsonResponse<{ outer: { inner: string } }>(input);
    expect(result).toEqual({ outer: { inner: 'value' } });
  });

  it('handles arrays', () => {
    const input = '{"items": [1, 2, 3]}';
    const result = parseJsonResponse<{ items: number[] }>(input);
    expect(result).toEqual({ items: [1, 2, 3] });
  });
});

describe('AI_CONFIG', () => {
  it('has expected default values', () => {
    expect(AI_CONFIG.model).toBe('gpt-4o-mini');
    expect(AI_CONFIG.modelContent).toBe('gpt-4o');
    expect(AI_CONFIG.temperature).toBe(0.3);
    expect(AI_CONFIG.maxTokensContent).toBe(8192);
    expect(AI_CONFIG.maxTokensShort).toBe(1024);
    expect(AI_CONFIG.maxTokensAltText).toBe(256);
    expect(AI_CONFIG.fetchTimeoutMs).toBe(60000);
  });

  it('config is readonly', () => {
    // TypeScript should prevent modification, but we verify structure
    expect(typeof AI_CONFIG.model).toBe('string');
    expect(typeof AI_CONFIG.temperature).toBe('number');
    expect(typeof AI_CONFIG.fetchTimeoutMs).toBe('number');
  });
});
