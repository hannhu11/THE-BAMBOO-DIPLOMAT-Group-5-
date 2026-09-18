# Prompt P3 — Map câu Bác Hồ

## Công cụ
GPT-5

## Mục đích
Với mỗi tình huống, đề xuất 3 câu trích Bác Hồ có thể áp dụng để đưa vào
màn hình reveal.

## Prompt

```
Cho tình huống ngoại giao mô phỏng: <context>.
Đề xuất 3 câu trích của Chủ tịch Hồ Chí Minh phù hợp để bình luận về
quyết định của nhân vật. Ưu tiên câu có trong Hồ Chí Minh Toàn tập
(NXB CTQGST 2011).

Trả về:
[
  { "quote": "...", "source": "Toàn tập, tập X, tr.YYY", "confidence": "high|med|low" }
]
```

## Chỉnh sửa của nhóm

- AI trả 12 câu, nhóm giữ 3 câu confidence=high.
- ⚠️ 2 câu AI ghi confidence=high nhưng nhóm không tìm thấy trong Toàn tập
  → hạ thành low và ĐÁNH DẤU "Bạn 2 verify" trước khi vào production.
- Không sử dụng câu confidence=low mà chưa verify.
