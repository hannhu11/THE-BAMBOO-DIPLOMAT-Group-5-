import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

OUTPUT_DIR = r"c:\Users\ADMIN\Downloads\THE-BAMBOO-DIPLOMAT\apps\player-web\public\cards"
os.makedirs(OUTPUT_DIR, exist_ok=True)

SIZE = 1024
SS_SCALE = 2
SS_SIZE = SIZE * SS_SCALE  # 2048 for supersampling anti-aliasing

def create_radial_vignette(w, h, inner_rgb, outer_rgb, center=None, power=1.4):
    """Creates a smooth, photographic radial vignette background."""
    if center is None:
        center = (w / 2, h / 2)
    cx, cy = center
    Y, X = np.ogrid[:h, :w]
    dist = np.sqrt((X - cx)**2 + (Y - cy)**2)
    max_d = np.sqrt(max(cx, w - cx)**2 + max(cy, h - cy)**2)
    norm = np.clip(dist / max_d, 0, 1) ** power
    
    img_arr = np.zeros((h, w, 4), dtype=np.uint8)
    for c in range(3):
        img_arr[..., c] = np.clip(inner_rgb[c] * (1 - norm) + outer_rgb[c] * norm, 0, 255).astype(np.uint8)
    img_arr[..., 3] = 255
    return Image.fromarray(img_arr, mode='RGBA')

def add_glow_circle(img, center, radius, color, blur=40):
    """Draws a soft, radiant bloom aura."""
    glow_layer = Image.new('RGBA', img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(glow_layer)
    cx, cy = center
    d.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=color)
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(blur))
    return Image.alpha_composite(img, glow_layer)

def apply_circular_clip_and_rim(img, stroke_gold=(212, 175, 55, 255), inner_gold=(243, 202, 104, 220), bg_fill=(10, 16, 14, 255)):
    """Clips content cleanly to circle with outer golden studded rim."""
    w, h = img.size
    cx, cy = w / 2, h / 2
    r_outer = w * 0.465
    
    # Create circular mask
    mask = Image.new('L', (w, h), 0)
    d_mask = ImageDraw.Draw(mask)
    d_mask.ellipse([cx - r_outer, cy - r_outer, cx + r_outer, cy + r_outer], fill=255)
    
    # Background outside circle
    bg = Image.new('RGBA', (w, h), bg_fill)
    clipped = Image.composite(img, bg, mask)
    
    # Draw rim over clipped edge
    draw = ImageDraw.Draw(clipped, 'RGBA')
    draw.ellipse([cx - r_outer, cy - r_outer, cx + r_outer, cy + r_outer], outline=stroke_gold, width=12 * SS_SCALE)
    r_sub = r_outer - 14 * SS_SCALE
    draw.ellipse([cx - r_sub, cy - r_sub, cx + r_sub, cy + r_sub], outline=inner_gold, width=3 * SS_SCALE)
    
    # 60 golden studs along outer rim
    for i in range(60):
        ang = i * 2 * math.pi / 60
        sx = cx + (r_outer - 7 * SS_SCALE) * math.cos(ang)
        sy = cy + (r_outer - 7 * SS_SCALE) * math.sin(ang)
        draw.ellipse([sx - 3 * SS_SCALE, sy - 3 * SS_SCALE, sx + 3 * SS_SCALE, sy + 3 * SS_SCALE], fill=inner_gold)
        
    return clipped

def draw_dong_son_center(draw, center, radius, gold_base, gold_bright):
    """Draws a high-precision Dong Son bronze drum center with authentic 14-point sun star and concentric rings."""
    cx, cy = center
    draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], outline=gold_base, width=8 * SS_SCALE)
    r_inner = radius - 14 * SS_SCALE
    draw.ellipse([cx - r_inner, cy - r_inner, cx + r_inner, cy + r_inner], outline=gold_bright, width=3 * SS_SCALE)
    
    # Beaded dots
    dot_r = radius - 7 * SS_SCALE
    for i in range(36):
        ang = i * 2 * math.pi / 36
        dx = cx + dot_r * math.cos(ang)
        dy = cy + dot_r * math.sin(ang)
        draw.ellipse([dx - 3 * SS_SCALE, dy - 3 * SS_SCALE, dx + 3 * SS_SCALE, dy + 3 * SS_SCALE], fill=gold_bright)
        
    # Concentric pattern ring
    r_drum = radius * 0.75
    draw.ellipse([cx - r_drum, cy - r_drum, cx + r_drum, cy + r_drum], outline=gold_base, width=4 * SS_SCALE)
    
    # 14-point Dong Son Sunburst
    star_r = radius * 0.65
    inner_star_r = star_r * 0.38
    pts = []
    num_points = 14
    for i in range(num_points * 2):
        ang = i * math.pi / num_points - math.pi / 2
        r_curr = star_r if i % 2 == 0 else inner_star_r
        pts.append((cx + r_curr * math.cos(ang), cy + r_curr * math.sin(ang)))
    draw.polygon(pts, fill=gold_bright, outline=gold_base)
    
    # Center core
    core_r = radius * 0.22
    draw.ellipse([cx - core_r, cy - core_r, cx + core_r, cy + core_r], fill=(255, 255, 255, 255), outline=gold_base, width=3 * SS_SCALE)
    draw.ellipse([cx - core_r * 0.6, cy - core_r * 0.6, cx + core_r * 0.6, cy + core_r * 0.6], fill=gold_bright)

