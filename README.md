# Richy Motors — Static Website

Dark-themed marketing site for premium car sales, with vehicle listings and a contact form.

## Quick start

Serve the folder locally (required for loading `vehicles.json`):

```bash
cd /home/deck/Documents/richsite
python3 -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080).

## Contact form (Web3Forms)

1. Go to [https://web3forms.com](https://web3forms.com) and create a free access key with your email.
2. Open [`js/config.js`](js/config.js) and replace `YOUR_ACCESS_KEY_HERE` with your key:

```js
window.RICHY_CONFIG = {
  web3formsAccessKey: "your-actual-key-here",
};
```

3. Submit a test message from the Contact section.

Submissions are emailed to the address you registered at Web3Forms. No server code is required.

## Update business details

Edit [`index.html`](index.html):

- Phone: `tel:+1234567890` links and displayed number
- Email: `info@richymotors.com`
- Location text in the Contact section

## Managing stock (for your client)

**Recommended:** Google Sheets — the business owner edits a spreadsheet; the site loads it live. No code.

1. Follow **[docs/MANAGING-STOCK.md](docs/MANAGING-STOCK.md)** (setup + daily use).
2. Optional CSV template: [docs/stock-template.csv](docs/stock-template.csv) — import into Google Sheets.
3. In [`js/config.js`](js/config.js) set `inventory.source` to `"googleSheet"` and paste the Sheet ID.

**Developer fallback:** keep `inventory.source: "json"` and edit [`data/vehicles.json`](data/vehicles.json).

| Field | Description |
|-------|-------------|
| `id` | Unique string |
| `title` | Display name |
| `year`, `make`, `model` | Vehicle info |
| `price`, `currency` | Shown on cards |
| `mileage` | Kilometers (number) |
| `fuel`, `transmission` | Optional specs |
| `image` | Full URL or path e.g. `assets/cars/my-car.jpg` |
| `status` | `available` or `sold` |
| `featured` | `yes` / `true` for Featured filter |

## Deploy

Upload the entire `richsite` folder to any static host:

- **Netlify** — drag-and-drop or connect a repo
- **Cloudflare Pages** — same
- **GitHub Pages** — push to a repo and enable Pages on the root or `/docs`

Ensure `Logo2.png` and all paths remain at the site root. Use HTTPS in production.

## File structure

```
index.html          Main page (all sections)
Logo2.png           Brand logo (transparent PNG)
css/styles.css      Styles
js/config.js        Web3Forms key
js/main.js          Nav, form, inquire pre-fill
js/inventory.js     Listings + modal
data/vehicles.json  Vehicle data
```
