# ==========================================================================
# generer-liste-photos.ps1 : équivalent Windows du script Node, sans rien installer.
# Scanne assets\photos\* et réécrit la liste des photos dans js\data.js,
# puis met à jour l'image de partage de index.html (1re photo de 00-portrait).
#
# Utilisation (clic droit sur le fichier > « Exécuter avec PowerShell »), ou :
#   powershell -ExecutionPolicy Bypass -File scripts\generer-liste-photos.ps1
#   powershell -ExecutionPolicy Bypass -File scripts\generer-liste-photos.ps1 -Url https://mon-site.netlify.app
# ==========================================================================
param([string]$Url = "")

$ErrorActionPreference = "Stop"
$racine = Split-Path -Parent $PSScriptRoot
$dossierPhotos = Join-Path $racine "assets\photos"
$fichierData = Join-Path $racine "js\data.js"
$fichierHtml = Join-Path $racine "index.html"
$extensions = @(".jpg", ".jpeg", ".png", ".webp")
$utf8 = New-Object System.Text.UTF8Encoding($false)

# Tri « naturel » (2.jpg avant 10.jpg) : on complète les nombres par des zéros pour comparer
$triNaturel = { [regex]::Replace($_.Name.ToLowerInvariant(), '\d+', { param($m) $m.Value.PadLeft(10, '0') }) }

$dossiers = Get-ChildItem -LiteralPath $dossierPhotos -Directory | Sort-Object Name
$lignes = @()
$liste = @{}
$total = 0
foreach ($d in $dossiers) {
  $fichiers = @(Get-ChildItem -LiteralPath $d.FullName -File |
    Where-Object { -not $_.Name.StartsWith(".") -and ($extensions -contains $_.Extension.ToLowerInvariant()) } |
    Sort-Object $triNaturel | ForEach-Object { $_.Name })
  $liste[$d.Name] = $fichiers
  $total += $fichiers.Count
  if ($fichiers.Count -eq 0) {
    $lignes += "  `"$($d.Name)`": []"
  } else {
    $items = ($fichiers | ForEach-Object { "    `"" + ($_ -replace '\\', '\\' -replace '"', '\"') + "`"" }) -join ",`n"
    $lignes += "  `"$($d.Name)`": [`n$items`n  ]"
  }
}
$bloc = "/* <photos-auto> */`nwindow.PHOTOS = {`n" + ($lignes -join ",`n") + "`n};`n/* </photos-auto> */"

# Réécriture du bloc dans data.js
$data = [System.IO.File]::ReadAllText($fichierData, $utf8)
$motif = '/\* <photos-auto> \*/[\s\S]*?/\* </photos-auto> \*/'
if (-not [regex]::IsMatch($data, $motif)) { Write-Error "Repères <photos-auto> introuvables dans js\data.js"; exit 1 }
$data = [regex]::Replace($data, $motif, { param($m) $bloc })
[System.IO.File]::WriteAllText($fichierData, $data, $utf8)

# Image de partage
$portraits = $liste["00-portrait"]
if ($portraits -and $portraits.Count -gt 0) {
  $image = "assets/photos/00-portrait/" + [uri]::EscapeDataString($portraits[0])
} else {
  $image = "assets/og-image.png"
}
if ($Url) { $image = $Url.TrimEnd("/") + "/" + $image }
$html = [System.IO.File]::ReadAllText($fichierHtml, $utf8)
$html = [regex]::Replace($html, '(<meta property="og:image" content=")[^"]*(")', { param($m) $m.Groups[1].Value + $image + $m.Groups[2].Value })
$html = [regex]::Replace($html, '(<meta name="twitter:image" content=")[^"]*(")', { param($m) $m.Groups[1].Value + $image + $m.Groups[2].Value })
[System.IO.File]::WriteAllText($fichierHtml, $html, $utf8)

Write-Host "Liste des photos mise a jour dans js\data.js`n"
foreach ($d in $dossiers) { Write-Host ("  {0,-32} {1} photo(s)" -f $d.Name, $liste[$d.Name].Count) }
Write-Host "`n  Total : $total photo(s)"
Write-Host "  Image de partage : $image"
