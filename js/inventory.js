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

  let vehicles = [];
  let activeFilter = "all";

  function formatPrice(v) {
    const n = Number(v.price);
    const formatted = isNaN(n) ? v.price : n.toLocaleString();
    return (v.currency || "USD") + " " + formatted;
  }

  function formatMileage(km) {
    if (km == null) return null;
    return Number(km).toLocaleString() + " km";
  }

  function matchesFilter(v) {
    if (activeFilter === "available") return v.status === "available";
    if (activeFilter === "featured") return v.featured === true;
    return true;
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
    try {
      const res = await fetch("data/vehicles.json");
      if (!res.ok) throw new Error("Failed to load");
      vehicles = await res.json();
      render();
    } catch {
      if (grid) {
        grid.innerHTML =
          '<p class="inventory-loading">Could not load inventory. Check that data/vehicles.json exists.</p>';
      }
    }
  }

  load();
})();
