/* ==========================================================================
   main.js — Construction des sections à partir de data.js,
   animations, galeries, visionneuse et menu.
   Aucun texte du site n'est écrit ici : tout vient de js/data.js.
   ========================================================================== */
(function () {
  "use strict";

  const D = window.SITE;
  const PHOTOS = window.PHOTOS || {};
  const racine = document.documentElement;

  const mouvementReduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pointeurFin = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ------------------------------------------------------------------
     1. OUTILS
     ------------------------------------------------------------------ */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // Échappe un texte destiné à un attribut HTML (alt, aria-label…)
  const echapper = (s) =>
    String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // Retire les balises (pour les attributs alt / aria-label)
  const texteBrut = (s) => String(s).replace(/<[^>]+>/g, "");

  // Âge calculé à partir de la date de naissance (AAAA-MM-JJ)
  function calculerAge(iso) {
    const [a, m, j] = iso.split("-").map(Number);
    const auj = new Date();
    let age = auj.getFullYear() - a;
    const moisAuj = auj.getMonth() + 1;
    if (moisAuj < m || (moisAuj === m && auj.getDate() < j)) age--;
    return age;
  }
  const AGE = calculerAge(D.identite.dateNaissance);

  /* Prépare un texte : remplace {age}, applique les espaces insécables
     de la typographie française et passe les émojis en noir & blanc. */
  function t(str) {
    return String(str || "")
      .replace(/\{age\}/g, AGE)
      .replace(/ ([?!:;»])/g, " $1")
      .replace(/« /g, "« ")
      .replace(/(\p{Extended_Pictographic})/gu, '<span class="emoji">$1</span>');
  }

  // Liste des photos d'un dossier, avec un texte alternatif descriptif
  function photosDe(dossier, legende) {
    const fichiers = PHOTOS[dossier] || [];
    return fichiers.map((f, i) => ({
      src: "assets/photos/" + dossier + "/" + encodeURIComponent(f),
      alt: fichiers.length > 1 ? `${legende} (photo ${i + 1} sur ${fichiers.length})` : legende,
    }));
  }

  // Les groupes de photos ouverts dans la visionneuse
  const GROUPES = {};

  /* ------------------------------------------------------------------
     2. BRIQUES HTML (photos, placeholders, vignettes)
     ------------------------------------------------------------------ */
  function balisePhoto(p, prioritaire) {
    const chargement = prioritaire ? 'fetchpriority="high"' : 'loading="lazy"';
    return `<img src="${p.src}" alt="${echapper(p.alt)}" ${chargement} decoding="async">`;
  }

  // Placeholder élégant quand la photo n'est pas encore ajoutée
  function placeholder(numero, classe = "", texte = "Photo à venir") {
    return `<div class="tile tile--ph ${classe}">
      <div class="photo ph curtain" role="img" aria-label="${echapper(texte)}">
        <span class="ph__num">${numero}</span>
        <span class="ph__txt">${texte}</span>
      </div>
    </div>`;
  }

  // Vignette cliquable qui ouvre la visionneuse
  function vignette(p, groupe, index, classe = "", restantes = 0) {
    const plus = restantes > 0 ? `<span class="tile__plus" aria-hidden="true">+${restantes}</span>` : "";
    const label = restantes > 0 ? `Voir les ${restantes} autres photos` : `Agrandir : ${p.alt}`;
    return `<button class="tile ${classe}" type="button" data-groupe="${groupe}" data-index="${index}" aria-label="${echapper(label)}">
      <span class="photo curtain">${balisePhoto(p)}</span>${plus}
    </button>`;
  }

  /* Mises en page des galeries : une grande photo d'affiche + des vignettes
     toutes de la même taille (3 par ligne en demi-largeur, 6 en pleine largeur). */
  const MISES_EN_PAGE = {
    gauche: { type: "une", vignettes: 3, ph: 3 },
    droite: { type: "une", vignettes: 3, ph: 3 },
    decale: { type: "une", vignettes: 3, ph: 3 },
    mosaique: { type: "une", vignettes: 3, ph: 3 },
    panorama: { type: "une", vignettes: 3, ph: 3 },
    apogee: { type: "une", vignettes: 6, ph: 6 },
  };

  function galerie(chap) {
    const conf = MISES_EN_PAGE[chap.miseEnPage] || MISES_EN_PAGE.gauche;
    const liste = photosDe(chap.dossier, chap.legende);
    GROUPES[chap.id] = liste;
    const cls = `g g--${chap.miseEnPage}`;

    // Aucune photo : placeholders
    if (!liste.length) {
      if (conf.type === "une") {
        const vigs = Array.from({ length: conf.ph }, () => placeholder(chap.numero, "tile--vig")).join("");
        return `<div class="${cls}">${placeholder(chap.numero, "tile--une")}<div class="g__vigs">${vigs}</div></div>`;
      }
      return `<div class="${cls}">${Array.from({ length: conf.ph }, () => placeholder(chap.numero)).join("")}</div>`;
    }

    if (conf.type === "une") {
      const vigs = liste.slice(1, 1 + conf.vignettes);
      const reste = liste.length - 1 - vigs.length;
      const htmlVigs = vigs
        .map((p, i) => vignette(p, chap.id, i + 1, "tile--vig", i === vigs.length - 1 ? reste : 0))
        .join("");
      return `<div class="${cls}">
        ${vignette(liste[0], chap.id, 0, "tile--une")}
        ${vigs.length ? `<div class="g__vigs">${htmlVigs}</div>` : ""}
      </div>`;
    }

    const visibles = liste.slice(0, conf.max);
    const reste = liste.length - visibles.length;
    return `<div class="${cls}">${visibles
      .map((p, i) => vignette(p, chap.id, i, "", i === visibles.length - 1 ? reste : 0))
      .join("")}</div>`;
  }

  const badges = (liste) =>
    liste && liste.length
      ? `<ul class="badges reveal">${liste.map((b) => `<li>${t(b)}</li>`).join("")}</ul>`
      : "";

  /* ------------------------------------------------------------------
     3. RENDU DES SECTIONS
     ------------------------------------------------------------------ */
  function rendreNavigation() {
    // « Réseaux » n'apparaît dans le menu que si au moins un lien est renseigné
    const liens = D.navigation.filter((n) => n.cible !== "#reseaux" || reseauxRemplis().length);
    $('[data-render="nav"]').innerHTML = liens
      .map((n) => `<li><a href="${n.cible}">${t(n.libelle)}</a></li>`)
      .join("");
    $('[data-render="menu"]').innerHTML = liens
      .map(
        (n, i) =>
          `<li><a href="${n.cible}"><span class="menu__num">0${i + 1}</span><span class="menu__label">${t(n.libelle)}</span></a></li>`
      )
      .join("");
    $('[data-render="menu-foot"]').innerHTML = t(D.identite.titre);
  }

  function rendreHero() {
    const id = D.identite;
    const portrait = photosDe("00-portrait", `Portrait de ${id.nomComplet}`)[0];
    const photo = portrait
      ? `<div class="photo curtain hero__img">${balisePhoto(portrait, true)}</div>`
      : `<div class="photo ph curtain hero__img" role="img" aria-label="Portrait à venir"><span class="ph__num">00</span><span class="ph__txt">Portrait à venir</span></div>`;

    $('[data-render="hero"]').innerHTML = `
      <div class="container hero__grid">
        <div class="hero__intro">
          <p class="eyebrow hero__eyebrow reveal"><span>Portfolio</span><span class="hero__rule" aria-hidden="true"></span><span>Édition 2027</span></p>
          <h1 class="display hero__name">
            <span class="sr-only">${id.nomComplet}</span>
            ${id.lignesNom.map((l, i) => `<span class="hero__line hero__line--${i + 1} split" aria-hidden="true">${l}</span>`).join("")}
          </h1>
          <p class="hero__title reveal" style="--d:.5s">${t(id.titre)}</p>
        </div>
        <figure class="hero__photo">
          ${photo}
          <figcaption class="hero__caption eyebrow" aria-hidden="true">${t(id.ville)} — ${new Date().getFullYear()}</figcaption>
        </figure>
        <div class="hero__outro">
          <p class="hero__tagline reveal" style="--d:.7s">${t(id.accroche)}</p>
          <a class="scroll-cue reveal" style="--d:.9s" href="#qui-suis-je">
            <span>Découvrir</span><span class="scroll-cue__line" aria-hidden="true"></span>
          </a>
        </div>
      </div>`;
  }

  function rendreApropos() {
    const a = D.apropos;
    const portraits = photosDe("00-portrait", `Portrait de ${D.identite.nomComplet}`);
    const p = portraits[1] || portraits[0];
    GROUPES.portrait = portraits;
    const photo = p
      ? vignette(p, "portrait", portraits.indexOf(p), "tile--une")
      : placeholder("00", "tile--une", "Portrait à venir");

    $('[data-render="apropos"]').innerHTML = `
      <div class="container about__grid">
        <header class="section-head about__head">
          <p class="eyebrow reveal">${t(a.surtitre)}</p>
          <h2 class="display section-title split" id="titre-apropos">${t(a.titre)}</h2>
        </header>
        <div class="about__photo">${photo}</div>
        <div class="about__text">
          <p class="about__lead reveal">${t(a.intro)}</p>
          ${a.paragraphes.map((x) => `<p class="reveal">${t(x)}</p>`).join("")}
          <p class="about__signature reveal" aria-hidden="true">${t(a.signature)}</p>
        </div>
        <aside class="fiche reveal" aria-label="Fiche d'identité">
          <div class="fiche__top">
            <span class="eyebrow">Fiche d'identité</span>
            <span class="fiche__crown" aria-hidden="true">✦</span>
          </div>
          <p class="fiche__name">${t(D.identite.nomComplet)}</p>
          <dl class="fiche__list">
            ${a.fiche.map((f) => `<div class="fiche__row"><dt>${t(f.libelle)}</dt><dd>${t(f.valeur)}</dd></div>`).join("")}
          </dl>
          <p class="fiche__foot eyebrow">${t(D.identite.titre)}</p>
        </aside>
      </div>`;
  }

  function rendreChapitre(c) {
    const annee = c.annee ? ` <span class="chapter__year">· ${c.annee}</span>` : "";
    const surtitre = `Chapitre ${c.numero}${c.lieu ? " · " + t(c.lieu) : ""}`;
    return `
      <article class="chapter chapter--${c.miseEnPage}" id="${c.id}" aria-labelledby="${c.id}-titre">
        <span class="chapter__marker" aria-hidden="true">✦</span>
        <div class="chapter__deco reveal" style="--d:.35s" aria-hidden="true"><span class="chapter__bignum" data-parallax>${c.numero}</span></div>
        <div class="chapter__grid">
          <header class="chapter__head">
            <h3 class="display chapter__title split" id="${c.id}-titre">${t(c.titre)}</h3>
            <p class="eyebrow reveal" style="--d:.15s">${surtitre}</p>
            <p class="chapter__subtitle reveal"><em>${t(c.sousTitre)}</em>${annee}</p>
          </header>
          <div class="chapter__gallery reveal" style="--d:.15s">${galerie(c)}</div>
          <div class="chapter__body">
            ${c.texte.map((x) => `<p class="reveal" style="--d:.3s">${t(x)}</p>`).join("")}
            ${badges(c.badges)}
          </div>
        </div>
      </article>
      ${
        c.citation
          ? `<figure class="exergue">
              <span class="exergue__mark" aria-hidden="true">✦</span>
              <blockquote class="exergue__quote split">${t(c.citation)}</blockquote>
              <figcaption class="eyebrow reveal">${t(D.identite.nomComplet)} — ${t(c.titreCourt)} ${c.annee}</figcaption>
            </figure>`
          : ""
      }`;
  }

  // Chapitre final : l'apogée, en couleurs inversées
  function rendreApogee(c) {
    return `
      <article class="chapter chapter--apogee theme-inverse" id="${c.id}" aria-labelledby="${c.id}-titre">
        <span class="chapter__marker" aria-hidden="true">✦</span>
        <div class="chapter__deco" aria-hidden="true"><span class="chapter__bignum" data-parallax>${c.numero}</span></div>
        <header class="apogee__head">
          <span class="tricolore reveal" aria-hidden="true"><span></span><span></span><span></span></span>
          <h3 class="display apogee__title" id="${c.id}-titre">
            <span class="split">${t(c.titre)}</span>
            <span class="apogee__year reveal" style="--d:.3s">${c.annee}</span>
          </h3>
          <p class="eyebrow reveal" style="--d:.4s">Chapitre ${c.numero} · L'apogée</p>
          <p class="apogee__subtitle reveal"><em>${t(c.sousTitre)}</em></p>
        </header>
        <div class="chapter__gallery">${galerie(c)}</div>
        <div class="apogee__body">
          ${c.texte.map((x) => `<p class="reveal">${t(x)}</p>`).join("")}
        </div>
        <p class="apogee__mention reveal"><span>${t(c.mention)}</span><span class="apogee__caret" aria-hidden="true"></span></p>
      </article>`;
  }

  function rendreParcours() {
    const p = D.parcours;
    const frise = p.chapitres
      .map(
        (c) => `<li><a href="#${c.id}" data-frise="${c.id}">
          <span class="frise__num">${c.numero}</span>
          <span class="frise__dot" aria-hidden="true"></span>
          <span class="frise__label">${t(c.titreCourt)}</span>
          <span class="frise__year">${c.annee || "—"}</span>
        </a></li>`
      )
      .join("");

    $('[data-render="parcours"]').innerHTML = `
      <div class="container">
        <header class="section-head parcours__head">
          <p class="eyebrow reveal">${t(p.surtitre)}</p>
          <h2 class="display section-title split" id="titre-parcours">${t(p.titre)}</h2>
          <p class="section-intro reveal">${t(p.intro)}</p>
        </header>
        <nav class="frise reveal" aria-label="Aller directement à un chapitre">
          <ol>${frise}</ol>
        </nav>
        <div class="chapters">
          <div class="timeline" aria-hidden="true"><span class="timeline__progress"></span></div>
          ${p.chapitres.map((c) => (c.miseEnPage === "apogee" ? rendreApogee(c) : rendreChapitre(c))).join("")}
        </div>
      </div>`;
  }

  function rendreProjet() {
    const p = D.projet;
    const romains = ["I", "II", "III", "IV", "V"];
    $('[data-render="projet"]').innerHTML = `
      <div class="container">
        <header class="section-head projet__head">
          <p class="eyebrow reveal">${t(p.surtitre)}</p>
          <h2 class="display projet__title split" id="titre-projet">${t(p.titre)}</h2>
        </header>
        <svg class="horizon" viewBox="0 0 1200 60" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 30 C 100 6, 200 6, 300 30 S 500 54, 600 30 S 800 6, 900 30 S 1100 54, 1200 30" />
        </svg>
        <p class="projet__quote reveal">${t(p.citation)}</p>
        <ul class="piliers">
          ${p.piliers
            .map(
              (x, i) => `<li class="pilier reveal" style="--d:${i * 0.12}s">
                <span class="pilier__num">${romains[i]}</span>
                <h3 class="pilier__title">${t(x.titre)}</h3>
                <p class="pilier__text">${t(x.texte)}</p>
              </li>`
            )
            .join("")}
        </ul>
      </div>`;
  }

  function rendreContact() {
    const c = D.contact;
    const tel = c.telephone.replace(/ /g, " ");

    $('[data-render="contact"]').innerHTML = `
      <div class="container contact__grid">
        <header class="section-head contact__head">
          <p class="eyebrow reveal">${t(c.surtitre)}</p>
          <h2 class="display section-title split" id="titre-contact">${t(c.titre)}</h2>
          <p class="section-intro reveal">${t(c.intro)}</p>
          <a class="btn reveal" href="mailto:${c.email}"><span>${t(c.bouton)}</span><span class="btn__arrow" aria-hidden="true">→</span></a>
        </header>
        <dl class="coordonnees">
          <div class="coord reveal"><dt class="eyebrow">Téléphone</dt><dd><a href="tel:${c.telephoneLien}">${tel}</a></dd></div>
          <div class="coord reveal"><dt class="eyebrow">E-mail</dt><dd><a href="mailto:${c.email}">${c.email}</a></dd></div>
          <div class="coord reveal"><dt class="eyebrow">Localisation</dt><dd>${t(c.localisation)}</dd></div>
        </dl>
      </div>`;
  }

  /* Flèche des cartes en SVG : le caractère « ↗ » s'affichait en emoji bleu sur iPhone */
  const FLECHE_SVG =
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7"/><path d="M8 7h9v9"/></svg>';

  /* Section « Mes réseaux » : une carte par réseau, avec son logo (en or) */
  const RESEAUX = {
    instagram: {
      nom: "Instagram",
      logo: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="4.4" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor"/></svg>',
    },
    tiktok: {
      nom: "TikTok",
      logo: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>',
    },
    facebook: {
      nom: "Facebook",
      logo: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/></svg>',
    },
    x: {
      nom: "X",
      logo: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>',
    },
  };

  // Réseaux renseignés dans data.js (les liens vides sont ignorés)
  const reseauxRemplis = () =>
    Object.entries(D.reseaux || {}).filter(([cle, url]) => RESEAUX[cle] && url && url.trim());

  // « @nom » déduit de l'adresse du profil (ex. instagram.com/xxx → @xxx)
  function pseudo(url) {
    try {
      const segment = new URL(url).pathname.split("/").filter(Boolean)[0] || "";
      // Liens de partage (facebook.com/share/…) : pas de nom de compte lisible
      if (!segment || segment === "profile.php" || segment === "share") return "";
      return "@" + decodeURIComponent(segment).replace(/^@/, "");
    } catch (e) {
      return "";
    }
  }

  function rendreReseaux() {
    const zone = $('[data-render="reseaux"]');
    if (!zone) return;
    const liste = reseauxRemplis();
    // Aucun lien : la section est retirée (le lien du menu aussi, voir rendreNavigation)
    if (!liste.length) {
      zone.remove();
      return;
    }
    const r = D.mesReseaux || {};
    zone.innerHTML = `
      <div class="container">
        <header class="section-head">
          <p class="eyebrow reveal">${t(r.surtitre)}</p>
          <h2 class="display section-title split" id="titre-reseaux">${t(r.titre)}</h2>
          ${r.intro ? `<p class="section-intro reveal">${t(r.intro)}</p>` : ""}
        </header>
        <ul class="mes-reseaux">
          ${liste
            .map(([cle, url], i) => {
              const res = RESEAUX[cle];
              // Sans « @nom » lisible dans le lien (ex. Facebook), on affiche le nom complet
              const nomCompte = pseudo(url) || t(D.identite.nomComplet);
              return `<li class="reveal" style="--d:${i * 0.12}s">
                <a class="carte-reseau" href="${echapper(url)}" target="_blank" rel="noopener"
                   aria-label="${res.nom}${nomCompte ? " " + nomCompte : ""} (nouvel onglet)">
                  <span class="carte-reseau__logo">${res.logo}</span>
                  <span class="carte-reseau__nom">${res.nom}</span>
                  ${nomCompte ? `<span class="carte-reseau__pseudo">${echapper(nomCompte)}</span>` : ""}
                  <span class="carte-reseau__fleche" aria-hidden="true">${FLECHE_SVG}</span>
                </a>
              </li>`;
            })
            .join("")}
        </ul>
      </div>`;
  }

  function rendreFooter() {
    $('[data-render="footer"]').innerHTML = `
      <div class="container site-footer__inner">
        <p class="site-footer__name">${t(D.footer)}</p>
        <p class="eyebrow">© ${new Date().getFullYear()} · Tous droits réservés</p>
        <a class="eyebrow site-footer__top" href="#accueil">Haut de page ↑</a>
      </div>`;
  }

  /* ------------------------------------------------------------------
     4. ANIMATIONS
     ------------------------------------------------------------------ */

  // Découpe un titre en mots pour les faire apparaître un à un
  function decouperMots(el) {
    let i = 0;
    const parcourir = (noeud) => {
      Array.from(noeud.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          // On ne coupe que sur les espaces normaux (les insécables restent collés)
          n.textContent.split(/( +|\n+)/).forEach((morceau) => {
            if (!morceau) return;
            if (/^[ \n]+$/.test(morceau)) {
              frag.appendChild(document.createTextNode(" "));
              return;
            }
            const mot = document.createElement("span");
            mot.className = "w";
            const interieur = document.createElement("span");
            interieur.className = "w__in";
            interieur.style.setProperty("--i", i++);
            interieur.textContent = morceau;
            mot.appendChild(interieur);
            frag.appendChild(mot);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.classList.contains("emoji")) {
          parcourir(n);
        }
      });
    };
    parcourir(el);
  }

  function initApparitions() {
    $$(".split").forEach(decouperMots);
    const cibles = $$(".reveal, .curtain, .split, .horizon");

    if (mouvementReduit || !("IntersectionObserver" in window)) {
      cibles.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entrees) =>
        entrees.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0 }
    );
    cibles.forEach((el) => io.observe(el));
  }

  // Noir & blanc → couleur : au survol (ordinateur) ou à l'apparition (mobile)
  function initNoirEtBlanc() {
    if (!D.options || !D.options.photosNoirEtBlanc) return;
    racine.classList.add("nb");
    if (pointeurFin || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entrees) =>
        entrees.forEach((e) => {
          if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add("is-color"), mouvementReduit ? 0 : 700);
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.55 }
    );
    $$(".photo:not(.ph)").forEach((el) => io.observe(el));
  }

  // Ligne du parcours, parallaxe des grands numéros et état de l'en-tête
  function initDefilement() {
    const entete = $("#en-tete");
    const chapitres = $(".chapters");
    const progres = $(".timeline__progress");
    const numeros = $$("[data-parallax]");
    let attente = false;

    function maj() {
      attente = false;
      const vh = window.innerHeight;
      entete.classList.toggle("is-scrolled", window.scrollY > 40);

      if (chapitres && progres) {
        const r = chapitres.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (vh * 0.6 - r.top) / r.height));
        progres.style.transform = `scaleY(${p})`;
      }
      // Parallaxe : les grands numéros défilent moins vite que le contenu
      if (!mouvementReduit && (D.effets || {}).parallaxeNumeros !== false) {
        numeros.forEach((n) => {
          const r = n.parentElement.getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) return;
          const decalage = (r.top + r.height / 2 - vh / 2) * -0.12;
          n.style.transform = `translate3d(0, ${decalage.toFixed(1)}px, 0)`;
        });
      }
    }
    const demander = () => {
      if (!attente) {
        attente = true;
        requestAnimationFrame(maj);
      }
    };
    window.addEventListener("scroll", demander, { passive: true });
    window.addEventListener("resize", demander);
    maj();
  }

  // Chapitre et section en cours : allume les ✦ et le lien de la frise / du menu
  function initSuivi() {
    if (!("IntersectionObserver" in window)) return;
    const liensFrise = $$("[data-frise]");
    const ioChap = new IntersectionObserver(
      (entrees) =>
        entrees.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-active");
          liensFrise.forEach((a) => {
            if (a.dataset.frise === e.target.id) a.setAttribute("aria-current", "step");
            else a.removeAttribute("aria-current");
          });
        }),
      { rootMargin: "-45% 0px -45% 0px" }
    );
    $$(".chapter").forEach((c) => ioChap.observe(c));

    const liensNav = $$(".nav__list a, .menu__list a");
    const ioSec = new IntersectionObserver(
      (entrees) =>
        entrees.forEach((e) => {
          if (!e.isIntersecting) return;
          liensNav.forEach((a) => {
            if (a.getAttribute("href") === "#" + e.target.id) a.setAttribute("aria-current", "true");
            else a.removeAttribute("aria-current");
          });
        }),
      { rootMargin: "-50% 0px -50% 0px" }
    );
    $$("main > section").forEach((s) => ioSec.observe(s));
  }

  /* ------------------------------------------------------------------
     5. MENU MOBILE
     ------------------------------------------------------------------ */
  function initMenu() {
    const bouton = $(".burger");
    const menu = $("#menu-mobile");
    const label = $(".sr-only", bouton);

    function basculer(ouvrir) {
      bouton.setAttribute("aria-expanded", String(ouvrir));
      label.textContent = ouvrir ? "Fermer le menu" : "Ouvrir le menu";
      menu.classList.toggle("is-open", ouvrir);
      document.body.classList.toggle("menu-open", ouvrir);
      racine.classList.toggle("no-scroll", ouvrir);
      if (ouvrir) setTimeout(() => $("a", menu).focus(), 300);
    }
    bouton.addEventListener("click", () => basculer(bouton.getAttribute("aria-expanded") !== "true"));
    $$("a", menu).forEach((a) => a.addEventListener("click", () => basculer(false)));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("is-open")) {
        basculer(false);
        bouton.focus();
      }
    });
    // Repasse en mode bureau : on referme le menu
    window.matchMedia("(min-width: 960px)").addEventListener("change", (m) => m.matches && basculer(false));
  }

  /* ------------------------------------------------------------------
     6. VISIONNEUSE (lightbox)
     ------------------------------------------------------------------ */
  function initVisionneuse() {
    const lb = $("#lightbox");
    const img = $(".lb__img", lb);
    const legende = $(".lb__caption", lb);
    const compteur = $(".lb__count", lb);
    const btnFermer = $(".lb__close", lb);
    const btnPrec = $(".lb__prev", lb);
    const btnSuiv = $(".lb__next", lb);
    let liste = [];
    let index = 0;
    let focusPrecedent = null;

    function afficher() {
      const p = liste[index];
      img.classList.add("is-loading");
      const tampon = new Image();
      tampon.onload = tampon.onerror = () => {
        img.src = p.src;
        img.alt = p.alt;
        img.classList.remove("is-loading");
      };
      tampon.src = p.src;
      legende.textContent = p.alt;
      compteur.textContent = liste.length > 1 ? `${index + 1} / ${liste.length}` : "";
      // Précharge les voisines pour une navigation fluide
      [index + 1, index - 1].forEach((i) => {
        const v = liste[(i + liste.length) % liste.length];
        if (v) new Image().src = v.src;
      });
    }
    function aller(pas) {
      if (liste.length < 2) return;
      index = (index + pas + liste.length) % liste.length;
      afficher();
    }
    function ouvrir(groupe, i) {
      liste = GROUPES[groupe] || [];
      if (!liste.length) return;
      index = i;
      focusPrecedent = document.activeElement;
      const plusieurs = liste.length > 1;
      btnPrec.hidden = btnSuiv.hidden = !plusieurs;
      lb.hidden = false;
      racine.classList.add("no-scroll");
      requestAnimationFrame(() => lb.classList.add("is-open"));
      afficher();
      btnFermer.focus();
    }
    function fermer() {
      lb.classList.remove("is-open");
      racine.classList.remove("no-scroll");
      setTimeout(() => (lb.hidden = true), mouvementReduit ? 0 : 400);
      if (focusPrecedent) focusPrecedent.focus();
    }

    document.addEventListener("click", (e) => {
      const tuile = e.target.closest(".tile[data-groupe]");
      if (tuile) ouvrir(tuile.dataset.groupe, Number(tuile.dataset.index));
    });
    btnFermer.addEventListener("click", fermer);
    btnPrec.addEventListener("click", () => aller(-1));
    btnSuiv.addEventListener("click", () => aller(1));
    // Clic sur le fond : fermeture
    lb.addEventListener("click", (e) => {
      if (e.target === lb || e.target.classList.contains("lb__figure")) fermer();
    });

    // Clavier : flèches, Échap, et focus maintenu dans la visionneuse
    document.addEventListener("keydown", (e) => {
      if (lb.hidden) return;
      if (e.key === "Escape") fermer();
      else if (e.key === "ArrowRight") aller(1);
      else if (e.key === "ArrowLeft") aller(-1);
      else if (e.key === "Tab") {
        const focusables = [btnFermer, btnPrec, btnSuiv].filter((b) => !b.hidden);
        const pos = focusables.indexOf(document.activeElement);
        e.preventDefault();
        const suivant = e.shiftKey ? pos - 1 : pos + 1;
        focusables[(suivant + focusables.length) % focusables.length].focus();
      }
    });

    // Balayage sur mobile
    let x0 = null;
    let y0 = null;
    lb.addEventListener("touchstart", (e) => {
      x0 = e.touches[0].clientX;
      y0 = e.touches[0].clientY;
    }, { passive: true });
    lb.addEventListener("touchend", (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      const dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) aller(dx < 0 ? 1 : -1);
      else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) fermer(); // glisser vers le bas
      x0 = y0 = null;
    });
  }

  /* ------------------------------------------------------------------
     7. DÉMARRAGE
     (le curseur doré et les autres effets visuels sont dans js/effets.js)
     ------------------------------------------------------------------ */
  rendreNavigation();
  rendreHero();
  rendreApropos();
  rendreParcours();
  rendreProjet();
  rendreContact();
  rendreReseaux();
  rendreFooter();

  initNoirEtBlanc();
  initApparitions();
  initDefilement();
  initSuivi();
  initMenu();
  initVisionneuse();
})();
