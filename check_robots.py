import re, os

files = []
for root, dirs, filenames in os.walk('app/[locale]'):
    if 'node_modules' in root or '.next' in root:
        continue
    for f in filenames:
        if f == 'page.tsx':
            files.append(os.path.join(root, f))

results = []
for filepath in sorted(files):
    with open(filepath, 'r') as fh:
        content = fh.read()
    
    if 'generateMetadata' not in content:
        continue
    
    # Find generateMetadata function and extract its return statement
    gen_meta_match = re.search(
        r'export\s+async\s+function\s+generateMetadata\s*\([^)]*\)[^{]*\{(.*?)^\s*\}',
        content, re.DOTALL | re.MULTILINE
    )
    
    has_robots_in_return = False
    if gen_meta_match:
        func_body = gen_meta_match.group(1)
        # Check if robots appears in the return value
        if re.search(r'return\s*\{[^}]*robots', func_body, re.DOTALL):
            has_robots_in_return = True
    
    if not has_robots_in_return:
        results.append(f"NO robots in generateMetadata return: {filepath}")
    else:
        results.append(f"HAS robots: {filepath}")

for r in results:
    print(r)
