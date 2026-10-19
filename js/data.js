/* ==========================================================================
   data.js — TOUT le contenu du site se trouve ici.
   --------------------------------------------------------------------------
   Pour modifier un texte, changez simplement la valeur entre guillemets.
   Astuces :
   - {age} est remplacé automatiquement par l'âge calculé à partir de
     la date de naissance (il reste donc juste au fil des années).
   - <em>mot</em> met un mot en italique dans les titres.
   - Les espaces avant « ? ! : ; » et à l'intérieur des guillemets
     français sont rendus insécables automatiquement.
   ========================================================================== */

window.SITE = {
  /* ---------- Identité ---------- */
  identite: {
    nomComplet: "Fatoumata Binta Diallo",
    // Le nom du hero, ligne par ligne (le mot en <em> passe en italique)
    lignesNom: ["Fatoumata", "<em>Binta</em>", "Diallo"],
    titre: "Candidate Miss Guinée France 2027",
    accroche: "« Une jeune femme qui ose croire en ses rêves. »",
    dateNaissance: "2003-12-11", // format AAAA-MM-JJ
    ville: "Paris",
  },

  /* ---------- Options d'affichage ---------- */
  options: {
    // true : photos en noir & blanc qui passent en couleur au survol
    // (ordinateur) ou à l'apparition (téléphone). false : toujours en couleur.
    photosNoirEtBlanc: false,
  },

  /* ---------- Effets animés ----------
     Mettez false pour désactiver un effet (true pour le réactiver).
     Tous sont automatiquement coupés si le visiteur a demandé
     « réduire les animations » dans les réglages de son appareil. */
  effets: {
    intro: true,               // écran d'ouverture (couronne + nom), une fois par session
    couronneProgression: true, // petite couronne qui se remplit, en bas à droite
    citationLumineuse: true,   // la citation de Miss Mermoz s'illumine mot à mot
    paillettes: true,          // paillettes dorées dans le chapitre Miss Guinée France

    // Effets visuels (js/effets.js et css/effets.css)
    heroVivant: true,          // zoom lent de la photo d'accueil + nom qui s'écarte au défilement
    revelationPhotos: true,    // photos du parcours dévoilées en rideau, du noir & blanc à la couleur
    titresParLigne: true,      // titres qui apparaissent ligne par ligne
    parallaxeNumeros: true,    // grands numéros 01, 02… qui défilent moins vite
    bandeau: true,             // bandeau défilant entre « Qui suis-je » et le Parcours
    refletDore: true,          // reflet lumineux sur les badges et le titre du chapitre 06
    transitionsFond: true,     // fondu de couleur entre sections noires et blanches
    grain: true,               // grain de pellicule très léger
    curseur: true,             // curseur doré (ordinateur uniquement)
    boutonsMagnetiques: true,  // le bouton « Me contacter » attiré par la souris (ordinateur)
  },

  /* ---------- Bandeau défilant (entre « Qui suis-je » et le Parcours) ----------
     Les mots sont séparés automatiquement par des ✦ et affichés en capitales. */
  bandeau: ["Authentique", "Rêveuse", "Déterminée", "Engagée"],

  /* ---------- Menu ---------- */
  navigation: [
    { libelle: "Accueil", cible: "#accueil" },
    { libelle: "Qui suis-je", cible: "#qui-suis-je" },
    { libelle: "Parcours", cible: "#parcours" },
    { libelle: "Mon projet", cible: "#projet" },
    { libelle: "Contact", cible: "#contact" },
    { libelle: "Réseaux", cible: "#reseaux" },
  ],

  /* ---------- Section « Qui suis-je ? » ---------- */
  apropos: {
    surtitre: "I — Portrait",
    titre: "Qui suis-<em>je</em> ?",
    intro:
      "Je suis Diallo Fatoumata Binta, {age} ans, une jeune femme qui ose croire en ses rêves.",
    paragraphes: [
      "Authentique, rêveuse, déterminée et guidée par la foi en Dieu, je suis une jeune femme qui se bat pour les causes qui lui tiennent à cœur. Pour moi, être Miss, ce n'est pas seulement porter une couronne, c'est porter une culture, inspirer et faire entendre sa voix.",
      "Ma motivation est née de mon désir de représenter fièrement la femme guinéenne et de contribuer positivement à l'image de mon pays. À travers mon projet de préservation et de valorisation des sites touristiques balnéaires de Guinée, je rêve d'une Guinée plus propre, plus attractive et plus respectueuse de son environnement.",
      "Je veux montrer qu'une Miss peut être belle, engagée et porteuse de changement, sans jamais perdre son authenticité.",
    ],
    fiche: [
      { libelle: "Âge", valeur: "{age} ans (née le 11/12/2003)" },
      { libelle: "Nationalité", valeur: "Guinéenne" },
      { libelle: "Ville", valeur: "Paris" },
      { libelle: "Passions", valeur: "Mode, concours de beauté et tourisme" },
      { libelle: "Qualités", valeur: "Authentique · Rêveuse · Déterminée" },
    ],
    signature: "Fatoumata Binta",
  },

  /* ---------- Section « Mon parcours » ---------- */
  parcours: {
    surtitre: "II — Mon parcours",
    titre: "Mon <em>parcours</em>",
    intro: "Du primaire à Miss Guinée France : six chapitres d'une même histoire.",
    /*
      miseEnPage possibles : "gauche", "droite", "mosaique", "panorama",
      "decale", "apogee" (réservée au dernier chapitre).
      dossier : nom du dossier dans assets/photos/
      legende : sert de texte alternatif (alt) aux photos du chapitre.
    */
    chapitres: [
      {
        id: "chapitre-01",
        numero: "01",
        dossier: "01-primaire",
        titre: "Le primaire et le <em>collège</em>",
        titreCourt: "Primaire et collège",
        lieu: "",
        sousTitre: "Les premiers pas",
        annee: "",
        miseEnPage: "gauche",
        legende: "Fatoumata Binta Diallo lors de ses premiers défilés, à l'école primaire et au collège",
        texte: [
          "Tout a commencé au primaire, sans que je sache où cette passion allait me mener. À travers mes premiers défilés, je découvrais un univers qui allait peu à peu prendre une place importante dans ma vie. Avec le recul, ces photos représentent le début d'une belle histoire.",
        ],
        badges: [],
      },
      {
        id: "chapitre-02",
        numero: "02",
        dossier: "02-miss-mermoz",
        titre: "Miss <em>Mermoz</em>",
        titreCourt: "Miss Mermoz",
        lieu: "Le lycée",
        sousTitre: "Ma première couronne",
        annee: "2023",
        miseEnPage: "droite",
        legende: "Fatoumata Binta Diallo, Miss Mermoz 2023",
        texte: [
          "À ceux qui ont tendance à dire que les Miss n'ont rien dans la tête, détrompez-vous ! 👑 En 2023, j'ai remporté ma première couronne tout en obtenant mon baccalauréat avec mention bien, avec une moyenne de 15/20. Comme quoi, passion et études peuvent parfaitement coexister : tout est une question de priorités, d'organisation et de détermination.",
        ],
        badges: ["Couronne Miss Mermoz", "Bac mention Bien (15/20)"],
        // Citation affichée en très grand format après le chapitre
        citation:
          "« Parce qu'une femme peut aimer les podiums, rêver d'une couronne et avoir tout autant d'ambition dans ses études. Nos passions ne doivent pas nous empêcher de réussir. »",
      },
      {
        id: "chapitre-03",
        numero: "03",
        dossier: "03-miss-crisber-2023",
        titre: "Miss <em>Crisber</em> 2023",
        titreCourt: "Miss Crisber",
        lieu: "",
        sousTitre: "Miss suppléante",
        annee: "2023",
        miseEnPage: "mosaique",
        legende: "Fatoumata Binta Diallo, Miss suppléante à Miss Crisber 2023",
        texte: [
          "En 2023, Miss Crisber m'offre une expérience extraordinaire, marquée par de belles rencontres et des souvenirs précieux. En tant que Miss suppléante, je poursuis mon évolution et je grandis encore à travers cette aventure.",
        ],
        badges: ["Miss suppléante"],
      },
      {
        id: "chapitre-04",
        numero: "04",
        dossier: "04-miss-capitale-guinee",
        titre: "Miss Capitale <em>Guinée</em>",
        titreCourt: "Miss Capitale",
        lieu: "",
        sousTitre: "Une nouvelle aventure",
        annee: "2024",
        miseEnPage: "panorama",
        legende: "Fatoumata Binta Diallo lors de Miss Capitale Guinée",
        texte: [
          "Avec Miss Capitale, mon parcours prend une nouvelle dimension. Entre les défilés, les interviews et mon titre de Miss Fair-Play, je découvre de nouvelles expériences et je vois ma passion grandir un peu plus.",
        ],
        badges: ["Miss Fair-Play"],
      },
      {
        id: "chapitre-05",
        numero: "05",
        dossier: "05-miss-tourisme-guinee-2024",
        titre: "Miss Tourisme <em>Guinée</em> 2024",
        titreCourt: "Miss Tourisme",
        lieu: "",
        sousTitre: "Première dauphine",
        annee: "2024",
        miseEnPage: "decale",
        legende: "Fatoumata Binta Diallo, première dauphine de Miss Tourisme Guinée 2024",
        texte: [
          "Miss Tourisme Guinée restera l'une des expériences les plus marquantes de mon parcours. Sacrée première dauphine, j'ai appris à me dépasser et à donner le meilleur de moi-même. J'y ai compris que la plus belle victoire ne se résume pas à une couronne, mais se trouve aussi dans les cœurs que l'on touche.",
        ],
        badges: ["1<sup>re</sup> dauphine"],
      },
      {
        id: "chapitre-06",
        numero: "06",
        dossier: "06-miss-guinee-france",
        titre: "Miss Guinée <em>France</em>",
        titreCourt: "Miss Guinée France",
        lieu: "",
        sousTitre: "Un rêve qui continue de s'écrire",
        annee: "2027",
        miseEnPage: "apogee",
        legende: "Fatoumata Binta Diallo, candidate Miss Guinée France 2027",
        texte: [
          "Les rêves ne meurent jamais, ils restent en nous et attendent simplement le bon moment pour prendre vie. C'est avec cette conviction que mon chemin m'a conduite jusqu'à Miss Guinée France. J'ai appris qu'il faut croire en ses rêves, rester patiente et saisir les opportunités qui se présentent. Car je crois profondément que ce qui nous est destiné finit par trouver son chemin jusqu'à nous, et que rien ni personne ne peut nous enlever ce qui nous revient. Aujourd'hui, je vis cette aventure avec le cœur rempli d'espoir, de détermination et la fierté d'être arrivée jusqu'ici.",
        ],
        badges: [],
        mention: "Le chapitre en cours d'écriture…",
      },
    ],
  },

  /* ---------- Section « Mon projet » ---------- */
  projet: {
    surtitre: "III — Mon projet",
    titre: "Préserver et valoriser les sites touristiques <em>balnéaires</em> de Guinée",
    citation:
      "« Je rêve d'une Guinée plus propre, plus attractive et plus respectueuse de son environnement. »",
    piliers: [
      { titre: "Préserver", texte: "Protéger les plages et le littoral." },
      { titre: "Valoriser", texte: "Faire connaître la beauté des sites guinéens." },
      { titre: "Sensibiliser", texte: "Impliquer la population et la jeunesse." },
    ],
  },

  /* ---------- Section « Contact » ---------- */
  contact: {
    surtitre: "IV — Contact",
    titre: "Restons en <em>contact</em>",
    intro:
      "Une question, une proposition de partenariat ou simplement l'envie d'échanger ? Je serai ravie de vous lire.",
    telephone: "+33 6 05 94 84 10",
    telephoneLien: "+33605948410",
    email: "ftabintdiallo@gmail.com",
    localisation: "📍 Paris",
    bouton: "Me contacter",
  },

  /* ---------- Section « Mes réseaux » ---------- */
  mesReseaux: {
    surtitre: "V — Mes réseaux",
    titre: "Mes <em>réseaux</em>",
    intro: "Suivez mon aventure au quotidien.",
  },

  /* ---------- Réseaux sociaux ----------
     Collez l'adresse complète de chaque profil (ex. "https://www.instagram.com/…").
     Un réseau laissé vide ("") n'est pas affiché sur le site.
     Si les trois sont vides, la section « Mes réseaux » est masquée. */
  reseaux: {
    instagram: "https://www.instagram.com/bint11diallo/",
    tiktok: "https://www.tiktok.com/@bint_diallo",
    facebook: "https://www.facebook.com/share/1EKgFFN7T6/",
  },

  /* ---------- Pied de page ---------- */
  footer: "Fatoumata Binta Diallo · Candidate Miss Guinée France 2027",
};

