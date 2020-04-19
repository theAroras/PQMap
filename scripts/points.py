import re, json

pattern = re.compile(r'(\d)-')

d = None
with open('input.txt', 'r') as fin:
    d = fin.read()
d = d.replace('\n', '')
d = d.replace('\t', '')
d = d.upper()
d = pattern.sub(r'\1,-', d)

res = []
cur, cur_char = '', ''
print(d)
for i, char in enumerate(d):
    if i == len(d) - 1:
        break
    if char.isalpha():
        print(cur_char, cur)
        if cur_char == 'M':
            x, y = map(float, cur.split(','))
            res.append([x, y])
        elif cur_char == 'V':
            cur = cur.replace(',', '')
            res.append([res[-1][0], res[-1][1] + float(cur)])
        elif cur_char == 'H':
            cur = cur.replace(',', '')
            res.append([res[-1][0] + float(cur), res[-1][1]])
        elif cur_char == 'L':
            x, y = map(float, cur.split(','))
            res.append([res[-1][0] + x, res[-1][1] + y])
        elif cur_char == 'C':
            x1, y1, x2, y2, x3, y3 = map(float, cur.split(','))
            res.append([res[-1][0] + x1, res[-1][1] + y1])
            res.append([res[-1][0] + x2, res[-1][1] + y2])
            res.append([res[-1][0] + x3, res[-1][1] + y3])
        elif cur_char == 'S':
            x1, y1, x2, y2 = map(float, cur.split(','))
            res.append([res[-1][0] + x1, res[-1][1] + y1])
            res.append([res[-1][0] + x2, res[-1][1] + y2])
        else:
            print(cur_char, cur)
        cur_char = char
        cur = ""
    else:
        cur += char

for i in range(len(res)):
    # [0, 2000] -> [-180, 180]
    res[i][0] = ((res[i][0] / 2000) * 360) - 180
    # [0, 1000] -> [90, -90]
    res[i][1] = ((res[i][1] / 1000) * -180) + 90
    res[i][0] = f'{res[i][0]:.2f}'
    res[i][1] = f'{res[i][1]:.2f}'

res.append(res[0])
print(res)

with open('output.txt', 'w') as fout:
    fout.write(json.dumps(res).replace('"', ''))