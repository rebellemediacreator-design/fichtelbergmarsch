// app.js
(() => {
  const root = document.documentElement;
  const pages = Array.from(document.querySelectorAll(".rb-page"));
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const pageNow = document.getElementById("pageNow");
  const pageTotal = document.getElementById("pageTotal");
  const progressFill = document.getElementById("progressFill");
  const themeSelect = document.getElementById("themeSelect");
  const btnJumpPlan = document.getElementById("btnJumpPlan");

  let idx = 0;
  pageTotal.textContent = String(pages.length);

  // Clone chicken SVG from page 1 into all other pages if empty
  const firstSvg = pages[0].querySelector("[data-chicken] svg");
  pages.forEach((p) => {
    const slot = p.querySelector("[data-chicken]");
    if (!slot) return;
    if (!slot.querySelector("svg") && firstSvg) {
      slot.innerHTML = firstSvg.outerHTML;
    }
  });

  function setTheme(val){ root.setAttribute("data-theme", val); }
  setTheme("cocoa");
  themeSelect.value = "cocoa";
  themeSelect.addEventListener("change", (e) => setTheme(e.target.value));

  function layEgg(pageEl, direction){
    const wrap = pageEl.querySelector("[data-eggs]");
    const chicken = pageEl.querySelector("[data-chicken]");
    if (!wrap || !chicken) return;

    const egg = document.createElement("div");
    egg.className = "rb-egg";

    const startX = direction === "next" ? 58 : 46;
    const startY = 64;

    egg.style.left = `${startX}px`;
    egg.style.top = `${startY}px`;
    wrap.appendChild(egg);

    const drop = 22 + Math.random() * 10;
    const drift = (Math.random() * 10 - 5);

    requestAnimationFrame(() => {
      egg.style.opacity = "1";
      egg.animate(
        [
          { transform: "translate3d(0, -6px, 0) scale(0.85)", opacity: 0 },
          { transform: "translate3d(0, 0px, 0) scale(1)", opacity: 1 },
          { transform: `translate3d(${drift}px, ${drop}px, 0) scale(1)`, opacity: 1 },
          { transform: `translate3d(${drift}px, ${drop - 3}px, 0) scale(1)`, opacity: 1 }
        ],
        { duration: 520, easing: "cubic-bezier(.2,.8,.2,1)" }
      );
    });

    // Keep only last 5 eggs
    const eggs = Array.from(wrap.querySelectorAll(".rb-egg"));
    if (eggs.length > 5) eggs.slice(0, eggs.length - 5).forEach(e => e.remove());
  }

  function setActive(n, direction="next") {
    const clamped = Math.max(0, Math.min(pages.length - 1, n));
    if (clamped === idx) return;

    pages[idx].classList.remove("is-active");
    idx = clamped;
    pages[idx].classList.add("is-active");

    pageNow.textContent = String(idx + 1);
    const pct = ((idx + 1) / pages.length) * 100;
    progressFill.style.width = `${pct}%`;

    layEgg(pages[idx], direction);
    pages[idx].scrollIntoView({ behavior: "smooth", block: "start" });
  }

  prevBtn.addEventListener("click", () => setActive(idx - 1, "prev"));
  nextBtn.addEventListener("click", () => setActive(idx + 1, "next"));

  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") setActive(idx - 1, "prev");
    if (e.key === "ArrowRight") setActive(idx + 1, "next");
  });

  // Swipe navigation
  let touchX = null, touchY = null;
  window.addEventListener("touchstart", (e) => {
    const t = e.changedTouches[0];
    touchX = t.clientX; touchY = t.clientY;
  }, { passive:true });

  window.addEventListener("touchend", (e) => {
    if (touchX === null || touchY === null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchX;
    const dy = t.clientY - touchY;

    if (Math.abs(dx) > 55 && Math.abs(dy) < 60) {
      if (dx < 0) setActive(idx + 1, "next");
      else setActive(idx - 1, "prev");
    }
    touchX = null; touchY = null;
  }, { passive:true });

  if (btnJumpPlan) {
    btnJumpPlan.addEventListener("click", () => {
      const targetIndex = pages.findIndex(p => p.id === "plan");
      if (targetIndex >= 0) setActive(targetIndex, "next");
    });
  }

  // Init
  pages.forEach((p, i) => p.classList.toggle("is-active", i === 0));
  pageNow.textContent = "1";
  progressFill.style.width = `${(1 / pages.length) * 100}%`;
  layEgg(pages[0], "next");
})();
