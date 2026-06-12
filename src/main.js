/* CHATEAU AMSTERDAM — Production Interactions
   reveals · parallax · magnetic buttons · counters · language selector · header */
(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Bilingual Translation System ---------- */
  const langConfig = {
    nl: {
      title: "Chateau Amsterdam · Urban Winery Amsterdam-Noord",
      description: "Eerste urban winery van Nederland, gevestigd in Amsterdam-Noord. Druiven uit heel Europa, gemaakt aan het IJ. Boek een tasting of proeverij tussen de stalen tanks.",
      ogTitle: "Chateau Amsterdam · Urban Winery",
      ogDesc: "Geen wijngaard. Wel wijn. Druiven uit heel Europa, wijn gemaakt aan het IJ in Amsterdam-Noord."
    },
    en: {
      title: "Chateau Amsterdam · Urban Winery Amsterdam-Noord · No vineyard, still wine.",
      description: "The first urban winery in the Netherlands, located in Amsterdam-Noord. Grapes from all over Europe, made on the IJ. Book a tasting among the steel tanks.",
      ogTitle: "Chateau Amsterdam · Urban Winery",
      ogDesc: "No vineyard. Still wine. Grapes from all over Europe, wine made on the IJ in Amsterdam-Noord."
    }
  };

  const htmlEl = document.documentElement;
  const bodyEl = document.body;
  const langButtons = document.querySelectorAll(".lang-btn");
  const siteTitle = document.getElementById("site-title");
  const metaDesc = document.getElementById("meta-description");
  const ogTitleMeta = document.getElementById("og-title");
  const ogDescMeta = document.getElementById("og-description");
  const twitterTitleMeta = document.getElementById("twitter-title");
  const twitterDescMeta = document.getElementById("twitter-description");

  function setLanguage(lang) {
    if (lang === "en") {
      bodyEl.classList.add("lang-en");
      htmlEl.setAttribute("lang", "en");
    } else {
      bodyEl.classList.remove("lang-en");
      htmlEl.setAttribute("lang", "nl");
    }

    // Toggle active state on buttons
    langButtons.forEach((btn) => {
      if (btn.dataset.lang === lang) {
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");
      } else {
        btn.classList.remove("active");
        btn.setAttribute("aria-pressed", "false");
      }
    });

    // Update SEO meta tags
    const config = langConfig[lang] || langConfig.nl;
    if (siteTitle) siteTitle.textContent = config.title;
    if (metaDesc) metaDesc.setAttribute("content", config.description);
    if (ogTitleMeta) ogTitleMeta.setAttribute("content", config.ogTitle);
    if (ogDescMeta) ogDescMeta.setAttribute("content", config.ogDesc);
    if (twitterTitleMeta) twitterTitleMeta.setAttribute("content", config.ogTitle);
    if (twitterDescMeta) twitterDescMeta.setAttribute("content", config.ogDesc);

    // Persist language
    localStorage.setItem("preferred-lang", lang);
  }

  // Initialize Language
  const savedLang = localStorage.getItem("preferred-lang");
  const userLang = savedLang || (navigator.language.startsWith("en") ? "en" : "nl");
  setLanguage(userLang);

  // Bind Language Toggles
  langButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setLanguage(btn.dataset.lang);
    });
  });

  /* ---------- scroll reveals ---------- */
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          const d = parseFloat(e.target.dataset.delay || 0);
          setTimeout(() => e.target.classList.add("in"), d * 1000);
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.18, rootMargin: "0px 0px -6% 0px" }
  );
  document.querySelectorAll(".rv, .rv-line").forEach((el) => io.observe(el));

  /* hero entrance */
  window.addEventListener("load", () => {
    document.querySelector(".hero")?.classList.add("loaded");
  });
  // fallback in case load already fired
  setTimeout(() => document.querySelector(".hero")?.classList.add("loaded"), 1400);

  /* ---------- parallax ---------- */
  const pEls = [...document.querySelectorAll("[data-parallax]")];
  let ticking = false;
  function parallax() {
    const vh = window.innerHeight;
    for (const el of pEls) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) continue;
      const speed = parseFloat(el.dataset.parallax) || 0.1;
      const center = r.top + r.height / 2 - vh / 2;
      el.style.transform = `translateY(${(-center * speed).toFixed(1)}px)`;
    }
    ticking = false;
  }
  function onScroll() {
    if (!ticking && !reduced) {
      ticking = true;
      requestAnimationFrame(parallax);
    }
    const h = document.querySelector(".site-header");
    if (h) h.classList.toggle("is-scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- magnetic buttons ---------- */
  if (!reduced && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".btn, .nav-cta, .path .go").forEach((btn) => {
      const strength = 0.3;
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.translate = `${x * strength}px ${y * strength}px`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transition = "translate 0.6s cubic-bezier(0.19,1,0.22,1)";
        btn.style.translate = "0px 0px";
        setTimeout(() => (btn.style.transition = ""), 600);
      });
    });
  }

  /* ---------- counters ---------- */
  const cio = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        cio.unobserve(e.target);
        const el = e.target;
        const target = parseFloat(el.dataset.count);
        const dur = 1600;
        const fmt = (v) =>
          el.dataset.format === "dots"
            ? Math.round(v).toLocaleString("nl-NL")
            : Math.round(v).toString();
        if (reduced) { el.textContent = fmt(target); continue; }
        const t0 = performance.now();
        (function tick(t) {
          const p = Math.min((t - t0) / dur, 1);
          const ease = 1 - Math.pow(1 - p, 4);
          el.textContent = fmt(target * ease);
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      }
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll("[data-count]").forEach((el) => cio.observe(el));

  /* ---------- path rows: whole row clickable ---------- */
  document.querySelectorAll(".path[data-href]").forEach((row) => {
    row.addEventListener("click", (e) => {
      if (e.target.closest("a")) return;
      const href = row.dataset.href;
      if (href && href !== "#") {
        const targetSection = document.querySelector(href);
        if (targetSection) {
          e.preventDefault();
          targetSection.scrollIntoView({ behavior: "smooth" });
        } else {
          window.location.href = href;
        }
      }
    });
  });
})();
