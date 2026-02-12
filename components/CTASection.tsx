import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { GOLD, SURFACE_ALT, CARD, TEXT, TEXT_MID, neu } from '@/lib/theme';

interface CTASectionProps {
  heading: string;
  subtitle: string;
  /** Background color (defaults to SURFACE_ALT) */
  bg?: string;
  /** Show the "Call Now" button (defaults to true) */
  showCallButton?: boolean;
  /** Phone number for the call button */
  phone?: string;
}

export default function CTASection({ heading, subtitle, bg = SURFACE_ALT, showCallButton = true, phone }: CTASectionProps) {
  const t = useTranslations();

  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: bg }}>
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: TEXT }}>
          {heading}
        </h2>
        <p className="text-base mb-6" style={{ color: TEXT_MID }}>
          {subtitle}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/contact"
            className="px-6 sm:px-8 py-3 rounded-xl text-sm font-semibold cursor-pointer text-white transition-all duration-200 hover:brightness-110"
            style={{ backgroundColor: GOLD, boxShadow: `0 4px 20px ${GOLD}44` }}
          >
            {t('cta.getFreeQuote')}
          </Link>
          {showCallButton && phone && (
            <a
              href={`tel:${phone}`}
              className="px-6 sm:px-8 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200"
              style={{ boxShadow: neu(4), backgroundColor: CARD, color: TEXT }}
            >
              {t('cta.callNow')}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
