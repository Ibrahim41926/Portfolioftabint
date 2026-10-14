# Portfolio · Fatoumata Binta Diallo
### Candidate Miss Guinée France 2027

Site portfolio d'une seule page, en noir et blanc, au style éditorial. Il est fait en HTML, CSS et JavaScript, sans framework ni étape de compilation : on peut l'ouvrir directement dans un navigateur ou l'héberger gratuitement.

```
miss-portfolio/
├── index.html              ← structure de la page (vous n'avez pas besoin d'y toucher)
├── css/style.css           ← mise en forme
├── js/data.js              ← TOUS les textes, liens et la liste des photos
├── js/main.js              ← animations, galeries, visionneuse, menu
├── assets/
│   ├── photos/…            ← vos photos, une par dossier de chapitre
│   ├── favicon.svg         ← icône de l'onglet (couronne)
│   └── og-image.png        ← image de partage par défaut (sans portrait)
└── scripts/
    ├── generer-liste-photos.js    ← met à jour la liste des photos (Node.js)
    ├── generer-liste-photos.ps1   ← même chose sous Windows, sans rien installer
    └── optimiser-photos.js        ← facultatif : compresse les photos en .webp
```

---

## 1. Ouvrir le site en local

**Le plus simple :** double-cliquez sur `index.html`. Le site s'ouvre dans votre navigateur.

**Si vous utilisez VS Code :** installez l'extension *Live Server*, faites un clic droit sur `index.html`, puis choisissez **Open with Live Server**. La page se recharge à chaque modification.

> Une connexion Internet est nécessaire pour charger les polices (Google Fonts). Sans connexion, le site s'affiche avec des polices de remplacement.

---

## 2. Ajouter les photos

### Où les déposer

| Dossier | Contenu |
|---|---|
| `assets/photos/00-portrait/` | Photo principale. La **1re** sert pour l'accueil et l'image de partage, la **2e** (si présente) pour « Qui suis-je ». |
| `assets/photos/01-primaire/` | Chapitre 01 · Le primaire |
| `assets/photos/02-miss-mermoz/` | Chapitre 02 · Miss Mermoz |
| `assets/photos/03-miss-crisber-2023/` | Chapitre 03 · Miss Crisber 2023 |
| `assets/photos/04-miss-capitale-guinee/` | Chapitre 04 · Miss Capitale Guinée |
| `assets/photos/05-miss-tourisme-guinee-2024/` | Chapitre 05 · Miss Tourisme Guinée 2024 |
| `assets/photos/06-miss-guinee-france/` | Chapitre 06 · Miss Guinée France 2027 |

