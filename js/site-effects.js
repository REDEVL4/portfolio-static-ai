const revealSelectors = [
  ".hero-copy",
  ".hero-aside-card",
  ".featured-panel",
  ".info-panel",
  ".resume-panel",
  ".contact-panel",
  ".metric-card",
  ".project-card",
  ".detail-panel",
  ".content-card",
  ".fact-card",
  ".education-card",
  ".timeline-card",
  ".related-card"
];

function initReveal() {
  const nodes = [...document.querySelectorAll(revealSelectors.join(","))];
  if (!nodes.length) {
    return;
  }

  nodes.forEach((node, index) => {
    node.classList.add("reveal-on-scroll");
    node.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 70}ms`);
  });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    nodes.forEach((node) => node.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -48px 0px"
    }
  );

  nodes.forEach((node) => observer.observe(node));
}

function initHeroGlow() {
  const hero = document.querySelector(".hero-shell");
  if (!hero) {
    return;
  }

  const updateGlow = (event) => {
    const rect = hero.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    hero.style.setProperty("--hero-glow-x", `${Math.max(0, Math.min(100, x))}%`);
    hero.style.setProperty("--hero-glow-y", `${Math.max(0, Math.min(100, y))}%`);
  };

  hero.addEventListener("pointermove", updateGlow);
  hero.addEventListener("pointerleave", () => {
    hero.style.setProperty("--hero-glow-x", "68%");
    hero.style.setProperty("--hero-glow-y", "22%");
  });
}

initReveal();
initHeroGlow();
