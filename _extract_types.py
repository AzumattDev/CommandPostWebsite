import json, math
from collections import deque
import numpy as np
from PIL import Image, ImageDraw, ImageFont

img = Image.open('images/preseason_map.png').convert('RGB')
arr = np.array(img)
H, W = arr.shape[:2]
R, G, B = arr[:,:,0].astype(int), arr[:,:,1].astype(int), arr[:,:,2].astype(int)
MX = np.maximum(np.maximum(R,G),B)
MN = np.minimum(np.minimum(R,G),B)

# Same border + seed extraction as main pipeline
border_mask = (MX < 150) & (MN < 100)
d1 = border_mask.copy()
d1[1:,:]|=border_mask[:-1,:];d1[:-1,:]|=border_mask[1:,:]
d1[:,1:]|=border_mask[:,:-1];d1[:,:-1]|=border_mask[:,1:]
d2=d1.copy()
d2[1:,:]|=d1[:-1,:];d2[:-1,:]|=d1[1:,:]
d2[:,1:]|=d1[:,:-1];d2[:,:-1]|=d1[:,1:]

blue_mask = (B > 150) & (B > R + 40) & (B > G + 20) & (B < 230)
visited = np.zeros((H,W), dtype=bool)
icons = []  # list of (centroid_y, centroid_x, cluster_pixels)

def flood(sy, sx):
    pixels=[]; q=deque([(sy,sx)]); visited[sy,sx]=True
    while q:
        y,x=q.popleft(); pixels.append((y,x))
        for dy,dx in [(-1,0),(1,0),(0,-1),(0,1)]:
            ny,nx=y+dy,x+dx
            if 0<=ny<H and 0<=nx<W and not visited[ny,nx] and blue_mask[ny,nx]:
                visited[ny,nx]=True; q.append((ny,nx))
    return pixels

for y in range(H):
    for x in range(W):
        if blue_mask[y,x] and not visited[y,x]:
            px = flood(y,x)
            if len(px) > 10:
                cy = sum(p[0] for p in px)/len(px)
                cx = sum(p[1] for p in px)/len(px)
                icons.append((cy, cx, px))

print(f"Found {len(icons)} icons")

def col_concentration(cy_f, cx_f):
    """Column concentration metric — high for narrow digits like 1 and 7."""
    win = 7
    y0w = max(0, round(cy_f)-win); y1w = min(H-1, round(cy_f)+win)
    x0w = max(0, round(cx_f)-win); x1w = min(W-1, round(cx_f)+win)
    reg = arr[y0w:y1w+1, x0w:x1w+1]
    rb = (reg[:,:,0].astype(int)+reg[:,:,1].astype(int)+reg[:,:,2].astype(int))//3
    rs = MX[y0w:y1w+1,x0w:x1w+1].astype(int) - MN[y0w:y1w+1,x0w:x1w+1].astype(int)
    white = (rb > 200) & (rs < 60)
    cs = white.sum(axis=0)
    if cs.sum() == 0: return 0.0
    return float(cs.max() / max(cs.mean(), 0.1))

