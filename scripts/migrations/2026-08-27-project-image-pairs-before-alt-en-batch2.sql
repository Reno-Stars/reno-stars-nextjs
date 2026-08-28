-- Migration: project_image_pairs beforeAltTextEn batch 2 — new projects after 2026-08-23
-- Rows: 150 published project_image_pairs missing before_alt_text_en (38 projects)
-- Source: title_en field on project_image_pairs
-- NOT APPLIED — requires human execution after PR merge
-- Pattern: UPDATE project_image_pairs SET before_alt_text_en = title_en WHERE id = '...' AND before_alt_text_en IS NULL;

BEGIN;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'a56fab00-9b26-421d-a7c3-c2c8a71044f5'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '60d1487f-d256-493e-9fa5-7eb8d7147449'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'ae05fc34-7c61-4ba7-b2ba-ba19ecf825b7'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'af891bb0-8dad-401d-a3e3-dd54e0efe7c8'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '8fbec064-59db-4d7a-ac19-31cd36b156b7'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'd289b9da-58bc-4c8b-a1fa-a54259e3b3c5'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '043a5990-a3be-48d5-a430-252595770930'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '9d03b2e5-0044-4a42-9e32-14f8db8278b5'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '91f6a224-771c-4913-9458-69e53035855b'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '0cccfeaa-c331-4f27-ad93-b884c5fa5a9f'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'dc430730-d441-4610-84e2-8bdb68d38e72'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '30f6a9cd-4c46-4d81-aa58-7542523d3b8d'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'dee146a9-260c-4c97-8f0d-f9d58306ceee'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '8be9ceac-59b2-416f-b024-ec08bcd830af'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '2ea04405-51e8-4e63-92f4-c5d9c4d31f3f'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '27984aaf-72b2-4763-b8c7-d41be0f7a74c'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '1002e4a5-8d8f-4f7d-8bab-7a8dda5533b9'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'c3184231-3286-4adb-a505-a44211a6e830'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'e1244ff4-b2fa-46ed-a5d1-82852b8f6c71'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '88c0bdf1-fb8d-4c99-bc33-70c8c6f95d57'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'e740b728-f490-4ebe-9fbd-c404af0a1396'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '6d619b10-4b1d-4dd7-b694-b08fb2e5fa9f'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '79d2f843-d40d-4235-ae6d-41637d099885'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '6b8e2018-9b25-4fd8-8488-087ddff5c71a'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'da5aa467-4ae8-44e7-89e3-58fa030f8deb'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'c2ca3b99-d3b3-41f5-9059-8db29d60bf01'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'deb62913-d242-4659-84f5-6854c656619f'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'c7f0c86d-cd1b-454f-a74f-974223540404'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '6fd6dfc2-e41e-44c9-b060-d765bd1c9651'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '15aef9e3-3521-4a24-8726-81f34abe20a3'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '943f3f08-952b-443e-b43f-6574ca96eb39'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '63ae9638-32d2-488d-ab6a-cc26c0ea12ac'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '615f510e-b1aa-41be-bf81-2e75cb2817c1'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '91ad8b69-d896-4c1c-8532-abdd67c24880'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '411f96a2-b161-4d17-9d5e-f8cbf1a74bee'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'f475714e-fa8e-4125-896d-580f0fac3859'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'e76f3370-a056-4850-8b6d-fafa71d8b002'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'bd5751c3-8a15-41d4-84d5-c59f431e1dd9'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '262b20fa-1673-44a6-92c9-6ec7b06d1e03'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'b4e16007-50e5-47a0-94ca-7bfb99d296d8'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'daa98126-8cab-42fd-9c60-72c14e1525c6'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '6b135417-aa87-470b-838b-62a9e47d39a2'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'b6e5abf5-0b8b-4f39-ae7d-e39bdfa0f6c3'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '07860f02-d3bc-4d48-a10c-d44287606e75'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'f95e7ba0-1f58-4fff-83cd-b9c16807a77f'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '461bf7db-1a65-4b79-a0ad-ee2530b925bc'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '280a2f50-3fb9-41c7-ab10-00327df48998'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'a9d6653a-219c-43ed-8974-4f51d4a25e26'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '624ce942-ff70-45e3-93fa-87d5cc5a5690'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '4a3137f1-b6c6-49a6-b09f-8966e6bf1c9c'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '5904ed07-6a71-4838-83c4-308ff127b1e5'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '01628097-425e-455f-b2f1-361b2074f441'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'ad0d5023-ebc8-4cb8-b63a-d95a0b875548'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '1a448beb-d3ea-4bf2-b235-39a57ffff378'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '9d7214b0-fda6-43ad-9534-3352b09008e9'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'e373dc0d-4512-41af-8595-74f9a2a12ebf'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '65f21c0f-de71-4b97-9384-589babbeb639'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '4fbab49e-8c3e-4e42-9174-3eae92144dff'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '1a2b0349-c244-4b59-b7cf-c77ace2eead6'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'b41d1955-348f-4cbd-8dc9-c6b4802a876b'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '51195d80-9519-4a22-80f5-a556187a28b6'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '9180cee7-e0e3-41cc-8f91-2d624d7191ca'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '7298abce-3854-436a-be46-fa051b846227'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '319f473b-7db3-4367-86b0-ecc04fe9d219'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'd4761a85-7fa2-4eac-81c9-e4a8cd1cd8de'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '260ced37-d170-4d13-b5ad-28ff7d1449a6'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '3a9a1034-fcf4-42c1-9aac-463c87049cd3'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '4aabe80b-0631-45b4-896a-d8aefa62ef1c'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '6f1ea06d-cb51-4765-b609-882a2c67f6d0'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '57227518-03f4-43be-b451-cf6b5829a8dd'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '50e6b9d6-adea-4f7b-81f5-4c61924b0526'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '0443ad16-cb06-474a-ac45-00bbd0c4bd8b'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'c58947b5-234f-4503-bea8-ca246a9e9b5b'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'a4c102f3-61ab-44c5-8346-73b6b1056402'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '2e1f609c-d809-4e2d-8c84-06f0f3dd0b52'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'f16b3233-5fcb-4cfe-8ad0-cc6073e8902d'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'fcd6422e-ff03-49d2-a00b-0b10a47dbc31'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '9d7aa325-ca6b-4744-8e63-5e0ade107288'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '11f4b471-0338-490b-aa72-4898c25450fd'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '59013c4c-0449-4d8f-86bf-4286c66402b8'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'a7d11f64-e2d9-494e-abcb-21cb718b60b3'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '921d4939-d5f5-43dd-b905-974830f8aa27'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '04b0a43c-b793-4adf-92f6-15e912f19a8f'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '4959025c-7002-4ffc-91d3-7ea1dbd7e2c3'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'fe53529a-0e3b-4bc1-8c0f-c51ac3bf9af7'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '8ae07580-9724-4481-94bf-db1c2ceec344'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'fb27c850-afab-4b84-8f86-513a1a340c51'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '414d7d7a-8f79-49e8-9873-57457e3c79d4'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'd86c126c-ee32-4365-bee2-64fa110b4493'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '2f4a067e-9e0e-4c98-8f6d-e9830139b5df'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'a4ffea51-a939-4272-a816-658079a7b90f'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '57c2acb2-cd88-4573-8b24-1829e1033ae0'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'fc69c193-3a26-488b-895c-3b8210508a22'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '2a1cef46-85cb-4d95-aad0-691c07ecd63a'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'd027d875-6748-47fb-a182-e837b7ed8505'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'cd0f6d68-23d0-4665-ba68-ec04def54917'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '703c2c38-c9b4-412f-8df8-1a6dc6ea81da'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '66a979e8-54e9-482f-aef5-82f03010caf2'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'e3412f0c-11f2-4bde-a1ca-c10fc91bd69d'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'ead9ff15-c1ac-41fd-a125-5d0c81cea9b1'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'beb3828e-862a-4d48-bce2-08660f4b9c91'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'f92464e9-1447-4a26-8b48-3eead69542de'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'f196a0da-5ad0-4d6a-a64d-10d98c8c234c'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'db3479cd-4b5b-4758-af95-eca0ce0d49e8'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '05870cd5-23d4-4841-8a05-e44cf4e8c6ff'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '47b9b4f2-e311-419c-bc1c-6f7b028905ed'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'c488e65e-a434-4031-8e61-518be1743073'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '7d3eb212-b3c5-4662-a467-b6beaa498b97'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '11fb5bca-d4e3-4b58-8f31-ae299d983f20'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '6b94df3a-4795-4e03-8d3a-df8a97e1406f'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '9d684111-066d-4e5d-be33-a11b692f5865'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '37ca610f-eed9-4810-a128-01b01855da8f'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'd672a50e-d3a7-43cb-8520-7a9064c67fdd'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '595f74b9-96ff-4ea9-97f6-c170687f7b64'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '5f2e41d0-7c37-41e2-99ff-63e758f4bef5'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '0f943a70-cc70-41bb-98fd-ac5e5538ec52'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'ef32215a-1d41-4482-befa-f24bf8d160e7'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'a209098d-2652-4ca3-87d3-5b559f82b079'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '1aa17cdd-481d-4cc2-a8b5-7ed6edfdceb7'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '4ea6eae8-4a85-4ca8-bf3c-e32f1508bd7d'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'f52f9925-80b0-4a66-8043-e85475ef46ab'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '4b3b4225-d02e-47d8-b9b2-cc9c0f112dab'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '707ec9da-e32f-4f7f-b035-553a19715d48'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'e65995a9-f3fc-4ab2-b094-828aba1de792'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '37dc99d9-9445-4817-91f0-97033af8da63'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '30d8c770-ce1d-4750-b30f-297dfb807bee'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '161918b8-4bb4-4472-89f1-80195274c655'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'a9bbcf90-d1cb-4d7a-8cd3-776668784623'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '4fa30b78-a92e-41fa-8799-b967f155c24c'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '5cff9d8e-87cb-481c-a873-e24e23ed3640'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'fbff8746-2caf-4ad6-92c2-09b680f3857a'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '10be56a7-49d8-4511-8d00-b4ee8da6e27a'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'b8285cfe-5ab0-4375-9747-8a4449e7d5d7'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '64caaaa4-729a-4dd8-a92c-7e95319b2131'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '2eb5b788-4c3e-453c-89e9-7ad768fb4987'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'fa67f7e2-82e0-4101-baf7-7e585f8410cf'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '9570830f-3966-43fe-b938-75d1e34ee3e9'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '079663bb-9203-462c-b24d-436967a68404'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'f584ee99-553c-42d9-8316-6835da354a30'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '4e8d194e-d07e-409a-aa62-2a7b9bbc1416'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '591e8bb1-ca5c-41dc-98d7-305cde4c8d26'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '05e42107-088a-457a-a5aa-db325d678bd7'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '491d2f11-127f-4e9d-a3d1-b831daef4842'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '6dbc0d43-1a78-4827-a4af-1ff564c4c7c8'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '369a850f-6942-4c6b-9e9c-0c8e392739b0'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'c4825ab7-4fbe-409c-82a3-881d286de4bd'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = 'eb20e5a6-5541-4567-9634-706fe0c4ff70'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '645dbb52-1c04-4e2e-b147-d811afaf4f0b'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '16c45fa7-8bb7-4ea2-99f5-bbe1b1e24092'
  AND before_alt_text_en IS NULL;

UPDATE project_image_pairs
SET before_alt_text_en = title_en
WHERE id = '9e6b9b49-0ac3-4bbe-baa6-bea86452be29'
  AND before_alt_text_en IS NULL;

COMMIT;
