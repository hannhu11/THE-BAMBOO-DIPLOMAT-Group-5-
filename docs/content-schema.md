# CONTENT SCHEMA & ACADEMIC GROUNDING SPECIFICATION
## THE BAMBOO DIPLOMAT (HCM202 · SE1802)

---

### 1. NGUYÊN TẮC NỘI DUNG HỌC THUẬT (ACADEMIC GROUNDING)
- Mọi câu trích dẫn, nguyên tắc và insight triết học ngoại giao đều được đối chiếu trực tiếp từ **Giáo trình Tư tưởng Hồ Chí Minh (Nhà xuất bản Chính trị quốc gia Sự thật, Hà Nội, 2021)**.
- **Tuyệt đối không sử dụng trích dẫn giả mạo (Hallucination)** hay thông tin chưa được kiểm chứng.
- Mỗi tình huống phải đặt người chơi vào thế tiến thoái lưỡng nan thực tế (Dilemma with Real Trade-offs), không có phương án nào "hoàn hảo 100% không mất gì".

---

### 2. CẤU TRÚC DỮ LIỆU CONTENT

#### Scenarios (`content/scenarios.json`)
```json
{
  "id": "sc1",
  "order": 1,
  "title": "...",
  "principle": "...",
  "context": "...",
  "options": [
    {
      "id": "A",
      "label": "...",
      "hint": "...",
      "isBalanced": false,
      "academicCitation": {
        "work": "Giáo trình Tư tưởng Hồ Chí Minh",
        "publisher": "NXB Chính trị quốc gia Sự thật",
        "year": 2021,
        "pageOrChapter": "Chương 4"
      }
    }
  ],
  "wisdom": {
    "quote": "...",
    "source": "Hồ Chí Minh: Toàn tập..."
  }
}
```

#### Black Swan DSL (`content/black_swan.json`)
Sử dụng AST JSON DSL độc quyền để tính toán an toàn:
```json
{
  "id": "bs_semi",
  "title": "...",
  "rule": {
    "when": {
      "type": "compound_and",
      "conditions": [
        { "type": "axis_compare", "axis": "autonomy", "operator": "lt", "threshold": 50 },
        { "type": "choice_match", "scenarioId": "sc1", "choice": "A" }
      ]
    },
    "effects": [
      { "axis": "economy", "delta": -25 }
    ]
  }
}
```
