/* ==========================================================================
   paillettes.js — Fines paillettes dorées dans le chapitre 06 (Miss Guinée France)
   <canvas> en JavaScript pur, placé derrière le texte et les photos.
   - ≈ 70 particules visibles par écran sur ordinateur, 40 sur téléphone
     (réglables plus bas : PAR_ECRAN_ORDINATEUR / PAR_ECRAN_TELEPHONE) ;
   - losanges de 1,5 à 4 px et petites étoiles scintillantes de 5 à 8 px,
     en or foncé, or et or clair, légère rotation et scintillement ;
   - l'animation ne tourne QUE lorsque le chapitre est visible (batterie).
   Pour la désactiver : effets.paillettes = false dans js/data.js.
   ========================================================================== */
(function () {
  "use strict";

  const EFFETS = (window.SITE && window.SITE.effets) || {};
  if (EFFETS.paillettes === false) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const chapitre = document.querySelector(".chapter--apogee");
  if (!chapitre || !("IntersectionObserver" in window)) return;

  const canvas = document.createElement("canvas");
  canvas.className = "paillettes";
  canvas.setAttribute("aria-hidden", "true");
  // Juste après le grand numéro en filigrane, donc derrière tout le contenu
  const deco = chapitre.querySelector(".chapter__deco");
  if (deco) deco.after(canvas);
  else chapitre.prepend(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Couleurs : le chapitre 06 est sur fond blanc cassé, on privilégie donc les ors
  // soutenus (--or-fonce, --or), avec un peu d'or clair pour la lumière
  const styles = getComputedStyle(document.documentElement);
  const or = styles.getPropertyValue("--or").trim();
  const orFonce = styles.getPropertyValue("--or-fonce").trim();
  const blanc = styles.getPropertyValue("--blanc").trim();
  const enRvb = (hex) => {
    const h = hex.replace("#", "");
    const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const rvbOr = enRvb(or);
  const rvbBlanc = enRvb(blanc);
  const rvbOrFonce = enRvb(orFonce);
  const rvbOrClair = rvbOr.map((v, i) => Math.round(v + (rvbBlanc[i] - v) * 0.3));
  const COULEURS = [rvbOrFonce, rvbOrFonce, rvbOr, rvbOr, rvbOrClair]; // 2/5 or foncé, 2/5 or, 1/5 or clair

  // Réglages de visibilité (augmenter pour plus de paillettes, diminuer pour plus de discrétion)
  // Nombre de particules visibles à la fois dans un écran (le total suit la hauteur du chapitre)
  const PAR_ECRAN_ORDINATEUR = 70;
  const PAR_ECRAN_TELEPHONE = 40;
  const MAXIMUM = 240; // plafond, pour rester fluide sur téléphone
  const PART_ETINCELLES = 0.18; // part des particules dessinées en petite étoile à 4 branches

  let largeur = 0;
  let hauteur = 0;
  let particules = [];

  const hasard = (min, max) => min + Math.random() * (max - min);

  function creer(enHaut) {
    const etincelle = Math.random() < PART_ETINCELLES;
    return {
      x: hasard(0, largeur),
      y: enHaut ? hasard(-40, -4) : hasard(0, hauteur),
      etincelle,
      taille: etincelle ? hasard(5, 8) : hasard(1.5, 4),
      vitesse: hasard(8, 26),          // px par seconde : chute lente et variable
      derive: hasard(6, 18),           // amplitude du léger balancement
      phase: hasard(0, Math.PI * 2),
      rotation: hasard(0, Math.PI),
      vRotation: hasard(-1.2, 1.2),    // radians par seconde
      scintille: hasard(1.5, 4),       // vitesse du scintillement
      couleur: COULEURS[Math.floor(Math.random() * COULEURS.length)],
    };
  }

  function dimensionner() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    largeur = chapitre.offsetWidth;
    hauteur = chapitre.offsetHeight;
    canvas.width = Math.round(largeur * dpr);
    canvas.height = Math.round(hauteur * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const parEcran = window.innerWidth < 768 ? PAR_ECRAN_TELEPHONE : PAR_ECRAN_ORDINATEUR;
    const ecrans = Math.max(1, hauteur / window.innerHeight);
    const nombre = Math.min(MAXIMUM, Math.round(parEcran * ecrans));
    particules = Array.from({ length: nombre }, () => creer(false));
  }

  let actif = false;
  let precedent = 0;
  let temps = 0;

  function dessiner(t) {
    if (!actif) return;
    const dt = Math.min(0.05, (t - precedent) / 1000 || 0); // en secondes, borné après une pause
    precedent = t;
    temps += dt;
    ctx.clearRect(0, 0, largeur, hauteur);

    for (const p of particules) {
      p.y += p.vitesse * dt;
      p.rotation += p.vRotation * dt;
      if (p.y > hauteur + 6) Object.assign(p, creer(true));
      const x = p.x + Math.sin(temps * 0.6 + p.phase) * p.derive;
      const eclat = 0.55 + 0.45 * Math.abs(Math.sin(temps * p.scintille + p.phase));
      const [r, v, b] = p.couleur;
      ctx.save();
      ctx.translate(x, p.y);
      ctx.fillStyle = `rgba(${r}, ${v}, ${b}, ${eclat.toFixed(3)})`;
      if (p.etincelle) {
        // Petite étoile à 4 branches qui scintille (sa taille pulse avec l'éclat)
        const s = p.taille * (0.6 + 0.4 * eclat);
        const e = Math.max(0.8, s * 0.16);
        ctx.rotate(p.rotation * 0.25);
        ctx.fillRect(-s / 2, -e / 2, s, e);
        ctx.fillRect(-e / 2, -s / 2, e, s);
      } else {
        ctx.rotate(p.rotation);
        ctx.fillRect(-p.taille / 2, -p.taille / 2, p.taille, p.taille); // petit losange qui tourne
      }
      ctx.restore();
    }
    requestAnimationFrame(dessiner);
  }

  function demarrer() {
    if (actif || document.hidden) return;
    actif = true;
    precedent = performance.now();
    requestAnimationFrame(dessiner);
  }
  function arreter() {
    actif = false; // la boucle requestAnimationFrame s'arrête d'elle-même
  }

  dimensionner();
  let visible = false;
  new IntersectionObserver((entrees) => {
    visible = entrees[0].isIntersecting;
    if (visible) demarrer();
    else arreter();
  }).observe(chapitre);

  // Onglet en arrière-plan : on coupe aussi
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) arreter();
    else if (visible) demarrer();
  });

  // Taille du chapitre modifiée (rotation du téléphone, polices chargées…)
  if ("ResizeObserver" in window) {
    let attente = null;
    new ResizeObserver(() => {
      clearTimeout(attente);
      attente = setTimeout(dimensionner, 150);
    }).observe(chapitre);
  }
})();
