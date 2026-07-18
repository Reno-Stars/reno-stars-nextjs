import type { Metadata } from 'next';
import Link from 'next/link';
import { NAVY, TEXT_MID, SURFACE, CARD, GOLD } from '@/lib/theme';

/**
 * Reno Stars Companion account & data deletion request page.
 *
 * Google Play (Data safety → "provide a way for users to request that their
 * data is deleted") requires apps that let users create an account to expose a
 * publicly reachable URL that explains how to request account + data deletion,
 * what data is deleted, and what is retained. A privacy-policy contact line is
 * not sufficient on its own — Google's reviewer looks for a dedicated deletion
 * URL. This page is that URL:
 * https://www.reno-stars.com/geoclockr/delete-account/
 *
 * It is the developer-facing "web deletion" path; the app itself is
 * invite-based (an employer administrator provisions and removes workers), so
 * most deletions happen through the employer, but this page guarantees a route
 * that does not depend on the employer.
 *
 * Sibling of app/geoclockr/privacy/ — intentionally outside `[locale]/`, a
 * compliance surface (not SEO), locale-free URL to match what is submitted to
 * the stores. Indexable so reviewers and users can both reach it.
 */

const LAST_UPDATED = '18 July 2026';
const CONTACT_EMAIL = 'airenostars@gmail.com';
const DELETION_SUBJECT = 'Reno Stars Companion — account deletion request';

export const metadata: Metadata = {
  title: 'Request Account Deletion — Reno Stars Companion | Reno Stars',
  description:
    'How to request deletion of your Reno Stars Companion account and personal data, what is deleted, and what is retained for payroll and legal recordkeeping.',
  alternates: { canonical: '/geoclockr/delete-account/' },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: '2rem' }}>
      <h2 className="text-xl font-bold mb-3" style={{ color: NAVY }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function RenoStarsCompanionDeleteAccountPage() {
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(DELETION_SUBJECT)}`;
  return (
    <main
      id="main-content"
      className="min-h-screen py-16 px-4"
      style={{ backgroundColor: SURFACE }}
    >
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2" style={{ color: NAVY }}>
          Reno Stars Companion — Request Account &amp; Data Deletion
        </h1>
        <p className="text-sm mb-8" style={{ color: TEXT_MID }}>
          Last updated: {LAST_UPDATED}
        </p>

        <div className="text-base leading-relaxed" style={{ color: TEXT_MID }}>
          <p>
            Reno Stars Companion (&ldquo;the app&rdquo;) is a workforce time-tracking app operated by
            Reno Stars. This page explains how you can request deletion of your account and the
            personal data associated with it, what we delete, and what we may keep.
          </p>

          <aside
            className="my-6 p-5 rounded-lg"
            style={{ backgroundColor: CARD, borderLeft: `4px solid ${GOLD}` }}
          >
            <p>
              <strong style={{ color: NAVY }}>How to request deletion.</strong> Email us at{' '}
              <a href={mailto} style={{ color: GOLD }}>
                {CONTACT_EMAIL}
              </a>{' '}
              from the email address on your account, with the subject &ldquo;{DELETION_SUBJECT}
              &rdquo;. Tell us the name of your employer / organization so we can locate your
              account. If you can no longer access that email address, contact us anyway and we will
              verify your identity another way before deleting anything.
            </p>
          </aside>

          <Section title="Who can request deletion">
            <p className="mb-3">
              Reno Stars Companion is an employer tool: your organization&rsquo;s administrator
              provisions accounts and can remove your access at any time from their admin tools. You
              do not have to go through your employer to have your personal data deleted — you can
              request it directly from us using the email above, and we will honor it.
            </p>
          </Section>

          <Section title="What we delete">
            <p className="mb-3">
              When we process a deletion request, we permanently delete the personal data tied to
              your account, including:
            </p>
            <ul className="list-disc pl-6 mb-3 space-y-1">
              <li>your profile — name, email address, and profile photo;</li>
              <li>your location history and position records;</li>
              <li>the device identifier and push-notification token linked to your account;</li>
              <li>diagnostic and technical logs associated with your account.</li>
            </ul>
          </Section>

          <Section title="What may be retained, and why">
            <p className="mb-3">
              Some records are kept, or anonymized rather than deleted, where they are required for
              payroll or legal recordkeeping — these are records <em>your employer</em> is obligated
              to keep:
            </p>
            <ul className="list-disc pl-6 mb-3 space-y-1">
              <li>
                <strong style={{ color: NAVY }}>Clock in/out times and timesheets</strong> — the
                hours you worked, retained as employment/payroll records for as long as your
                employer is legally required to keep them. Where possible these are dissociated from
                your identifying profile.
              </li>
              <li>
                <strong style={{ color: NAVY }}>Job-site records you created</strong> (photos,
                videos, tasks, checklist completions) — retained as part of your employer&rsquo;s
                work records.
              </li>
            </ul>
            <p className="mb-3">
              <strong style={{ color: NAVY }}>Location history</strong> is in all cases automatically
              and permanently deleted 90 days after it is recorded, whether or not you request
              deletion.
            </p>
          </Section>

          <Section title="Timeline">
            <p>
              We acknowledge deletion requests within a few business days and complete deletion
              within <strong>30 days</strong>, except for the payroll/legal records described above,
              which are retained only for as long as legally required and then deleted or anonymized.
            </p>
          </Section>

          <Section title="Contact">
            <p className="mb-1">
              <strong style={{ color: NAVY }}>Reno Stars — Reno Stars Companion</strong>
            </p>
            <p className="mb-1">
              Email:{' '}
              <a href={mailto} style={{ color: GOLD }}>
                {CONTACT_EMAIL}
              </a>
            </p>
            <p className="mb-1">Vancouver, BC, Canada</p>
            <p>
              See also our{' '}
              <Link href="/geoclockr/privacy/" style={{ color: GOLD }}>
                Privacy Policy
              </Link>
              .
            </p>
          </Section>
        </div>
      </div>
    </main>
  );
}
