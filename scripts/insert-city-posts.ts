import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const posts = JSON.parse(process.env.POSTS_JSON!);
const now = new Date().toISOString();
async function run() {
  for (const p of posts) {
    const vals = [p.slug,p.te,p.tz,p.xe,p.xz,p.ce,p.cz,p.me,p.mz,p.de,p.dz,p.fe,p.fz,p.rt,'Reno Stars Team',true,now,now,now];
    const ph = vals.map((_:unknown,i:number) => '$' + (i+1)).join(',');
    const sql = 'INSERT INTO blog_posts (slug,title_en,title_zh,excerpt_en,excerpt_zh,content_en,content_zh,meta_title_en,meta_title_zh,meta_description_en,meta_description_zh,focus_keyword_en,focus_keyword_zh,reading_time_minutes,author,is_published,published_at,created_at,updated_at) VALUES (' + ph + ') ON CONFLICT (slug) DO NOTHING RETURNING id,slug';
    const r = await pool.query(sql, vals);
    console.log(r.rows.length ? 'Inserted: ' + r.rows[0].slug : 'Skip: ' + p.slug);
  }
  await pool.end();
}
run().catch(e => { console.error(e.message); process.exit(1); });
