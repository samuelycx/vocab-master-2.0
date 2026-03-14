import os
import re

def sanitize_wxss_robust():
    # Use path relative to script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    dist_path = os.path.join(script_dir, "../dist/build/mp-weixin")
    if not os.path.exists(dist_path):
        print(f"Error: Dist path not found at {dist_path}")
        return

    wxss_file = os.path.join(dist_path, "app.wxss")
    if not os.path.exists(wxss_file):
        print(f"Error: app.wxss not found at {wxss_file}")
        return

    with open(wxss_file, "r", encoding="utf-8") as f:
        content = f.read()

    # Find ANY sequence starting with . that contains a backslash
    # and ends at a character that is common as a CSS selector terminator
    # but ALLOWING escaped characters inside.
    # Pattern: \. followed by characters OR backslash-pairs
    # [a-zA-Z0-9_\-] is normal. \\. is escaped.
    # Re-using a better pattern for finding class names with escapes:
    # \. (?: [a-zA-Z0-9_\-] | \\. )+
    
    matches = re.findall(r'\.(?:[a-zA-Z0-9_\-]|\\.)+', content)
    unique_matches = set(matches)
    
    # We only care about those containing a backslash
    escaped_classes = [m for m in unique_matches if '\\' in m]
    
    print(f"Found {len(escaped_classes)} escaped class selectors.")
    
    mapping = {}
    for sel in escaped_classes:
        # sel is like ".\!relative" or ".sm\:flex"
        # The class name in CSS is the whole string (including the .)
        # The class name in HTML is the unescaped version (without the leading .)
        class_name_in_html = sel[1:].replace('\\', '')
        # The new class name will replace \ with nothing or _
        # We'll use underscores to keep it safe
        new_class_name = sel[1:].replace('\\', '_')
        # Ensure the new class name itself doesn't have illegal chars
        # ! -> i, : -> _, etc.
        for illegal in "!@#$%^&*()[]{}:;\"'<>?,./|\\":
            if illegal in new_class_name:
                new_class_name = new_class_name.replace(illegal, "_")
        
        mapping[sel] = {
            "html_orig": class_name_in_html,
            "html_new": new_class_name,
            "css_new": "." + new_class_name
        }

    if not mapping:
        print("No escaped classes found.")
        return

    # 2. Update app.wxss
    new_content = content
    # Order by length descending to avoid partial replacements (though . prefix helps)
    sorted_selectors = sorted(mapping.keys(), key=len, reverse=True)
    
    for sel in sorted_selectors:
        new_content = new_content.replace(sel, mapping[sel]["css_new"])

    with open(wxss_file, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Updated app.wxss")

    # 3. Update .js and .wxml
    for root, dirs, files in os.walk(dist_path):
        for file in files:
            if file.endswith((".js", ".wxml")):
                file_path = os.path.join(root, file)
                
                # Skip large libraries that might not contain our classes
                if "vendor.js" in file and os.path.getsize(file_path) > 1024 * 1024:
                    print(f"Skipping large file: {file}")
                    continue

                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    data = f.read()
                
                new_data = data
                changed = False
                for sel, info in mapping.items():
                    orig_html = info["html_orig"]
                    new_html = info["html_new"]
                    
                    if orig_html in new_data:
                        # Match boundary: start/end of string, or space
                        # Regex for matching the class name in a string
                        pattern = r'(["\' ])' + re.escape(orig_html) + r'(["\' ])'
                        if re.search(pattern, new_data):
                            new_data = re.sub(pattern, r'\1' + new_html + r'\2', new_data)
                            changed = True
                
                if changed:
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(new_data)
                    print(f"Patched {file}")

if __name__ == "__main__":
    sanitize_wxss_robust()
