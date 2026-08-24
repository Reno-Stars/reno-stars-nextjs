/**
 * Migration: Set meta_description_en AND meta_description_zh for 7 published projects
 * Scope: is_published=true projects with NULL meta_description_zh AND NULL meta_description_en
 * NOT APPLIED — needs human to run after PR merge:
 *   pnpm db:query -f scripts/migrations/2026-08-24-projects-meta-description-en-zh-batch1.sql
 *
 * Backlog cap: 1 project migration file (vs 20 blog_posts, 4 project_sites pending).
 */

BEGIN;

-- North Vancouver Bathroom Renovation
UPDATE projects
SET
  meta_description_en = 'BATHROOM RENOVATION with Black Herringbone Tile in North Vancouver. Completed by Reno Stars. Includes Schluter waterproofing, custom tile, heated floors. Book your free consultation.',
  meta_description_zh = '北温哥华黑色人字纹瓷砖浴室翻新项目，由聚星装修完成。含 Schluter 防水体系、定制瓷砖、加热地板。预约免费咨询。'
WHERE id = '0d7d6efd-6f55-4d5d-b9cf-7ab9a4d40ffb'
  AND (meta_description_zh IS NULL OR meta_description_zh = '');

-- Richmond Condo Flooring Replacement
UPDATE projects
SET
  meta_description_en = 'CONDO FLOORING Replacement in Richmond BC. Reno Stars installed new LVP/luxury vinyl plank flooring in this Richmond condo. Free consultation. Book online.',
  meta_description_zh = '列治文公寓地板更换工程，不列颠哥伦比亚省列治文。聚星装修为列治文公寓安装了新的 LVP 豪华乙烯基地板。免费咨询，在线预约。'
WHERE id = '3ef5531b-cfb9-454d-9cd2-90887b3775f0'
  AND (meta_description_zh IS NULL OR meta_description_zh = '');

-- Richmond House Renovation (Kitchen, Bathrooms, Flooring)
UPDATE projects
SET
  meta_description_en = 'HOUSE RENOVATION with Kitchen, Bathrooms and Flooring in Richmond BC. Reno Stars completed this full-home renovation: kitchen, two bathrooms, new flooring. Free quote.',
  meta_description_zh = '列治文房屋翻新，含厨房、两间浴室及全屋地板工程，不列颠哥伦比亚省列治文。聚星装修完成此全屋翻新项目。免费报价，在线预约。'
WHERE id = '331f03b3-624e-4ddf-9b38-c8768d3d1932'
  AND (meta_description_zh IS NULL OR meta_description_zh = '');

-- Vancouver House Renovation (Kitchen, Bathrooms, Flooring)
UPDATE projects
SET
  meta_description_en = 'HOUSE RENOVATION with Kitchen, Bathrooms and New Flooring in Vancouver BC. Reno Stars completed a full-home renovation: modern kitchen, updated bathrooms, new flooring throughout.',
  meta_description_zh = '温哥华房屋翻新，含厨房、两间浴室及全屋地板工程，不列颠哥伦比亚省温哥华。聚星装修完成现代厨房、两间浴室翻新及全屋新地板。免费报价。'
WHERE id = '9cbc6ccf-bc07-4c2f-a867-c57ab4218728'
  AND (meta_description_zh IS NULL OR meta_description_zh = '');

-- Coquitlam Kitchen Renovation
UPDATE projects
SET
  meta_description_en = 'KITCHEN RENOVATION with Waterfall Quartz Island in Coquitlam BC. Reno Stars completed this custom kitchen with waterfall quartz island, soft-close cabinets and designer lighting. Free quote.',
  meta_description_zh = '高贵林瀑布石英石台面厨房翻新工程，不列颠哥伦比亚省高贵林。聚星装修完成此定制厨房项目，含瀑布石英石台面岛台、软关闭橱柜及设计师照明。免费报价。'
WHERE id = '838f1ee4-beaa-42e7-bca5-73c810422d76'
  AND (meta_description_zh IS NULL OR meta_description_zh = '');

-- Richmond Whole Home Renovation
UPDATE projects
SET
  meta_description_en = 'WHOLE HOME RENOVATION with Marble-Look Kitchen in Richmond BC. Reno Stars completed this full-home renovation including a marble-look kitchen, bathrooms and living spaces. Free consultation.',
  meta_description_zh = '列治文大理石风格厨房全屋翻新工程，不列颠哥伦比亚省列治文。聚星装修完成含大理石风格厨房、两间浴室及起居空间的全屋翻新。免费咨询。'
WHERE id = 'c8a66604-00ed-4307-8b28-b95257eaa249'
  AND (meta_description_zh IS NULL OR meta_description_zh = '');

-- Delta Whole House Renovation (Kitchen and Two Bathrooms)
UPDATE projects
SET
  meta_description_en = 'WHOLE HOUSE RENOVATION with Kitchen and Two Bathrooms in Delta BC. Reno Stars completed a full renovation: custom kitchen, two bathrooms, quartz countertops. Free consultation.',
  meta_description_zh = '三角洲含厨房及两间浴室全屋翻新工程，不列颠哥伦比亚省三角洲。聚星装修完成定制厨房、两间浴室、石英石台面全屋翻新。免费咨询。'
WHERE id = '7c9a9237-4f64-480b-a2fa-2d14e9faa99f'
  AND (meta_description_zh IS NULL OR meta_description_zh = '');

END;