def classify_digit(cluster_pixels, arr):
    ys = [p[0] for p in cluster_pixels]
    xs = [p[1] for p in cluster_pixels]
    cy_f = sum(ys)/len(ys)
    cx_f = sum(xs)/len(xs)

    # Expand bounding box slightly to include digit edges
    y0,y1 = max(0,min(ys)-1), min(H-1,max(ys)+1)
    x0,x1 = max(0,min(xs)-1), min(W-1,max(xs)+1)
    crop = arr[y0:y1+1, x0:x1+1]
    cH, cW = crop.shape[:2]
    if cH == 0 or cW == 0:
        return '?', {}

    # White pixels within the icon = the digit
    cr,cg,cb = crop[:,:,0].astype(int),crop[:,:,1].astype(int),crop[:,:,2].astype(int)
    # White: bright AND low saturation
    sat = MX[y0:y1+1,x0:x1+1].astype(int) - MN[y0:y1+1,x0:x1+1].astype(int)
    bright = (cr+cg+cb)//3
    white = (bright > 190) & (sat < 40)

    wys, wxs = np.where(white)
    if len(wys) < 3:
        return '?', {}

    total = len(wys)
    wy0,wy1 = wys.min(),wys.max()
    wx0,wx1 = wxs.min(),wxs.max()
    span_y = wy1 - wy0 + 1
    span_x = wx1 - wx0 + 1

    # Normalized features
    upper_frac = np.sum(wys < (wy0 + span_y/2)) / total
    lower_frac = 1 - upper_frac
    left_frac  = np.sum(wxs < (wx0 + span_x/2)) / total
    right_frac = 1 - left_frac
    cx_norm = (wxs.mean() - wx0) / max(span_x-1,1)  # 0=left, 1=right
    cy_norm = (wys.mean() - wy0) / max(span_y-1,1)  # 0=top, 1=bottom
    density = total / (span_y * span_x)

    # Column concentration: high for narrow digits (1, 7) — computed from raw pixels
    cc = col_concentration(cy_f, cx_f)

    feats = {
        'total': total, 'span_x': span_x, 'span_y': span_y,
        'upper_frac': round(upper_frac,3), 'lower_frac': round(lower_frac,3),
        'left_frac': round(left_frac,3), 'right_frac': round(right_frac,3),
        'cx_norm': round(cx_norm,3), 'cy_norm': round(cy_norm,3),
        'density': round(density,3), 'col_conc': round(cc,2)
    }

    # "1" or "7": both have highly concentrated column distribution
    # Threshold 5.0 — "1" col_conc ~6.3, "7" col_conc ~9.0, others < 4.5
    if cc > 5.0:
        # Distinguish 7 (top-heavy) from 1 (symmetric)
        if upper_frac > 0.57:
            return '7', feats
        return '1', feats

    # "7" - upper heavy, rightward taper (catches 7s with lower col_conc)
    if upper_frac > 0.55 and right_frac > 0.50 and cy_norm < 0.45:
        return '7', feats

    # "6" - lower heavy (loop at bottom)
    if lower_frac > 0.56 and cy_norm > 0.52:
        return '6', feats

    # "5" - upper-left heavy top, lower-right bottom
    if upper_frac > 0.50 and left_frac > 0.49 and cy_norm < 0.50:
        return '5', feats

    # "4" - right-heavy, moderate concentration (col_conc 4-5)
    if cc > 3.8 and right_frac > 0.52:
        return '4', feats

    # "3" - right-heavy
    if right_frac > 0.53 and cy_norm > 0.48:
        return '3', feats

    # "2" - lower-heavy, left-leaning bottom
    if lower_frac > 0.50 and left_frac > 0.48:
        return '2', feats

    # Fallback: use center of mass to pick closest
    scores = {
        '2': abs(cy_norm - 0.52) + abs(left_frac - 0.52),
        '3': abs(right_frac - 0.55) + abs(cy_norm - 0.50),
        '4': abs(right_frac - 0.52) + abs(cc - 4.2),
        '5': abs(left_frac - 0.52) + abs(upper_frac - 0.53),
        '6': abs(lower_frac - 0.58) + abs(cy_norm - 0.55),
        '7': abs(upper_frac - 0.60) + abs(cy_norm - 0.42),
    }
    return min(scores, key=scores.get), feats

results = []
for i, (cy, cx, px) in enumerate(icons):
    digit, feats = classify_digit(px, arr)
    results.append({'seed': i, 'cy': round(cy,1), 'cx': round(cx,1), 'digit': digit, 'feats': feats})

# Print summary
from collections import Counter
counts = Counter(r['digit'] for r in results)
print("Digit distribution:", dict(sorted(counts.items())))
print()
for r in results:
    print(f"  seed={r['seed']:2d} cy={r['cy']:5.1f} cx={r['cx']:5.1f} -> {r['digit']}  feats={r['feats']}")

# Save contact sheet of all icon crops for verification
sheet_cols = 12
sheet_rows = math.ceil(len(icons) / sheet_cols)
cell_size = 40
sheet = Image.new('RGB', (sheet_cols * cell_size, sheet_rows * cell_size), (30,30,40))
draw = ImageDraw.Draw(sheet)
for i, (cy, cx, px) in enumerate(icons):
    ys = [p[0] for p in px]; xs = [p[1] for p in px]
    y0,y1 = max(0,min(ys)-2), min(H-1,max(ys)+2)
    x0,x1 = max(0,min(xs)-2), min(W-1,max(xs)+2)
    crop = img.crop((x0,y0,x1+1,y1+1))
    crop_w, crop_h = crop.size
    scale = min((cell_size-4)/crop_w, (cell_size-12)/crop_h, 2.0)
    nw, nh = max(1,int(crop_w*scale)), max(1,int(crop_h*scale))
    crop = crop.resize((nw,nh), Image.NEAREST)
    col = i % sheet_cols; row = i // sheet_cols
    px_off = col*cell_size + (cell_size-nw)//2
    py_off = row*cell_size + (cell_size-nh)//2 - 4
    sheet.paste(crop, (px_off, py_off))
    digit = results[i]['digit']
    draw.text((col*cell_size+2, row*cell_size+cell_size-12), f"{i}:{digit}", fill=(255,220,100))
sheet.save('_icon_sheet.png')
print("\nSaved _icon_sheet.png")
class NpEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (np.integer,)): return int(obj)
        if isinstance(obj, (np.floating,)): return float(obj)
        return super().default(obj)

with open('_digit_results.json', 'w') as f:
    json.dump(results, f, indent=2, cls=NpEncoder)
print("Saved _digit_results.json")
