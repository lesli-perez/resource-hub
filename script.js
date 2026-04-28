const state = {
  data: [],
  searchQuery: "",
  activeTags: new Set()
};

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("resetBtn").addEventListener("click", showAll);
  document.getElementById("clearFiltersBtn").addEventListener("click", resetFilter);
  document.getElementById("filterBtn").addEventListener("click", toggleFilterMenu);
  document.getElementById("search").addEventListener("keyup", filter);

  document.getElementById("filterMenu").addEventListener("click", (e) => {
    e.stopPropagation();
  });

  document.addEventListener("keydown", handleEscKey);

  fetch("files.json")
    .then(res => res.json())
    .then(json => {
      state.data = json;
      buildTagMenu();
      render(state.data);
    });
});

/* =========================
   ESC KEY CLOSE
========================= */
function handleEscKey(e) {
  if (e.key === "Escape") {
    document.getElementById("filterMenu").classList.remove("show");
    document.getElementById("filterArrow").textContent = "▼";
  }
}

/* =========================
   TAG HELPERS
========================= */
function getAllTags(item) {
  return Object.values(item.tags).flat();
}

/* =========================
   FILTER MENU (CATEGORIZED)
========================= */
function buildTagMenu() {
  const menu = document.getElementById("filterMenu");

  const categories = {};

  state.data.forEach(item => {
    for (let category in item.tags) {
      if (!categories[category]) categories[category] = new Set();

      item.tags[category].forEach(tag => {
        categories[category].add(tag);
      });
    }
  });

  const sortedCategories = Object.keys(categories).sort();

  menu.innerHTML = sortedCategories.map(category => {
    const tags = [...categories[category]]
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

    return `
      <div class="filter-group">
        <div class="filter-title">${category}</div>

        ${tags.map(tag => `
          <label class="filter-item">
            <input type="checkbox"
              data-tag="${tag}"
              ${state.activeTags.has(tag) ? "checked" : ""}>
            ${tag}
          </label>
        `).join("")}
      </div>
    `;
  }).join("");

  menu.querySelectorAll("input[type='checkbox']").forEach(cb => {
    cb.addEventListener("change", () => toggleTag(cb.dataset.tag));
  });
}

/* =========================
   DROPDOWN TOGGLE 
========================= */
function toggleFilterMenu(e) {
  e.stopPropagation();

  const menu = document.getElementById("filterMenu");
  const arrow = document.getElementById("filterArrow");

  const isOpen = menu.classList.toggle("show");

  arrow.textContent = isOpen ? "▲" : "▼";
}

/* =========================
   FILTER LOGIC
========================= */
function toggleTag(tag) {
  if (state.activeTags.has(tag)) state.activeTags.delete(tag);
  else state.activeTags.add(tag);

  buildTagMenu();
  applyFilters();
}

function filter() {
  state.searchQuery = document.getElementById("search").value.toLowerCase();
  applyFilters();
}

function applyFilters() {
  let filtered = state.data;

  if (state.searchQuery) {
    filtered = filtered.filter(d =>
      d.title.toLowerCase().includes(state.searchQuery) ||
      getAllTags(d).join(" ").toLowerCase().includes(state.searchQuery)
    );
  }

  if (state.activeTags.size > 0) {
    filtered = filtered.filter(d =>
      [...state.activeTags].some(tag =>
        getAllTags(d).includes(tag)
      )
    );
  }

  updateStatus();
  render(filtered);
}

/* =========================
   RESET FUNCTIONS
========================= */
function resetFilter() {
  document.getElementById("search").value = "";
  state.searchQuery = "";
  state.activeTags.clear();

  buildTagMenu();
  updateStatus();
  render(state.data);
}

function showAll() {
  document.getElementById("search").value = "";
  state.searchQuery = "";
  state.activeTags.clear();

  document.getElementById("filterMenu").classList.remove("show");
  document.getElementById("filterArrow").textContent = "▼";

  buildTagMenu();
  updateStatus();
  render(state.data);
}
/* =========================
   STATUS
========================= */
function updateStatus() {
  const status = document.getElementById("statusText");

  status.textContent =
    state.activeTags.size === 0 && !state.searchQuery
      ? "Viewing All Files"
      : `Filters: ${[...state.activeTags].join(", ")} ${
          state.searchQuery ? "| Search: " + state.searchQuery : ""
        }`;
}

/* =========================
   RENDER
========================= */
function render(items) {
  const container = document.getElementById("container");
  container.innerHTML = "";

  items.forEach(item => {
    const descriptionHtml = Array.isArray(item.description)
      ? item.description.join("\n\n")
      : item.description || "";

    const div = document.createElement("div");
    div.className = "card";

    div.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      window.open(item.url, "_blank");
    });

    const allTags = getAllTags(item);
    const visibleTags = allTags.slice(0, 3);
    const hiddenTags = allTags.slice(3);

    div.innerHTML = `
      <div class="left">
        <h3>${item.title}</h3>

        ${item.image ? `<img src="${item.image}" class="card-img">` : ""}

        <div class="bottom">
          <div class="tags">

            ${visibleTags.map(tag => `
              <span class="tag" data-tag="${tag}">
                ${tag}
              </span>
            `).join("")}

            ${hiddenTags.length > 0 ? `
              <span class="tag more" data-more>
                +${hiddenTags.length} more
              </span>

              <div class="hidden-tags">
                ${hiddenTags.map(tag => `
                  <span class="tag" data-tag="${tag}">
                    ${tag}
                  </span>
                `).join("")}
              </div>
            ` : ""}

          </div>

          <a class="download" href="${item.file}" target="_blank">
            Open/Download Files
          </a>
        </div>
      </div>

      <div class="right">
        ${marked.parse(descriptionHtml)}
      </div>
    `;

    div.querySelectorAll("[data-tag]").forEach(el => {
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleTag(el.dataset.tag);
      });
    });

    const moreBtn = div.querySelector("[data-more]");
    if (moreBtn) {
      moreBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        div.querySelector(".hidden-tags").classList.toggle("show");
      });
    }

    container.appendChild(div);
  });
}