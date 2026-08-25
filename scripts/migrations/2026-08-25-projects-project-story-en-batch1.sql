-- Migration: 2026-08-25-projects-project-story-en-batch1.sql
-- Target: projects with is_published AND project_story_en IS NULL (batch 1 of 2)
-- 56 total rows; first 28 addressed here.
-- Derived from: description_en field (rewritten as a first-person project narrative)
--
-- NOT APPLIED — needs a human to run this file against the production database.
-- DO NOT run this migration more than once on the same database.
-- Run with: psql $DATABASE_URL -f scripts/migrations/2026-08-25-projects-project-story-en-batch1.sql

UPDATE projects
SET project_story_en = 'This retail renovation transformed a toy store in Metrotown, Burnaby into an inviting and organized shopping environment. The project included structural wall modifications to improve the floor plan, durable commercial-grade laminate flooring, a complete interior repaint in bright, child-friendly colors, and all necessary government inspections to ensure compliance. Completed within a 2–3 week timeline and within a $23,000–$25,000 budget, the renovation helped the business reopen with an upgraded storefront that better serves its customers.'
WHERE id = '1ea53266-6319-4b03-b109-d7e72aa2d8d9'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This Vancouver whole house renovation transformed a dated home into a fresh, cohesive living space. The bathroom was updated with a new freestanding bathtub with floor-mounted filler, updated wall tiles, and a stylish vanity with ample storage. The project encompassed new engineered hardwood flooring throughout the main areas, optimized recessed LED lighting, and complete interior painting in a neutral palette. Crown molding and updated baseboards add architectural detail, while new light fixtures in the hallway and bedrooms complete the transformation. The homeowners now have a bathroom that functions as a personal spa retreat and a home that feels renewed throughout.'
WHERE id = '3a8a197d-01fd-4187-8ee6-9164a974c900'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'A full flooring replacement in a Richmond high-rise condo, this project installed light oak engineered plank across the living areas and bedrooms, with clean transitions into the existing tile at the entry and bathroom thresholds. Baseboards were refitted to the new floor height, and the pale finish keeps the rooms bright against the floor-to-ceiling windows. The result is a home that feels larger and more cohesive, with a floor finish that will hold up to daily wear from the owners and their family.'
WHERE id = '3ef5531b-cfb9-454d-9cd2-90887b3775f0'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'A complete commercial renovation of a dental clinic in Burnaby, finished in just one week. This was our second project with this client — the first was a fireplace renovation at their home. When the dentist needed to open as quickly as possible, the entire build-out had to be compressed into a single week. We re-planned the floor zones, traffic flow, and storage to maximize every square foot, then executed the demo, drywall, electrical, plumbing, cabinetry, quartz countertops, and finishing work back-to-back. Commercial projects are not like residential — when the clinic is not open, the dentist is not earning. Time is cost, and efficiency is the deliverable.'
WHERE id = '70047904-0a5b-4cfa-8b3e-e2afe4a04114'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This dual bathroom renovation in a Burnaby family home updated two full bathrooms with coordinated modern finishes. Each bathroom features custom frameless glass shower doors, LED-backlit mirrors, and a tiled shower base with a sleek linear drain. Matte hardware and neutral-toned tiles create a unified look between the two spaces. Multiple trades — plumbing, electrical, glass, and tile — were carefully coordinated to complete both bathrooms efficiently within a single project timeline. The family now has two bathrooms that feel like new, with a design that will age well and materials that stand up to daily use.'
WHERE id = 'fe05b33d-9548-443a-adc7-35744b2fe6c8'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'A complete bathroom renovation as part of a whole house transformation in a Vancouver family home. The homeowners wanted a cohesive modern look throughout, so we replaced outdated fixtures with sleek contemporary hardware, installed new porcelain floor-to-ceiling tiles, and added a floating vanity with integrated LED lighting. The result is a bright, spa-inspired bathroom that flows seamlessly with the rest of the renovated home. Every detail — from the tile selection to the fixture placement — was chosen to balance aesthetics with the practical needs of a busy family.'
WHERE id = '95830870-fb6b-4632-a19c-4729002bd91e'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This Burnaby townhouse kitchen renovation features striking wood-vein custom cabinets paired with a matte black island and matching black fixtures. The project extended beyond the kitchen to include new engineered hardwood flooring, optimized recessed LED lighting throughout the main floor, and a complete interior repaint. The result is a bold, contemporary kitchen that serves as the centerpiece of the open-concept living space. Storage was maximized with custom cabinetry designed around the way the family actually uses the kitchen, and the lighting design ensures the space is as functional as it is visually impressive.'
WHERE id = '02b37032-37bc-4562-8553-f9da01aa397d'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This renovation transformed a daughter outdated bathtub bathroom into a sleek walk-in shower in a Richmond townhouse. The design features large gray porcelain tiles paired with matte black fixtures, a frameless glass shower door, and a custom miter-cut niche for toiletries. The color palette of gray, black, and white creates a timeless look that appeals to both parents and the young homeowner, while the durable materials ensure years of daily use. The transformation took the bathroom from a space the family avoided to one the daughter is proud to show her friends.'
WHERE id = '7b2e5611-c53b-4fd7-9e29-73845dbef728'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This comprehensive project renovated three and a half bathrooms in a Delta family townhouse, coordinating multiple trades across four distinct spaces. The main bathroom features a walk-in shower and freestanding bathtub with large porcelain tiles and warm lighting. The children bathroom includes a practical bathtub with slip-resistant flooring. A ground-floor powder room was updated with warm-toned accent tiles and matte black fixtures, while the basement bathroom received a complete overhaul with waterproofing, a new shower, and fresh finishes throughout. Managing four spaces simultaneously required careful scheduling to minimize the disruption to a family still living in the home during construction.'
WHERE id = '0f8df3ba-5f59-4abd-89c6-5567810e7d5e'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This comprehensive Vancouver whole house renovation transformed a dated family home into a stunning modern residence through thoughtful design and meticulous craftsmanship. The project encompassed every major living area — kitchen, bathrooms, living spaces, and bedrooms — creating a cohesive contemporary aesthetic throughout. The kitchen received custom cabinetry with quartz countertops and stainless steel appliances, while the primary bathroom was upgraded with a walk-in shower featuring floor-to-ceiling tiles and frameless glass. Living areas were refreshed with new engineered hardwood flooring, updated lighting fixtures, and a modern neutral colour palette that maximizes natural light. The project also included structural improvements, updated electrical and plumbing systems, and energy-efficient windows. Custom millwork and built-in storage solutions were integrated throughout to maximize functionality in every room. This Vancouver home renovation demonstrates how a unified design vision can breathe new life into an older property while respecting its original character and neighbourhood context.'
WHERE id = '33a29a45-e781-41a3-9391-66eca2929f70'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This kitchen renovation in Coquitlam centred on a long quartz island with seating for four. Shaker cabinetry in white and soft grey runs to the ceiling, housing wall ovens and an integrated fridge, and a linear pendant fixture lights the island. The project also covered the bathrooms, where quartz-topped vanities sit beneath round backlit mirrors, and a marble-look surround was fitted to the fireplace. Polished large-format tile runs through the main floor. The result is a kitchen that handles daily family life while looking impressive enough for entertaining.'
WHERE id = 'bdabe61c-1551-443b-9db5-e7d6c5d9bb82'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'A commercial renovation that transformed a Vancouver skin lab into a modern, client-facing clinic space. The project involved a complete interior overhaul to create a clean, clinical aesthetic that instils confidence in clients from the moment they walk in. All work was coordinated around the clinic operating schedule, with non-disruptive phases allowing the business to continue serving clients throughout. The finished space communicates the quality of the services offered and has become a genuine asset to the business.'
WHERE id = '00efc301-c95b-4a9f-946b-2539a9a87d03'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This Richmond kitchen renovation centres on a marble-look kitchen with arched glass-front upper cabinets, brushed gold tapware, and a black undermount sink. The powder room pairs a vessel basin with an organic-shaped mirror, and the staircase was rebuilt in light oak. Elsewhere, a fluted-tile shower niche is framed in marble, and built-in wardrobes with integrated lighting line the hallway. The homeowners wanted a bright, detailed kitchen that works for daily cooking and dinner parties alike, and the material selections deliver both without appearing overdone.'
WHERE id = '183b5fb7-0fce-4f50-b3d3-3dc690eca445'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This Coquitlam condo kitchen renovation focused on maximizing the feeling of space in a compact layout. Custom cabinetry was designed to use every available inch — including over-fridge storage and pull-out pantry systems — while a clean material palette of white and warm wood keeps the room feeling open. The project included new countertops, a tile backsplash, and updated fixtures, all selected to be practical for daily use and easy to maintain. The result is a kitchen that functions at a higher level than its square footage suggests.'
WHERE id = 'df893f9f-54de-4f99-92df-df934196d5be'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This commercial warehouse renovation in Burnaby transformed an industrial storage space into a functional, organized commercial environment. The project involved significant structural and mechanical work to bring the space up to current commercial code, including updated electrical, improved lighting, and floor repairs. The finished space provides the client with a functional base of operations that supports their business activities and meets all regulatory requirements for their industry.'
WHERE id = '3cba3895-b4c5-412f-8a96-35047192bdda'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This Langley kitchen renovation centres on a waterfall island in a bold contemporary design. The homeowners wanted a kitchen that could handle an active family lifestyle while making a statement visually. Custom cabinetry was paired with premium quartz counters and a full tile backsplash in a coordinated material palette. The island design provides additional seating and a natural gathering point for the family, while the durable surfaces handle daily traffic without showing wear.'
WHERE id = 'd1899877-1cc3-4043-9544-dfe0f7fdaba6'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This Richmond kitchen renovation features clean modern lines and warm wood tones for a kitchen that feels both contemporary and inviting. The project included custom shaker cabinetry, a large central island with bar seating, and a full backsplash in a coordinated tile. Lighting was upgraded throughout, with recessed fixtures providing ambient light and pendant fixtures over the island adding task lighting and visual interest. The kitchen now serves as the natural centre of the open-plan living space, equally suited to family dinners and hosting.'
WHERE id = '5f5770ac-b5e3-4089-bef7-d78d0fcac1be'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This Langley kitchen renovation features a waterfall island design paired with custom cabinetry and matte black fixtures for a cohesive modern aesthetic. The material palette was chosen to balance durability with visual impact — quartz counters handle daily use without showing wear, while the bold island design makes a statement in the open-plan living space. The project also included updated lighting and a full backsplash in a coordinated tile. Every detail was chosen to create a kitchen that works as well for the way the family actually lives as it looks in the finished photos.'
WHERE id = 'a83452cd-415b-457c-9ab0-5b533920ca5c'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This Burnaby townhouse kitchen renovation transformed a dated kitchen into a bright, functional family space. White shaker cabinets provide classic style that will age well, paired with a quartz countertop that handles daily meal prep without showing wear. The project included new flooring, updated lighting, and a full backsplash in a practical tile that is easy to clean. The kitchen now functions as the heart of the home — a space the family gathers in naturally, not just a room they pass through on the way to somewhere else.'
WHERE id = '8a01e9c4-e89e-4784-b818-e5d68bd06bbd'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This Vancouver master bathroom renovation was designed around the idea of a personal spa retreat at home. A curbless walk-in shower with floor-to-ceiling tile and a frameless glass enclosure creates a clean, accessible bathing space. Heated floors add comfort on cold mornings, and a floating double vanity with integrated lighting provides storage without taking up visual space. Material selections were made to create a sense of calm — warm stone tones, matte fixtures, and backlit mirrors that provide functional light without harsh glare. The renovation gave the homeowners a bathroom that makes starting and ending each day a more restorative experience.'
WHERE id = '550493d9-5185-474c-af64-9ee819310746'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This renovation project in Coquitlam focused on a budget-friendly transformation that still delivers meaningful visual and functional improvements. New flooring, updated lighting, and refreshed surfaces brought the condo up to a standard that made it competitive in the rental market without over-improving for the neighbourhood. The bathroom received a targeted update — new vanity, tile, and fixtures — that delivers a modern feel at a proportionate cost. The result is a property that rents faster and at a stronger rate than comparable units in the same building.'
WHERE id = '65163509-80c6-4572-bbba-831fdf31db9f'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This Burnaby townhouse renovation transformed an outdated kitchen into a space that works for how a modern family actually lives. A redesign of the layout opened up sightlines to the living areas, and a large central island became the natural hub of the home. Custom cabinetry maximizes storage without visual clutter, and premium finishes — quartz counters, matte black fixtures, and coordinated tile — give the kitchen a high-end feel without appearing impractical for daily family life. The renovation made the kitchen the reason the family chooses to spend time together at home.'
WHERE id = 'acebea3c-62fb-462e-a400-e9a24f911563'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This North Vancouver bathroom renovation was designed around a black herringbone tile surround that gives the space a striking focal point. The compact layout was rethought to improve circulation and storage — a floating vanity, backlit mirror, and linear drain in the walk-in shower all contribute to a feeling of openness that belies the room size. The material palette of black, white, and warm wood creates a contemporary look that will not date quickly, and all fixtures were selected for durability in a household with children.'
WHERE id = '40eb125c-4600-4ca6-a842-aa90e2708e49'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This Burnaby family home renovation covered the kitchen, three bathrooms, and new flooring throughout — coordinating six trades across multiple phases while the family remained in residence. The kitchen was rebuilt with white shaker cabinetry, quartz counters, and a tile backsplash, while each bathroom received a targeted renovation tailored to how that specific household member uses it. New plank flooring and fresh paint carry through the living areas and bedrooms, tying the finished rooms together into a home that feels cohesive and updated from the moment you walk in.'
WHERE id = '59e00107-21be-45d5-886f-cd4de905694f'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This Delta kitchen renovation was rebuilt in white shaker cabinetry with a quartz waterfall peninsula and a matching full-height counter run. A deep apron-front sink sits under the window with brushed brass tapware, and a stacked tile backsplash carries the light finish behind the range and hood. Oak-toned plank flooring runs through the space. The same project renewed the bathroom, where a soft grey vanity with a black-framed mirror faces a marble-look tiled tub surround. The homeowners were looking for a kitchen that feels premium but functions for daily family life — this design delivers both without appearing over-styled.'
WHERE id = '66177cfa-9cbb-4ac4-94b9-515c66786a05'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This whole-house renovation project in Burnaby focused on creating a cohesive modern design throughout every room in the home. The kitchen features custom cabinetry and a large central island, while the living areas received new flooring, updated lighting, and a neutral paint palette. The bathrooms were renovated with coordinated finishes that create a unified feel across the home. The homeowners had lived in the house for years and wanted to update it in a way that felt like finally getting what they had always pictured — not just a collection of updated rooms, but a home that feels intentional.'
WHERE id = 'd9af4d6e-e73e-4d89-87dc-b5fdafab7b3a'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This Richmond townhouse renovation updated the kitchen, bathrooms, and main living areas for a family ready to make their home work better for their lifestyle. The kitchen received custom shaker cabinetry, new quartz counters, and a full backsplash, while the bathrooms were renovated with modern finishes including frameless glass shower enclosures and backlit mirrors. New flooring, updated lighting, and fresh paint throughout tied the completed rooms together into a home that feels renewed. The family moved through the renovation with minimal disruption and returned to a home that genuinely makes their daily life better.'
WHERE id = '181c865f-23d5-4254-aa2d-a4eaf857201a'
  AND project_story_en IS NULL;

UPDATE projects
SET project_story_en = 'This Vancouver bathroom renovation was designed to bring a spa-like quality to a compact primary bathroom. A curbless walk-in shower with floor-to-ceiling tile and a frameless glass enclosure creates an accessible, visually clean bathing space. A floating vanity with integrated LED lighting maximizes storage without overwhelming the room, and a heated floor system adds comfort on cooler mornings. The material palette — warm stone tones, matte fixtures, and a backlit mirror — creates a cohesive atmosphere that makes the bathroom a place the homeowners actually want to spend time in, not just a utilitarian space to move through quickly.'
WHERE id = '906ab373-f8c0-4262-863f-25117f7b5efe'
  AND project_story_en IS NULL;
