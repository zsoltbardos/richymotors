# Managing vehicle stock (for Richy Motors)

Your website can load cars from a **Google Sheet** — like Excel, but online. You add, edit, or mark cars sold in the sheet; the site updates automatically (no coding).

---

## Who should own the Google Sheet?

**The business owner should create and own the sheet on their Google account** — not yours.

If you create it on your personal Google account:

- The stock list lives in **your** Drive until you transfer it
- The client may need you for access, recovery, or billing if you delete your account
- It is awkward for handover and ongoing support

**Recommended handoff:**

1. Ask the client to sign in to **their** Gmail / Google Workspace account.
2. They create a new Google Sheet (or you guide them on a call).
3. You help set up columns and sharing; they keep **Owner** access.
4. You only need the Sheet ID for `js/config.js` — you do not need to own the file.

**If you already created it on your account:** open the sheet → **Share** → add the client’s email as **Editor** → open the ⋮ menu next to their name → **Transfer ownership**. After that, they own it.

The site only needs the sheet to be **viewable by anyone with the link** (read-only). The client stays the owner and editor.

---

## One-time setup

### 1. Create the spreadsheet (client’s Google account)

1. Client: go to [sheets.google.com](https://sheets.google.com) → **Blank spreadsheet**.
2. Import [`stock-template.csv`](stock-template.csv) (*File → Import*), or copy the columns below manually.
3. Name the tab at the bottom **`Inventory`** (exact spelling).

### 2. Column headers (row 1)

Put these in **row 1**, one per column:

| id | title | year | make | model | price | currency | mileage | fuel | transmission | image | status | featured |
|----|-------|------|------|-------|-------|----------|---------|------|--------------|-------|--------|----------|

### 3. Example row (row 2)

| 1 | 2020 Toyota Corolla | 2020 | Toyota | Corolla | 12500 | USD | 45000 | Petrol | Automatic | https://example.com/photo.jpg | available | yes |

### 4. Share the sheet

1. Click **Share**.
2. Set **General access** to **Anyone with the link** → **Viewer**.
3. Save.

### 5. Connect the sheet to the website

1. Copy the Sheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/`**`PASTE_THIS_PART`**`/edit`
2. Open **`js/config.js`** on the site and set:

```js
inventory: {
  source: "googleSheet",
  googleSheetId: "PASTE_THIS_PART",
  googleSheetTab: "Inventory",
},
```

3. Upload/redeploy the site (Netlify, Cloudflare, etc.).

---

## Day-to-day: updating stock (for the business owner)

1. Open your Google Sheet (bookmark it on phone and computer).
2. **Add a car** — new row under the headers, fill every column.
3. **Change price or details** — edit the row.
4. **Mark sold** — set `status` to `sold`.
5. **Highlight on site** — set `featured` to `yes` or `true`.
6. **Remove from site** — delete the row (or clear the `id` column).

Changes usually appear on the website within a few minutes. Refresh the inventory page to check.

### Column guide

| Column | What to enter |
|--------|----------------|
| **id** | Unique number or code (1, 2, 3…) |
| **title** | Full listing title shown on the site |
| **year** | e.g. 2019 |
| **make** | e.g. Toyota |
| **model** | e.g. Camry |
| **price** | Numbers only, e.g. 15000 |
| **currency** | USD, EUR, etc. |
| **mileage** | Kilometers, numbers only |
| **fuel** | Petrol, Diesel, Hybrid… |
| **transmission** | Automatic, Manual… |
| **image** | Full photo link (see below) |
| **status** | `available` or `sold` |
| **featured** | `yes` or leave blank |

### Car photos

- Upload photos to [Google Drive](https://drive.google.com), set sharing to **Anyone with the link**, right‑click → **Get link**.
- Or use image URLs from your phone/cloud gallery if they provide a direct link.
- Paste the URL in the **image** column.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Cars not showing | Sheet must be **Anyone with the link → Viewer** |
| Wrong cars | Check tab name is **Inventory** and `googleSheetTab` matches |
| Old data on site | Hard refresh (Ctrl+F5) or wait a minute |
| Sheet works locally but not live | Redeploy after changing `js/config.js` |

---

## Alternative: edit a file (technical)

If you prefer not to use Google Sheets, leave `source: "json"` in `js/config.js` and edit `data/vehicles.json` — best for developers, not typical daily use for staff.
