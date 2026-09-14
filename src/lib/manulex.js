// Fréquence lexicale par niveau scolaire — corpus Manulex complet
// (Lété, B., Sprenger-Charolles, L. & Colé, P., 2004), vérifié dans le
// corpus RISS (Gala, François, Bernhard & Fairon, 2014, hal-01001916 ;
// Grossmann, 2018, hal-04807000). Importé le 2026-09-14 depuis l'export
// officiel (manulex.org/fr/downloads.html, licence CC BY-NC-SA 3.0) via
// scripts/import-manulex.py — voir ce script pour le détail du mapping et
// le seuil de fréquence appliqué.
//
// LIMITES —
// 1. Corpus FRANÇAIS, pas belge : 54 manuels de lecture du primaire
//    FRANÇAIS (CP à CM2, mappé ici sur P1-P3 FWB ; voir scripts/import-manulex.py
//    pour le détail du mapping et sa limite propre — CE2 à CM2 sont regroupés
//    en une seule tranche, mappée sur P3). Le calibrage par niveau reflète les
//    programmes scolaires français, pas le rythme d'acquisition FWB. Les
//    belgicismes (nonante, septante, farde, essuie...) sont probablement
//    absents du corpus : un mot belge courant ne sera pas flagué, non pas
//    parce qu'il est jugé connu, mais parce qu'il est absent des données
//    (voir le commentaire sur la sémantique null/false d'estConnuAuNiveau
//    plus bas).
// 2. Aucune donnée secondaire (S1-S6) dans Manulex : estConnuAuNiveau/
//    detecterMotsHorsNiveau ne peuvent détecter des mots hors-niveau que
//    sur des textes destinés au primaire.
//
// niveau = premier niveau scolaire où le mot est considéré comme fréquent.
//
// NIVEAUX_ORDRE réexporte TOUS_NIVEAUX de constants.js (source unique pour
// l'ordre des niveaux scolaires, partagée avec lib/constants.js) plutôt que
// de dupliquer la liste ici — deux listes indépendantes auraient pu diverger
// silencieusement si un niveau était ajouté/renommé.
import { TOUS_NIVEAUX } from './constants'
import frequenceLexicaleManulex from '../data/frequenceLexicale.json'

export const NIVEAUX_ORDRE = TOUS_NIVEAUX

export const FREQUENCE_LEXICALE = frequenceLexicaleManulex

function normaliser(mot) {
  return mot
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z-]/g, '')
}

// Retourne true/false quand le mot est présent dans le référentiel (connu ou
// confirmé au-dessus du niveau cible), ou null quand le mot est absent du
// référentiel — état volontairement distinct de `false` : un mot absent n'est
// PAS considéré comme rare. Même avec le corpus Manulex complet, un mot peut
// être absent simplement parce qu'il n'apparaît jamais dans un manuel scolaire
// primaire français (secondaire, vocabulaire très spécialisé...) — voir la
// limite "P1-P3 uniquement" documentée en tête de fichier. C'est ce qui
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
