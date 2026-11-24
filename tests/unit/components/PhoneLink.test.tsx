import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { render, fireEvent } from '@testing-library/react';
import PhoneLink from '@/components/PhoneLink';

describe('PhoneLink', () => {
  it('renders exactly the markup of a plain tel: anchor', () => {
    const plain = renderToStaticMarkup(
      <a href="tel:778-960-7999" className="px-6 py-3" style={{ color: 'red' }} aria-label="Call 778-960-7999">
        <span>Call</span>
      </a>,
    );
    const linked = renderToStaticMarkup(
      <PhoneLink
        href="tel:778-960-7999"
        phone="778-960-7999"
        trackingLocation="sticky_combo"
        className="px-6 py-3"
        style={{ color: 'red' }}
        aria-label="Call 778-960-7999"
      >
        <span>Call</span>
      </PhoneLink>,
    );
    expect(linked).toBe(plain);
  });

  describe('on click', () => {
    const gtag = vi.fn();
    const realLocation = window.location;
    // Records whether PhoneLink let the dial through, then stops jsdom from
    // attempting the tel: navigation (it only logs "Not implemented").
    let dialAllowed: boolean[] = [];
    const observe = (e: Event) => {
      dialAllowed.push(!e.defaultPrevented);
      e.preventDefault();
    };

    beforeEach(() => {
      gtag.mockReset();
      dialAllowed = [];
      window.addEventListener('click', observe);
      window.gtag = gtag;
      // isAnalyticsEnabled() skips localhost; pretend to be the live host.
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: { ...realLocation, hostname: 'www.reno-stars.com' },
      });
    });
    afterEach(() => {
      window.removeEventListener('click', observe);
      delete window.gtag;
      Object.defineProperty(window, 'location', { configurable: true, value: realLocation });
    });

    it('sends phone_click with the number, location and beacon transport, and keeps the caller onClick', () => {
      const own = vi.fn();
      const { getByText } = render(
        <PhoneLink href="tel:+17789607999" phone="778-960-7999" trackingLocation="footer" onClick={own}>
          Call
        </PhoneLink>,
      );
      fireEvent.click(getByText('Call'));
      expect(own).toHaveBeenCalledTimes(1);
      expect(dialAllowed).toEqual([true]);
      expect(gtag).toHaveBeenCalledWith('event', 'phone_click', {
        phone_number: '778-960-7999',
        link_location: 'footer',
        transport_type: 'beacon',
      });
    });

    it('defaults phone_number to the href and does not prevent the dial', () => {
      const { getByText } = render(<PhoneLink href="tel:+17789607999">Call</PhoneLink>);
      fireEvent.click(getByText('Call'));
      expect(dialAllowed).toEqual([true]);
      expect(gtag).toHaveBeenCalledWith('event', 'phone_click', {
        phone_number: '+17789607999',
        transport_type: 'beacon',
      });
    });
  });
});

describe('every click-to-call link goes through PhoneLink', () => {
  it('has no raw <a> with a tel: href in components/ or app/', () => {
    const files = execSync('git ls-files components app', { encoding: 'utf8' })
      .split('\n')
      .filter((f) => f.endsWith('.tsx') && f !== 'components/PhoneLink.tsx');
    const offenders: string[] = [];
    for (const file of files) {
      const src = readFileSync(file, 'utf8');
      for (const m of src.matchAll(/href=(\{[^}]*\btel\b[^}]*\}|"tel:[^"]*")/g)) {
        const tagStart = src.lastIndexOf('<', m.index);
        const tag = src.slice(tagStart, m.index).split(/\s/)[0];
        if (tag !== '<PhoneLink') offenders.push(`${file}: ${tag} ${m[1]}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
