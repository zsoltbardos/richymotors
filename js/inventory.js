(function () {
  const grid = document.getElementById("inventory-grid");
  const emptyEl = document.getElementById("inventory-empty");
  const filterChips = document.querySelectorAll(".filter-chip");
  const modal = document.getElementById("vehicle-modal");
  const modalImage = document.getElementById("modal-image");
  const modalTitle = document.getElementById("modal-title");
  const modalPrice = document.getElementById("modal-price");
  const modalSpecs = document.getElementById("modal-specs");
  const modalStatus = document.getElementById("modal-status");
  const modalInquire = document.getElementById("modal-inquire");
  const modalClose = document.querySelector(".modal-close");

  const inventoryConfig = window.RICHY_CONFIG?.inventory || { source: "json" };

  let vehicles = [];
  let activeFilter = "all";

  function formatPrice(v) {
    const n = Number(v.price);
    const formatted = isNaN(n) ? v.price : n.toLocaleString();
    return (v.currency || "USD") + " " + formatted;
  }

  function formatMileage(km) {
    if (km == null || km === "") return null;
    return Number(km).toLocaleString() + " km";
  }

  function matchesFilter(v) {
    if (activeFilter === "available") return v.status === "available";
    if (activeFilter === "featured") return v.featured === true;
    return true;
  }

  function parseBool(value) {
    const s = String(value ?? "")
      .trim()
      .toLowerCase();
    return s === "true" || s === "yes" || s === "y" || s === "1";
  }

  function normalizeVehicle(raw) {
    if (!raw || !String(raw.id || "").trim()) return null;

    const status = String(raw.status || "available")
      .trim()
      .toLowerCase();

    return {
      id: String(raw.id).trim(),
      title: String(raw.title || "").trim(),
      year: raw.year !== "" && raw.year != null ? Number(raw.year) : undefined,
      make: String(raw.make || "").trim() || undefined,
      model: String(raw.model || "").trim() || undefined,
      price: raw.price !== "" && raw.price != null ? Number(raw.price) : raw.price,
      currency: String(raw.currency || "USD").trim() || "USD",
      mileage:
        raw.mileage !== "" && raw.mileage != null ? Number(raw.mileage) : undefined,
      fuel: String(raw.fuel || "").trim() || undefined,
      transmission: String(raw.transmission || "").trim() || undefined,
      image: String(raw.image || "").trim(),
      status: status === "sold" ? "sold" : "available",
      featured: parseBool(raw.featured),
    };
  }

  function parseCsv(text) {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const next = text[i + 1];

      if (inQuotes) {
        if (ch === '"' && next === '"') {
          field += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          field += ch;
        }
        continue;
      }

      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(field);
        field = "";
      } else if (ch === "\n" || (ch === "\r" && next === "\n")) {
        row.push(field);
        field = "";
        if (row.some((cell) => String(cell).trim() !== "")) rows.push(row);
        row = [];
        if (ch === "\r") i++;
      } else if (ch !== "\r") {
        field += ch;
      }
    }

    if (field.length || row.length) {
      row.push(field);
      if (row.some((cell) => String(cell).trim() !== "")) rows.push(row);
    }

    return rows;
  }

  function csvToVehicles(csvText) {
    const rows = parseCsv(csvText.trim());
    if (rows.length < 2) return [];

    const headers = rows[0].map((h) =>
      String(h)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_")
    );

    const list = [];
    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i];
      const raw = {};
      headers.forEach((key, idx) => {
        raw[key] = cells[idx] != null ? String(cells[idx]).trim() : "";
      });
      const vehicle = normalizeVehicle(raw);
      if (vehicle && vehicle.title && vehicle.image) list.push(vehicle);
    }
    return list;
  }

  async function loadFromJson() {
    const res = await fetch("data/vehicles.json");
    if (!res.ok) throw new Error("Failed to load vehicles.json");
    const data = await res.json();
    return data.map((v) => normalizeVehicle(v)).filter(Boolean);
  }

  async function loadFromGoogleSheet() {
    const sheetId = (inventoryConfig.googleSheetId || "").trim();
    const tab = inventoryConfig.googleSheetTab || "Inventory";
    if (!sheetId) throw new Error("googleSheetId missing in js/config.js");

    const url =
      "https://docs.google.com/spreadsheets/d/" +
      encodeURIComponent(sheetId) +
      "/gviz/tq?tqx=out:csv&sheet=" +
      encodeURIComponent(tab);

    const res = await fetch(url);
    if (!res.ok) throw new Error("Could not fetch Google Sheet");
    const csv = await res.text();
    const list = csvToVehicles(csv);
    if (!list.length) throw new Error("No vehicles found in sheet");
    return list;
  }

  function showError(message) {
    if (grid) {
      grid.innerHTML = '<p class="inventory-loading">' + escapeHtml(message) + "</p>";
    }
  }

  function renderCard(v) {
    const sold = v.status === "sold";
    const badges = [];
    if (v.featured) badges.push('<span class="badge badge-featured">Featured</span>');
    if (sold) badges.push('<span class="badge badge-sold">Sold</span>');

    const meta = [v.year, v.make, v.model, formatMileage(v.mileage)].filter(Boolean).join(" · ");

    const card = document.createElement("article");
    card.className = "vehicle-card" + (sold ? " is-sold" : "");
    card.dataset.id = v.id;
    card.innerHTML =
      '<img class="vehicle-card-image" src="' +
      escapeAttr(v.image) +
      '" alt="' +
      escapeAttr(v.title) +
      '" loading="lazy">' +
      '<div class="vehicle-card-body">' +
      '<div class="vehicle-card-badges">' +
      badges.join("") +
      "</div>" +
      "<h3>" +
      escapeHtml(v.title) +
      "</h3>" +
      '<p class="vehicle-card-price">' +
      escapeHtml(formatPrice(v)) +
      "</p>" +
      '<p class="vehicle-card-meta">' +
      escapeHtml(meta) +
      "</p>" +
      '<div class="vehicle-card-actions">' +
      '<button type="button" class="btn btn-outline btn-details">Details</button>' +
      (sold
        ? ""
        : '<button type="button" class="btn btn-primary btn-inquire">Inquire</button>') +
      "</div></div>";

    card.querySelector(".btn-details")?.addEventListener("click", () => openModal(v));
    card.querySelector(".btn-inquire")?.addEventListener("click", () => {
      window.RichyMain?.prefillInquiry(v.title);
    });

    return card;
  }

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function escapeAttr(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function openModal(v) {
    if (!modal) return;
    modalImage.src = v.image;
    modalImage.alt = v.title;
    modalTitle.textContent = v.title;
    modalPrice.textContent = formatPrice(v);
    modalStatus.textContent = v.status === "sold" ? "Sold" : "Available";
    modalStatus.className = "modal-status " + v.status;

    const specs = [];
    if (v.year) specs.push(["Year", v.year]);
    if (v.make) specs.push(["Make", v.make]);
    if (v.model) specs.push(["Model", v.model]);
    if (v.mileage != null) specs.push(["Mileage", formatMileage(v.mileage)]);
    if (v.fuel) specs.push(["Fuel", v.fuel]);
    if (v.transmission) specs.push(["Transmission", v.transmission]);

    modalSpecs.innerHTML = specs
      .map(([label, val]) => "<li><strong>" + escapeHtml(label) + ":</strong> " + escapeHtml(String(val)) + "</li>")
      .join("");

    if (modalInquire) {
      if (v.status === "sold") {
        modalInquire.classList.add("hidden");
      } else {
        modalInquire.classList.remove("hidden");
        modalInquire.onclick = (e) => {
          e.preventDefault();
          modal.close();
          window.RichyMain?.prefillInquiry(v.title);
        };
      }
    }

    modal.showModal();
  }

  function render() {
    const filtered = vehicles.filter(matchesFilter);
    grid.innerHTML = "";

    if (filtered.length === 0) {
      emptyEl?.classList.remove("hidden");
      return;
    }
    emptyEl?.classList.add("hidden");
    filtered.forEach((v) => grid.appendChild(renderCard(v)));
  }

  filterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      filterChips.forEach((c) => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      activeFilter = chip.dataset.filter || "all";
      render();
    });
  });

  modalClose?.addEventListener("click", () => modal?.close());
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) modal.close();
  });

  async function load() {
    const source = inventoryConfig.source || "json";

    try {
      if (source === "googleSheet") {
        vehicles = await loadFromGoogleSheet();
      } else {
        vehicles = await loadFromJson();
      }
      render();
    } catch (err) {
      if (source === "googleSheet") {
        try {
          vehicles = await loadFromJson();
          render();
          return;
        } catch {
          /* fall through */
        }
      }
      showError(
        source === "googleSheet"
          ? "Could not load stock from Google Sheets. Check docs/MANAGING-STOCK.md and js/config.js."
          : "Could not load inventory. Check data/vehicles.json or your Google Sheet setup."
      );
    }
  }

  load();
})();