/* ==========================================================================
   LISTE DES PHOTOS
   Générée automatiquement par scripts/generer-liste-photos.js (ou .ps1).
   Ne modifiez pas à la main entre les deux repères ci-dessous :
   relancez plutôt le script après avoir ajouté des photos.
   Les photos s'affichent dans l'ordre alphabétique des noms de fichiers
   (astuce : 01.jpg, 02.jpg…). La 1re photo de chaque dossier est mise en avant.
   ========================================================================== */
/* <photos-auto> */
window.PHOTOS = {
  "00-portrait": [
    "WhatsApp Image 2026-10-13 at 17.29.30.jpeg",
    "z.jpeg"
  ],
  "01-primaire": [
    "IMG_4564.JPG.jpeg",
    "WhatsApp Image 2026-10-13 at 15.16.36 (1).jpeg",
    "WhatsApp Image 2026-10-13 at 15.16.36.jpeg"
  ],
  "02-miss-mermoz": [
    "01-Couronne.jpeg",
    "Bandeaux.jpeg",
    "WhatsApp Image 2026-10-13 at 15.19.19 (2).jpeg",
    "WhatsApp Image 2026-10-13 at 15.19.19 (3).jpeg",
    "WhatsApp Image 2026-10-13 at 15.19.19 (4).jpeg"
  ],
  "03-miss-crisber-2023": [
    "WhatsApp Image 2026-10-13 at 15.27.07 (1).jpeg",
    "WhatsApp Image 2026-10-13 at 15.27.07 (3).jpeg",
    "WhatsApp Image 2026-10-13 at 15.27.07 (4).jpeg",
    "WhatsApp Image 2026-10-13 at 15.27.07 (6).jpeg",
    "WhatsApp Image 2026-10-13 at 15.27.07.jpeg"
  ],
  "04-miss-capitale-guinee": [
    "WhatsApp Image 2026-10-13 at 15.23.27 (1).jpeg",
    "WhatsApp Image 2026-10-13 at 15.23.27.jpeg",
    "WhatsApp Image 2026-10-13 at 15.23.29 (1).jpeg",
    "WhatsApp Image 2026-10-13 at 15.23.29 (2).jpeg",
    "WhatsApp Image 2026-10-13 at 15.23.29 (3).jpeg",
    "WhatsApp Image 2026-10-13 at 15.23.29.jpeg"
  ],
  "05-miss-tourisme-guinee-2024": [
    "WhatsApp Image 2026-10-13 at 15.40.25.jpeg",
    "WhatsApp Image 2026-10-13 at 15.40.27 (1).jpeg",
    "WhatsApp Image 2026-10-13 at 15.40.27 (2).jpeg",
    "WhatsApp Image 2026-10-13 at 15.40.27 (3).jpeg",
    "WhatsApp Image 2026-10-13 at 15.40.27.jpeg",
    "WhatsApp Image 2026-10-13 at 15.40.28 (1).jpeg",
    "WhatsApp Image 2026-10-13 at 15.40.28 (2).jpeg",
    "WhatsApp Image 2026-10-13 at 15.40.28.jpeg"
  ],
  "06-miss-guinee-france": [
    "01-profil.jpeg",
    "WhatsApp Image 2026-10-13 at 17.35.53 (1).jpeg",
    "WhatsApp Image 2026-10-13 at 17.35.53 (2).jpeg",
    "WhatsApp Image 2026-10-13 at 17.35.53.jpeg",
    "WhatsApp Image 2026-10-13 at 17.35.54 (1).jpeg",
    "WhatsApp Image 2026-10-13 at 17.35.54.jpeg",
    "WhatsApp Image 2026-10-13 at 17.35.55 (1).jpeg",
    "WhatsApp Image 2026-10-13 at 17.35.55 (2).jpeg",
    "WhatsApp Image 2026-10-13 at 17.35.55.jpeg",
    "WhatsApp Image 2026-10-13 at 17.35.56 (1).jpeg",
    "WhatsApp Image 2026-10-13 at 17.35.56 (3).jpeg",
    "WhatsApp Image 2026-10-13 at 17.35.56.jpeg",
    "WhatsApp Image 2026-10-13 at 17.35.57 (1).jpeg",
    "WhatsApp Image 2026-10-13 at 17.35.57 (2).jpeg",
    "WhatsApp Image 2026-10-13 at 17.35.57.jpeg"
  ]
};
/* </photos-auto> */
