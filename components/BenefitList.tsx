import { Check } from 'lucide-react';
import { GOLD, GOLD_PALE, CARD, TEXT, neu } from '@/lib/theme';

interface BenefitListProps {
  benefits: string[];
}

export default function BenefitList({ benefits }: BenefitListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {benefits.map((benefit) => (
        <div
          key={benefit}
          className="rounded-xl p-4 flex items-center gap-3"
          style={{ boxShadow: neu(4), backgroundColor: CARD }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: GOLD_PALE }}
          >
            <Check className="w-4 h-4" style={{ color: GOLD }} />
          </div>
          <span className="text-sm font-medium" style={{ color: TEXT }}>
            {benefit}
          </span>
        </div>
      ))}
    </div>
  );
}
