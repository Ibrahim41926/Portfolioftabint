/* ==========================================================================
   effets.js — Effets visuels (styles associés : css/effets.css)
     1. Hero vivant : zoom lent de la photo, nom qui s'écarte au défilement
     2. Révélation des photos du parcours (rideau + noir & blanc → couleur)
     3. Titres révélés ligne par ligne
     4. Bandeau défilant entre « Qui suis-je » et le Parcours
     5. Reflet doré (badges, titre du chapitre 06)
     6. Transitions de fond entre sections noires et blanches
     7. Grain de pellicule
     8. Curseur doré (ordinateur)
     9. Boutons magnétiques (ordinateur)
   La parallaxe des grands numéros est dans main.js (initDefilement).
   Chaque effet se désactive dans js/data.js → effets : { nomDeLEffet: false }.
   Avec « réduire les animations », tout ce qui bouge est coupé.
   ========================================================================== */
(function () {
  "use strict";

  const D = window.SITE || {};
  const EFFETS = D.effets || {};
  const actif = (cle) => EFFETS[cle] !== false;

  const racine = document.documentElement;
  const mouvementReduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pointeurFin = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  const avecGsap = !mouvementReduit && !!gsap && !!ScrollTrigger;
  if (avecGsap) gsap.registerPlugin(ScrollTrigger);

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ------------------------------------------------------------------
     1. HERO VIVANT
     - zoom très lent de la photo (CSS, classe « hero-vivant ») ;
     - au défilement : prénom vers la gauche, nom vers la droite, le nom
       s'estompe et la photo descend un peu moins vite que la page.
     ------------------------------------------------------------------ */
  function initHero() {
    if (!actif("heroVivant") || mouvementReduit) return;
    racine.classList.add("hero-vivant");
    if (!avecGsap) return;

    const hero = $(".hero");
    if (!hero) return;
    gsap
      .timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
      })
      .to(".hero__line--1", { xPercent: -5 }, 0)
      .to(".hero__line--2", { xPercent: -2.5 }, 0)
      .to(".hero__line--3", { xPercent: 5 }, 0)
      .to(".hero__name", { opacity: 0 }, 0)
      .to(".hero__photo", { yPercent: 10 }, 0);
  }

  /* ------------------------------------------------------------------
     2. RÉVÉLATION DES PHOTOS DU PARCOURS
     Un masque (clip-path) s'ouvre de bas en haut pendant que l'image
     passe d'un léger zoom (1.2) à sa taille normale, puis du noir & blanc
     à la couleur. Remplace le « rideau » CSS de main.js pour ces photos.
     ------------------------------------------------------------------ */
  function initRevelationPhotos() {
    if (!actif("revelationPhotos") || !avecGsap) return;

    $$(".chapters .photo:not(.ph)").forEach((photo) => {
      const img = $("img", photo);
      if (!img) return;
      photo.classList.remove("curtain");
      photo.classList.add("photo--revelee");

      // Petit décalage entre les vignettes d'une même rangée
      const tuile = photo.closest(".tile");
      const rangee = photo.closest(".g__vigs");
      const rang = rangee && tuile ? Array.from(rangee.children).indexOf(tuile) + 1 : 0;

      gsap.set(photo, { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(img, { scale: 1.2, filter: "grayscale(1)" });

      const tl = gsap.timeline({ paused: true, delay: rang * 0.1 });
      tl.to(photo, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: "power3.inOut" }, 0)
        .to(img, { scale: 1, duration: 1.6, ease: "power3.out" }, 0)
        .to(img, { filter: "grayscale(0)", duration: 0.7, ease: "power1.out" }, 1)
        // À la fin, on rend la main au CSS (zoom au survol, etc.)
        .set(photo, { clearProps: "clipPath" })
        .set(img, { clearProps: "transform,filter" });

      ScrollTrigger.create({ trigger: photo, start: "top 90%", once: true, onEnter: () => tl.play() });
    });
  }

  /* ------------------------------------------------------------------
     3. TITRES RÉVÉLÉS LIGNE PAR LIGNE
     main.js découpe les titres en mots masqués (.w > .w__in) qui glissent
     de bas en haut. Ici, on donne le même retard à tous les mots d'une
     même ligne : chaque ligne monte d'un bloc, avec un décalage entre lignes.
     ------------------------------------------------------------------ */
  function initTitresParLigne() {
    if (!actif("titresParLigne") || mouvementReduit) return;
    const titres = $$(".section-title.split, .projet__title.split, .chapter__title.split, .apogee__title > .split");

    function calculer() {
      titres.forEach((titre) => {
        let ligne = -1;
        let haut = null;
        $$(".w", titre).forEach((mot) => {
          const y = mot.offsetTop;
          if (haut === null || Math.abs(y - haut) > 4) {
            ligne++;
            haut = y;
          }
          // --i × 70 ms (voir style.css) : 140 ms d'écart entre deux lignes
          if (mot.firstElementChild) mot.firstElementChild.style.setProperty("--i", ligne * 2);
        });
      });
    }
    calculer();
    // Les lignes changent quand les polices arrivent ou que la largeur change
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(calculer);
    let attente = null;
    window.addEventListener("resize", () => {
      clearTimeout(attente);
      attente = setTimeout(calculer, 200);
    });
  }

  /* ------------------------------------------------------------------
     4. BANDEAU DÉFILANT
     Défilement infini en CSS ; il accélère un peu quand on fait défiler
     la page, puis revient doucement à sa vitesse normale.
     ------------------------------------------------------------------ */
  function initBandeau() {
    const zone = $('[data-render="bandeau"]');
    if (!zone) return;
    const mots = D.bandeau || [];
    if (!actif("bandeau") || !mots.length) {
      zone.remove();
      return;
    }

    const groupe = mots
      .map((m) => `<span class="bandeau__mot">${m}</span><span class="bandeau__etoile">✦</span>`)
      .join("");
    // Un bloc assez long pour couvrir l'écran, doublé pour une boucle sans couture
    const bloc = `<div class="bandeau__bloc">${groupe}${groupe}</div>`;
    zone.innerHTML = `<div class="bandeau__piste">${bloc}${bloc}</div>`;

    if (mouvementReduit) return;
    const piste = $(".bandeau__piste", zone);
    let vitesse = 1;
    let cible = 1;
    let dernierY = window.scrollY;
    let dernierT = performance.now();
    let visible = false;
    let enCours = false;

    window.addEventListener("scroll", () => {
      const t = performance.now();
      const v = Math.abs(window.scrollY - dernierY) / Math.max(16, t - dernierT); // px par ms
      dernierY = window.scrollY;
      dernierT = t;
      cible = Math.min(3, 1 + v * 1.2);
      demarrer();
    }, { passive: true });

    function boucle() {
      cible += (1 - cible) * 0.04;       // la poussée retombe peu à peu
      vitesse += (cible - vitesse) * 0.08; // la vitesse suit en douceur
      const anim = piste.getAnimations ? piste.getAnimations()[0] : null;
      if (anim) anim.playbackRate = vitesse;
      if (visible && Math.abs(vitesse - 1) > 0.005) requestAnimationFrame(boucle);
      else {
        if (anim) anim.playbackRate = 1;
        vitesse = 1;
        enCours = false;
      }
    }
    function demarrer() {
      if (!visible || enCours) return;
      enCours = true;
      requestAnimationFrame(boucle);
    }
    new IntersectionObserver((e) => {
      visible = e[0].isIntersecting;
      // Hors de l'écran, l'animation CSS est mise en pause (batterie)
      zone.classList.toggle("est-hors-ecran", !visible);
    }).observe(zone);
  }

  /* ------------------------------------------------------------------
     5. REFLET DORÉ (animation en CSS, classe « reflet-dore »)
     Sur le titre du chapitre 06, le reflet passe dans un petit cadre qui
     le contient (overflow hidden), pour ne jamais élargir la page.
     ------------------------------------------------------------------ */
  function initReflet() {
    if (!actif("refletDore") || mouvementReduit) return;
    racine.classList.add("reflet-dore");
    const titre = $(".apogee__title");
    if (titre) {
      const cadre = document.createElement("span");
      cadre.className = "reflet";
      cadre.setAttribute("aria-hidden", "true");
      cadre.innerHTML = '<span class="reflet__bande"></span>';
      titre.appendChild(cadre);
    }
  }

  /* ------------------------------------------------------------------
     6. TRANSITIONS DE FOND
     Quand une section n'a pas la même couleur de fond que la précédente,
     un voile de la couleur précédente la recouvre et s'efface au défilement :
     le fond passe en douceur du noir au blanc cassé (ou l'inverse).
     ------------------------------------------------------------------ */
  function initTransitionsFond() {
    if (!actif("transitionsFond") || !avecGsap) return;
    const zones = [".hero", "#qui-suis-je", ".bandeau", "#parcours", ".chapter--apogee", "#projet", "#contact", "#reseaux", ".site-footer"]
      .map((s) => $(s))
      .filter(Boolean);
    const fond = (el) => getComputedStyle(el).getPropertyValue("--bg").trim();

    for (let i = 1; i < zones.length; i++) {
      const zone = zones[i];
      const avant = fond(zones[i - 1]);
      if (!avant || avant === fond(zone)) continue;
      const voile = document.createElement("div");
      voile.className = "fondu-voile";
      voile.setAttribute("aria-hidden", "true");
      voile.style.setProperty("--voile", avant);
      zone.classList.add("fondu-zone");
      zone.prepend(voile);
      gsap.fromTo(voile, { opacity: 1 }, {
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: zone, start: "top 90%", end: "top 35%", scrub: true },
      });
    }
  }

  /* ------------------------------------------------------------------
     7. GRAIN DE PELLICULE (défini dans style.css, ici seulement l'interrupteur)
     ------------------------------------------------------------------ */
  function initGrain() {
    if (!actif("grain")) racine.classList.add("sans-grain");
  }

  /* ------------------------------------------------------------------
     8. CURSEUR DORÉ (souris uniquement ; écrans tactiles : curseur normal)
     - suit la souris avec un léger retard ;
     - grossit et affiche « Voir » sur les photos ;
     - se réduit sur les liens et boutons.
     ------------------------------------------------------------------ */
  function initCurseur() {
    if (!actif("curseur") || mouvementReduit || !pointeurFin) return;
    const c = $(".cursor");
    if (!c) return;
    c.innerHTML = '<span class="cursor__rond"><span class="cursor__texte">Voir</span></span>';
    racine.classList.add("has-cursor");

    let x = -100, y = -100, cx = -100, cy = -100;
    let enCours = false;

    function boucle() {
      cx += (x - cx) * 0.18;
      cy += (y - cy) * 0.18;
      c.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
      // La boucle s'arrête quand le curseur a rattrapé la souris
      if (Math.abs(x - cx) > 0.2 || Math.abs(y - cy) > 0.2) requestAnimationFrame(boucle);
      else enCours = false;
    }

    // État selon l'élément sous la souris : photo (« Voir »), lien/bouton (réduit) ou rien
    function etat(el) {
      const cible = el && el.closest ? el.closest("a, button, [role='button'], .tile") : null;
      const surPhoto = !!(cible && cible.matches(".tile[data-groupe]"));
      c.classList.toggle("is-photo", surPhoto);
      c.classList.toggle("is-lien", !!cible && !surPhoto);
    }

    document.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      c.classList.add("is-visible");
      etat(e.target);
      if (!enCours) {
        enCours = true;
        requestAnimationFrame(boucle);
      }
    }, { passive: true });

    // La page défile sous une souris immobile : on revérifie ce qu'il y a dessous
    let verif = false;
    window.addEventListener("scroll", () => {
      if (verif || !c.classList.contains("is-visible")) return;
      verif = true;
      requestAnimationFrame(() => {
        verif = false;
        etat(document.elementFromPoint(x, y));
      });
    }, { passive: true });
    document.documentElement.addEventListener("mouseleave", () => c.classList.remove("is-visible"));
  }

  /* ------------------------------------------------------------------
     9. BOUTONS MAGNÉTIQUES (souris uniquement)
     Quand la souris approche, le bouton glisse légèrement vers elle,
     puis revient en place. Propriété CSS « translate » : n'interfère pas
     avec les animations d'apparition (qui utilisent « transform »).
     ------------------------------------------------------------------ */
  function initBoutonsMagnetiques() {
    if (!actif("boutonsMagnetiques") || mouvementReduit || !pointeurFin) return;
    const RAYON = 80;   // distance d'attraction autour du bouton (px)
    const FORCE = 0.25; // part du déplacement de la souris suivie par le bouton
    const MAX = 12;     // déplacement maximal (px)
    const borne = (v) => Math.max(-MAX, Math.min(MAX, v));

    $$(".btn").forEach((btn) => {
      let tx = 0, ty = 0, cx = 0, cy = 0;
      let enCours = false;

      function boucle() {
        cx += (tx - cx) * 0.15;
        cy += (ty - cy) * 0.15;
        btn.style.translate = `${cx.toFixed(2)}px ${cy.toFixed(2)}px`;
        if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) requestAnimationFrame(boucle);
        else {
          // Position finale exacte (et aucun décalage résiduel au repos)
          cx = tx;
          cy = ty;
          btn.style.translate = tx || ty ? `${tx}px ${ty}px` : "";
          enCours = false;
        }
      }

      document.addEventListener("pointermove", (e) => {
        if (e.pointerType !== "mouse") return;
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2 - cx);
        const dy = e.clientY - (r.top + r.height / 2 - cy);
        const proche = Math.abs(dx) < r.width / 2 + RAYON && Math.abs(dy) < r.height / 2 + RAYON;
        const nx = proche ? borne(dx * FORCE) : 0;
        const ny = proche ? borne(dy * FORCE) : 0;
        if (nx === tx && ny === ty) return;
        tx = nx;
        ty = ny;
        if (!enCours) {
          enCours = true;
          requestAnimationFrame(boucle);
        }
      }, { passive: true });
    });
  }

  /* ------------------------------------------------------------------
     10. MESURES À JOUR
     Les photos d'affiche gardent leurs proportions d'origine : leur
     hauteur n'est connue qu'une fois chargées. On remesure alors les
     déclencheurs au défilement (regroupé, pour ne pas le faire 40 fois).
     ------------------------------------------------------------------ */
  function initMesures() {
    if (!ScrollTrigger) return;
    let attente = null;
    const remesurer = () => {
      clearTimeout(attente);
      attente = setTimeout(() => ScrollTrigger.refresh(), 250);
    };
    $$(".tile--une img").forEach((img) => {
      if (!img.complete) img.addEventListener("load", remesurer, { once: true });
    });
  }

  /* ------------------------------------------------------------------
     DÉMARRAGE
     ------------------------------------------------------------------ */
  initMesures();
  initGrain();
  initBandeau();
  initTitresParLigne();
  initReflet();
  initHero();
  initRevelationPhotos();
  initTransitionsFond();
  initCurseur();
  initBoutonsMagnetiques();
})();
