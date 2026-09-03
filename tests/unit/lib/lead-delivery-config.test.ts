import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  missingEnvFor,
  isChannelConfigured,
  missingLeadEnv,
  reportLeadDeliveryConfig,
  resetLeadConfigWarningForTests,
} from '@/lib/lead-delivery-config';

/**
 * These tests encode the production incident of 2026-08-14 → 2026-09-03, when
 * the contact form accepted 7 submissions and delivered none because the
 * deployment carried no RESEND_API_KEY and no ODOO_* vars.
 *
 * Note what the EXISTING suite did: tests/unit/lib/email.test.ts has a passing
 * case named "should return false when RESEND_API_KEY is not set". The exact
 * production condition was asserted as correct behaviour, so a green suite was
 * compatible with every lead being dropped. The point of this file is that the
 * same condition is now *reported*, not merely tolerated.
 */

const LEAD_VARS = [
  'RESEND_API_KEY', 'EMAIL_FROM',
  'ODOO_BASE_URL', 'ODOO_API_KEY', 'ODOO_DB',
  'TELEGRAM_BOT_TOKEN',
];

let saved: Record<string, string | undefined>;

beforeEach(() => {
  saved = Object.fromEntries(LEAD_VARS.map((k) => [k, process.env[k]]));
  for (const k of LEAD_VARS) delete process.env[k];
  resetLeadConfigWarningForTests();
});

afterEach(() => {
  for (const [k, v] of Object.entries(saved)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  vi.restoreAllMocks();
});

describe('lead delivery config', () => {
  it('reports exactly the production configuration that lost the leads', () => {
    // Nothing set — the state ns/reno-stars was actually in for ~20 days.
    expect(missingLeadEnv()).toEqual({
      email: ['RESEND_API_KEY', 'EMAIL_FROM'],
      crm: ['ODOO_BASE_URL', 'ODOO_API_KEY', 'ODOO_DB'],
      alerting: ['TELEGRAM_BOT_TOKEN'],
    });
    expect(isChannelConfigured('email')).toBe(false);
    expect(isChannelConfigured('crm')).toBe(false);
  });

  it('treats an empty string as missing, not as configured', () => {
    process.env.RESEND_API_KEY = '';
    process.env.EMAIL_FROM = '';
    expect(missingEnvFor('email')).toEqual(['RESEND_API_KEY', 'EMAIL_FROM']);
  });

  it('reports a PARTIALLY configured channel — the subtler failure', () => {
    // A key without a verified sender still cannot deliver.
    process.env.RESEND_API_KEY = 're_test';
    expect(missingEnvFor('email')).toEqual(['EMAIL_FROM']);
    expect(isChannelConfigured('email')).toBe(false);
  });

  it('logs one structured error naming the missing vars, and only once', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(reportLeadDeliveryConfig()).toBe(false);
    expect(err).toHaveBeenCalledTimes(1);

    const payload = JSON.parse(err.mock.calls[0][0] as string);
    expect(payload.event).toBe('lead.config.incomplete');
    expect(payload.missing.email).toContain('RESEND_API_KEY');
    expect(payload.missing.crm).toContain('ODOO_BASE_URL');

    // Called on every submission; must not flood the log.
    reportLeadDeliveryConfig();
    reportLeadDeliveryConfig();
    expect(err).toHaveBeenCalledTimes(1);
  });

  it('stays silent and returns true when everything is configured', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    for (const k of LEAD_VARS) process.env[k] = 'set';

    expect(reportLeadDeliveryConfig()).toBe(true);
    expect(err).not.toHaveBeenCalled();
  });

  it('does not throw — a mail misconfiguration must not take the site down', () => {
    expect(() => reportLeadDeliveryConfig()).not.toThrow();
  });
});
