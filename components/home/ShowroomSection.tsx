'use client';

import Image from 'next/image';
import { Link } from '@/navigation';
import type { Company } from '@/lib/types';
import { NAVY, GOLD } from '@/lib/theme';

interface ShowroomSectionProps {
  company: Company;
  showroom: {
    address: string;
    appointmentText: string;
    phone: string;
  };
  translations: {
    title: string;
    bookAppointment: string;
  };
}

export default function ShowroomSection({ company, showroom, translations: t }: ShowroomSectionProps) {
  return (
    <section id="showroom" aria-labelledby="showroom-title" className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: NAVY }}>
      <div className="max-w-4xl mx-auto text-center">
        <Image src={company.logo} alt={company.name} width={180} height={40} loading="lazy" className="h-10 w-auto object-contain mx-auto mb-5 rounded-md bg-white/95 px-3 py-1" />
        <h2 id="showroom-title" className="text-2xl md:text-3xl font-bold mb-3 text-white">{t.title}</h2>
        <p className="text-base mb-2 text-white/80">{showroom.appointmentText}</p>
        <p className="text-sm text-white/70 mb-6">{showroom.address} &middot; {showroom.phone}</p>
        <Link href="/contact"
          className="inline-block px-8 py-3.5 rounded-xl text-base font-semibold cursor-pointer text-white transition-all duration-200 hover:brightness-110"
          style={{ backgroundColor: GOLD, boxShadow: `0 4px 20px ${GOLD}44` }}
        >
          {t.bookAppointment}
        </Link>
      </div>
    </section>
  );
}
