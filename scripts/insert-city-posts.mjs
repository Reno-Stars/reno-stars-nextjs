/* global process, console */
import pkg from 'pg';
const { Pool } = pkg;
const pool = new Pool({connectionString: process.env.DATABASE_URL});
const now = new Date().toISOString();
const posts = JSON.parse(process.env.POSTS_JSON);
const Q = 'INSERT INTO blog_posts (slug,title_en,title_zh,excerpt_en,excerpt_zh,content_en,content_zh,meta_title_en,meta_title_zh,meta_description_en,meta_description_zh,focus_keyword_en,focus_keyword_zh,reading_time_minutes,author,is_published,published_at,created_at,updated_at) VALUES (' + Array.from({length:16},(_,i)=>('$'+(i+1))).join(',') + ',true,$16,$16,$16) ON CONFLICT (slug) DO NOTHING RETURNING id,slug';
async function run() {
  for (const p of posts) {
    const r = await pool.query(Q, [p.slug,p.te,p.tz,p.xe,p.xz,p.ce,p.cz,p.me,p.mz,p.de,p.dz,p.fe,p.fz,p.rt,'Reno Stars Team',now]);
    if (r.rows.length) console.log('Inserted:', r.rows[0].slug);
    else console.log('Skip:', p.slug);
  }
  await pool.end();
  console.log('Done');
}
run().catch(e => { console.error('ERR:', e.message); pool.end(); process.exit(1); });
