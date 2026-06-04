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

## Add or edit vehicles

Edit [`data/vehicles.json`](data/vehicles.json). Each entry:

| Field | Description |
|-------|-------------|
| `id` | Unique string |
| `title` | Display name |
| `year`, `make`, `model` | Vehicle info |
| `price`, `currency` | Shown on cards |
| `mileage` | Kilometers (number) |
| `fuel`, `transmission` | Optional specs |
| `image` | URL or path e.g. `assets/cars/my-car.jpg` |
| `status` | `available` or `sold` |
| `featured` | `true` to show under Featured filter |

Place local images in `assets/cars/` and reference them as `assets/cars/filename.jpg`.

## Deploy

Upload the entire `richsite` folder to any static host:

- **Netlify** — drag-and-drop or connect a repo
- **Cloudflare Pages** — same
- **GitHub Pages** — push to a repo and enable Pages on the root or `/docs`

Ensure `Logo.jpg` and all paths remain at the site root. Use HTTPS in production.

## File structure

```
index.html          Main page (all sections)
Logo.jpg            Brand logo
css/styles.css      Styles
js/config.js        Web3Forms key
js/main.js          Nav, form, inquire pre-fill
js/inventory.js     Listings + modal
data/vehicles.json  Vehicle data
```
