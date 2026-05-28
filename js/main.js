import { state } from "./state.js";
import { buildTagIndex, toggleTag, updateStatus } from "./ui.js";
import { render } from "./render.js";
import { applyFilters } from "./filters.js";
import "./advanced.js";
import { initAdvancedUI } from "./advanced.js";
import { initAdvancedHelp } from "./advanced.js"; 
import { openAdvancedModal, initPanelToggle, resetAdvancedFilters } from "./advanced.js";



window.state = state; // TEMP bridge

document.addEventListener("DOMContentLoaded", () => {

    initAdvancedUI();
    initAdvancedHelp();
    initPanelToggle();
  // =========================
  // FETCH DATA
  // =========================
  fetch("files.json")
    .then(res => res.json())
    .then(json => {
      state.data = json;

      buildTagIndex();
      render(state.data);
    });



    //SCROLL TO TOP BUTTON
    const scrollBtn = document.getElementById("scrollTopBtn");

    // show/hide on scroll
    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) {
          scrollBtn.classList.add("show");
      } else {
          scrollBtn.classList.remove("show");
      }
    });

    // scroll to top
    scrollBtn.addEventListener("click", () => {
      window.scrollTo({
          top: 0,
          behavior: "smooth"
      });
    });


  // =========================
  // SEARCH 
  // =========================
  document.getElementById("search").addEventListener("input", (e) => {
    state.searchQuery = e.target.value.toLowerCase();
    applyFilters();
  });

  // =========================
  // BUTTONS (FIXED)
  // =========================

  // SHOW ALL
  document.getElementById("resetBtn").addEventListener("click", () => {
    state.searchQuery = "";
    state.activeTags.clear();

    document.getElementById("search").value = "";

    resetAdvancedFilters();  

    buildTagIndex();
    applyFilters();
  });




    document.getElementById("filterBtn").addEventListener("click", (e) => {
      e.stopPropagation();

      const layout = document.querySelector(".layout");
      layout.classList.toggle("filters-open");
    });

    document.querySelector(".layout").classList.add("filters-open");

    
});

const sortBtn = document.getElementById("sortBtn");
const sortWrapper = document.querySelector(".sort-wrapper");
const sortOptions = document.querySelectorAll(".sort-option");

sortBtn.addEventListener("click", () => {
  sortWrapper.classList.toggle("open");
});

sortOptions.forEach(opt => {
  opt.addEventListener("click", () => {
    state.sortMode = opt.dataset.value;
    applyFilters();

    sortWrapper.classList.remove("open");


    sortBtn.innerHTML = `${opt.textContent} <span class="sort-arrow">▾</span>`;
  });
});