import OptimizedImage from "@/components/OptimizedImage";
import { Link } from "@/navigation";
import type { Company } from "@/lib/types";
import { NAVY, GOLD } from "@/lib/theme";

interface ShowroomSectionProps {
  company: Company;
  showroom: {
    address: string;
    phone: string;
  };
  translations: {
    title: string;
    appointmentPrefix: string;
    appointmentBold: string;
    bookAppointment: string;
  };
}

export default function ShowroomSection({
  company,
  showroom,
  translations: t,
}: ShowroomSectionProps) {
  return (
    <section
      id="showroom"
      aria-labelledby="showroom-title"
      className="py-14 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: NAVY }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <OptimizedImage
          src={company.logo}
          alt={company.name}
          width={180}
          height={40}
          loading="lazy"
          placeholder="empty"
          className="h-10 w-auto object-contain mx-auto mb-5 rounded-md bg-white/95 px-3 py-1"
          style={{
            boxShadow:
              "8px 8px 20px rgba(0,0,0,0.5), -8px -8px 20px rgba(255,255,255,0.12), 0 0 30px rgba(255,255,255,0.06)",
          }}
        />
        <h2
          id="showroom-title"
          className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 text-white"
        >
          {t.title}
        </h2>
        <p className="text-base mb-2 text-white/80">
          {t.appointmentPrefix} <strong className="text-white">{t.appointmentBold}</strong>
        </p>
        <p className="text-sm text-white/70 mb-6">
          {showroom.address} <br /> {showroom.phone}
        </p>
        <Link
          href="/showroom"
          className="inline-block px-6 sm:px-8 py-3.5 rounded-xl text-base font-semibold cursor-pointer text-white transition-all duration-200 hover:brightness-110"
          style={{
            backgroundColor: GOLD,
            boxShadow: `8px 8px 20px rgba(0,0,0,0.5), -8px -8px 20px rgba(255,255,255,0.12), 0 0 30px rgba(200,146,42,0.25)`,
          }}
        >
          {t.bookAppointment}
        </Link>
      </div>
    </section>
  );
}
