import os
import re

def sanitize_wxss():
    dist_path = "../dist/build/mp-weixin"
    if not os.path.exists(dist_path):
        print(f"Error: Dist path not found at {dist_path}")
        return

    # 1. Sanitize app.wxss
    wxss_file = os.path.join(dist_path, "app.wxss")
    if not os.path.exists(wxss_file):
        print(f"Error: app.wxss not found at {wxss_file}")
        return

    with open(wxss_file, "r", encoding="utf-8") as f:
        content = f.read()

    # Find all escaped class names: .[\!|\[|\]|\:|\.|\/|...]
    # Tailwind classes look like: .sm\:text-center, .\!relative, .w-1\/2, .opacity-0\.5, .top-\[50\%\]
    
    # Simple strategy: Any backslash followed by a character -> replace with _
    # And specifically handle the :is() / :where() patterns we saw earlier
    
    # Fix :is() / :where() first
    content = re.sub(r'\.([a-zA-Z0-9_-]+)(:[a-z-]+)*:(is|where)\(\.dark[^\)]*\)', r'.dark .\1\2', content)
    
    # Find all backslashed characters to build a replacement map
    escapes = re.findall(r'\\.', content)
    unique_escapes = set(escapes)
    
    print(f"Found unique escapes: {unique_escapes}")
    
    # We will replace these escapes with '_' globally in the dist folder
    # to ensure templates match the CSS
    
    # First, let's replace them in the CSS content
    new_content = content
    for esc in unique_escapes:
        char = esc[1]
        # Replace the escape sequence with an underscore
        new_content = new_content.replace(esc, "_")

    with open(wxss_file, "w", encoding="utf-8") as f:
        f.write(new_content)

    print("Sanitized app.wxss")

    # 2. Global search and replace in ALL files in dist to match the new class names
    # This is heavy but necessary if we want Tailwind complex classes to work
    for root, dirs, files in os.walk(dist_path):
        for file in files:
            if file.endswith((".js", ".wxml", ".json", ".wxss")):
                file_path = os.path.join(root, file)
                if file_path == wxss_file:
                    continue # Already did it
                
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    data = f.read()
                
                new_data = data
                changed = False
                for esc in unique_escapes:
                    # In JS or WXML, the class names are stored AS IS (without backslash escaping in the string)
                    # BUT with the special character itself. E.g. "sm:text-center" or "!relative"
                    char = esc[1]
                    if char in data:
                        # Replace character with _
                        new_data = new_data.replace(char, "_")
                        changed = True
                
                if changed:
                    with open(file_path, "w", encoding="utf-8") as f:
                        f.write(new_data)
                    print(f"Updated {file}")

if __name__ == "__main__":
    sanitize_wxss()