- **Formats acceptés :** `.jpg`, `.jpeg`, `.png`, `.webp`.
- **Ordre d'affichage :** alphabétique. Nommez vos fichiers `01.jpg`, `02.jpg`, `03.jpg`… La **1re photo** de chaque dossier est mise en grand.
- **Nombre :** autant que vous voulez. La page en montre quelques-unes (4 à 6 selon le chapitre). Une vignette « +N » ouvre la visionneuse, qui donne accès à toutes les photos.
- **Poids :** pour un site rapide sur téléphone, visez moins de 500 Ko par photo et 2000 px maximum de côté (voir l'optimisation plus bas).
- Tant qu'un dossier est vide, le site affiche des cadres « Photo à venir ».

### Mettre à jour la liste des photos (obligatoire après chaque ajout)

Un site statique ne peut pas lire le contenu d'un dossier tout seul. Un petit script écrit donc la liste des photos dans `js/data.js`. Il faut le relancer **chaque fois que vous ajoutez, renommez ou supprimez une photo**.

**Option A : Windows, sans rien installer**
Faites un clic droit sur `scripts/generer-liste-photos.ps1`, puis choisissez **Exécuter avec PowerShell**. Vous pouvez aussi lancer, dans un terminal ouvert dans le dossier du site :
```powershell
powershell -ExecutionPolicy Bypass -File scripts\generer-liste-photos.ps1
```

**Option B : avec Node.js** (à installer depuis https://nodejs.org)
```bash
node scripts/generer-liste-photos.js
```

Le script affiche le nombre de photos trouvées par dossier. Il met aussi à jour l'image de partage (WhatsApp, Instagram, Facebook…) avec votre portrait.

> **Après la mise en ligne :** relancez le script en indiquant l'adresse de votre site. L'aperçu de partage sera alors fiable sur toutes les plateformes :
> ```bash
> node scripts/generer-liste-photos.js --url https://votre-site.netlify.app
> # ou
> powershell -ExecutionPolicy Bypass -File scripts\generer-liste-photos.ps1 -Url https://votre-site.netlify.app
> ```

### Facultatif : compresser les photos en WebP

Les photos de téléphone pèsent souvent 3 à 8 Mo chacune. Ce script les convertit en `.webp` (environ 5 à 10 fois plus léger, sans perte de qualité visible). Il nécessite Node.js :

```bash
npm install          # une seule fois (installe « sharp »)
npm run optimiser    # convertit, puis met à jour la liste automatiquement
```

Les originaux ne sont pas supprimés. Ils sont déplacés **à côté** du site, dans le dossier `miss-portfolio-photos-originales/`, pour ne pas être mis en ligne par erreur.

---

## 3. Modifier les textes

Tout se trouve dans **`js/data.js`**. Ouvrez-le avec un éditeur de texte (VS Code, Bloc-notes…) et changez ce qui est entre guillemets.

- **`{age}`** est remplacé automatiquement par l'âge, calculé depuis la date de naissance. Il reste donc juste chaque année.
- **`<em>mot</em>`** met un mot en italique dans les titres.
- Les **espaces insécables** de la typographie française (avant `?` `!` `:` `;`, à l'intérieur de `« »`) sont ajoutés automatiquement.
- **Réseaux sociaux :** collez l'adresse complète de votre profil dans `reseaux` :
  ```js
  reseaux: {
    instagram: "https://www.instagram.com/votre-compte",
    tiktok: "",
    facebook: "",
  },
  ```
  Un réseau laissé vide (`""`) n'apparaît pas sur le site.
- **Noir & blanc :** `options.photosNoirEtBlanc: true` affiche les photos en noir et blanc. Elles passent en couleur au survol sur ordinateur, et lorsqu'elles apparaissent sur téléphone. Mettez `false` pour garder la couleur partout.
- **Mise en page d'un chapitre :** le champ `miseEnPage` accepte `"gauche"`, `"droite"`, `"mosaique"`, `"panorama"`, `"decale"` ou `"apogee"`.

Attention à ne pas supprimer de guillemet, de virgule ou d'accolade. Si la page devient vide après une modification, c'est presque toujours la cause : annulez la dernière modification (Ctrl + Z).

Les textes de partage sur les réseaux (`<title>`, description, Open Graph) se trouvent en haut de `index.html`, car les réseaux sociaux les lisent sans exécuter JavaScript.

---

## 4. Mettre le site en ligne gratuitement

> Avant la mise en ligne : ajoutez les photos, puis lancez le script de génération de la liste.

### Option 1 : Netlify (glisser-déposer, environ 2 minutes)

1. Allez sur **https://app.netlify.com/drop**.
2. Créez un compte gratuit, ou connectez-vous avec Google ou GitHub.
3. **Glissez le dossier `miss-portfolio` entier** dans la zone prévue sur la page.
4. Au bout de quelques secondes, Netlify vous donne une adresse du type `https://nom-aleatoire.netlify.app`.
5. Pour changer ce nom : **Site configuration → Change site name** (par exemple `fatoumata-binta-diallo`).
6. Relancez le script de génération de la liste avec `--url` et votre nouvelle adresse (voir plus haut), puis glissez à nouveau le dossier dans **Deploys** pour mettre à jour le site.

Pour chaque mise à jour, ouvrez votre site sur Netlify, onglet **Deploys**, et glissez de nouveau le dossier.

### Option 2 : GitHub Pages

1. Créez un compte sur **https://github.com**.
2. Cliquez sur **+ → New repository**. Nommez-le par exemple `miss-portfolio`, laissez-le **Public** et cliquez sur **Create repository**.
3. Sur la page du dépôt, cliquez sur **uploading an existing file**.
4. Glissez **le contenu** du dossier `miss-portfolio` (les fichiers et dossiers qu'il contient, pas le dossier lui-même), puis cliquez sur **Commit changes**.
5. Ouvrez **Settings → Pages**. Sous *Build and deployment*, choisissez **Source : Deploy from a branch**, **Branch : main**, dossier **/ (root)**, puis **Save**.
6. Après une à deux minutes, le site est en ligne à l'adresse `https://votre-nom.github.io/miss-portfolio/`.

Pour mettre à jour le site, refaites l'étape 4 (**Add file → Upload files**) avec les fichiers modifiés.

> Les fichiers `.gitkeep` dans les dossiers photos servent seulement à garder les dossiers vides sur GitHub. Vous pouvez les laisser.

---

## Détails techniques

- Animations : CSS et `IntersectionObserver`, plus **GSAP + ScrollTrigger** (chargés depuis cdnjs) pour l'intro et la citation qui s'illumine. Sans connexion à cdnjs, le site fonctionne quand même, sans intro et avec la citation déjà illuminée.
- **Effets animés** (un fichier chacun) : `js/intro.js` (intro), `js/citation.js` (citation de Miss Mermoz qui s'illumine mot à mot), `js/couronne.js` (couronne de progression), `js/paillettes.js` (paillettes du chapitre 06). Pour en couper un, mettez `false` dans le bloc `effets` de `js/data.js`. Tous sont coupés automatiquement si le visiteur a activé « réduire les animations ».
- **Effets visuels** : `js/effets.js` et `css/effets.css` (hero vivant, révélation des photos, titres ligne par ligne, bandeau défilant, reflet doré, transitions de fond, grain, curseur doré, boutons magnétiques). Chacun a son interrupteur dans le bloc `effets` de `js/data.js`. Les mots du bandeau se modifient dans `bandeau` (même fichier).
- L'intro ne se joue qu'une fois par onglet. Pour la revoir pendant vos tests, ouvrez le site dans un nouvel onglet.
- Polices : *Bodoni Moda* (titres) et *Jost* (texte), via Google Fonts.
- Accessibilité : balises sémantiques, texte alternatif sur chaque photo, navigation au clavier (visionneuse : ← → Échap). Les préférences « réduire les animations » du système sont respectées.
- Visionneuse : clic sur une photo ; flèches du clavier, balayage sur mobile (glisser vers le bas pour fermer), Échap pour fermer.
- Testé à 375 px, 768 px et 1440 px, sans défilement horizontal ni erreur dans la console.
#   P o r t f o l i o f t a b i n t  
 