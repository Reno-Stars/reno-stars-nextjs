/* eslint-disable no-undef */
/**
 * One-time migration script: gallery_items → designs
 *
 * 1. Drop FK constraint, category index, category & project_id columns
 * 2. Rename table gallery_items → designs
 * 3. Rename indexes
 * 4. Delete old rows (photos, not design renderings)
 * 5. Insert 37 design rendering records
 *
 * Run: npx dotenv -e .env.local -- node scripts/migrate-gallery-to-designs.mjs
 */

import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const designItems = [
  { imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/02/8c79e5d9eff5e21b435fd551bf296b0-1-1024x576.jpg', titleEn: 'Kitchen Design', titleZh: '厨房设计', displayOrder: 1 },
  { imageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/Kitchen-3_4-1-1024x658.webp', titleEn: 'Warm-toned Kitchen and Dining', titleZh: '暖色调厨房与餐厅', displayOrder: 2 },
  { imageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/WASHROOM6-1-1024x658.webp', titleEn: 'Warm Wooden Bathroom', titleZh: '温木色浴室', displayOrder: 3 },
  { imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/02/modern-bathroom-floating-vanity-round-mirror-led-lighting-673x1024.jpg', titleEn: 'Modern Bathroom with Floating Vanity', titleZh: '悬浮式洗手台现代浴室', displayOrder: 4 },
  { imageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/SENIOR-DINING-2-1-1024x658.webp', titleEn: 'Senior Dining Room', titleZh: '长者餐厅', displayOrder: 5 },
  { imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/02/minimalist-bathroom-floating-vanity-glass-shower-1024x576.jpg', titleEn: 'Minimalist Bathroom with Glass Shower', titleZh: '极简浴室玻璃淋浴间', displayOrder: 6 },
  { imageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/kITCHEN2_7-1-1024x658.webp', titleEn: 'Modern White Kitchen', titleZh: '现代白色厨房', displayOrder: 7 },
  { imageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/Kitchen-3_6-1-1024x658.webp', titleEn: 'Warm Wooden Kitchen and Dining', titleZh: '暖木色厨房与餐厅', displayOrder: 8 },
  { imageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/Main-Washroom-3-1-1024x658.webp', titleEn: 'Modern Mono-toned Bathroom', titleZh: '现代单色调浴室', displayOrder: 9 },
  { imageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/LIVINGROOM-3-1-1024x658.webp', titleEn: 'Modern Living Room', titleZh: '现代客厅', displayOrder: 10 },
  { imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/02/faf3daf54872b70a8addecea2ccf41e-1024x576.jpg', titleEn: 'Kitchen Design Concept', titleZh: '厨房设计概念', displayOrder: 11 },
  { imageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/SENIOR-ENTRANCE-AND-BOOKSTORE2-1-1024x658.webp', titleEn: 'Senior Entrance and Bookstore', titleZh: '长者入口与书房', displayOrder: 12 },
  { imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/02/modern-bathroom-dark-wood-vanity-glass-shower-1024x684.jpg', titleEn: 'Dark Wood Vanity Bathroom', titleZh: '深木色洗手台浴室', displayOrder: 13 },
  { imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/02/modern-bathroom-double-vanity-built-in-bathtub-1024x798.jpg', titleEn: 'Double Vanity with Built-in Bathtub', titleZh: '双洗手台内嵌浴缸', displayOrder: 14 },
  { imageUrl: 'https://reno-stars.com/wp-content/uploads/2024/04/Second-washroom4-1-1024x658.webp', titleEn: 'Modern White Bathroom', titleZh: '现代白色浴室', displayOrder: 15 },
  { imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/02/dff5ad1d3a3c1fa4583e49943cc07ec-1024x576.jpg', titleEn: 'Interior Design Concept', titleZh: '室内设计概念', displayOrder: 16 },
  { imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/02/e5a0078cf93deae29107652b51b3829-1024x659.jpg', titleEn: 'Renovation Design Rendering', titleZh: '装修设计效果图', displayOrder: 17 },
  { imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/02/a984f898a591d5e747fd71f0e6b388d-1-1024x576.jpg', titleEn: 'Living Space Design', titleZh: '生活空间设计', displayOrder: 18 },
  { imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/02/f6c18ffcaadf6253e584f7b421e888c-1024x1014.png', titleEn: 'Bathroom Design Rendering', titleZh: '浴室设计效果图', displayOrder: 19 },
  { imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/02/WechatIMG150-1024x576.jpg', titleEn: 'Commercial Space Design', titleZh: '商业空间设计', displayOrder: 20 },
  { imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/02/WechatIMG151-1024x576.jpg', titleEn: 'Commercial Interior Design', titleZh: '商业室内设计', displayOrder: 21 },
  { imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/02/WechatIMG152-1024x576.jpg', titleEn: 'Commercial Renovation Design', titleZh: '商业装修设计', displayOrder: 22 },
  { imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/02/WechatIMG156.jpg', titleEn: 'Commercial Space Rendering', titleZh: '商业空间效果图', displayOrder: 23 },
  { imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/02/WechatIMG157-1.jpg', titleEn: 'Commercial Interior Rendering', titleZh: '商业室内效果图', displayOrder: 24 },
  { imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/02/WechatIMG159.jpg', titleEn: 'Commercial Design Concept', titleZh: '商业设计概念', displayOrder: 25 },
  { imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/02/modern-home-bar-with-wooden-finish-and-built-in-wine-rack-1024x576.jpg', titleEn: 'Home Bar with Wine Rack', titleZh: '内嵌酒架吧台', displayOrder: 26 },
  { imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/02/modern-white-kitchen-with-large-island-and-shaker-cabinets-1024x576.jpg', titleEn: 'White Kitchen with Large Island', titleZh: '白色大岛台厨房', displayOrder: 27 },
  { imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/02/modern-kitchen-with-light-wood-cabinets-and-island-seating-1024x576.jpg', titleEn: 'Light Wood Kitchen with Island', titleZh: '浅木色岛台厨房', displayOrder: 28 },
  { imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/02/modern-kitchen-with-beige-cabinets-and-white-island-1024x576.jpg', titleEn: 'Beige Kitchen with White Island', titleZh: '米色橱柜白色岛台厨房', displayOrder: 29 },
  { imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/02/bright-modern-kitchen-with-white-cabinets-and-island-seating-blue-1024x576.jpg', titleEn: 'Bright Modern Kitchen', titleZh: '明亮现代厨房', displayOrder: 30 },
  { imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/02/modern-marble-bathroom-vanity-led-lighting-673x1024.jpg', titleEn: 'Marble Bathroom with LED Lighting', titleZh: '大理石LED灯浴室', displayOrder: 31 },
  { imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/02/modern-white-bathroom-marble-shower-966x1024.png', titleEn: 'White Bathroom with Marble Shower', titleZh: '白色大理石淋浴浴室', displayOrder: 32 },
  { imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/02/modern-marble-bathroom-vanity-729x1024.jpg', titleEn: 'Marble Vanity Bathroom', titleZh: '大理石洗手台浴室', displayOrder: 33 },
  { imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/02/modern-bathroom-with-double-vanity-and-built-in-bathtub-1024x798.jpg', titleEn: 'Double Vanity Bathroom', titleZh: '双洗手台浴室', displayOrder: 34 },
  { imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/02/75b2c5d0915a977e6207ef2191928a6-789x1024.jpg', titleEn: 'Bathroom Design', titleZh: '浴室设计', displayOrder: 35 },
  { imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/02/961f7913f7a54d6dbc65780b477701f-1-1024x992.jpg', titleEn: 'Interior Design', titleZh: '室内设计', displayOrder: 36 },
  { imageUrl: 'https://reno-stars.com/wp-content/uploads/2025/02/modern-beige-bathroom-with-floating-vanity-and-glass-shower-1024x576.jpg', titleEn: 'Beige Bathroom with Glass Shower', titleZh: '米色玻璃淋浴浴室', displayOrder: 37 },
];

async function migrate() {
  await client.connect();
  console.log('Connected to database');

  try {
    await client.query('BEGIN');

    // 1. Drop FK constraint
    console.log('Dropping FK constraint...');
    await client.query('ALTER TABLE gallery_items DROP CONSTRAINT IF EXISTS gallery_items_project_id_projects_id_fk');

    // 2. Drop category index
    console.log('Dropping category index...');
    await client.query('DROP INDEX IF EXISTS gallery_items_category_idx');

    // 3. Drop category and project_id columns
    console.log('Dropping category and project_id columns...');
    await client.query('ALTER TABLE gallery_items DROP COLUMN IF EXISTS category');
    await client.query('ALTER TABLE gallery_items DROP COLUMN IF EXISTS project_id');

    // 4. Rename the table
    console.log('Renaming table gallery_items → designs...');
    await client.query('ALTER TABLE gallery_items RENAME TO designs');

    // 5. Rename indexes
    console.log('Renaming indexes...');
    await client.query('ALTER INDEX gallery_items_pkey RENAME TO designs_pkey');
    await client.query('ALTER INDEX gallery_items_image_url_idx RENAME TO designs_image_url_idx');

    // 6. Delete old rows (they were photos, not design renderings)
    console.log('Deleting old gallery photo rows...');
    const del = await client.query('DELETE FROM designs');
    console.log(`  Deleted ${del.rowCount} old rows`);

    // 7. Insert 37 design rendering records
    console.log('Inserting 37 design items...');
    for (const item of designItems) {
      await client.query(
        'INSERT INTO designs (image_url, title_en, title_zh, display_order, is_published) VALUES ($1, $2, $3, $4, true) ON CONFLICT (image_url) DO NOTHING',
        [item.imageUrl, item.titleEn, item.titleZh, item.displayOrder]
      );
    }

    await client.query('COMMIT');
    console.log('Migration completed successfully!');

    // Verify
    const count = await client.query('SELECT count(*) FROM designs');
    console.log(`Designs table now has ${count.rows[0].count} rows`);

    const sample = await client.query('SELECT id, title_en, display_order FROM designs ORDER BY display_order LIMIT 5');
    console.log('\nSample rows:');
    sample.rows.forEach(r => console.log(`  #${r.display_order}: ${r.title_en} (${r.id})`));

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed, rolled back:', err.message);
    throw err;
  } finally {
    await client.end();
  }
}

migrate().catch(() => process.exit(1));
