#!/usr/bin/env node
/* ==========================================================================
   generer-liste-photos.js
   Scanne assets/photos/* et réécrit la liste des photos dans js/data.js
   (entre les repères <photos-auto> et </photos-auto>).
   Met aussi à jour l'image de partage (Open Graph / Twitter) de index.html
   avec la 1re photo du dossier 00-portrait.

   Utilisation (depuis le dossier miss-portfolio) :
     node scripts/generer-liste-photos.js
     node scripts/generer-liste-photos.js --url https://mon-site.netlify.app

   L'option --url (facultative) écrit une adresse complète pour l'image de
   partage, ce qui garantit l'aperçu sur WhatsApp, Facebook, X…
   Aucune dépendance : Node.js suffit.
   ========================================================================== */
"use strict";

const fs = require("fs");
const path = require("path");

const RACINE = path.resolve(__dirname, "..");
const DOSSIER_PHOTOS = path.join(RACINE, "assets", "photos");
const FICHIER_DATA = path.join(RACINE, "js", "data.js");
const FICHIER_HTML = path.join(RACINE, "index.html");
const EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const IMAGE_PAR_DEFAUT = "assets/og-image.png";

// Tri « naturel » : 2.jpg avant 10.jpg
const tri = new Intl.Collator("fr", { numeric: true, sensitivity: "base" }).compare;

// Lecture de l'option --url
const iUrl = process.argv.indexOf("--url");
const urlSite = iUrl > -1 && process.argv[iUrl + 1] ? process.argv[iUrl + 1].replace(/\/+$/, "") : "";

// 1. Inventaire des photos
const dossiers = fs
  .readdirSync(DOSSIER_PHOTOS, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort(tri);

const liste = {};
let total = 0;
for (const dossier of dossiers) {
  liste[dossier] = fs
    .readdirSync(path.join(DOSSIER_PHOTOS, dossier))
    .filter((f) => !f.startsWith(".") && EXTENSIONS.has(path.extname(f).toLowerCase()))
    .sort(tri);
  total += liste[dossier].length;
}

// 2. Réécriture du bloc dans data.js
const bloc =
  "/* <photos-auto> */\nwindow.PHOTOS = " + JSON.stringify(liste, null, 2) + ";\n/* </photos-auto> */";

const data = fs.readFileSync(FICHIER_DATA, "utf8");
const motif = /\/\* <photos-auto> \*\/[\s\S]*?\/\* <\/photos-auto> \*\//;
if (!motif.test(data)) {
  console.error("✖ Repères <photos-auto> introuvables dans js/data.js : rien n'a été modifié.");
  process.exit(1);
}
fs.writeFileSync(FICHIER_DATA, data.replace(motif, bloc), "utf8");

// 3. Image de partage dans index.html
const portrait = (liste["00-portrait"] || [])[0];
let image = portrait ? `assets/photos/00-portrait/${encodeURIComponent(portrait)}` : IMAGE_PAR_DEFAUT;
if (urlSite) image = `${urlSite}/${image}`;

const html = fs.readFileSync(FICHIER_HTML, "utf8");
const nouveauHtml = html
  .replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${image}$2`)
  .replace(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${image}$2`);
fs.writeFileSync(FICHIER_HTML, nouveauHtml, "utf8");

// 4. Compte rendu
console.log("✦ Liste des photos mise à jour dans js/data.js\n");
for (const d of dossiers) console.log(`  ${d.padEnd(32, " ")} ${liste[d].length} photo(s)`);
console.log(`\n  Total : ${total} photo(s)`);
console.log(`  Image de partage : ${image}`);
