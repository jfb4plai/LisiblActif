#!/usr/bin/env python3
"""
Extrait la liste des mots-vedettes de la BDLP-Belgique (Base de données
lexicographiques panfrancophone, section Belgique) et produit
src/data/belgicismes.json — un ensemble de belgicismes normalisés, utilisé
par src/lib/manulex.js pour éviter qu'un mot belge légitime (nonante, farde,
bourgmestre...) soit signalé à tort comme "hors-niveau" simplement parce que
Manulex (corpus français) le classe rare ou absent.

Source : https://www.bdlp.org/recherche?bases[]=BE — page de recherche
avancée, `<select id="query">` (l'index des mots-vedettes ; ATTENTION, la
même page contient d'autres <select> pour les auteurs, domaines sémantiques,
étymons latins/germaniques, provinces... — bien cibler id="query", pas tous
les <select> de la page).

Licence : contenu public en ligne (bdlp.org, © Université Laval), issu du
Dictionnaire des belgicismes (Francard, Geron, Wilmet & Wirtz, De Boeck,
2010) — pas de licence ouverte affichée. Utilisé ici comme simple liste de
mots (aucune définition, aucune citation du dictionnaire), pour un usage non
commercial d'intérêt pédagogique FWB. Projet financé par le FNRS et la
Communauté Wallonie-Bruxelles, réalisé par le centre Valibel (UCLouvain).

BDLP-Belgique N'EST PAS une base graduée par année scolaire : cette liste ne
permet pas d'affirmer à quel niveau FWB un mot est acquis, seulement d'éviter
un faux signalement (voir le commentaire sur estConnuAuNiveau dans
lib/manulex.js).

Usage : python scripts/import-belgicismes.py
Nécessite le paquet requests (pip install requests) — aucune dépendance npm
ajoutée (même choix que pour Manulex : pas de scraping/parsing HTML côté
Node pour un script à usage occasionnel).
"""

import html
import json
import re
import unicodedata
from pathlib import Path

URL = 'https://www.bdlp.org/recherche?bases[]=BE'


def normaliser(mot):
    mot = mot.lower()
    mot = ''.join(c for c in unicodedata.normalize('NFD', mot) if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z-]', '', mot)


def extraire_options(page_html, select_id):
    """Extrait les textes <option> d'un <select id=...> précis, sans dépendance
    de parsing HTML complet (BeautifulSoup) — juste ce <select>-là."""
    debut = page_html.index(f'id="{select_id}"')
    fin = page_html.index('</select>', debut)
    bloc = page_html[debut:fin]
    return [html.unescape(m).strip() for m in re.findall(r'<option[^>]*>([^<]*)</option>', bloc)]


def convertir(page_html):
    entrees = extraire_options(page_html, 'query')

    mots = set()
    for entree in entrees:
        entree = re.sub(r'#\d+$', '', entree)  # retire les marqueurs d'homographe (ex. "à#1")
        for segment in entree.split(','):       # "beau, belle" -> deux formes
            n = normaliser(segment)
            if n and len(n) >= 2:
                mots.add(n)

    return sorted(mots), len(entrees)


def main():
    import requests

    reponse = requests.get(URL, timeout=30)
    reponse.raise_for_status()

    mots, nb_entrees = convertir(reponse.text)

    sortie = Path(__file__).resolve().parent.parent / 'src' / 'data' / 'belgicismes.json'
    sortie.write_text(json.dumps(mots, ensure_ascii=False, indent=2), encoding='utf-8')

    print(f"{nb_entrees} entrées brutes -> {len(mots)} mots normalisés exportés vers {sortie}")


if __name__ == '__main__':
    main()
