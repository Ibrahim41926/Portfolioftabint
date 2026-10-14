/* ==========================================================================
   citation.js — La citation de Miss Mermoz s'illumine mot à mot (GSAP + ScrollTrigger)
   - au départ, les mots sont gris et peu visibles ;
   - au fil du défilement, chacun passe à la couleur du texte, l'un après l'autre ;
   - « couronne », « ambition » et « réussir » passent en or.
   Avec « réduire les animations » (ou sans GSAP), la citation est déjà illuminée.
   Pour la désactiver : effets.citationLumineuse = false dans js/data.js.
   ========================================================================== */
(function () {
  "use strict";

  const EFFETS = (window.SITE && window.SITE.effets) || {};
  if (EFFETS.citationLumineuse === false) return;

  const citation = document.querySelector(".exergue__quote");
  if (!citation) return;

  // Les mots ont déjà été découpés en <span class="w__in"> par main.js
  const mots = Array.from(citation.querySelectorAll(".w__in"));
  if (!mots.length) return;

  // Mots en or (même sans animation : la citation est alors « déjà illuminée »)
  const MOTS_OR = ["couronne", "ambition", "réussir"];
  mots.forEach((m) => {
    // « d'ambition » → « ambition » : on ignore l'élision et la ponctuation
    const brut = m.textContent.toLowerCase().split(/['’]/).pop().replace(/[^\p{L}]/gu, "");
    if (MOTS_OR.includes(brut)) m.classList.add("mot-or");
  });

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  gsap.registerPlugin(ScrollTrigger);

  const styles = getComputedStyle(document.documentElement);
  const gris = styles.getPropertyValue("--gris").trim();
  const or = styles.getPropertyValue("--or").trim();
  const texte = getComputedStyle(citation).color; // couleur principale selon le fond

  gsap.fromTo(
    mots,
    { color: gris, opacity: 0.25 },
    {
      color: (i, el) => (el.classList.contains("mot-or") ? or : texte),
      opacity: 1,
      ease: "none",
      stagger: 0.3,
      scrollTrigger: { trigger: citation, start: "top 80%", end: "bottom 40%", scrub: true },
    }
  );
})();
