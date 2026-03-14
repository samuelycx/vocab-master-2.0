import re
import os
import json

VOCAB_PATH = os.path.join(os.getcwd(), 'src/data/vocab.js')

def clean_vocab_regex():
    print("Starting vocabulary cleaning (Regex mode - Improved POS)...")
    
    if not os.path.exists(VOCAB_PATH):
        print(f"Error: File not found at {VOCAB_PATH}")
        return

    with open(VOCAB_PATH, 'r', encoding='utf-8') as f:
        content = f.read()

    # Counters
    stats = {
        'examples_extracted': 0,
        'pos_added': 0,
        'phonetic_fixed': 0
    }

    # Expanded POS Suffix Map
    pos_suffixes = {
        'adj.': ['able', 'al', 'ful', 'ic', 'ive', 'ous', 'y', 'ent', 'ant', 'ed', 'ing', 'ar', 'less', 'ary'],
        'n.': ['tion', 'sion', 'ment', 'nce', 'ity', 'ness', 'er', 'or', 'ist', 'ism', 'ship', 'age', 'ure', 'cy', 'ty', 'th', 'dom'],
        'adv.': ['ly', 'ward', 'wise'],
        'v.': ['ate', 'ize', 'ise', 'fy', 'en', 'ed', 'ing']
    }

    # 1. Clean Phonetics
    def clean_phonetic(match):
        val = match.group(1).strip()
        if ';' in val:
            val = val.split(';')[0].strip()
        if val and not val.startswith('/'):
            val = '/' + val
        if val and not val.endswith('/'):
            val = val + '/'
        return f'"phonetic": "{val}",'

    content = re.sub(r'"phonetic":\s*"(.*?)",', clean_phonetic, content)

    # 2. Extract Examples and Clean Meanings with Aggressive POS
    output_lines = []
    lines = content.split('\n')
    
    i = 0
    current_word = None
    
    while i < len(lines):
        line = lines[i]
        
        # Detect Word Start
        word_match = re.search(r'^\s*"(.+?)":\s*\{', line)
        if word_match:
            current_word = word_match.group(1)
        
        # Detect Meanings
        if '"meanings": [' in line:
            output_lines.append(line)
            i += 1
            extracted_examples_for_word = []
            
            while i < len(lines) and '],' not in lines[i]:
                m_line = lines[i]
                m_match = re.search(r'^\s*"(.*)"\s*,?$', m_line)
                if m_match:
                    raw_meaning = m_match.group(1)
                    
                    # Extract Example (Try various bracket styles)
                    # Matches 【例] or [例] or 【例】 or [例】
                    ex_match = re.search(r'[【\[]例[\]】](.*?)($|[【\[])', raw_meaning)
                    if ex_match:
                        ex = ex_match.group(1).strip()
                        if ex:
                            extracted_examples_for_word.append(ex)
                            stats['examples_extracted'] += 1
                    
                    # Clean Meaning
                    clean_m = raw_meaning
                    
                    # Remove Examples
                    clean_m = re.sub(r'[【\[]例[\]】].*?($)', '', clean_m)
                    
                    # Remove Extensions/Collocations/PartsOfSpeech tags
                    # Handle cases like " 拓展】" (missing opening), "【拓展】", "[搭配]"
                    # Aggressive cleanup: remove anything starting with these keywords if they look like tags
                    
                    # 1. Standard patterns with brackets
                    clean_m = re.sub(r'[【\[](拓展|搭配|形容词|副词|名词|动词|同义词|反义词|释)[\]】].*?($)', '', clean_m)
                    
                    # 2. Cleanup corrupted/messy leftovers like " 拓展】【..." or "】..."
                    clean_m = re.sub(r'\s+拓展[\]】].*?($)', '', clean_m)
                    clean_m = re.sub(r'\s+搭配[\]】].*?($)', '', clean_m)
                    
                    # 3. Remove trailing brackets/punctuation garbage
                    clean_m = re.sub(r'[\]】]\s*$', '', clean_m)

                    clean_m = clean_m.strip()
                    if clean_m.startswith(')'): clean_m = clean_m[1:]

                    # POS Check/Add
                    if clean_m:
                        pos_match = re.match(r'^([a-z\.]+\.)\s', clean_m)
                        if not pos_match and current_word:
                             found_pos = None
                             # 1. Check suffixes
                             for pos, suffixes in pos_suffixes.items():
                                for suffix in suffixes:
                                    if current_word.endswith(suffix):
                                        found_pos = pos
                                        clean_m = f"{pos} {clean_m}"
                                        stats['pos_added'] += 1
                                        break
                                if found_pos: break
                        
                        comma = ',' if lines[i].strip().endswith(',') else ''
                        # Escape quotes properly
                        clean_m_esc = clean_m.replace('"', "'")
                        output_lines.append(f'            "{clean_m_esc}"{comma}')
                else:
                    output_lines.append(m_line)
                i += 1
            
            output_lines.append(lines[i]) # Closing ],
            context_examples = extracted_examples_for_word
        
        elif '"examples": [' in line and current_word:
            output_lines.append(line)
            i += 1
            existing_examples = set()
            while i < len(lines) and '],' not in lines[i]:
                e_line = lines[i]
                e_match = re.search(r'^\s*"(.*)"\s*,?$', e_line)
                if e_match:
                    existing_examples.add(e_match.group(1))
                i += 1
            
            # Merge
            if 'context_examples' in locals() and context_examples:
                for ex in context_examples:
                    existing_examples.add(ex)
                context_examples = []

            ex_list = list(existing_examples)
            for idx, ex in enumerate(ex_list):
                comma = ',' if idx < len(ex_list) - 1 else ''
                ex_clean = ex.replace('"', "'") 
                output_lines.append(f'            "{ex_clean}"{comma}')
            output_lines.append(lines[i])
        
        else:
            output_lines.append(line)
        
        i += 1

    with open(VOCAB_PATH, 'w', encoding='utf-8') as f:
        f.write('\n'.join(output_lines))

    print("Success!")
    print(f"Extracted Examples: {stats['examples_extracted']}")
    print(f"Added POS: {stats['pos_added']}")

if __name__ == '__main__':
    clean_vocab_regex()
