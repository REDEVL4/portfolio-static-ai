const revealSelectors = [
  ".hero-copy",
  ".spotlight-shell",
  ".spotlight-nav",
  ".surface-panel",
  ".contact-band",
  ".page-hero-shell",
  ".project-toolbar",
  ".metric-card",
  ".project-card",
  ".detail-panel",
  ".content-card",
  ".fact-card",
  ".education-card",
  ".timeline-card",
  ".related-card"
];

function revealNodes(nodes) {
  if (!nodes.length) {
    return [];
  }

  const fresh = nodes.filter((node) => !node.dataset.revealReady);
  fresh.forEach((node, index) => {
    node.dataset.revealReady = "true";
    node.classList.add("reveal-on-scroll");
    node.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 70}ms`);
  });
  return fresh;
}

function initReveal() {
  const nodes = revealNodes([...document.querySelectorAll(revealSelectors.join(","))]);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll("[data-reveal-ready='true']").forEach((node) => node.classList.add("is-visible"));
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

  return observer;
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

function initTilt() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.matchMedia("(max-width: 991px)").matches) {
    return;
  }

  const nodes = [...document.querySelectorAll("[data-tilt]")].filter((node) => !node.dataset.tiltReady);
  nodes.forEach((node) => {
    node.dataset.tiltReady = "true";
    node.classList.add("tilt-surface");

    const reset = () => {
      node.style.setProperty("--tilt-shine-x", "50%");
      node.style.setProperty("--tilt-shine-y", "50%");
    };

    node.addEventListener("pointermove", (event) => {
      const rect = node.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      node.style.setProperty("--tilt-shine-x", `${(px * 100).toFixed(1)}%`);
      node.style.setProperty("--tilt-shine-y", `${(py * 100).toFixed(1)}%`);
    });

    node.addEventListener("pointerleave", reset);
    reset();
  });
}

function initNavState() {
  const nav = document.querySelector(".site-nav");
  if (!nav) {
    return;
  }

  const sync = () => {
    nav.classList.toggle("site-nav--scrolled", window.scrollY > 18);
  };

  sync();
  window.addEventListener("scroll", sync, { passive: true });
}

const revealObserver = initReveal();
initHeroGlow();
initTilt();
initNavState();

if (document.body) {
  const mutationObserver = new MutationObserver(() => {
    const nodes = revealNodes([...document.querySelectorAll(revealSelectors.join(","))]);
    if (revealObserver && nodes?.length) {
      nodes.forEach((node) => revealObserver.observe(node));
    }
    initTilt();
  });

  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}
