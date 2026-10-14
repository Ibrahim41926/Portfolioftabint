/* ==========================================================================
   couronne.js — Couronne de progression (en bas à droite)
   - visible uniquement pendant la section « Mon parcours » (fondu) ;
   - se remplit d'or de bas en haut au fil des 6 chapitres ;
   - indique le chapitre en cours (« 3 / 6 ») ;
   - pleine au chapitre 06, avec un léger scintillement ;
   - un clic ramène au début du parcours.
   JavaScript pur (sans GSAP), d'après la position verticale des chapitres.
   Pour la désactiver : effets.couronneProgression = false dans js/data.js.
   ========================================================================== */
(function () {
  "use strict";

  const EFFETS = (window.SITE && window.SITE.effets) || {};
  if (EFFETS.couronneProgression === false) return;

  const section = document.getElementById("parcours");
  const chapitres = Array.from(document.querySelectorAll(".chapter"));
  if (!section || chapitres.length < 2) return;

  const total = chapitres.length;
  const CONTOUR = "M5 26 3 8l9 8 8-13 8 13 9-8-2 18Z";

  // Construction du bouton : contour doré + même forme remplie, découpée par un masque
  const bouton = document.createElement("button");
  bouton.type = "button";
  bouton.className = "couronne-prog";
  bouton.setAttribute("aria-label", "Revenir au début du parcours");
  bouton.tabIndex = -1;
  bouton.innerHTML = `
    <svg viewBox="0 0 40 34" aria-hidden="true">
      <defs>
        <clipPath id="couronne-prog-niveau"><rect class="couronne-prog__niveau" x="0" y="0" width="40" height="34"/></clipPath>
      </defs>
      <path class="couronne-prog__plein" d="${CONTOUR}" clip-path="url(#couronne-prog-niveau)"/>
      <path class="couronne-prog__contour" d="${CONTOUR}"/>
      <path class="couronne-prog__contour" d="M6 30h28"/>
    </svg>
    <span class="couronne-prog__compte" aria-hidden="true">1 / ${total}</span>`;
  document.body.appendChild(bouton);

  const niveau = bouton.querySelector(".couronne-prog__niveau");
  const compte = bouton.querySelector(".couronne-prog__compte");
  // La couronne occupe y = 3 à 26 dans le dessin : on remplit cette hauteur
  const HAUT = 3;
  const BAS = 26;

  const borne = (v) => Math.min(1, Math.max(0, v));
  let etat = { visible: null, idx: -1, plein: null };

  function maj() {
    const vh = window.innerHeight;
    const milieu = vh / 2;

    // Visible seulement pendant la section Parcours
    const s = section.getBoundingClientRect();
    const visible = s.top < milieu && s.bottom > milieu;

    // Haut de chaque chapitre ; le chapitre en cours est le dernier passé au milieu de l'écran
    const pos = chapitres.map((c) => c.getBoundingClientRect().top);
    let idx = 0;
    pos.forEach((p, i) => {
      if (p <= milieu) idx = i;
    });
    // Remplissage : 0 au chapitre 01, 1 quand le chapitre 06 atteint le milieu de l'écran
    const remplissage = borne((milieu - pos[0]) / (pos[total - 1] - pos[0] || 1));
    const plein = remplissage >= 0.995 || idx === total - 1;

    const y = BAS - (BAS - HAUT) * (plein ? 1 : remplissage);
    niveau.setAttribute("y", y.toFixed(2));

    if (visible !== etat.visible) {
      bouton.classList.toggle("est-visible", visible);
      bouton.tabIndex = visible ? 0 : -1;
      etat.visible = visible;
    }
    if (idx !== etat.idx) {
      compte.textContent = `${idx + 1} / ${total}`;
      bouton.setAttribute("aria-label", `Chapitre ${idx + 1} sur ${total}. Revenir au début du parcours`);
      etat.idx = idx;
    }
    if (plein !== etat.plein) {
      bouton.classList.toggle("est-pleine", plein);
      etat.plein = plein;
    }
  }

  // Mise à jour pendant le défilement, puis encore un court instant ensuite
  // (défilement doux après un clic, inertie sur téléphone)
  let derniere = 0;
  let enCours = false;
  function boucle(t) {
    maj();
    if (t - derniere < 900) requestAnimationFrame(boucle);
    else enCours = false;
  }
  function demander() {
    derniere = performance.now();
    if (!enCours) {
      enCours = true;
      requestAnimationFrame(boucle);
    }
  }
  window.addEventListener("scroll", demander, { passive: true });
  window.addEventListener("resize", demander);
  window.addEventListener("load", demander);
  demander();

  // Clic : retour au début du parcours
  bouton.addEventListener("click", () => {
    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY, behavior: reduit ? "auto" : "smooth" });
  });
})();
