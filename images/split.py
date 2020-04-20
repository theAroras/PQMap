from PIL import Image
import os

def crop(path, input, height, width, k, page):
    im = Image.open(input)
    imgwidth, imgheight = im.size
    for i in range(0, imgheight, height):
        for j in range(0, imgwidth, width):
            box = (j, i, j+width, i+height)
            a = im.crop(box)
            try:
                o = a
                print(os.path.join(path, f"IMG-{i // height},{j // width}.jpg"))
                o.save(os.path.join(path, f"IMG-{i // height},{j // width}.jpg"))
            except:
                pass
            k +=1

crop("zones/", "map.jpg", 80, 80, 0, 0)