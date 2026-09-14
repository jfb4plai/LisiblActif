import mammoth from 'mammoth'

// Extraction de texte côté navigateur, limitée à .docx et .txt.
//
// Le PDF n'est PAS couvert ici. Le pattern PLAI établi pour le PDF
// (projets/diffactif/src/lib/extractFile.js) rend chaque page en image et
// l'envoie à Claude Vision via un endpoint serveur dédié (/api/extract) —
// une brique d'OCR complète, pas une simple lecture de fichier. L'ajouter à
// LisiblActif est un travail à part entière (nouvel endpoint, gestion des
// coûts/pages, format des réponses), volontairement laissé pour une tâche
// séparée plutôt que d'être esquissé ici à moitié.
export async function extractFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()

  if (ext === 'docx') {
    const buffer = await file.arrayBuffer()
    const { value } = await mammoth.extractRawText({ arrayBuffer: buffer })
    return value.trim()
  }

  if (ext === 'txt') {
    return (await file.text()).trim()
  }

  if (ext === 'pdf') {
    throw new Error("Import PDF non disponible pour l'instant — copiez le texte manuellement, ou importez un .docx/.txt.")
  }

  throw new Error(`Format ".${ext}" non pris en charge — utilisez un fichier .docx ou .txt.`)
}
