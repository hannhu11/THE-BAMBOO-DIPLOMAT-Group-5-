# Prompt P4 — Review công thức chấm điểm

## Công cụ
GPT-5 (đóng vai reviewer)

## Prompt

```
Reviews the following scoring formula for a Vietnamese political science
educational game (5.2.3 principles of international solidarity).

Formula:
Score = 100 × (S_autonomy^0.4 · S_economy^0.3 · S_prestige^0.3)^(1/1) / 100

Requirements:
1. Reward balanced strategies (all 3 axes moderate) over extreme ones.
2. If any axis = 0, total score = 0 (representing collapse).
3. Weights reflect that autonomy is the "root" (dĩ bất biến).

Please identify edge cases, bugs, or alternatives.
```

## Kết quả

- ✅ AI xác nhận weighted geometric mean thoả cả 3 yêu cầu.
- ✅ Nhóm quyết dùng weights (0.4, 0.3, 0.3).
- ⚠️ Warning: nếu axis floor = 1 thay vì 0, score sẽ không bao giờ = 0.
  Nhóm quyết định giữ floor = 0 để phù hợp với ý nghĩa "sụp đổ".
