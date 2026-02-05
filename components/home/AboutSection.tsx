import { GOLD, SURFACE, CARD, TEXT, TEXT_MID, neu } from '@/lib/theme';

interface AboutSectionProps {
  items: { title: string; text: string }[];
  translations: {
    title: string;
    subtitle: string;
  };
}

export default function AboutSection({ items, translations: t }: AboutSectionProps) {
  return (
    <section id="about" aria-labelledby="about-title" className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h2 id="about-title" className="text-2xl font-bold mb-1" style={{ color: TEXT }}>{t.title}</h2>
          <p className="text-base" style={{ color: TEXT_MID }}>{t.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <div key={item.title} className="rounded-2xl p-5 transition-all duration-200" style={{ boxShadow: neu(5), backgroundColor: CARD }}>
              <div className="w-8 h-0.5 rounded-full mb-3" style={{ backgroundColor: GOLD }} />
              <h3 className="text-base font-bold mb-1.5" style={{ color: TEXT }}>{item.title}</h3>
              <p className="text-base leading-relaxed" style={{ color: TEXT_MID }}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
