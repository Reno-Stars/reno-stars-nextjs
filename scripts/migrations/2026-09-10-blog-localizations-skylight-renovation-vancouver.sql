-- Migration: NOT APPLIED — requires human execution
-- Adds localizations JSON to published blog post skylight-renovation-vancouver-2026 (4728d80b-fe19-4a17-8071-475029968bf9)
-- Source: title_en/title_zh, excerpt_en/excerpt_zh, focus_keyword_en/keyword_zh,
--   meta_title_en/zh, meta_description_en/zh, seo_keywords_en/zh column pairs.
-- Template locale gets en values; all 11 non-source locales get meta fields from en+zh.

UPDATE blog_posts
SET
  localizations = '{
  "en": {
    "title": "Skylight Renovation in Vancouver 2026: Costs, Types, and How to Choose the Right One",
    "metaTitle": "Vancouver Skylight Renovation 2026: Costs, Types & Permits",
    "metaDescription": "Vancouver skylight renovation 2026: $1,800–$8,500 installed. Fixed, vented, and tubular types compared. Permits, energy performance, and costs.",
    "excerpt": "A skylight renovation brings natural light deep into Vancouver homes. This guide covers 2026 costs by scope, skylight types, permits, energy performance, and real project examples from Reno Stars.",
    "content": "",
    "focusKeyword": "skylight renovation Vancouver",
    "seoKeywords": "skylight renovation Vancouver, skylight installation Vancouver, VELUX skylight Vancouver, tubular skylight Vancouver, skylight cost Vancouver 2026, skylight replacement Vancouver"
  },
  "zh": {
    "title": "溫哥華天窗裝修2026：費用、類型與選擇指南",
    "metaTitle": "溫哥華天窗裝修2026 | 天窗費用、類型、許可證 | Reno Stars",
    "metaDescription": "溫哥華天窗裝修2026：含安裝費用$1,800–$8,500。比較固定、通風和導管式天窗。含許可證，能源性能和Reno Stars真實工程費用。",
    "excerpt": "天窗裝修為溫哥華住宅帶來深層自然光。本文介紹2026年按工程範圍，天窗類型、許可證，能源性能分類的費用，以及Reno Stars的真實工程案例。",
    "content": "",
    "focusKeyword": "溫哥華天窗裝修",
    "seoKeywords": "溫哥華天窗裝修, 天窗安裝溫哥華, VELUX天窗, 導管式天窗, 天窗費用, 天窗更換"
  },
  "zhHant": {
    "title": "溫哥華天窗裝修2026：費用、類型與選擇指南",
    "metaTitle": "溫哥華天窗裝修2026 | 天窗費用、類型、許可證 | Reno Stars",
    "metaDescription": "溫哥華天窗裝修2026：含安裝費用$1,800–$8,500。比較固定、通風和導管式天窗。含許可證，能源性能和Reno Stars真實工程費用。",
    "excerpt": "天窗裝修為溫哥華住宅帶來深層自然光。本文介紹2026年按工程範圍，天窗類型、許可證，能源性能分類的費用，以及Reno Stars的真實工程案例。",
    "content": "",
    "focusKeyword": "溫哥華天窗裝修",
    "seoKeywords": "溫哥華天窗裝修, 天窗安裝溫哥華, VELUX天窗, 導管式天窗, 天窗費用, 天窗更換"
  },
  "fr": {
    "title": "Skylight Renovation in Vancouver 2026: Costs, Types, and How to Choose the Right One",
    "metaTitle": "Vancouver Skylight Renovation 2026: Costs, Types & Permits",
    "metaDescription": "Vancouver skylight renovation 2026: $1,800–$8,500 installed. Fixed, vented, and tubular types compared. Permits, energy performance, and costs.",
    "excerpt": "A skylight renovation brings natural light deep into Vancouver homes. This guide covers 2026 costs by scope, skylight types, permits, energy performance, and real project examples from Reno Stars.",
    "content": "",
    "focusKeyword": "skylight renovation Vancouver",
    "seoKeywords": "skylight renovation Vancouver, skylight installation Vancouver, VELUX skylight Vancouver, tubular skylight Vancouver, skylight cost Vancouver 2026, skylight replacement Vancouver"
  },
  "ja": {
    "title": "Skylight Renovation in Vancouver 2026: Costs, Types, and How to Choose the Right One",
    "metaTitle": "Vancouver Skylight Renovation 2026: Costs, Types & Permits",
    "metaDescription": "Vancouver skylight renovation 2026: $1,800–$8,500 installed. Fixed, vented, and tubular types compared. Permits, energy performance, and costs.",
    "excerpt": "A skylight renovation brings natural light deep into Vancouver homes. This guide covers 2026 costs by scope, skylight types, permits, energy performance, and real project examples from Reno Stars.",
    "content": "",
    "focusKeyword": "skylight renovation Vancouver",
    "seoKeywords": "skylight renovation Vancouver, skylight installation Vancouver, VELUX skylight Vancouver, tubular skylight Vancouver, skylight cost Vancouver 2026, skylight replacement Vancouver"
  },
  "ko": {
    "title": "Skylight Renovation in Vancouver 2026: Costs, Types, and How to Choose the Right One",
    "metaTitle": "Vancouver Skylight Renovation 2026: Costs, Types & Permits",
    "metaDescription": "Vancouver skylight renovation 2026: $1,800–$8,500 installed. Fixed, vented, and tubular types compared. Permits, energy performance, and costs.",
    "excerpt": "A skylight renovation brings natural light deep into Vancouver homes. This guide covers 2026 costs by scope, skylight types, permits, energy performance, and real project examples from Reno Stars.",
    "content": "",
    "focusKeyword": "skylight renovation Vancouver",
    "seoKeywords": "skylight renovation Vancouver, skylight installation Vancouver, VELUX skylight Vancouver, tubular skylight Vancouver, skylight cost Vancouver 2026, skylight replacement Vancouver"
  },
  "vi": {
    "title": "Skylight Renovation in Vancouver 2026: Costs, Types, and How to Choose the Right One",
    "metaTitle": "Vancouver Skylight Renovation 2026: Costs, Types & Permits",
    "metaDescription": "Vancouver skylight renovation 2026: $1,800–$8,500 installed. Fixed, vented, and tubular types compared. Permits, energy performance, and costs.",
    "excerpt": "A skylight renovation brings natural light deep into Vancouver homes. This guide covers 2026 costs by scope, skylight types, permits, energy performance, and real project examples from Reno Stars.",
    "content": "",
    "focusKeyword": "skylight renovation Vancouver",
    "seoKeywords": "skylight renovation Vancouver, skylight installation Vancouver, VELUX skylight Vancouver, tubular skylight Vancouver, skylight cost Vancouver 2026, skylight replacement Vancouver"
  },
  "th": {
    "title": "Skylight Renovation in Vancouver 2026: Costs, Types, and How to Choose the Right One",
    "metaTitle": "Vancouver Skylight Renovation 2026: Costs, Types & Permits",
    "metaDescription": "Vancouver skylight renovation 2026: $1,800–$8,500 installed. Fixed, vented, and tubular types compared. Permits, energy performance, and costs.",
    "excerpt": "A skylight renovation brings natural light deep into Vancouver homes. This guide covers 2026 costs by scope, skylight types, permits, energy performance, and real project examples from Reno Stars.",
    "content": "",
    "focusKeyword": "skylight renovation Vancouver",
    "seoKeywords": "skylight renovation Vancouver, skylight installation Vancouver, VELUX skylight Vancouver, tubular skylight Vancouver, skylight cost Vancouver 2026, skylight replacement Vancouver"
  },
  "id": {
    "title": "Skylight Renovation in Vancouver 2026: Costs, Types, and How to Choose the Right One",
    "metaTitle": "Vancouver Skylight Renovation 2026: Costs, Types & Permits",
    "metaDescription": "Vancouver skylight renovation 2026: $1,800–$8,500 installed. Fixed, vented, and tubular types compared. Permits, energy performance, and costs.",
    "excerpt": "A skylight renovation brings natural light deep into Vancouver homes. This guide covers 2026 costs by scope, skylight types, permits, energy performance, and real project examples from Reno Stars.",
    "content": "",
    "focusKeyword": "skylight renovation Vancouver",
    "seoKeywords": "skylight renovation Vancouver, skylight installation Vancouver, VELUX skylight Vancouver, tubular skylight Vancouver, skylight cost Vancouver 2026, skylight replacement Vancouver"
  },
  "ms": {
    "title": "Skylight Renovation in Vancouver 2026: Costs, Types, and How to Choose the Right One",
    "metaTitle": "Vancouver Skylight Renovation 2026: Costs, Types & Permits",
    "metaDescription": "Vancouver skylight renovation 2026: $1,800–$8,500 installed. Fixed, vented, and tubular types compared. Permits, energy performance, and costs.",
    "excerpt": "A skylight renovation brings natural light deep into Vancouver homes. This guide covers 2026 costs by scope, skylight types, permits, energy performance, and real project examples from Reno Stars.",
    "content": "",
    "focusKeyword": "skylight renovation Vancouver",
    "seoKeywords": "skylight renovation Vancouver, skylight installation Vancouver, VELUX skylight Vancouver, tubular skylight Vancouver, skylight cost Vancouver 2026, skylight replacement Vancouver"
  },
  "tl": {
    "title": "Skylight Renovation in Vancouver 2026: Costs, Types, and How to Choose the Right One",
    "metaTitle": "Vancouver Skylight Renovation 2026: Costs, Types & Permits",
    "metaDescription": "Vancouver skylight renovation 2026: $1,800–$8,500 installed. Fixed, vented, and tubular types compared. Permits, energy performance, and costs.",
    "excerpt": "A skylight renovation brings natural light deep into Vancouver homes. This guide covers 2026 costs by scope, skylight types, permits, energy performance, and real project examples from Reno Stars.",
    "content": "",
    "focusKeyword": "skylight renovation Vancouver",
    "seoKeywords": "skylight renovation Vancouver, skylight installation Vancouver, VELUX skylight Vancouver, tubular skylight Vancouver, skylight cost Vancouver 2026, skylight replacement Vancouver"
  },
  "ar": {
    "title": "Skylight Renovation in Vancouver 2026: Costs, Types, and How to Choose the Right One",
    "metaTitle": "Vancouver Skylight Renovation 2026: Costs, Types & Permits",
    "metaDescription": "Vancouver skylight renovation 2026: $1,800–$8,500 installed. Fixed, vented, and tubular types compared. Permits, energy performance, and costs.",
    "excerpt": "A skylight renovation brings natural light deep into Vancouver homes. This guide covers 2026 costs by scope, skylight types, permits, energy performance, and real project examples from Reno Stars.",
    "content": "",
    "focusKeyword": "skylight renovation Vancouver",
    "seoKeywords": "skylight renovation Vancouver, skylight installation Vancouver, VELUX skylight Vancouver, tubular skylight Vancouver, skylight cost Vancouver 2026, skylight replacement Vancouver"
  },
  "de": {
    "title": "Skylight Renovation in Vancouver 2026: Costs, Types, and How to Choose the Right One",
    "metaTitle": "Vancouver Skylight Renovation 2026: Costs, Types & Permits",
    "metaDescription": "Vancouver skylight renovation 2026: $1,800–$8,500 installed. Fixed, vented, and tubular types compared. Permits, energy performance, and costs.",
    "excerpt": "A skylight renovation brings natural light deep into Vancouver homes. This guide covers 2026 costs by scope, skylight types, permits, energy performance, and real project examples from Reno Stars.",
    "content": "",
    "focusKeyword": "skylight renovation Vancouver",
    "seoKeywords": "skylight renovation Vancouver, skylight installation Vancouver, VELUX skylight Vancouver, tubular skylight Vancouver, skylight cost Vancouver 2026, skylight replacement Vancouver"
  },
  "es": {
    "title": "Skylight Renovation in Vancouver 2026: Costs, Types, and How to Choose the Right One",
    "metaTitle": "Vancouver Skylight Renovation 2026: Costs, Types & Permits",
    "metaDescription": "Vancouver skylight renovation 2026: $1,800–$8,500 installed. Fixed, vented, and tubular types compared. Permits, energy performance, and costs.",
    "excerpt": "A skylight renovation brings natural light deep into Vancouver homes. This guide covers 2026 costs by scope, skylight types, permits, energy performance, and real project examples from Reno Stars.",
    "content": "",
    "focusKeyword": "skylight renovation Vancouver",
    "seoKeywords": "skylight renovation Vancouver, skylight installation Vancouver, VELUX skylight Vancouver, tubular skylight Vancouver, skylight cost Vancouver 2026, skylight replacement Vancouver"
  },
  "pt": {
    "title": "Skylight Renovation in Vancouver 2026: Costs, Types, and How to Choose the Right One",
    "metaTitle": "Vancouver Skylight Renovation 2026: Costs, Types & Permits",
    "metaDescription": "Vancouver skylight renovation 2026: $1,800–$8,500 installed. Fixed, vented, and tubular types compared. Permits, energy performance, and costs.",
    "excerpt": "A skylight renovation brings natural light deep into Vancouver homes. This guide covers 2026 costs by scope, skylight types, permits, energy performance, and real project examples from Reno Stars.",
    "content": "",
    "focusKeyword": "skylight renovation Vancouver",
    "seoKeywords": "skylight renovation Vancouver, skylight installation Vancouver, VELUX skylight Vancouver, tubular skylight Vancouver, skylight cost Vancouver 2026, skylight replacement Vancouver"
  },
  "it": {
    "title": "Skylight Renovation in Vancouver 2026: Costs, Types, and How to Choose the Right One",
    "metaTitle": "Vancouver Skylight Renovation 2026: Costs, Types & Permits",
    "metaDescription": "Vancouver skylight renovation 2026: $1,800–$8,500 installed. Fixed, vented, and tubular types compared. Permits, energy performance, and costs.",
    "excerpt": "A skylight renovation brings natural light deep into Vancouver homes. This guide covers 2026 costs by scope, skylight types, permits, energy performance, and real project examples from Reno Stars.",
    "content": "",
    "focusKeyword": "skylight renovation Vancouver",
    "seoKeywords": "skylight renovation Vancouver, skylight installation Vancouver, VELUX skylight Vancouver, tubular skylight Vancouver, skylight cost Vancouver 2026, skylight replacement Vancouver"
  }
}'
WHERE id = '4728d80b-fe19-4a17-8071-475029968bf9';
