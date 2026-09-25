---
title: "Fix projects service_type NULL — 3 Richmond bathroom projects"
---
-- Ladder 2/3: 3 published projects have NULL service_type, breaking category filtering.
-- hallway-bathroom, powder-room, and ensuite are all bathroom-type renovations.
UPDATE projects SET
  service_type = 'bathroom',
  updated_at = NOW()
WHERE slug IN (
    'hallway-bathroom-renovation-richmond',
    'powder-room-renovation-richmond',
    'ensuite-bathroom-renovation-richmond'
  )
  AND is_published = true
  AND service_type IS NULL;
