#!/bin/bash
curl -sf -X POST "https://www.reno-stars.com/api/blog/" \
  -H "Content-Type: application/json" \
  --data-binary @/workspace/repo/blog-drafts/mold-publish.json
echo "EXIT:$?"
