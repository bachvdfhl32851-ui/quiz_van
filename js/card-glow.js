export function initCardGlow() {
  document.querySelectorAll(".card").forEach(card => {
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const pos = e => {
      const r = card.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
    };
    const loop = () => {
      x += (tx - x) * .14;
      y += (ty - y) * .14;
      card.style.setProperty("--mx", `${x}px`);
      card.style.setProperty("--my", `${y}px`);
      raf = Math.abs(tx - x) > .5 || Math.abs(ty - y) > .5 ? requestAnimationFrame(loop) : 0;
    };
    card.addEventListener("pointerenter", e => { pos(e); x = tx; y = ty; });
    card.addEventListener("pointermove", e => {
      pos(e);
      if (!raf) raf = requestAnimationFrame(loop);
    });
  });
}
