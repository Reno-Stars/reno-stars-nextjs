-- Migration: 2026-09-13-service-areas-description-zh-en-cleanup
-- Table: service_areas
-- Issue: description_zh contains English place names that should be in Chinese
-- Richmond: "Richmond" is English; correct Chinese city name is 列治文
-- Port Moody: "Heritage Mountain", "Ioco", "Newport" are anglicized sub-area names
-- Status: NOT APPLIED — requires human to run
-- Sub-area names (Heritage Mountain, Ioco, Newport) kept anglicized as they
-- have no common Chinese translation in local usage.

UPDATE service_areas
SET description_zh = '列治文值得信赖的装修团队，负责公寓和住宅的厨房、浴室以及全屋改造。'
WHERE id = '3c5aa447-404e-4fdd-8cf9-dc4759885c1c'
  AND description_zh = 'Richmond 值得信赖的装修团队，负责公寓和住宅的厨房、浴室以及全屋改造。';

UPDATE service_areas
SET description_zh = '满地宝的专业厨房和浴室翻新，从遗产山到 Ioco 和 Newport。'
WHERE id = 'f2c05b08-fee7-4cc5-b695-91200fc39b44'
  AND description_zh = '穆迪港的专业厨房和浴室翻新，从遗产山到伊奥科和纽波特。';
