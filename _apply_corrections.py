import re

corrections = {0:1,1:1,2:1,3:1,4:1,5:1,6:1,7:2,8:1,9:2,10:2,11:2,12:1,13:2,14:1,15:1,16:1,17:2,18:2,19:3,20:1,21:1,22:1,23:3,24:4,25:5,26:1,27:1,28:3,29:3,30:2,31:2,32:5,33:3,34:6,35:1,36:4,37:3,38:1,39:4,40:7,41:6,42:1,43:2,44:3,45:5,46:3,47:4,48:6,49:1,50:2,51:4,52:1,53:1,54:5,55:3,56:2,57:2,58:4,59:2,60:4,61:1,62:3,63:3,64:1,65:2,66:3,67:1,68:1,69:2,70:1,71:1,72:2,73:1,74:2,75:1,76:2,77:2,78:1,79:1,80:1,81:1,82:1,83:1,84:1,85:1,86:1}

with open('preseason-map-planner.html', 'r', encoding='utf-8') as f:
    content = f.read()

changed = 0
already_correct = 0

for zone_id, new_type in corrections.items():
    # Use ,"id":N, with a trailing comma to avoid partial matches (e.g. "id":1 vs "id":10)
    # Pattern anchors on the id field followed by a comma, then scans to "type":DIGITS}
    pattern = r'("id":' + str(zone_id) + r',"[^}]*?"type":)(\d+)(\})'

    def replacer(m):
        global changed, already_correct
        current_type = int(m.group(2))
        if current_type == new_type:
            already_correct += 1
            return m.group(0)
        else:
            changed += 1
            return m.group(1) + str(new_type) + m.group(3)

    content = re.sub(pattern, replacer, content)

print(f'Changed: {changed}  Already correct: {already_correct}')

with open('preseason-map-planner.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done.')
