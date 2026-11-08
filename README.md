# Dừng / Bổ Sung Thịt MDL — WinMart

Web app cho nhân viên tại cửa hàng (CH) khai báo **Dừng thịt** hoặc **Bổ sung thịt MDL**.
Có dashboard báo cáo + danh sách CH vượt mức cần phê duyệt.

🌐 **Deploy URL:** `https://Ruralwcm.github.io/dung-bo-sung-thit/`

---

## 📋 Tính năng

### Khai báo
1. **📱 Định vị CH** — Bấm nút GPS → tự động xác định cửa hàng gần nhất (50m)
2. **🛑 Dừng thịt** — Chọn loại (Gà/Heo) + ngày dừng → Lưu
3. **➕ Bổ sung thịt** — Chọn SKU + số pack → Cảnh báo nếu vượt giới hạn (N×8)
4. **💾 Lưu** — Gửi về Google Sheets qua Apps Script backend

### Dashboard
- Xem toàn bộ khai báo dừng/bổ sung
- Lọc theo ngày, cửa hàng, loại hành động
- Đánh dấu **⚠️ Vượt mức** (cần phê duyệt)
- Export CSV

### Pack Limit
| Nhóm DT | Max Pack/Ngày |
|---------|---------------|
| N1      | 8             |
| N2      | 16            |
| N3      | 24            |
| N4      | 32            |
| N5      | 40            |
| N6      | 48            |
| N7      | 56            |
| N8      | 64            |

> Công thức: `max = N × 8`

---

## 🚀 Triển khai

### 1. Google Apps Script (Backend)

**a. Tạo Apps Script project:**
1. Truy cập https://script.google.com/
2. Tạo project mới ("New Project")
3. Xoá code mặc định, paste toàn bộ nội dung file `Code.gs`
4. Lưu (Ctrl+S)

**b. Deploy Web App:**
1. Bấm **Deploy** → **New deployment**
2. Chọn type: **Web App**
3. Cấu hình:
   - **Execute as:** Me
   - **Who has access:** Anyone (hoặc Anyone with Google account)
4. Bấm **Deploy** → Authorize → Copy URL

**c. Cấu hình trong app:**
1. Mở app tại `https://Ruralwcm.github.io/dung-bo-sung-thit/`
2. Kéo xuống cuối trang Khai báo → paste URL vào ô **GAS URL**
3. Bấm **Lưu**

### 2. GitHub Pages (Frontend)

**a. Tạo repo:**
1. Tạo GitHub repo: `Ruralwcm/dung-bo-sung-thit`
2. Upload file `index.html` lên root repo

**b. Bật Pages:**
1. Vào repo → Settings → Pages
2. Source: **Deploy from a branch** → Chọn `main` → `/ (root)` → Save
3. Đợi 1-2 phút → truy cập URL Pages

**c. Thêm `.nojekyll`:**
Tạo file `.nojekyll` (rỗng) ở root repo để GitHub Pages phục vụ file tĩnh đúng cách.

### 3. Storelist (Google Sheets)

Storelist được load từ Google Sheets published CSV:
```
https://docs.google.com/spreadsheets/d/1fMmEm1GC9aei_3oeu2vcadPVsUM9ms9eVhm99d7pF8A/gviz/tq?tqx=out:csv&sheet=Store_list
```

**Yêu cầu:** Sheet `Store_list` phải được **Publish to web** (File → Share → Publish to web).

Nếu chưa publish:
1. Mở sheet `1fMmEm1GC9aei_3oeu2vcadPVsUM9ms9eVhm99d7pF8A`
2. File → Share → Publish to web
3. Chọn tab `Store_list`, format CSV
4. Bấm Publish

### 4. Data Sheet (Backend)

Data được lưu vào sheet:
```
1RtVPThy95QMdHGvfL_9lCMNwcgStXCxxqLj1Cpf-KwY
```
Tab: `ThitMDL_Data` (tự động tạo nếu chưa có)

---

## 🧪 Kiểm tra sau deploy

### Test GAS backend:
```bash
# Lưu khai báo
curl -X POST "YOUR_GAS_URL" \
  -H "Content-Type: application/json" \
  -d '{"action":"save","data":{"ma_ch":"TEST","ten_ch":"Test CH","nhom_dt":"N3","lat":10.76,"lng":106.66,"hanh_dong":"Bổ sung thịt","loai_thit":"Heo","sku":"HEO001 — Heo đùi","so_pack":30,"vuot_muc":true,"nguoi_khai":"Test User","ghi_chu":"","created_at":"2026-11-08T00:00:00Z"}}'

# Lấy danh sách
curl "YOUR_GAS_URL?action=list"
```

### Test frontend:
1. Mở app trên điện thoại
2. Bấm 📍 ĐỊNH VỊ → chấp nhận quyền GPS
3. Chọn hành động → điền form → Lưu
4. Chuyển sang tab Dashboard → kiểm tra dữ liệu

---

## 📁 Files

| File | Mô tả |
|------|-------|
| `index.html` | Toàn bộ frontend (single-page app, vanilla JS) |
| `Code.gs` | Google Apps Script backend |
| `README.md` | File này |

---

## 🔧 Cấu trúc dữ liệu

Mỗi dòng trong sheet `ThitMDL_Data`:

| # | Cột | Kiểu | Mô tả |
|---|-----|------|-------|
| 1 | id | UUID | ID duy nhất |
| 2 | ma_ch | Text | Mã SAP cửa hàng |
| 3 | ten_ch | Text | Tên cửa hàng |
| 4 | nhom_dt | Text | Nhóm doanh thu (N1–N8) |
| 5 | lat | Number | Vĩ độ |
| 6 | lng | Number | Kinh độ |
| 7 | hanh_dong | Text | "Dừng thịt" hoặc "Bổ sung thịt" |
| 8 | loai_thit | Text | "Gà" / "Heo" / "Cả hai" |
| 9 | ngay_dung | Date | Ngày dừng (nếu Dừng thịt) |
| 10 | sku | Text | Mã & tên SKU (nếu Bổ sung) |
| 11 | so_pack | Number | Số pack bổ sung |
| 12 | vuot_muc | Boolean | TRUE nếu vượt pack limit |
| 13 | nguoi_khai | Text | Tên nhân viên khai báo |
| 14 | ghi_chu | Text | Ghi chú thêm |
| 15 | created_at | DateTime | Thời gian tạo |

---

## 🎨 Brand

- **Primary:** `#C00000` (WinMart Red)
- **Font:** System font stack (native mobile)
- **Design:** Mobile-first, responsive

---

## 📝 Ghi chú

- App có **offline fallback**: nếu không kết nối được GAS, dữ liệu được lưu tạm trong localStorage và tự động đồng bộ khi có kết nối
- GPS dùng browser Geolocation API (yêu cầu HTTPS hoặc localhost)
- Khoảng cách tính bằng công thức Haversine
- Storelist được cache 24h trong localStorage để giảm tải mạng