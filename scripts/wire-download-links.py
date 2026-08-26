"""
Wire DownloadLink component into all files that have raw <a href="https://..."> external links.
For each file:
1. Add `import DownloadLink from '@/components/download-link';` if not already present
2. Replace `<a href="https://...">` with `<DownloadLink href="https://...">` and close tag
"""

import re
import os

BASE = "/home/z/my-project/src"

# Files to process (from the Explore agent's research)
FILES = [
    "app/page.tsx",
    "components/citizen-feedback-page.tsx",
    "components/anonymous-tip-page.tsx",
    "components/constitution-page.tsx",
    "components/manifesto-tracker-page.tsx",
    "components/rti-generator-page.tsx",
    "components/procurement-monitor-page.tsx",
    "components/fy-comparison-page.tsx",
    "components/audit-trends-page.tsx",
    "components/budget-simulator-page.tsx",
    "components/corruption-heatmap-page.tsx",
    "components/service-delivery-page.tsx",
    "components/procurement-redflags-page.tsx",
    "components/budget-scatter-page.tsx",
]

# For files with window.open() calls (excluding social share which should remain raw)
WINDOW_OPEN_FILES = {
    "components/procurement-monitor-page.tsx": [
        # line 156: ppip search — skip, dynamic URL with template string
    ],
    "components/project-detail-drawer.tsx": [
        # line 636: oagkenya link
    ],
    "components/data-fetcher-page.tsx": [
        # line 119: google search — skip, dynamic URL
    ],
}

# Files to skip for window.open (social share or dynamic search URLs that shouldn't be gated)
SKIP_WINDOW_OPEN = {
    "components/governor-report-card-page.tsx",  # WhatsApp/X social share
}


def process_file(filepath_rel):
    full_path = os.path.join(BASE, filepath_rel)
    with open(full_path, "r", encoding="utf-8") as f:
        content = f.read()

    original = content

    # 1. Check if DownloadLink is already imported
    has_import = bool(re.search(r'import\s+DownloadLink\s+.*from\s+.*download-link', content))

    # 2. Replace <a href="https://...">...</a> with <DownloadLink href="...">...</DownloadLink>
    # Match <a href="https://..." ...>...</a> — handle multiline
    # Pattern: <a href="https://..." followed by attributes until >, then content, then </a>
    # We need to be careful to only match external URLs

    # Simple approach: find all <a href="https:// patterns and replace them
    count = 0

    # Pattern to match <a href="https://..." ...attributes...>content</a>
    # Using DOTALL for multiline
    pattern = r'<a\s+(href="https://[^"]*"[^>]*?)>(.*?)</a>'

    def replace_a_tag(match):
        nonlocal count
        attrs = match.group(1)
        inner = match.group(2)
        count += 1
        return f"<DownloadLink {attrs}>{inner}</DownloadLink>"

    content = re.sub(pattern, replace_a_tag, content, flags=re.DOTALL)

    # 3. Handle window.open() calls — only for static URLs in specific files
    filename = os.path.basename(filepath_rel)
    if filepath_rel not in SKIP_WINDOW_OPEN and filepath_rel in WINDOW_OPEN_FILES:
        # Replace window.open("https://...") patterns
        # We'll skip window.open for now as they're more complex (dynamic URLs, callbacks)
        pass

    # 4. Add import if needed and replacements were made
    if count > 0 and not has_import:
        # Find the last import line and add after it
        import_matches = list(re.finditer(r'^import\s+.*?;?\s*$', content, re.MULTILINE))
        if import_matches:
            last_import = import_matches[-1]
            insert_pos = last_import.end()
            content = content[:insert_pos] + "\nimport DownloadLink from '@/components/download-link';" + content[insert_pos:]

    if content != original:
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"  ✅ {filepath_rel}: {count} <a> tags replaced, import {'added' if count > 0 and not has_import else 'already present'}")
        return count
    else:
        print(f"  ⏭️  {filepath_rel}: no changes needed")
        return 0


total = 0
print("Wiring DownloadLink into all files with external <a> tags...\n")
for f in FILES:
    total += process_file(f)

print(f"\nTotal: {total} links wired across {len(FILES)} files")
