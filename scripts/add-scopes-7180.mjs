#!/usr/bin/env node
import fs from 'fs';
import { neon } from '@neondatabase/serverless';
const env = JSON.parse(fs.readFileSync(process.env.HOME + '/reno-star-business-intelligent/config/env.json'));
const sql = neon(env.services.neon_db);

const SCOPES = [
  ['Cream Marble Wall Tile (Floor-to-Ceiling)',     '奶油大理石整墙通铺'],
  ['Basketweave Marble Mosaic Shower Floor',        'Basketweave 大理石马赛克淋浴地面'],
  ['Frameless Dual-Person Glass Shower Enclosure',  '双人无框玻璃淋浴房'],
  ['Champagne Gold Rain + Handheld + Slide-Bar Set','香槟金顶喷+手持+滑杆花洒'],
  ['Built-in Quartz Shower Bench',                  '石英石淋浴坐凳'],
  ['Champagne Gold Trimmed Wall Niche',             '香槟金金属收边壁龛'],
  ['Cream Marble Bathtub Re-Surround',              '浴缸大理石包边重做'],
  ['French-Paneled Solid Wood Double Vanity',       '法式护墙板实木双人台盆'],
  ['Arched Coffered Ceiling with Recessed Pots',    '拱形吊顶+嵌入式筒灯'],
  ['Vintage Brass Wall Sconces (Candlelight Tone)', '复古黄铜壁灯（烛光色）'],
  ['Champagne Gold Arched Dressing Mirror',         '香槟金拱形穿衣镜'],
  ['Unified Champagne Gold Hardware Throughout',    '全屋香槟金五金统一'],
];

const SLUG = 'west-vancouver-luxury-bathroom-champagne-gold';

(async () => {
  const [project] = await sql`SELECT id FROM projects WHERE slug = ${SLUG}`;
  if (!project) { console.error('project not found'); process.exit(1); }
  const projectId = project.id;
  console.log(`Adding ${SCOPES.length} scope rows for ${SLUG}...`);
  for (let i = 0; i < SCOPES.length; i++) {
    const [en, zh] = SCOPES[i];
    await sql`
      INSERT INTO project_scopes (project_id, scope_en, scope_zh, display_order)
      VALUES (${projectId}, ${en}, ${zh}, ${i + 1})
    `;
    console.log(`  ${i + 1}. ${en}`);
  }
  console.log('\nDONE — bulk-translate.py will pick up the 12 new locales on next pass');
})().catch(e => { console.error('FATAL', e.message); process.exit(1); });
