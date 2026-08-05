import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import ZhTrustLine, { zhTrustLine, WeChatContactCard } from '@/components/ZhTrustSignals';
import { WECHAT_ID, COMPANY_STATS } from '@/lib/company-config';

describe('zhTrustLine', () => {
  it('builds the full Simplified line with the live rating interpolated', () => {
    expect(zhTrustLine('zh', 5)).toBe(
      '政府牌照注册 · WCB工伤保险 · $500万商业责任险 · 最长3年质保 · Google 5.0星好评'
    );
  });

  it('derives the liability + warranty segments from COMPANY_STATS, not literals (finding #5)', () => {
    // $5M → 500万 (万 = 10,000): dollars / 10,000. Computed from the SSOT so
    // this expectation tracks any future change to COMPANY_STATS.
    const wan = Math.round(parseFloat(COMPANY_STATS.liabilityCoverage.replace(/[^0-9.]/g, '')) * 100);
    const zh = zhTrustLine('zh', 5)!;
    const hant = zhTrustLine('zh-Hant', 5)!;
    expect(zh).toContain(`$${wan}万商业责任险`);
    expect(zh).toContain(`最长${COMPANY_STATS.warrantyYears}年质保`);
    expect(hant).toContain(`$${wan}萬商業責任險`);
    expect(hant).toContain(`最長${COMPANY_STATS.warrantyYears}年質保`);
  });

  it('builds the Traditional line', () => {
    expect(zhTrustLine('zh-Hant', 5)).toBe(
      '政府牌照註冊 · WCB工傷保險 · $500萬商業責任險 · 最長3年質保 · Google 5.0星好評'
    );
  });

  it('omits the Google segment when no rating is available (no fabrication)', () => {
    expect(zhTrustLine('zh')).toBe('政府牌照注册 · WCB工伤保险 · $500万商业责任险 · 最长3年质保');
    expect(zhTrustLine('zh', 0)).not.toContain('Google');
  });

  it('returns null for non-Chinese locales', () => {
    expect(zhTrustLine('en', 5)).toBeNull();
    expect(zhTrustLine('ko', 5)).toBeNull();
  });
});

describe('ZhTrustLine component', () => {
  it('renders the band on zh and nothing on en', () => {
    const zhHtml = renderToStaticMarkup(<ZhTrustLine locale="zh" rating={4.9} />);
    expect(zhHtml).toContain('Google 4.9星好评');
    expect(renderToStaticMarkup(<ZhTrustLine locale="en" rating={4.9} />)).toBe('');
  });
});

describe('WeChatContactCard', () => {
  it('renders QR asset, WeChat ID, and localized brand on zh', () => {
    const html = renderToStaticMarkup(<WeChatContactCard locale="zh" />);
    expect(html).toContain('wechat-qr.png');
    expect(html).toContain(WECHAT_ID);
    expect(html).toContain('聚星装修 (Reno Stars)'); // owner rule: both names surfaced
  });

  it('renders the Traditional brand on zh-Hant', () => {
    const html = renderToStaticMarkup(<WeChatContactCard locale="zh-Hant" />);
    expect(html).toContain('聚星裝修 (Reno Stars)');
  });

  it('renders nothing for non-Chinese locales', () => {
    expect(renderToStaticMarkup(<WeChatContactCard locale="en" />)).toBe('');
    expect(renderToStaticMarkup(<WeChatContactCard locale="ja" compact />)).toBe('');
  });
});
