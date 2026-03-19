/**
 * One-off script: reorder social links in the footer.
 * Target order: Facebook → Instagram → WhatsApp → WeChat → Xiaohongshu
 *
 * Usage: npx tsx scripts/fix-social-order.ts
 */
import { db } from '@/lib/db';
import { socialLinks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const ORDER: Record<string, number> = {
  facebook: 0,
  instagram: 1,
  whatsapp: 2,
  wechat: 3,
  xiaohongshu: 4,
};

async function main() {
  const rows = await db.select().from(socialLinks);
  console.log('Current order:');
  for (const row of rows.sort((a: { displayOrder: number }, b: { displayOrder: number }) => a.displayOrder - b.displayOrder)) {
    console.log(`  ${row.displayOrder}: ${row.platform}`);
  }

  for (const row of rows) {
    const newOrder = ORDER[row.platform];
    if (newOrder !== undefined && newOrder !== row.displayOrder) {
      await db.update(socialLinks).set({ displayOrder: newOrder }).where(eq(socialLinks.id, row.id));
      console.log(`Updated ${row.platform}: ${row.displayOrder} → ${newOrder}`);
    }
  }

  const updated = await db.select().from(socialLinks);
  console.log('\nNew order:');
  for (const row of updated.sort((a: { displayOrder: number }, b: { displayOrder: number }) => a.displayOrder - b.displayOrder)) {
    console.log(`  ${row.displayOrder}: ${row.platform}`);
  }
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
