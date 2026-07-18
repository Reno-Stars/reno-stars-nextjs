import type { Metadata } from 'next';
import Link from 'next/link';
import { NAVY, TEXT_MID, SURFACE, CARD, GOLD } from '@/lib/theme';

/**
 * Reno Stars Companion privacy policy.
 *
 * Google Play (App content → Privacy policy) and App Store Connect both
 * require a publicly reachable URL that actually renders a policy — a file
 * in the geo-clockr repo does not satisfy the requirement, and Google
 * re-checks reachability during review. This page is that URL:
 * https://www.reno-stars.com/geoclockr/privacy/
 *
 * Source of truth for the copy is `docs/legal/privacy-policy.md` in the
 * geo-clockr repo. When that file changes, mirror the change here and bump
 * LAST_UPDATED — the store listings link to this page, not to the repo.
 *
 * Intentionally outside `[locale]/`, matching the sibling `app/signup/`
 * Reno Stars Companion invite landing:
 *   - The store listings hard-code a locale-free URL. Adding locale routing
 *     would mean either /en/geoclockr/privacy (breaking the submitted URL)
 *     or a redirect Google's checker has to follow.
 *   - It is a compliance surface, not an SEO surface — it does not need the
 *     14 locale variants the marketing pages carry.
 *
 * Indexable (unlike /signup, which is noindex): app-store reviewers and
 * users should both be able to find it.
 */

const LAST_UPDATED = '15 July 2026';
const CONTACT_EMAIL = 'airenostars@gmail.com';

