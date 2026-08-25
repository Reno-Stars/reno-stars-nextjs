-- Migration: 2026-08-25-projects-project-story-en-batch2.sql
-- Target: projects with is_published AND project_story_en IS NULL (batch 2 of 2)
-- 28 rows remaining after batch1.
-- Derived from: description_en field (rewritten as a first-person project narrative)
--
-- NOT APPLIED — needs a human to run this file against the production database.
-- DO NOT run this migration more than once on the same database.
-- Run with: psql $DATABASE_URL -f scripts/migrations/2026-08-25-projects-project-story-en-batch2.sql

UPDATE projects
SET project_story_en = 'A complete Coquitlam condo bathroom renovation prepared the property for sale, with targeted upgrades that maximize return on investment. The project included a prefab base, a painted vanity, silver fixtures, LED strip lighting, a quartz water wall, and a custom quartz countertop, along with wall tile in the niche. The result is a modern and inviting bathroom that significantly increases the property value. Reno Stars completed the work on schedule, keeping the condo disruption-free for the owner during the listing period.'
WHERE id = 'f32478df-b05d-4932-b82a-6f1c5e4e0da5'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This West Vancouver kitchen renovation was designed specifically for an Airbnb investment property — every material was chosen for its photographability and durability under short-term guest use. White shaker cabinet doors with gold handles photograph beautifully in listing photos, and the under-cabinet LED strip lighting adds warm ambient illumination that guests consistently mention in reviews. The entire home received fresh neutral-tone paint for a cohesive look that appeals to international guests. Reno Stars designed the layout to maximize counter space while maintaining an open, welcoming feel, giving the property a competitive edge in the West Vancouver short-term rental market.'
WHERE id = 'f6569579-4798-41a2-836e-322fc1c5c337'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This modern Langley kitchen renovation showcases a balance of contemporary design and practical family functionality. The project began with complete demolition of the existing kitchen, followed by a redesigned layout that improves traffic flow and maximizes counter space. New custom cabinetry in a warm-toned finish features soft-close drawers, pull-out organizers, and a mix of open and closed storage. The generous quartz countertop provides ample preparation area with clean, maintenance-free surfaces. A tile backsplash adds visual interest, pendant lighting over the island creates a welcoming atmosphere for casual dining, and updated electrical, a powerful range hood, and energy-efficient appliances complete the space. Luxury vinyl plank flooring handles daily family traffic without showing wear. Reno Stars managed every trade — demolition, electrical, plumbing, cabinetry, tiling, and finishing — in a single coordinated project.'
WHERE id = '62476da2-c73a-4c00-a0c5-caef22c1b88f'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This Richmond bathroom renovation transformed two family bathrooms with a classic yet contemporary design centred on elegant white shaker-style cabinetry. The primary bathroom features a spacious curbless shower with frameless glass, custom white shaker vanity cabinets with brushed nickel hardware, premium quartz countertops, and LED-backlit mirrors. The second bathroom received coordinated upgrades — new tile surrounds, updated plumbing fixtures, and improved ventilation — in the same material palette. Both bathrooms received complete plumbing updates, new lighting fixtures, and fresh paint. Reno Stars managed all trades across both spaces simultaneously, minimizing disruption for the family and delivering two bathrooms that bridge traditional and modern aesthetics without compromising on function.'
WHERE id = '1a66b299-02d4-429b-a767-25aa7a39575f'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This Richmond kitchen renovation transformed a dated galley layout into an airy, functional cooking space with a minimalist warm style. The project began with full demolition of existing cabinetry and countertops, followed by optimized recessed LED lighting and new white shaker cabinets complemented by warm wood grain accent panels. A charming arched kitchen doorway was added to connect the dining area, creating a flowing transition between rooms. Elegant white quartz countertops provide a durable, easy-to-clean surface that pairs beautifully with soft-close drawers and brushed nickel hardware. The warm neutral tile backsplash ties the look together, and the complete electrical update accommodates modern appliances safely. Reno Stars delivered a kitchen that feels genuinely different from what was there before — not just refreshed, but re-imagined.'
WHERE id = '03589549-6b2d-4720-b0ce-f234fc962d74'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This Richmond townhouse project renovated two bathrooms simultaneously, each receiving a distinctive modern makeover tailored to the family lifestyle. The first bathroom was transformed from a dated bathtub configuration to a sleek walk-in shower with large-format grey porcelain tiles, frameless glass door, and matte black fixtures. The second bathroom retained its bathtub for family convenience while receiving new tile surrounds, a modern vanity with quartz countertop, and coordinating matte black plumbing fixtures. Both spaces received custom-finished bases, recessed LED lighting, improved ventilation, and new waterproofing behind all tile work. The grey tile palette creates visual continuity between the two bathrooms while allowing each its own character. Reno Stars managed all trades across both bathrooms in a single project timeline, reducing the overall disruption to the household.'
WHERE id = '2f7a992f-5372-4f03-9328-456fff969a97'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This Richmond townhouse kitchen renovation centres on elegant white shaker-style cabinetry that brings timeless charm to a modern family home. The complete transformation included removal of outdated cabinets and countertops, followed by custom white shaker doors with soft-close mechanisms and brushed nickel hardware. A stunning quartz countertop in a warm white tone provides ample preparation space and complements the cabinetry perfectly. The redesigned layout maximizes workflow efficiency with pull-out drawers, lazy Susan corner cabinets, and a dedicated pantry area. Under-cabinet LED strip lighting illuminates the workspace while adding ambient warmth. A classic subway tile backsplash creates visual texture without overwhelming the clean aesthetic, updated electrical accommodates modern appliances, and fresh neutral paint throughout ties every room together. Reno Stars managed demolition, cabinetry, electrical, tiling, and finishing as a single coordinated project.'
WHERE id = '3239a7b3-2c80-481f-a6f1-dfa6187b97e6'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This Vancouver kitchen renovation features a timeless white shaker cabinet design that brings classic elegance to a modern family kitchen. The comprehensive transformation included full demolition of the existing space, structural assessment, and a redesigned layout optimized for cooking and entertaining needs. Custom white shaker cabinets with brushed nickel hardware line the walls, offering generous storage with soft-close hinges and pull-out organizational inserts. Pristine quartz countertops provide a durable, stain-resistant surface ideal for daily meal preparation. A classic subway tile backsplash in a coordinating white tone adds subtle texture and depth. The island serves as the kitchen hub, with seating for casual meals and additional storage underneath. Recessed LED lighting and under-cabinet task lights ensure bright, even illumination across all work surfaces. The renovation also included new flooring, updated plumbing fixtures, and modern stainless steel appliances. Reno Stars delivered a kitchen that respects the character of the Pacific Northwest home while bringing it fully up to date.'
WHERE id = 'be83574d-60b4-4ad9-805d-098c8a5cccfd'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This Surrey kitchen renovation breathed new life into a family home cooking and dining area. Outdated cabinets and worn vinyl flooring were replaced with modern plywood cabinetry featuring crown molding for a polished look. Sleek silver faucets and a deep single-basin sink were installed for utility, while white quartz countertops provide spacious, stain-resistant workspace. New engineered hardwood flooring extends into the living area, creating seamless visual flow. The result is a contemporary kitchen that has become the family favourite gathering spot. Reno Stars managed the complete overhaul — demolition, cabinetry, plumbing, electrical, tiling, and finishing — on schedule and within budget.'
WHERE id = 'e7ef381e-cd29-4868-91d8-f5b5efcb4cbc'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This Richmond bathroom renovation transformed a traditional tub-and-shower combo into a sleek, modern minimalist retreat. The bathtub was removed and replaced with a spacious walk-in shower featuring a low-profile acrylic base. Stylish gray patterned wall tiles were installed floor-to-ceiling, giving the room dramatic yet calming ambiance. The vanity features elegant white shaker cabinetry with a polished quartz countertop and undermount ceramic basin. A frameless glass shower enclosure maximizes visual space, while brushed nickel fixtures and rain showerhead complete the spa-inspired design. Reno Stars managed the complete renovation — demolition, waterproofing, tiling, plumbing, electrical, and finishing — delivering a bathroom that feels like a genuine upgrade from what was there before.'
WHERE id = '394bba39-b5ba-4a17-b408-bdb54643064a'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This budget-friendly Burnaby bathroom renovation transformed a dated space into a modern retreat without over-improving for the neighbourhood. The project included a complete overhaul featuring a new prefab vanity, a stylish freestanding tub, and optimized lighting. Elegant gray 24x24 tiles adorn the walls, complemented by a sleek quartz countertop and durable vinyl flooring. The homeowners wanted a fresh, inviting atmosphere on a budget that appropriate to a Condo Strata property — and the result exceeded their expectations. Reno Stars completed the work efficiently, coordinating all trades within the condo's governing rules and working around building management requirements.'
WHERE id = '1d2f9425-5659-49dc-809c-716c43edc570'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This Surrey kitchen renovation transformed a dated space into a modern culinary haven. The project included custom cabinets that matched the ceiling trim, plywood cabinet bodies, and sleek silver faucets paired with durable quartz countertops. The homeowners wanted a cohesive and functional design that maximizes space while enhancing aesthetics — and the result is a bright, inviting kitchen that serves as the heart of the home. New engineered hardwood flooring runs through the kitchen and into the living area, creating visual continuity. Reno Stars managed every stage — demolition, custom cabinetry, plumbing rough-in, electrical, tiling, and finishing — in a single coordinated project.'
WHERE id = '4da79280-b84c-446c-8914-782e7e1fc1ef'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This luxurious Burnaby bathroom renovation represents the pinnacle of custom residential design, featuring a stunning blend of premium materials and thoughtful craftsmanship. The standout feature is a custom wood-grain vanity cabinet that brings natural warmth and organic texture to the space, paired with a polished quartz countertop and undermount ceramic basin. An oversized LED-backlit mirror serves as both a functional element and a striking design focal point. Elegant gold fixtures — including the widespread faucet, towel bars, and shower controls — add refined luxury. Large-format marble-look porcelain tiles line the walls and floor, creating a spa-like atmosphere with minimal maintenance requirements. The walk-in shower features a frameless glass enclosure with gold hardware accents and a built-in storage niche. Reno Stars sourced every material to the gold fixture specification, managed all trade coordination, and delivered a bathroom that genuinely feels extraordinary.'
WHERE id = '701ce355-942c-4df0-acab-593e05983d81'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This second Richmond dual-bathroom renovation delivered a comprehensive transformation of two distinct bathrooms within a family townhouse. The master bathroom received a complete overhaul with large-format grey porcelain tiles, a custom frameless glass shower enclosure, and a floating vanity with quartz countertop and undermount basin. Matte black fixtures throughout — including the rain showerhead, widespread faucet, and towel accessories — create a sophisticated contemporary aesthetic. The guest bathroom was redesigned with complementary materials, featuring a compact vanity with integrated storage and a shower-tub combination for versatility. Both spaces received new waterproofing membranes, updated plumbing, energy-efficient LED recessed lighting, and improved exhaust ventilation. The cohesive grey-and-black colour scheme ties both bathrooms together while each space serves its unique purpose. Reno Stars managed all trades across both bathrooms in a single project, minimizing disruption for the household.'
WHERE id = '4ced0347-337e-4f7e-aedc-8ec256406770'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This stunning Burnaby kitchen renovation showcases the transformative power of custom craftsmanship and thoughtful design. The project began with full demolition and structural assessment before installing premium custom cabinetry with soft-close hinges and elegant gold fixture hardware throughout. New engineered hardwood flooring, recessed LED lighting with dimmer controls, and a designer-selected warm neutral palette complete the transformation. The centrepiece is a spacious quartz countertop island that serves as both a preparation area and casual dining space. Every detail was carefully considered — from the undermount stainless steel sink to the brushed gold cabinet pulls — creating a cohesive and luxurious aesthetic. Reno Stars managed every trade across the full project duration, delivering a kitchen that maximizes both functionality and visual appeal in a modern family home.'
WHERE id = 'd043cb40-21ff-4b9b-aac3-e00339d0916f'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This Burnaby family townhouse renovation created a unified yet distinctive aesthetic across two bathrooms. One bathroom was transformed from a bathtub to a modern walk-in shower with linear drain and large white wall tiles, while the other retained its bathtub for young children. Coordinated white tile with brushed gold fixtures — faucets, showerheads, and towel bars — creates a warm, elegant atmosphere. Frameless glass doors maximize natural light and visual space, while new exhaust fans and waterproofing ensure long-term performance. Both bathrooms received updated plumbing and electrical to support the new fixtures. Reno Stars managed both bathrooms as a single project, coordinating plumbing, electrical, tiling, glass, and finishing trades across both spaces simultaneously.'
WHERE id = 'c0afba82-fded-4375-8466-fc8feb22f991'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This Richmond ensuite bathroom renovation replaced a 1980s framed shower stall, dark vanity, and dated tile with a bright, modern space. Reno Stars demolished to the studs — including certified asbestos abatement of the wall tile — then rebuilt the bathroom with a walk-in shower featuring black-framed sliding glass and marble-look walls, a wood-tone vanity with matte-black faucet and hardware, a new toilet, new exhaust venting, and updated electrical. The result is a bathroom that functions at a completely different level from what was there before, delivered within the existing footprint without altering the structural layout. All work passed required government inspections.'
WHERE id = 'a0690f3a-af1f-4cd1-a2b6-8920908801ea'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This Richmond hallway bathroom renovation removed a 1980s original — a tub with gold-framed sliding doors, patterned beige tile, and a dark laminate vanity — and replaced it with a modern space the family actually wants to use. Reno Stars handled certified asbestos abatement of the wall tile with air testing before installing a new tub-shower with black-framed sliding glass and marble-look surround, a new vanity with modern lighting, a new toilet, exhaust fan, and matte-black hardware throughout. Everything is new from the studs up: plumbing, electrical, waterproofing, and finishes. The bathroom now reads as intentional and current rather than inherited, and the transformation was completed within the existing footprint.'
WHERE id = '9063e628-abf9-411a-a7a4-2ddc179c1689'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This West Side Vancouver luxury master bathroom was transformed from 1990s damask wallpaper, gold-framed shower, and small mosaic tile into a champagne gold European-style retreat. Cream-toned marble walls run floor to ceiling, all hardware unified in champagne gold — faucet, shower set, door pulls, lighting, mirror frames, and niche edge. The original soaker tub was retained but reframed in cream marble for a modern silhouette. The shower received a fully frameless dual-head glass enclosure with built-in quartz bench and basketweave marble mosaic floor. Twin vanity uses a French-paneled white solid-wood double vanity with arched coffered ceiling, champagne gold hexagonal hardware, and vintage brass wall sconces. A separate champagne gold arched dressing mirror with brass sconces frames the entry. Reno Stars sourced every element to the exact specification, managed artisan trades for the marble and glass work, and delivered a bathroom that functions as a daily European mansion retreat with garden and pool views through the original plantation shutters.'
WHERE id = '561278cf-e1cd-453c-8ec7-302075e6cc54'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This North Vancouver bathroom was rebuilt around a black herringbone tile surround that gives the compact space a striking focal point. The glossy black tile runs full height around a white soaker tub, with a recessed niche set into the wall and brushed gold fixtures standing out against the dark field. Downlights above the tub keep the narrow room bright. A low-profile acrylic base, frameless glass enclosure, and updated plumbing complete the renovation. The material palette of black, white, and warm gold creates a contemporary look that will not date quickly, and the durable surfaces handle daily family use without showing wear. Reno Stars delivered this compact bathroom renovation on a targeted budget without compromising on the quality of the finishes.'
WHERE id = '0d7d6efd-6f55-4d5d-b9cf-7ab9a4d40ffb'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This Richmond whole-home renovation covered the kitchen, three bathrooms, a powder room, new flooring, and fresh paint throughout the entire house. In the kitchen, the existing maple cabinetry was refreshed and paired with new quartz counters, a marble-look tile backsplash, an undermount double sink, and a new dishwasher. The main bathroom was rebuilt with a shaker double vanity under a wide framed mirror and a glass shower lined in large-format marble-look tile. Wide plank flooring and fresh paint carry through the living areas and bedrooms, tying the finished rooms together. Coordinating all six rooms across multiple trade phases while the family remained in the home required careful scheduling and daily coordination. Reno Stars managed the full project as a single end-to-end engagement.'
WHERE id = '331f03b3-624e-4ddf-9b38-c8768d3d1932'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This Coquitlam kitchen renovation was rebuilt around a long quartz island with seating for four. White and soft grey shaker cabinetry runs to the ceiling, housing wall ovens and an integrated fridge, with a linear pendant fixture over the island. The project also covered the bathrooms — quartz-topped vanities sit beneath round backlit mirrors, and a marble-look surround was fitted to the fireplace. Polished large-format tile runs through the main floor. The kitchen layout was re-designed to improve workflow between cooking, prep, and clean-up zones, and the island addition created a natural gathering point that the family did not have before. Reno Stars managed every trade across the kitchen and both bathrooms in a single coordinated project.'
WHERE id = '838f1ee4-beaa-42e7-bca5-73c810422d76'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This Richmond powder room received a compact but complete refresh as part of a whole-house renovation. The dated yellow-laminate vanity, mirror, and hardware were removed and replaced with a new 36-inch white-shaker vanity, a framed mirror, matte-black faucet and hardware, new lighting, and a new exhaust fan. The tight timeline — this was one room within a larger multi-room project — meant every trade had to be sequenced precisely. Reno Stars completed the powder room in a single day, coordinating plumbing, electrical, and finishing trades to minimise overlap with the other active work zones in the house.'
WHERE id = '018eda65-401d-4ec3-84cc-7793597e75c7'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This Vancouver home renovation covered the kitchen, bathrooms, and new flooring throughout. The kitchen was rebuilt in white shaker cabinetry with a marble-look tile backsplash and matte black hardware, paired with a quartz counter and a stainless undermount sink; a second counter run adds a double sink and further storage. In the bathrooms, large-format grey tile wraps the tub and shower surround, and a shaker vanity with a quartz top sits beside a framed mirror. Wood-look vinyl plank flooring and recessed lighting carry through the living areas, tying the finished rooms together. Reno Stars managed demolition, cabinetry, plumbing, electrical, tiling, and finishing across all rooms as a single coordinated project, completing the work on schedule without disrupting the household.'
WHERE id = '9cbc6ccf-bc07-4c2f-a867-c57ab4218728'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This Richmond whole home renovation centred on a bright, detailed kitchen with full-height marble-look slab covering the backsplash and counters, arched glass-front upper cabinets, brushed gold tapware, and a black undermount sink. The powder room pairs a vessel basin with an organic-shaped mirror, and the staircase was rebuilt in light oak. A fluted-tile shower niche is framed in marble, and built-in wardrobes with integrated lighting line the hallway. The project extended to multiple rooms beyond the kitchen, with each space receiving the same level of material detail. Reno Stars managed every trade across the full scope — cabinetry, millwork, plumbing, electrical, tiling, glass, and finishing — delivering a fully coordinated result across the entire home.'
WHERE id = 'c8a66604-00ed-4307-8b28-b95257eaa249'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This Delta kitchen renovation was rebuilt in white shaker cabinetry with a quartz waterfall peninsula and a matching full-height counter run. A deep apron-front sink sits under the window with brushed brass tapware, and a stacked tile backsplash carries the light finish behind the range and hood. Oak-toned plank flooring runs through the space. The same project renewed the bathroom, where a soft grey vanity with a black-framed mirror faces a marble-look tiled tub surround. Material selections were coordinated between both rooms so the kitchen and bathroom feel like part of the same home renovation rather than two unrelated projects. Reno Stars managed the full scope — kitchen and bathroom, cabinetry through finishing — as a single coordinated project.'
WHERE id = '7c9a9237-4f64-480b-a2fa-2d14e9faa99f'
  AND project_story_en IS NULL;
