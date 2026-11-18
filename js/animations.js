import { $, reduceMotion } from "./dom.js";
import { TIMING, EASE, RING_RADIUS } from "./config.js";

export function morph(change) {
  const el = document.querySelector(".main");
  if (reduceMotion) { change(); return; }

  const h0 = el.offsetHeight;
  el.style.height = "";
  change();
  const h1 = el.offsetHeight;
  if (Math.abs(h1 - h0) < 2) return;

  el.classList.add("morphing");
  el.style.height = h0 + "px";
  void el.offsetHeight;
  el.style.transition = `height ${TIMING.morph}ms ${EASE}`;
  el.style.height = h1 + "px";

  const done = e => {
    if (e.propertyName !== "height") return;
    el.removeEventListener("transitionend", done);
    el.style.height = el.style.transition = "";
    el.classList.remove("morphing");
  };
  el.addEventListener("transitionend", done);
}

export function reveal(el) {
  el.classList.remove("hidden", "view-in");
  void el.offsetWidth;
  el.classList.add("view-in");
}

export function animateRing(score, total) {
  const circumference = 2 * Math.PI * RING_RADIUS;
  const fg = $("ringFg"), num = $("ringNum");
  $("ringTotal").textContent = `/ ${total}`;

  fg.style.transition = "none";
  fg.style.strokeDashoffset = circumference;
  void fg.getBoundingClientRect();
  fg.style.transition = "";
  fg.style.strokeDashoffset = circumference * (1 - score / total);

  if (reduceMotion || score === 0) { num.textContent = score; return; }
  num.textContent = 0;
  const t0 = performance.now();
  const tick = now => {
    const p = Math.min((now - t0) / TIMING.ring, 1);
    num.textContent = Math.round(score * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
