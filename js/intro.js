/* ==========================================================================
   intro.js — Intro cinématique (≈ 3 s, une seule fois par session)
   1. une couronne dorée se dessine trait par trait ;
   2. le nom apparaît lettre par lettre, le titre en or en dessous ;
   3. deux panneaux noirs s'ouvrent comme un rideau sur l'accueil.
   La décision de jouer l'intro est prise dans <head> (index.html) :
   la classe « intro-on » est alors présente sur <html>.
   Pour la désactiver : effets.intro = false dans js/data.js.
   ========================================================================== */
(function () {
  "use strict";

  const racine = document.documentElement;
  const intro = document.querySelector(".intro");
  if (!intro) return;

  // Pas d'intro à jouer : on retire simplement l'écran
  if (!racine.classList.contains("intro-on")) {
    intro.remove();
    return;
  }

  // Mémorise que l'intro a été vue : un rechargement arrive directement sur le site
  try {
    window.sessionStorage.setItem("intro-vue", "1");
  } catch (e) {
    /* navigation privée stricte : sans conséquence */
  }

  const identite = (window.SITE && window.SITE.identite) || {};
  const nom = intro.querySelector(".intro__nom");
  const titre = intro.querySelector(".intro__titre");
  const contenu = intro.querySelector(".intro__contenu");
  const passer = intro.querySelector(".intro__passer");

  // Le nom, découpé en lettres (chaque mot reste insécable pour ne pas se couper)
  (identite.nomComplet || "").split(" ").forEach((mot, i) => {
    if (i) nom.appendChild(document.createTextNode(" "));
    const blocMot = document.createElement("span");
    blocMot.className = "intro__mot";
    Array.from(mot).forEach((lettre) => {
      const l = document.createElement("span");
      l.className = "intro__lettre";
      l.textContent = lettre;
      blocMot.appendChild(l);
    });
    nom.appendChild(blocMot);
  });
  titre.textContent = identite.titre || "";

  let fini = false;
  let tl = null;

  // Fin de l'intro : on libère le défilement et on retire l'écran
  function terminer() {
    if (fini) return;
    fini = true;
    if (tl) tl.kill();
    racine.classList.remove("intro-on", "intro-attente");
    document.removeEventListener("keydown", surTouche);
    intro.remove();
    // Les mesures de ScrollTrigger (citation) sont refaites sans le blocage du défilement
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  }
  // « Passer » (ou Échap) : on saute directement à l'ouverture du rideau
  function passerIntro() {
    if (tl && tl.time() < 2.2) tl.seek(2.2);
    else terminer();
  }
  function surTouche(e) {
    if (e.key === "Escape") passerIntro();
  }

  passer.addEventListener("click", passerIntro);
  document.addEventListener("keydown", surTouche);

  // Sans GSAP (réseau coupé), on passe directement au site
  if (!window.gsap) {
    terminer();
    return;
  }

  window.scrollTo(0, 0);
  const lettres = intro.querySelectorAll(".intro__lettre");

  tl = window.gsap.timeline({ onComplete: terminer });
  tl
    // 1. La couronne se dessine (≈ 1,2 s)
    .to(".intro__couronne path", { strokeDashoffset: 0, duration: 1, stagger: 0.2, ease: "power2.inOut" }, 0)
    // 2. Le nom, lettre par lettre, puis le titre en or
    .to(lettres, { opacity: 1, y: 0, duration: 0.35, stagger: 0.025, ease: "power2.out" }, 0.95)
    .to(titre, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, 1.6)
    // 3. Le contenu s'efface et le rideau s'ouvre (fin à ≈ 2,95 s)
    .to(contenu, { opacity: 0, duration: 0.3, ease: "power1.in" }, 2.2)
    .call(() => racine.classList.remove("intro-attente"), null, 2.3) // l'accueil s'anime sous le rideau
    .to(".intro__panneau--haut", { yPercent: -100, duration: 0.65, ease: "power3.inOut" }, 2.3)
    .to(".intro__panneau--bas", { yPercent: 100, duration: 0.65, ease: "power3.inOut" }, 2.3)
    .to(passer, { opacity: 0, duration: 0.2 }, 2.3);
})();
