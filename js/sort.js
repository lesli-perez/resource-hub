import { TAG_ORDER } from "./state.js";

/* =========================
   TIME PARSING (robust)
========================= */
export function getTimeValue(item) {
  const times = item.tags?.Time || [];

  const values = times
    .map(t => {
      if (!t) return null;

      const clean = t.toLowerCase().trim().replace(/\.$/, "");

      // minutes
      let minMatch = clean.match(/(\d+)\s*min/);
      if (minMatch) return parseInt(minMatch[1]);

      // hours
      let hourMatch = clean.match(/(\d+)\s*hour/);
      if (hourMatch) return parseInt(hourMatch[1]) * 60;

      // multi-day fallback
      if (clean.includes("multi")) return 1440;

      return null;
    })
    .filter(v => v !== null);

  return values.length ? Math.min(...values) : Infinity;
}

/* =========================
   SKILL / LEVEL SORT
========================= */
export function getSkillValue(item) {
  const levels = item.tags?.Level || [];
  const order = TAG_ORDER.Level || [];

  // Convert level names into ordered indexes
  const indexes = levels
    .map(level => order.indexOf(level))
    .filter(index => index !== -1)
    .sort((a, b) => a - b);

  if (!indexes.length) return Infinity;

  /*
    Desired order:

    Beginner
    Beginner + Intermediate
    Beginner + Intermediate + Advanced
    Intermediate
    Intermediate + Advanced
    Advanced
    Expert

    Creates sortable values like:

    [0]         => 0
    [0,1]       => 0.1
    [0,1,2]     => 0.12
    [1]         => 1
    [1,2]       => 1.2
    [2]         => 2
    [3]         => 3
  */

  const primary = indexes[0];
  const secondary = indexes.slice(1).join("");

  return parseFloat(
    secondary
      ? `${primary}.${secondary}`
      : `${primary}`
  );
}

/* =========================
   MAIN SORT FUNCTION
========================= */
export function sortItems(items, mode) {
  const arr = [...items];

  switch (mode) {

    /* -------- TIME -------- */
    case "time-asc":
      return arr.sort(
        (a, b) => getTimeValue(a) - getTimeValue(b)
      );

    case "time-desc":
      return arr.sort(
        (a, b) => getTimeValue(b) - getTimeValue(a)
      );

    /* -------- SKILL -------- */
    case "skill-asc":
      return arr.sort(
        (a, b) => getSkillValue(a) - getSkillValue(b)
      );

    case "skill-desc":
      return arr.sort(
        (a, b) => getSkillValue(b) - getSkillValue(a)
      );

    /* -------- TITLE -------- */
    case "title-asc":
      return arr.sort(
        (a, b) => a.title.localeCompare(b.title)
      );

    case "title-desc":
      return arr.sort(
        (a, b) => b.title.localeCompare(a.title)
      );

    /* -------- DEFAULT -------- */
    default:
      return arr;
  }
}

/* =========================
   CLOSE SORT MENU ON OUTSIDE CLICK
========================= */
document.addEventListener("click", (e) => {
  const sortWrapper = document.querySelector(".sort-wrapper");
  const sortBtn = document.getElementById("sortBtn");

  if (!sortWrapper || !sortBtn) return;

  const clickedInside = sortWrapper.contains(e.target);

  if (!clickedInside) {
    sortWrapper.classList.remove("open");
  }
});