# ==========================================
# 4. di_bat_bien (Anchor of Sovereignty)
# ==========================================
def render_di_bat_bien():
    img = create_radial_vignette(SS_SIZE, SS_SIZE, (18, 56, 42), (4, 14, 10))
    img = add_glow_circle(img, (SS_SIZE // 2, SS_SIZE // 2), 480 * SS_SCALE, (16, 185, 129, 60), blur=70 * SS_SCALE)
    img = add_glow_circle(img, (SS_SIZE // 2, 420 * SS_SCALE), 320 * SS_SCALE, (243, 202, 104, 80), blur=60 * SS_SCALE)
    
    draw = ImageDraw.Draw(img, 'RGBA')
    cx, cy = SS_SIZE // 2, SS_SIZE // 2
    
    # Sacred Dong Son bronze drum background glow
    draw_dong_son_center(draw, (cx, cy), 320 * SS_SCALE, (40, 110, 85, 140), (212, 175, 55, 110))
    
    # Resilient Bamboo Forest Stalks on flanks
    bamboo_x = [180 * SS_SCALE, 260 * SS_SCALE, SS_SIZE - 260 * SS_SCALE, SS_SIZE - 180 * SS_SCALE]
    for bx in bamboo_x:
        draw.line([(bx, 80 * SS_SCALE), (bx, SS_SIZE - 80 * SS_SCALE)], fill=(20, 80, 58, 220), width=18 * SS_SCALE)
        draw.line([(bx, 80 * SS_SCALE), (bx, SS_SIZE - 80 * SS_SCALE)], fill=(52, 211, 153, 200), width=7 * SS_SCALE)
        for sy in range(160 * SS_SCALE, SS_SIZE - 120 * SS_SCALE, 110 * SS_SCALE):
            draw.line([(bx - 14 * SS_SCALE, sy), (bx + 14 * SS_SCALE, sy)], fill=(243, 202, 104, 255), width=5 * SS_SCALE)
            dir_x = 1 if bx > cx else -1
            draw.polygon([
                (bx, sy),
                (bx + dir_x * 55 * SS_SCALE, sy - 35 * SS_SCALE),
                (bx + dir_x * 25 * SS_SCALE, sy - 12 * SS_SCALE)
            ], fill=(16, 185, 129, 230))
            
    # Mighty Sovereign Bedrock
    rock_pts = [
        (cx - 240 * SS_SCALE, SS_SIZE - 140 * SS_SCALE),
        (cx - 120 * SS_SCALE, SS_SIZE - 240 * SS_SCALE),
        (cx + 120 * SS_SCALE, SS_SIZE - 240 * SS_SCALE),
        (cx + 240 * SS_SCALE, SS_SIZE - 140 * SS_SCALE),
        (cx + 160 * SS_SCALE, SS_SIZE - 90 * SS_SCALE),
        (cx - 160 * SS_SCALE, SS_SIZE - 90 * SS_SCALE),
    ]
    draw.polygon(rock_pts, fill=(20, 36, 28, 255), outline=(212, 175, 55, 240), width=3 * SS_SCALE)
    
    # Golden Sovereign Anchor
    ring_cy = 230 * SS_SCALE
    draw.ellipse([cx - 48 * SS_SCALE, ring_cy - 48 * SS_SCALE, cx + 48 * SS_SCALE, ring_cy + 48 * SS_SCALE], outline=(212, 175, 55, 255), width=12 * SS_SCALE)
    draw.ellipse([cx - 48 * SS_SCALE, ring_cy - 48 * SS_SCALE, cx + 48 * SS_SCALE, ring_cy + 48 * SS_SCALE], outline=(254, 240, 138, 255), width=4 * SS_SCALE)
    
    stock_y = ring_cy + 85 * SS_SCALE
    draw.line([(cx - 190 * SS_SCALE, stock_y), (cx + 190 * SS_SCALE, stock_y)], fill=(184, 134, 11, 255), width=24 * SS_SCALE)
    draw.line([(cx - 190 * SS_SCALE, stock_y), (cx + 190 * SS_SCALE, stock_y)], fill=(253, 230, 138, 255), width=8 * SS_SCALE)
    draw.ellipse([cx - 200 * SS_SCALE, stock_y - 14 * SS_SCALE, cx - 175 * SS_SCALE, stock_y + 14 * SS_SCALE], fill=(243, 202, 104, 255))
    draw.ellipse([cx + 175 * SS_SCALE, stock_y - 14 * SS_SCALE, cx + 200 * SS_SCALE, stock_y + 14 * SS_SCALE], fill=(243, 202, 104, 255))
    
    shank_bot = SS_SIZE - 230 * SS_SCALE
    draw.line([(cx, stock_y - 10 * SS_SCALE), (cx, shank_bot)], fill=(184, 134, 11, 255), width=28 * SS_SCALE)
    draw.line([(cx, stock_y - 10 * SS_SCALE), (cx, shank_bot)], fill=(254, 240, 138, 255), width=10 * SS_SCALE)
    
    arm_r = 180 * SS_SCALE
    arm_cy = shank_bot - 110 * SS_SCALE
    for ang in np.linspace(math.pi * 0.16, math.pi * 0.84, 80):
        ax = cx + arm_r * math.cos(ang)
        ay = arm_cy + arm_r * math.sin(ang)
        draw.ellipse([ax - 13 * SS_SCALE, ay - 13 * SS_SCALE, ax + 13 * SS_SCALE, ay + 13 * SS_SCALE], fill=(212, 175, 55, 255))
        draw.ellipse([ax - 5 * SS_SCALE, ay - 5 * SS_SCALE, ax + 5 * SS_SCALE, ay + 5 * SS_SCALE], fill=(255, 255, 255, 240))
        
    fluke_left = [(cx - 165 * SS_SCALE, arm_cy + 80 * SS_SCALE), (cx - 205 * SS_SCALE, arm_cy - 10 * SS_SCALE), (cx - 120 * SS_SCALE, arm_cy + 25 * SS_SCALE)]
    fluke_right = [(cx + 165 * SS_SCALE, arm_cy + 80 * SS_SCALE), (cx + 205 * SS_SCALE, arm_cy - 10 * SS_SCALE), (cx + 120 * SS_SCALE, arm_cy + 25 * SS_SCALE)]
    draw.polygon(fluke_left, fill=(243, 202, 104, 255), outline=(255, 255, 255, 240), width=2 * SS_SCALE)
    draw.polygon(fluke_right, fill=(243, 202, 104, 255), outline=(255, 255, 255, 240), width=2 * SS_SCALE)
    
    draw.polygon([(cx, stock_y - 12 * SS_SCALE), (cx + 14 * SS_SCALE, stock_y), (cx, stock_y + 12 * SS_SCALE), (cx - 14 * SS_SCALE, stock_y)], fill=(255, 255, 255, 255))
    
    clipped = apply_circular_clip_and_rim(img, (212, 175, 55, 255), (243, 202, 104, 220), (4, 14, 10, 255))
    final = clipped.resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    final.save(os.path.join(OUTPUT_DIR, "di_bat_bien.png"))
    print("Generated high-res di_bat_bien.png")

# ==========================================
# 5. sovereignty_shield (Vành Đai Độc Lập)
# ==========================================
def render_sovereignty_shield():
    img = create_radial_vignette(SS_SIZE, SS_SIZE, (22, 68, 50), (3, 12, 8))
    img = add_glow_circle(img, (SS_SIZE // 2, SS_SIZE // 2), 460 * SS_SCALE, (16, 185, 129, 90), blur=70 * SS_SCALE)
    img = add_glow_circle(img, (SS_SIZE // 2, SS_SIZE // 2), 260 * SS_SCALE, (243, 202, 104, 110), blur=50 * SS_SCALE)
    
    draw = ImageDraw.Draw(img, 'RGBA')
    cx, cy = SS_SIZE // 2, SS_SIZE // 2
    
    # Shield Geometry
    s_top = 180 * SS_SCALE
    s_mid = 540 * SS_SCALE
    s_bot = SS_SIZE - 200 * SS_SCALE
    s_w = 260 * SS_SCALE
    
    shield_outer = [
        (cx - s_w, s_top),
        (cx + s_w, s_top),
        (cx + s_w, s_mid),
        (cx, s_bot),
        (cx - s_w, s_mid)
    ]
    draw.polygon(shield_outer, fill=(14, 46, 34, 255), outline=(212, 175, 55, 255), width=12 * SS_SCALE)
    
    inset = 24 * SS_SCALE
    shield_inner = [
        (cx - s_w + inset, s_top + inset),
        (cx + s_w - inset, s_top + inset),
        (cx + s_w - inset, s_mid - inset * 0.5),
        (cx, s_bot - inset * 1.4),
        (cx - s_w + inset, s_mid - inset * 0.5)
    ]
    draw.polygon(shield_inner, fill=(24, 82, 62, 230), outline=(243, 202, 104, 255), width=5 * SS_SCALE)
    
    # Central Sacred Dong Son Bronze Drum on Shield
    draw_dong_son_center(draw, (cx, cy - 20 * SS_SCALE), 140 * SS_SCALE, (184, 134, 11, 255), (254, 240, 138, 255))
    
    # Radiant Diamond Forcefield Rays
    for i in range(12):
        ang = i * 2 * math.pi / 12
        rx1 = cx + 160 * SS_SCALE * math.cos(ang)
        ry1 = (cy - 20 * SS_SCALE) + 160 * SS_SCALE * math.sin(ang)
        rx2 = cx + 225 * SS_SCALE * math.cos(ang)
        ry2 = (cy - 20 * SS_SCALE) + 225 * SS_SCALE * math.sin(ang)
        draw.line([(rx1, ry1), (rx2, ry2)], fill=(255, 255, 255, 160), width=4 * SS_SCALE)
        
    clipped = apply_circular_clip_and_rim(img, (212, 175, 55, 255), (243, 202, 104, 220), (3, 12, 8, 255))
    final = clipped.resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    final.save(os.path.join(OUTPUT_DIR, "sovereignty_shield.png"))
    print("Generated high-res sovereignty_shield.png")

# ==========================================
# 6. self_reliance (Tự Lực Cánh Sinh)
# ==========================================
def render_self_reliance():
    img = create_radial_vignette(SS_SIZE, SS_SIZE, (78, 46, 14), (5, 16, 11), center=(SS_SIZE // 2, 420 * SS_SCALE))
    img = add_glow_circle(img, (SS_SIZE // 2, 440 * SS_SCALE), 420 * SS_SCALE, (245, 158, 11, 110), blur=80 * SS_SCALE)
    img = add_glow_circle(img, (SS_SIZE // 2, 440 * SS_SCALE), 220 * SS_SCALE, (254, 240, 138, 140), blur=40 * SS_SCALE)
    
    draw = ImageDraw.Draw(img, 'RGBA')
    cx = SS_SIZE // 2
    
    # 1. Rising Sun over Vietnamese Mountains
    sun_cy = 440 * SS_SCALE
    draw.ellipse([cx - 160 * SS_SCALE, sun_cy - 160 * SS_SCALE, cx + 160 * SS_SCALE, sun_cy + 160 * SS_SCALE], fill=(245, 158, 11, 240), outline=(254, 240, 138, 255), width=6 * SS_SCALE)
    
    # Sunrays
    for i in range(24):
        ang = i * 2 * math.pi / 24
        sx1 = cx + 170 * SS_SCALE * math.cos(ang)
        sy1 = sun_cy + 170 * SS_SCALE * math.sin(ang)
        sx2 = cx + 380 * SS_SCALE * math.cos(ang)
        sy2 = sun_cy + 380 * SS_SCALE * math.sin(ang)
        draw.line([(sx1, sy1), (sx2, sy2)], fill=(253, 230, 138, 85), width=5 * SS_SCALE)
        
    # 2. Mountain Peaks
    mountain_left = [(140 * SS_SCALE, SS_SIZE - 120 * SS_SCALE), (cx - 160 * SS_SCALE, 540 * SS_SCALE), (cx, SS_SIZE - 160 * SS_SCALE)]
    mountain_right = [(cx, SS_SIZE - 160 * SS_SCALE), (cx + 170 * SS_SCALE, 510 * SS_SCALE), (SS_SIZE - 140 * SS_SCALE, SS_SIZE - 120 * SS_SCALE)]
    draw.polygon(mountain_left, fill=(18, 38, 28, 255), outline=(212, 175, 55, 180), width=3 * SS_SCALE)
    draw.polygon(mountain_right, fill=(12, 28, 20, 255), outline=(212, 175, 55, 180), width=3 * SS_SCALE)
    
    # 3. Anvil of Self-Reliance at Center
    anvil_top = 660 * SS_SCALE
    anvil_pts = [
        (cx - 160 * SS_SCALE, anvil_top),
        (cx + 160 * SS_SCALE, anvil_top),
        (cx + 120 * SS_SCALE, anvil_top + 70 * SS_SCALE),
        (cx + 160 * SS_SCALE, anvil_top + 140 * SS_SCALE),
        (cx - 160 * SS_SCALE, anvil_top + 140 * SS_SCALE),
        (cx - 120 * SS_SCALE, anvil_top + 70 * SS_SCALE),
    ]
    draw.polygon(anvil_pts, fill=(28, 48, 40, 255), outline=(212, 175, 55, 255), width=5 * SS_SCALE)
    
    # 4. Central Golden Sword
    sword_pts = [
        (cx, 220 * SS_SCALE),
        (cx + 26 * SS_SCALE, 280 * SS_SCALE),
        (cx + 18 * SS_SCALE, anvil_top - 10 * SS_SCALE),
        (cx - 18 * SS_SCALE, anvil_top - 10 * SS_SCALE),
        (cx - 26 * SS_SCALE, 280 * SS_SCALE),
    ]
    draw.polygon(sword_pts, fill=(254, 240, 138, 255), outline=(184, 134, 11, 255), width=4 * SS_SCALE)
    draw.line([(cx, 230 * SS_SCALE), (cx, anvil_top - 15 * SS_SCALE)], fill=(255, 255, 255, 255), width=6 * SS_SCALE)
    
    guard_y = anvil_top - 40 * SS_SCALE
    draw.line([(cx - 75 * SS_SCALE, guard_y), (cx + 75 * SS_SCALE, guard_y)], fill=(212, 175, 55, 255), width=14 * SS_SCALE)
    
    # 5. Bamboo Stalks
    for bx in [cx - 260 * SS_SCALE, cx + 260 * SS_SCALE]:
        draw.line([(bx, 160 * SS_SCALE), (bx, SS_SIZE - 160 * SS_SCALE)], fill=(16, 185, 129, 255), width=16 * SS_SCALE)
        draw.line([(bx, 160 * SS_SCALE), (bx, SS_SIZE - 160 * SS_SCALE)], fill=(243, 202, 104, 230), width=6 * SS_SCALE)
        for sy in range(220 * SS_SCALE, SS_SIZE - 180 * SS_SCALE, 90 * SS_SCALE):
            draw.line([(bx - 12 * SS_SCALE, sy), (bx + 12 * SS_SCALE, sy)], fill=(255, 255, 255, 255), width=4 * SS_SCALE)
            
    # Sparks
    for sp_ang, sp_d in [(0.4, 60), (0.9, 100), (1.4, 75), (1.9, 120), (2.3, 80), (2.7, 95)]:
        sp_x = cx + sp_d * SS_SCALE * math.cos(sp_ang)
        sp_y = (guard_y - 20 * SS_SCALE) - sp_d * SS_SCALE * math.sin(sp_ang)
        draw.ellipse([sp_x - 5 * SS_SCALE, sp_y - 5 * SS_SCALE, sp_x + 5 * SS_SCALE, sp_y + 5 * SS_SCALE], fill=(255, 255, 255, 255))
        
    clipped = apply_circular_clip_and_rim(img, (212, 175, 55, 255), (243, 202, 104, 220), (5, 16, 11, 255))
    final = clipped.resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    final.save(os.path.join(OUTPUT_DIR, "self_reliance.png"))
    print("Generated high-res self_reliance.png")

# ==========================================
# 7. cau_dong_ton_di (Multilateral Concord)
# ==========================================
def render_cau_dong_ton_di():
    img = create_radial_vignette(SS_SIZE, SS_SIZE, (22, 60, 96), (4, 14, 26))
    img = add_glow_circle(img, (SS_SIZE // 2, 480 * SS_SCALE), 450 * SS_SCALE, (96, 165, 250, 80), blur=70 * SS_SCALE)
    img = add_glow_circle(img, (SS_SIZE // 2, 400 * SS_SCALE), 240 * SS_SCALE, (243, 202, 104, 110), blur=50 * SS_SCALE)
    
    draw = ImageDraw.Draw(img, 'RGBA')
    cx, cy = SS_SIZE // 2, SS_SIZE // 2
    
    # 1. Global Coordinates Grid
    g_r = 300 * SS_SCALE
    draw.ellipse([cx - g_r, cy - g_r, cx + g_r, cy + g_r], outline=(78, 126, 167, 100), width=4 * SS_SCALE)
    draw.ellipse([cx - g_r * 0.55, cy - g_r, cx + g_r * 0.55, cy + g_r], outline=(78, 126, 167, 80), width=3 * SS_SCALE)
    draw.line([(cx - g_r, cy), (cx + g_r, cy)], fill=(78, 126, 167, 90), width=3 * SS_SCALE)
    draw.line([(cx - g_r * 0.86, cy - g_r * 0.5), (cx + g_r * 0.86, cy - g_r * 0.5)], fill=(78, 126, 167, 70), width=2 * SS_SCALE)
    draw.line([(cx - g_r * 0.86, cy + g_r * 0.5), (cx + g_r * 0.86, cy + g_r * 0.5)], fill=(78, 126, 167, 70), width=2 * SS_SCALE)
    
    # 2. Golden Arch Bridge
    arch_pts = []
    b_span = 280 * SS_SCALE
    b_ybase = cy + 120 * SS_SCALE
    b_height = 150 * SS_SCALE
    for x in range(int(cx - b_span), int(cx + b_span) + 1, 6 * SS_SCALE):
        norm = (x - cx) / b_span
        y = b_ybase - (1 - norm**2) * b_height
        arch_pts.append((x, y))
        
    for i in range(len(arch_pts) - 1):
        x1, y1 = arch_pts[i]
        x2, y2 = arch_pts[i + 1]
        draw.line([(x1, y1), (x2, y2)], fill=(212, 175, 55, 255), width=14 * SS_SCALE)
        draw.line([(x1, y1), (x2, y2)], fill=(254, 240, 138, 255), width=5 * SS_SCALE)
        if i % 4 == 0:
            draw.line([(x1, y1), (x1, b_ybase + 60 * SS_SCALE)], fill=(243, 202, 104, 180), width=3 * SS_SCALE)
            
    draw.line([(cx - b_span, b_ybase + 60 * SS_SCALE), (cx + b_span, b_ybase + 60 * SS_SCALE)], fill=(96, 165, 250, 200), width=6 * SS_SCALE)
    
    # 3. Two Detailed Doves of Peace Facing Each Other
    # Left Dove
    ld_cx, ld_cy = cx - 80 * SS_SCALE, cy - 80 * SS_SCALE
    # Body
    draw.ellipse([ld_cx - 30 * SS_SCALE, ld_cy - 16 * SS_SCALE, ld_cx + 30 * SS_SCALE, ld_cy + 16 * SS_SCALE], fill=(255, 255, 255, 255), outline=(212, 175, 55, 255), width=2 * SS_SCALE)
    # Wing spread
    draw.polygon([
        (ld_cx - 10 * SS_SCALE, ld_cy),
        (ld_cx - 75 * SS_SCALE, ld_cy - 60 * SS_SCALE),
        (ld_cx - 35 * SS_SCALE, ld_cy - 10 * SS_SCALE)
    ], fill=(250, 250, 255, 255), outline=(212, 175, 55, 255), width=2 * SS_SCALE)
    # Head & beak
    draw.ellipse([ld_cx + 20 * SS_SCALE, ld_cy - 12 * SS_SCALE, ld_cx + 42 * SS_SCALE, ld_cy + 8 * SS_SCALE], fill=(255, 255, 255, 255))
    draw.polygon([(ld_cx + 40 * SS_SCALE, ld_cy - 4 * SS_SCALE), (ld_cx + 56 * SS_SCALE, ld_cy), (ld_cx + 40 * SS_SCALE, ld_cy + 4 * SS_SCALE)], fill=(254, 240, 138, 255))
    
    # Right Dove
    rd_cx, rd_cy = cx + 80 * SS_SCALE, cy - 80 * SS_SCALE
    # Body
    draw.ellipse([rd_cx - 30 * SS_SCALE, rd_cy - 16 * SS_SCALE, rd_cx + 30 * SS_SCALE, rd_cy + 16 * SS_SCALE], fill=(255, 255, 255, 255), outline=(212, 175, 55, 255), width=2 * SS_SCALE)
    # Wing spread
    draw.polygon([
        (rd_cx + 10 * SS_SCALE, rd_cy),
        (rd_cx + 75 * SS_SCALE, rd_cy - 60 * SS_SCALE),
        (rd_cx + 35 * SS_SCALE, rd_cy - 10 * SS_SCALE)
    ], fill=(250, 250, 255, 255), outline=(212, 175, 55, 255), width=2 * SS_SCALE)
    # Head & beak
    draw.ellipse([rd_cx - 42 * SS_SCALE, rd_cy - 12 * SS_SCALE, rd_cx - 20 * SS_SCALE, rd_cy + 8 * SS_SCALE], fill=(255, 255, 255, 255))
    draw.polygon([(rd_cx - 40 * SS_SCALE, ld_cy - 4 * SS_SCALE), (rd_cx - 56 * SS_SCALE, ld_cy), (rd_cx - 40 * SS_SCALE, ld_cy + 4 * SS_SCALE)], fill=(254, 240, 138, 255))
    
    # Golden Lotus Blossom at Center
    lotus_y = cy - 80 * SS_SCALE
    draw.ellipse([cx - 22 * SS_SCALE, lotus_y - 12 * SS_SCALE, cx + 22 * SS_SCALE, lotus_y + 12 * SS_SCALE], fill=(254, 240, 138, 255), outline=(212, 175, 55, 255), width=3 * SS_SCALE)
    draw.polygon([(cx, lotus_y - 28 * SS_SCALE), (cx + 16 * SS_SCALE, lotus_y), (cx, lotus_y + 12 * SS_SCALE), (cx - 16 * SS_SCALE, lotus_y)], fill=(255, 255, 255, 255), outline=(212, 175, 55, 255), width=2 * SS_SCALE)
    
    clipped = apply_circular_clip_and_rim(img, (78, 126, 167, 255), (212, 175, 55, 220), (4, 14, 26, 255))
    final = clipped.resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    final.save(os.path.join(OUTPUT_DIR, "cau_dong_ton_di.png"))
    print("Generated high-res cau_dong_ton_di.png")

# ==========================================
# 8. un_resolution (UN General Assembly)
# ==========================================
def render_un_resolution():
    img = create_radial_vignette(SS_SIZE, SS_SIZE, (20, 50, 88), (3, 10, 20))
    img = add_glow_circle(img, (SS_SIZE // 2, 460 * SS_SCALE), 450 * SS_SCALE, (147, 197, 253, 90), blur=70 * SS_SCALE)
    img = add_glow_circle(img, (SS_SIZE // 2, 460 * SS_SCALE), 240 * SS_SCALE, (243, 202, 104, 110), blur=50 * SS_SCALE)
    
    draw = ImageDraw.Draw(img, 'RGBA')
    cx, cy = SS_SIZE // 2, SS_SIZE // 2
    
    # 1. Connected Laurel Wreath with Stem
    wreath_r = 270 * SS_SCALE
    for side in [-1, 1]:
        # Curved stem line
        stem_pts = []
        for i in range(25):
            ang = math.pi * 0.5 + side * (0.15 + i * 0.055)
            sx = cx + wreath_r * math.cos(ang)
            sy = (cy + 40 * SS_SCALE) + wreath_r * math.sin(ang)
            stem_pts.append((sx, sy))
        for j in range(len(stem_pts) - 1):
            draw.line([stem_pts[j], stem_pts[j + 1]], fill=(212, 175, 55, 255), width=4 * SS_SCALE)
            
        # Overlapping laurel leaves along the stem
        for i in range(12):
            ang = math.pi * 0.5 + side * (0.18 + i * 0.11)
            wx = cx + wreath_r * math.cos(ang)
            wy = (cy + 40 * SS_SCALE) + wreath_r * math.sin(ang)
            leaf_pts = [
                (wx, wy),
                (wx + side * 42 * SS_SCALE, wy - 22 * SS_SCALE),
                (wx + side * 24 * SS_SCALE, wy + 8 * SS_SCALE)
            ]
            draw.polygon(leaf_pts, fill=(107, 157, 196, 240), outline=(243, 202, 104, 255), width=2 * SS_SCALE)
            
    # 2. International Law Parchment & UNCLOS 1982 Charter at Center
    scroll_w = 260 * SS_SCALE
    scroll_h = 320 * SS_SCALE
    scroll_top = cy - 160 * SS_SCALE
    scroll_pts = [
        (cx - scroll_w // 2, scroll_top),
        (cx + scroll_w // 2, scroll_top),
        (cx + scroll_w // 2, scroll_top + scroll_h),
        (cx - scroll_w // 2, scroll_top + scroll_h)
    ]
    draw.polygon(scroll_pts, fill=(248, 244, 232, 255), outline=(184, 134, 11, 255), width=6 * SS_SCALE)
    
    # Scroll top and bottom wooden rollers
    draw.ellipse([cx - scroll_w // 2 - 15 * SS_SCALE, scroll_top - 12 * SS_SCALE, cx + scroll_w // 2 + 15 * SS_SCALE, scroll_top + 12 * SS_SCALE], fill=(212, 175, 55, 255))
    draw.ellipse([cx - scroll_w // 2 - 15 * SS_SCALE, scroll_top + scroll_h - 12 * SS_SCALE, cx + scroll_w // 2 + 15 * SS_SCALE, scroll_top + scroll_h + 12 * SS_SCALE], fill=(212, 175, 55, 255))
    
    # 3. Golden Scales of Justice
    scale_cy = scroll_top + 110 * SS_SCALE
    draw.line([(cx, scale_cy - 60 * SS_SCALE), (cx, scale_cy + 90 * SS_SCALE)], fill=(184, 134, 11, 255), width=10 * SS_SCALE)
    draw.line([(cx - 85 * SS_SCALE, scale_cy - 40 * SS_SCALE), (cx + 85 * SS_SCALE, scale_cy - 40 * SS_SCALE)], fill=(184, 134, 11, 255), width=7 * SS_SCALE)
    for pan_x in [cx - 85 * SS_SCALE, cx + 85 * SS_SCALE]:
        draw.line([(pan_x, scale_cy - 40 * SS_SCALE), (pan_x - 24 * SS_SCALE, scale_cy + 15 * SS_SCALE)], fill=(212, 175, 55, 220), width=3 * SS_SCALE)
        draw.line([(pan_x, scale_cy - 40 * SS_SCALE), (pan_x + 24 * SS_SCALE, scale_cy + 15 * SS_SCALE)], fill=(212, 175, 55, 220), width=3 * SS_SCALE)
        draw.arc([pan_x - 28 * SS_SCALE, scale_cy + 5 * SS_SCALE, pan_x + 28 * SS_SCALE, scale_cy + 35 * SS_SCALE], start=0, end=180, fill=(184, 134, 11, 255), width=5 * SS_SCALE)
        
    # Red wax seal of UNCLOS 1982
    seal_y = scroll_top + scroll_h - 45 * SS_SCALE
    draw.ellipse([cx - 28 * SS_SCALE, seal_y - 28 * SS_SCALE, cx + 28 * SS_SCALE, seal_y + 28 * SS_SCALE], fill=(185, 28, 28, 255), outline=(243, 202, 104, 255), width=3 * SS_SCALE)
    draw_dong_son_center(draw, (cx, seal_y), 18 * SS_SCALE, (243, 202, 104, 255), (255, 255, 255, 255))
    
    # 4. Diplomatic Gavel
    gavel_cx = cx
    gavel_y = SS_SIZE - 200 * SS_SCALE
    draw.line([(gavel_cx - 90 * SS_SCALE, gavel_y + 40 * SS_SCALE), (gavel_cx + 90 * SS_SCALE, gavel_y - 40 * SS_SCALE)], fill=(184, 134, 11, 255), width=18 * SS_SCALE)
    draw.line([(gavel_cx - 90 * SS_SCALE, gavel_y + 40 * SS_SCALE), (gavel_cx + 90 * SS_SCALE, gavel_y - 40 * SS_SCALE)], fill=(254, 240, 138, 255), width=6 * SS_SCALE)
    # Gavel head
    draw.ellipse([gavel_cx - 120 * SS_SCALE, gavel_y + 20 * SS_SCALE, gavel_cx - 60 * SS_SCALE, gavel_y + 80 * SS_SCALE], fill=(212, 175, 55, 255), outline=(254, 240, 138, 255), width=4 * SS_SCALE)
    
    clipped = apply_circular_clip_and_rim(img, (78, 126, 167, 255), (212, 175, 55, 220), (3, 10, 20, 255))
    final = clipped.resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    final.save(os.path.join(OUTPUT_DIR, "un_resolution.png"))
    print("Generated high-res un_resolution.png")

# ==========================================
# 9. diplomatic_gong (Tiếng Chiêng Ngoại Giao)
# ==========================================
def render_diplomatic_gong():
    img = create_radial_vignette(SS_SIZE, SS_SIZE, (36, 28, 14), (6, 8, 14))
    img = add_glow_circle(img, (SS_SIZE // 2, SS_SIZE // 2), 470 * SS_SCALE, (245, 158, 11, 100), blur=70 * SS_SCALE)
    img = add_glow_circle(img, (SS_SIZE // 2, SS_SIZE // 2), 260 * SS_SCALE, (254, 240, 138, 140), blur=50 * SS_SCALE)
    
    draw = ImageDraw.Draw(img, 'RGBA')
    cx, cy = SS_SIZE // 2, SS_SIZE // 2
    
    # 1. Concentric Golden Shockwave Ripples
    for r_wave in [380 * SS_SCALE, 340 * SS_SCALE, 300 * SS_SCALE]:
        draw.ellipse([cx - r_wave, cy - r_wave, cx + r_wave, cy + r_wave], outline=(243, 202, 104, 90), width=4 * SS_SCALE)
        
    # 2. Monumental Bronze Gong
    gong_r = 250 * SS_SCALE
    draw.ellipse([cx - gong_r, cy - gong_r, cx + gong_r, cy + gong_r], fill=(32, 24, 12, 255), outline=(212, 175, 55, 255), width=14 * SS_SCALE)
    draw.ellipse([cx - gong_r + 14 * SS_SCALE, cy - gong_r + 14 * SS_SCALE, cx + gong_r - 14 * SS_SCALE, cy + gong_r - 14 * SS_SCALE], outline=(254, 240, 138, 255), width=4 * SS_SCALE)
    
    # 3. Concentric Dong Son Relief Bands
    for r_band in [200 * SS_SCALE, 160 * SS_SCALE, 120 * SS_SCALE]:
        draw.ellipse([cx - r_band, cy - r_band, cx + r_band, cy + r_band], outline=(184, 134, 11, 230), width=4 * SS_SCALE)
        num_motifs = int(r_band / (12 * SS_SCALE))
        for m in range(num_motifs):
            m_ang = m * 2 * math.pi / num_motifs
            mx = cx + r_band * math.cos(m_ang)
            my = cy + r_band * math.sin(m_ang)
            draw.ellipse([mx - 3 * SS_SCALE, my - 3 * SS_SCALE, mx + 3 * SS_SCALE, my + 3 * SS_SCALE], fill=(243, 202, 104, 255))
            
    # 4. Central Raised Nipple (Núm Chiêng) with 14-point Sunburst
    draw_dong_son_center(draw, (cx, cy), 95 * SS_SCALE, (212, 175, 55, 255), (255, 255, 255, 255))
    
    # 5. Golden Mallet Crossing the Foreground
    head_cx, head_cy = cx - 180 * SS_SCALE, SS_SIZE - 230 * SS_SCALE
    draw.ellipse([head_cx - 45 * SS_SCALE, head_cy - 45 * SS_SCALE, head_cx + 45 * SS_SCALE, head_cy + 45 * SS_SCALE], fill=(184, 134, 11, 255), outline=(254, 240, 138, 255), width=5 * SS_SCALE)
    draw.line([(head_cx, head_cy), (cx + 180 * SS_SCALE, cy + 300 * SS_SCALE)], fill=(212, 175, 55, 255), width=18 * SS_SCALE)
    draw.line([(head_cx, head_cy), (cx + 180 * SS_SCALE, cy + 300 * SS_SCALE)], fill=(254, 240, 138, 255), width=6 * SS_SCALE)
    
    # Sound Sparks
    for ang in [0.2, 0.7, 1.3, 1.8, 2.5, 3.2, 3.9, 4.6, 5.2, 5.8]:
        dist = 175 * SS_SCALE
        sx = cx + dist * math.cos(ang)
        sy = cy + dist * math.sin(ang)
        draw.line([(cx + 95 * SS_SCALE * math.cos(ang), cy + 95 * SS_SCALE * math.sin(ang)), (sx, sy)], fill=(255, 255, 255, 200), width=4 * SS_SCALE)
        draw.ellipse([sx - 6 * SS_SCALE, sy - 6 * SS_SCALE, sx + 6 * SS_SCALE, sy + 6 * SS_SCALE], fill=(254, 240, 138, 255))
        
    clipped = apply_circular_clip_and_rim(img, (212, 175, 55, 255), (243, 202, 104, 220), (6, 8, 14, 255))
    final = clipped.resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    final.save(os.path.join(OUTPUT_DIR, "diplomatic_gong.png"))
    print("Generated high-res diplomatic_gong.png")

if __name__ == "__main__":
    print("Starting generation of high-res master artworks for the 6 cards...")
    render_di_bat_bien()
    render_sovereignty_shield()
    render_self_reliance()
    render_cau_dong_ton_di()
    render_un_resolution()
    render_diplomatic_gong()
    print("All 6 card artworks generated successfully at 1024x1024 with supersampled anti-aliasing!")
