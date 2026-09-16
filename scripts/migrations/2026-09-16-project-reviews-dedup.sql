-- Deduplicate project_reviews: keep lexicographically smaller id per unique body text
-- NOT APPLIED — requires human to run against the live database
-- Covers 7 duplicate pairs (14 rows total), all with body_lang = 'en'
BEGIN;

-- Pair 1: "I am so happy we went with Ryan and Jasper for our renovatio..."
DELETE FROM project_reviews WHERE id = '9306b916-d003-45cc-95da-eccf89057aee';

-- Pair 2: "Pretty happy with this renovation company overall. Pricing w..."
DELETE FROM project_reviews WHERE id = '5cf6172c-1c36-4b31-bf53-3e2692bec26a';

-- Pair 3: "This is our second project with Reno Stars, and once again t..."
DELETE FROM project_reviews WHERE id = '9283f5bf-ac42-4843-8098-5cbe1a0e0611';

-- Pair 4: "We had a great experience renovating our 30-year-old townhou..."
DELETE FROM project_reviews WHERE id = 'a33b79ef-f1d9-4280-9a91-5844207a94fb';

-- Pair 5: "We recently needed a complete condo remodel. I stumbled thro..."
DELETE FROM project_reviews WHERE id = '4d8d5bfa-354c-45cf-82ef-a82b87ce1a57';

-- Pair 6: "We're really happy with the work Jasper, Ryan, and their tea..."
DELETE FROM project_reviews WHERE id = '75d406e9-fe0e-4d55-afbe-21827c873ec9';

-- Pair 7: "We worked with Reno Stars Construction on a partial renovati..."
DELETE FROM project_reviews WHERE id = '8dcdd4b3-c2d2-4452-a2a8-aaec7c99acb4';

COMMIT;
