import json

dd = None
with open('input.txt', 'r') as fin:
    dd = fin.read()
dd = dd.split('\n\n')

for d in dd:
    d = d.replace('\n', '')
    d = d.replace('\t', '')

    points = [list(map(float, p.split(','))) for p in d.split()]

    for i in range(len(points)):
        print(points[i], end=' ')
        # [0, 2000] -> [-180, 180]
        points[i][0] = ((points[i][0] / 2000) * 360) - 180
        # [0, 1000] -> [90, -90]
        points[i][1] = ((points[i][1] / 1000) * -180) + 90
        points[i][0] = f'{points[i][0]:.2f}'
        points[i][1] = f'{points[i][1]:.2f}'
        print(points[i])

    points.append(points[0])

    with open('output.txt', 'a') as fout:
        fout.write(json.dumps(points[::-1]).replace('"', ''))
        fout.write(',\n')

while True:
    x, y = map(int, input().split())
    # [0, 2000] -> [-180, 180]
    x = ((x / 2000) * 360) - 180
    # [0, 1000] -> [90, -90]
    y = ((y / 1000) * -180) + 90
    x = f'{x:.2f}'
    y = f'{y:.2f}'
    print(f'[{x}, {y}]')