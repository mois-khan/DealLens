import json
import re

def parse_json(text: str) -> dict:
    original = text
    text = text.strip()
    match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
    if match:
        text = match.group(1).strip()
    else:
        start_dict = text.find('{')
        start_list = text.find('[')
        start_idx = -1
        if start_dict != -1 and start_list != -1:
            start_idx = min(start_dict, start_list)
        else:
            start_idx = max(start_dict, start_list)
        end_dict = text.rfind('}')
        end_list = text.rfind(']')
        end_idx = -1
        if end_dict != -1 and end_list != -1:
            end_idx = max(end_dict, end_list)
        else:
            end_idx = max(end_dict, end_list)
        if start_idx != -1 and end_idx != -1 and end_idx >= start_idx:
            text = text[start_idx:end_idx+1]
    return json.loads(text)

test_str1 = '```json\n{"test": 123}\n```'
test_str2 = '{"test": 123}'
test_str3 = 'Some text\n{"test": 123}\nTrailing text'

print('1', parse_json(test_str1))
print('2', parse_json(test_str2))
print('3', parse_json(test_str3))
