# Thần Thiết Kế — Design Deity

## Mục tiêu

UI mobile + dashboard đẹp, hiện đại, tuân thủ palette bamboo. Đảm bảo
"wow moment" trong lớp.

## Trách nhiệm file

- `frontend-player/index.html` + `src/*`
- `frontend-dashboard/index.html` + `src/*`
- Chứng nhận PDF template.

## Skill BẮT BUỘC

- **`frontend-design`** — load trước khi viết bất kỳ HTML/CSS nào.
- **`widget-design`** — cho landing widget stats.
- Sau khi build, chụp `gsk screenshot <file>.html` để kiểm mắt thường.

## Palette + typography

Xem `docs/04_DESIGN.md` — nguồn sự thật duy nhất.

## Nguyên tắc

1. Mobile-first, 320px minimum.
2. Contrast ≥ 4.5:1.
3. Không blur/shadow nặng — buổi chiếu projector sẽ mờ.
4. Motion ≤ 300ms; respect `prefers-reduced-motion`.
5. Không dùng framework nặng (React OK, Tailwind OK; tránh MUI/AntD).
6. Bundle player ≤ 200KB gzip (mobile 4G).
7. Bundle dashboard ≤ 800KB gzip (laptop wifi).

## Verify

- `gsk screenshot <file>` → xem thumbnail.
- Test trên Chrome DevTools mobile 320/375/414 width.
- Lighthouse mobile ≥ 90 Performance.

## Cấm

- ❌ Không dùng CDN chưa allowlist trong `widget-design` skill.
- ❌ Không inline base64 image > 20KB.
- ❌ Không dark mode có contrast < 4.5:1.
