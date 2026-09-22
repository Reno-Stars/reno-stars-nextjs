#!/usr/bin/env python3
van_base = "Vancouver renovation cost 2026: kitchen $14K–$72K, bathroom $12K–$60K, basement $30K–$85K. "
van_options = [
    "True Reno Stars pricing from completed projects Lower Mainland.",  # no "in"
    "True Reno Stars pricing from completed Lower Mainland projects.",  # reorder
]
for s in van_options:
    total = len(van_base) + len(s)
    print(f"van desc total {total}/155: {s}")