export const metadata: Metadata = {
  title: 'Reno Stars Companion Privacy Policy | Reno Stars',
  description:
    'How Reno Stars Companion collects, uses, and shares location, work records, and media — including background location used for automatic clock in and out.',
  alternates: { canonical: '/geoclockr/privacy/' },
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

export default function RenoStarsCompanionPrivacyPage() {
  return (
    <main
      id="main-content"
      className="min-h-screen py-16 px-4"
      style={{ backgroundColor: SURFACE }}
    >
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2" style={{ color: NAVY }}>
          Reno Stars Companion — Privacy Policy
        </h1>
        <p className="text-sm mb-8" style={{ color: TEXT_MID }}>
          Last updated: {LAST_UPDATED}
        </p>

        <div className="text-base leading-relaxed" style={{ color: TEXT_MID }}>
          <p>
            Reno Stars Companion (&ldquo;the app&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is a workforce
            time-tracking app operated by Reno Stars (&ldquo;the operator&rdquo;). Reno Stars Companion is used
            by organizations (&ldquo;employers&rdquo;) to record when their workers
            (&ldquo;you&rdquo;) arrive at and leave job sites, using the device&rsquo;s location.
            This policy explains what we collect, why, who we share it with, and the choices you
            have.
          </p>

          <aside
            className="my-6 p-5 rounded-lg"
            style={{ backgroundColor: CARD, borderLeft: `4px solid ${GOLD}` }}
          >
            <p>
              <strong style={{ color: NAVY }}>
                Please read this first — Reno Stars Companion is an employer tool.
              </strong>{' '}
              If you use Reno Stars Companion, your employer has an account and can see the location, clock
              in/out times, timesheets, photos, and job-site activity that the app records about you
              while you are on the clock or near an assigned job site. Reno Stars Companion collects location{' '}
              <strong>in the background</strong> so it can clock you in and out automatically. You
              control this through your device&rsquo;s location permission and by clocking out; see
              &ldquo;Your choices&rdquo; below.
            </p>
          </aside>

          <Section title="Information we collect">
            <p className="mb-3">
              <strong style={{ color: NAVY }}>Account information.</strong> Your name, email
              address, profile photo (optional), role, and the organization you belong to. Provided
              when your employer invites you or when you create your profile.
            </p>
            <p className="mb-3">
              <strong style={{ color: NAVY }}>
                Location information (including background location).
              </strong>{' '}
              With your permission, Reno Stars Companion collects your device&rsquo;s precise and approximate
              location:
            </p>
            <ul className="list-disc pl-6 mb-3 space-y-1">
              <li>
                to automatically clock you in when you arrive at, and out when you leave, a job site
                (this is the app&rsquo;s core function and requires <strong>background location</strong>{' '}
                — location collected while the app is closed or not in use);
              </li>
              <li>to confirm you are physically at a job site at clock-in;</li>
              <li>
                to record site presence and travel between sites while you are clocked in.
              </li>
            </ul>
            <p className="mb-3">
              Location is used for clock-in/out evaluation on our server and is stored as part of
              your timesheet and position history.
            </p>
            <p className="mb-3">
              <strong style={{ color: NAVY }}>Motion / physical-activity information.</strong>{' '}
              Reno Stars Companion uses your device&rsquo;s activity-recognition sensor to detect whether you
              are stationary or moving. This lets the app reduce location sampling when you are not
              moving, to save battery. It is not used to profile you.
            </p>
            <p className="mb-3">
              <strong style={{ color: NAVY }}>Photos, videos, and signatures.</strong> Media you
              attach to job-site records, task comments, or checklist items, and signatures you draw
              to complete checklist requirements.
            </p>
            <p className="mb-3">
              <strong style={{ color: NAVY }}>Work records.</strong> Clock events, timesheets,
              shifts, tasks, and job-site assignments associated with your account.
            </p>
            <p>
              <strong style={{ color: NAVY }}>Device and technical information.</strong> A device
              identifier, push-notification token, app version, and diagnostic/crash logs used to
              keep the service working.
            </p>
          </Section>

          <Section title="How we use information">
            <p className="mb-3">
              We use the information above to: operate automatic and manual clock-in/out; produce
              timesheets and payroll records for your employer; show job-site, task, and shift
              information; send push notifications (e.g. arrival, tasks, mentions); and maintain the
              security, reliability, and performance of the service.
            </p>
            <p>
              We do <strong>not</strong> sell your personal information, and we do{' '}
              <strong>not</strong> use it for advertising.
            </p>
          </Section>

          <Section title="Who we share information with">
            <p className="mb-3">
              <strong style={{ color: NAVY }}>Your employer.</strong> The organization that invited
              you can see your location history, clock in/out times, timesheets, photos, and
              job-site activity through their Reno Stars Companion admin tools. The app is a tool your
              employer uses to manage work; your employer is responsible for how they use this
              information.
            </p>
            <p className="mb-3">
              <strong style={{ color: NAVY }}>Service providers (processors)</strong> that operate
              the service on our behalf:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Supabase / Reno Stars backend</strong> — database, authentication, and file
                storage (self-hosted infrastructure operated by the operator).
              </li>
              <li>
                <strong>Expo (Expo Application Services)</strong> — app builds and
                push-notification delivery.
              </li>
              <li>
                <strong>Apple Push Notification service</strong> and{' '}
                <strong>Google Firebase Cloud Messaging</strong> — delivery of push notifications to
                your device.
              </li>
              <li>
                <strong>Google Maps Platform</strong> — job-site address search when an
                administrator creates a site.
              </li>
            </ul>
            <p className="mt-3">
              <strong style={{ color: NAVY }}>Legal reasons.</strong> We may disclose information if
              required by law or to protect the rights, safety, or property of users or the public.
            </p>
          </Section>

          <Section title="Data retention">
            <p className="mb-3">
              <strong style={{ color: NAVY }}>Work records</strong> — clock events, timesheets,
              photos, videos, and the job-site records you create — are kept for as long as your
              employer&rsquo;s account is active, or as required for payroll and legal
              recordkeeping.
            </p>
            <p className="mb-3">
              <strong style={{ color: NAVY }}>Location history</strong> is kept for{' '}
              <strong>90 days</strong>, then permanently deleted. We keep it that long, and no
              longer, because it is the evidence behind the hours on your timesheet: if a shift is
              ever questioned, it is what shows where you actually were. Your clock in/out times and
              timesheets are separate records and are kept as described above.
            </p>
            <p className="mb-3">
              <strong style={{ color: NAVY }}>Diagnostics</strong> — the technical reports the app
              sends to keep background tracking working — are kept for 30 days.
            </p>
            <p>
              When an account or organization is deleted, associated personal data is deleted or
              anonymized, except where retention is legally required.
            </p>
          </Section>

          <Section title="Security">
            <p>
              Data is encrypted in transit (HTTPS/TLS). Access to backend data is restricted by role
              and organization. Private files (photos, avatars, signatures) are stored in
              access-controlled buckets and served through short-lived signed URLs.
            </p>
          </Section>

          <Section title="Your choices">
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong style={{ color: NAVY }}>Location permission.</strong> You can grant,
                downgrade, or revoke location permission (including background location) at any time
                in your device settings. Automatic clock-in/out requires &ldquo;Allow all the
                time&rdquo;; without it, the app cannot detect arrival and you would clock in and
                out manually.
              </li>
              <li>
                <strong style={{ color: NAVY }}>Clocking out.</strong> When you clock out,
                continuous location tracking stops.
              </li>
              <li>
                <strong style={{ color: NAVY }}>Notifications.</strong> You can disable push
                notifications in your device settings.
              </li>
              <li>
                <strong style={{ color: NAVY }}>Access and deletion.</strong> To access, correct, or
                delete your personal data, contact your employer&rsquo;s Reno Stars Companion administrator or
                us at the address below. You can also{' '}
                <Link href="/geoclockr/delete-account/" style={{ color: GOLD }}>
                  request account and data deletion
                </Link>{' '}
                directly.
              </li>
            </ul>
          </Section>

          <Section title="Children">
            <p>
              Reno Stars Companion is a workplace app intended for adults in an employment relationship. It is
              not directed to, and must not be used by, children under 16.
            </p>
          </Section>

          <Section title="International users">
            <p>
              Your information may be processed and stored in Canada, where the operator is based.
              By using Reno Stars Companion you consent to this transfer.
            </p>
          </Section>

          <Section title="Changes to this policy">
            <p>
              We may update this policy. Material changes will be reflected by the &ldquo;Last
              updated&rdquo; date above and, where appropriate, communicated in the app.
            </p>
          </Section>

          <Section title="Contact">
            <p className="mb-1">
              <strong style={{ color: NAVY }}>Reno Stars — Reno Stars Companion</strong>
            </p>
            <p className="mb-1">
              Email:{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: GOLD }}>
                {CONTACT_EMAIL}
              </a>
            </p>
            <p className="mb-1">Vancouver, BC, Canada</p>
            <p>
              Website:{' '}
              <a href="https://www.reno-stars.com" style={{ color: GOLD }}>
                www.reno-stars.com
              </a>
            </p>
          </Section>
        </div>
      </div>
    </main>
  );
}
