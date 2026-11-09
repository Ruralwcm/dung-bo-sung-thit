/**
 * Google Apps Script — Backend for "Dừng / Bổ Sung Thịt MDL"
 * 
 * Deployment:
 * 1. Open https://script.google.com/
 * 2. Create new project
 * 3. Paste this entire file into Code.gs
 * 4. Save (Ctrl+S)
 * 5. Deploy → New deployment → Web App
 *    - Execute as: Me
 *    - Access: Anyone (or Anyone with Google account)
 * 6. Copy the Web App URL → paste into the app Config section
 *
 * Data Sheet: 1RtVPThy95QMdHGvfL_9lCMNwcgStXCxxqLj1Cpf-KwY
 * Tab name: ThitMDL_Data
 */

const SHEET_ID = '1RtVPThy95QMdHGvfL_9lCMNwcgStXCxxqLj1Cpf-KwY';
const TAB_NAME = 'ThitMDL_Data';
const HEADERS = [
  'id', 'ma_ch', 'ten_ch', 'nhom_dt', 'lat', 'lng',
  'hanh_dong', 'loai_thit', 'ngay_dung', 'sku', 'so_pack',
  'vuot_muc', 'nguoi_khai', 'ghi_chu', 'ly_do', 'ngay_nhan_hang', 'created_at'
];

/**
 * doGet — Handles GET requests
 * Query params:
 *   ?action=list         → return all records
 *   ?action=list&from=YYYY-MM-DD&to=YYYY-MM-DD  → filtered
 */
function doGet(e) {
  const params = e?.parameter || {};
  const action = params.action || 'list';

  if (action === 'list') {
    const data = getRecords(params.from, params.to);
    return jsonResponse({ success: true, data: data, count: data.length });
  }

  return jsonResponse({ success: false, error: 'Unknown action: ' + action });
}

/**
 * doPost — Handles POST requests
 * Body: JSON { action: 'save', data: { ...record } }
 */
function doPost(e) {
  try {
    const body = JSON.parse(e.postData?.contents || '{}');
    const action = body.action;

    if (action === 'save') {
      const record = body.data;
      if (!record || !record.ma_ch) {
        return jsonResponse({ success: false, error: 'Thiếu dữ liệu khai báo' });
      }
      saveRecord(record);
      return jsonResponse({ success: true, message: 'Đã lưu khai báo' });
    }

    return jsonResponse({ success: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonResponse({ success: false, error: 'Server error: ' + err.toString() });
  }
}

/**
 * Get or create the data sheet
 */
function getSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(TAB_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(TAB_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    // Format header
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#C00000').setFontColor('#FFFFFF');
  }
  return sheet;
}

/**
 * Save a single record (append row)
 */
function saveRecord(record) {
  const sheet = getSheet();
  const id = Utilities.getUuid();
  const row = [
    id,
    record.ma_ch || '',
    record.ten_ch || '',
    record.nhom_dt || '',
    record.lat || 0,
    record.lng || 0,
    record.hanh_dong || '',
    record.loai_thit || '',
    record.ngay_dung || '',
    record.sku || '',
    record.so_pack || 0,
    record.vuot_muc ? 'TRUE' : 'FALSE',
    record.nguoi_khai || '',
    record.ghi_chu || '',
    record.ly_do || '',
    record.ngay_nhan_hang || '',
    record.created_at || new Date().toISOString()
  ];
  sheet.appendRow(row);
}

/**
 * Get all records, optionally filtered by date range
 */
function getRecords(from, to) {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const range = sheet.getRange(2, 1, lastRow - 1, HEADERS.length);
  const values = range.getValues();

  const records = values.map(row => ({
    id:           String(row[0] || ''),
    ma_ch:        String(row[1] || ''),
    ten_ch:       String(row[2] || ''),
    nhom_dt:      String(row[3] || ''),
    lat:          Number(row[4] || 0),
    lng:          Number(row[5] || 0),
    hanh_dong:    String(row[6] || ''),
    loai_thit:    String(row[7] || ''),
    ngay_dung:    String(row[8] || ''),
    sku:          String(row[9] || ''),
    so_pack:      Number(row[10] || 0),
    vuot_muc:     String(row[11] || '').toUpperCase() === 'TRUE',
    nguoi_khai:   String(row[12] || ''),
    ghi_chu:      String(row[13] || ''),
    ly_do:        String(row[14] || ''),
    ngay_nhan_hang: String(row[15] || ''),
    created_at:   String(row[16] || '')
  }));

  // Filter by date range
  if (from || to) {
    return records.filter(r => {
      const d = (r.created_at || '').slice(0, 10);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }

  return records;
}

/**
 * Helper: return JSON with CORS headers
 */
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * (Optional) Initialize the sheet with test data — run once from Apps Script editor
 */
function initSheet() {
  const sheet = getSheet();
  // Clear existing
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, HEADERS.length).clearContent();
  }
  Logger.log('Sheet initialized: ' + TAB_NAME);
}

/**
 * (Optional) Test: insert a sample record
 */
function testSave() {
  saveRecord({
    ma_ch: 'TEST001',
    ten_ch: 'WinMart Test',
    nhom_dt: 'N3',
    lat: 10.762622,
    lng: 106.660172,
    hanh_dong: 'Bổ sung thịt',
    loai_thit: 'Heo',
    ngay_dung: '',
    sku: 'HEO001 — Heo đùi',
    so_pack: 30,
    vuot_muc: true,
    nguoi_khai: 'Nguyễn Văn A',
    ghi_chu: 'Test record',
    created_at: new Date().toISOString()
  });
  Logger.log('Test record saved!');
}