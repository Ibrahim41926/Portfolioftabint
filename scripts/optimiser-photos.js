#!/usr/bin/env node
/* ==========================================================================
   optimiser-photos.js (FACULTATIF)
   Convertit les photos .jpg / .jpeg / .png de assets/photos/* en .webp
   compressés (2000 px maximum sur le plus grand côté, qualité 80).
   Les originaux sont déplacés HORS du site, dans le dossier voisin
   « miss-portfolio-photos-originales », pour ne pas être mis en ligne.
   La liste des photos de data.js est ensuite régénérée automatiquement.

   Prérequis (une seule fois) :  npm install
   Utilisation :                 npm run optimiser
   ========================================================================== */
"use strict";

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

let sharp;
try {
  sharp = require("sharp");
} catch {
  console.error("✖ Le module « sharp » est absent. Lancez d'abord : npm install");
  process.exit(1);
}

const RACINE = path.resolve(__dirname, "..");
const DOSSIER_PHOTOS = path.join(RACINE, "assets", "photos");
const ORIGINAUX = path.join(RACINE, "..", "miss-portfolio-photos-originales");
const A_CONVERTIR = new Set([".jpg", ".jpeg", ".png"]);
const TAILLE_MAX = 2000;
const QUALITE = 80;

(async () => {
  let n = 0;
  let avant = 0;
  let apres = 0;

  for (const dossier of fs.readdirSync(DOSSIER_PHOTOS)) {
    const chemin = path.join(DOSSIER_PHOTOS, dossier);
    if (!fs.statSync(chemin).isDirectory()) continue;

    for (const fichier of fs.readdirSync(chemin)) {
      const ext = path.extname(fichier).toLowerCase();
      if (!A_CONVERTIR.has(ext)) continue;

      const source = path.join(chemin, fichier);
      const cible = path.join(chemin, path.basename(fichier, path.extname(fichier)) + ".webp");
      if (fs.existsSync(cible)) {
        console.log(`  · ${dossier}/${fichier} : une version .webp existe déjà, ignorée`);
        continue;
      }

      await sharp(source)
        .rotate() // respecte l'orientation de l'appareil photo
        .resize({ width: TAILLE_MAX, height: TAILLE_MAX, fit: "inside", withoutEnlargement: true })
        .webp({ quality: QUALITE })
        .toFile(cible);

      const t1 = fs.statSync(source).size;
      const t2 = fs.statSync(cible).size;
      avant += t1;
      apres += t2;
      n++;

      // Mise à l'abri de l'original
      const dossierOriginal = path.join(ORIGINAUX, dossier);
      fs.mkdirSync(dossierOriginal, { recursive: true });
      fs.renameSync(source, path.join(dossierOriginal, fichier));

      console.log(`  ✓ ${dossier}/${fichier} → ${path.basename(cible)} (${(t1 / 1e6).toFixed(1)} Mo → ${(t2 / 1e6).toFixed(1)} Mo)`);
    }
  }

  if (n) {
    console.log(`\n✦ ${n} photo(s) optimisée(s) : ${(avant / 1e6).toFixed(1)} Mo → ${(apres / 1e6).toFixed(1)} Mo`);
    console.log(`  Originaux déplacés dans : ${ORIGINAUX}\n`);
  } else {
    console.log("Aucune photo à convertir.\n");
  }

  // Régénère la liste des photos dans data.js
  execFileSync(process.execPath, [path.join(__dirname, "generer-liste-photos.js"), ...process.argv.slice(2)], {
    stdio: "inherit",
  });
})();
