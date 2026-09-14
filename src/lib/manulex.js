// Fréquence lexicale par niveau scolaire — inspirée du corpus Manulex
// (Lété, B., Sprenger-Charolles, L. & Colé, P., 2004), vérifié dans le
// corpus RISS (Gala, François, Bernhard & Fairon, 2014, hal-01001916 ;
// Grossmann, 2018, hal-04807000).
//
// ATTENTION — liste de démarrage, pas le corpus Manulex complet.
// Manulex n'a pas d'export public automatisé : cette liste couvre des mots
// très fréquents pour permettre des tests fiables et un usage minimal.
// Voir scripts/import-manulex.mjs (tâche dédiée) pour l'étendre avec un
// export réel du corpus une fois obtenu sous licence académique.
//
// niveau = premier niveau scolaire où le mot est considéré comme fréquent.
//
// NIVEAUX_ORDRE réexporte TOUS_NIVEAUX de constants.js (source unique pour
// l'ordre des niveaux scolaires, partagée avec lib/constants.js) plutôt que
// de dupliquer la liste ici — deux listes indépendantes auraient pu diverger
// silencieusement si un niveau était ajouté/renommé.
import { TOUS_NIVEAUX } from './constants'

export const NIVEAUX_ORDRE = TOUS_NIVEAUX

export const FREQUENCE_LEXICALE = {
  le: 'P1', la: 'P1', les: 'P1', un: 'P1', une: 'P1', et: 'P1', il: 'P1', elle: 'P1',
  maman: 'P1', papa: 'P1', chat: 'P1', chien: 'P1', ecole: 'P1', ami: 'P1',
  petit: 'P1', grand: 'P1', jour: 'P1', jouer: 'P1', maison: 'P1', dort: 'P1',
  parce: 'P2', que: 'P2', pourquoi: 'P2', toujours: 'P2', encore: 'P2',
  copain: 'P2', foret: 'P2', histoire: 'P2', animal: 'P2',
  cependant: 'P4', neanmoins: 'P5', consequence: 'P5',
  hypothese: 'S1', paradoxe: 'S2', ambigu: 'S3', dispositif: 'S3', ulterieurement: 'S4',
}

function normaliser(mot) {
  return mot
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z-]/g, '')
}

// Retourne true/false quand le mot est présent dans le référentiel (connu ou
// confirmé au-dessus du niveau cible), ou null quand le mot est absent du
// référentiel — état volontairement distinct de `false` : un mot absent
// n'est PAS considéré comme rare, faute de données suffisantes dans la liste
// de démarrage (voir l'avertissement en tête de fichier). C'est ce qui
// permet à detecterMotsHorsNiveau de ne signaler que des mots confirmés
// hors-niveau plutôt que la quasi-totalité d'un texte réel.
export function estConnuAuNiveau(mot, niveauCible, dataset = FREQUENCE_LEXICALE) {
  const cle = normaliser(mot)
  const niveauIntroduction = dataset[cle]
  if (!niveauIntroduction) return null
  return NIVEAUX_ORDRE.indexOf(niveauIntroduction) <= NIVEAUX_ORDRE.indexOf(niveauCible)
}

export function detecterMotsHorsNiveau(texte, niveauCible, dataset = FREQUENCE_LEXICALE) {
  // Découpage sur les espaces ET les apostrophes (droites ou courbes) : sans
  // ça, une élision comme "l'hypothèse" ou "qu'il" fusionnerait l'article
  // élidé et le mot suivant en un seul token que normaliser() ne peut plus
  // reconnaître ("lhypothese"), et un mot pourtant hors-niveau ne serait
  // jamais signalé (retournerait null au lieu de false).
  const mots = texte.trim().split(/[\s'’]+/).filter(Boolean)
  return mots.filter(mot => estConnuAuNiveau(mot, niveauCible, dataset) === false)
}
