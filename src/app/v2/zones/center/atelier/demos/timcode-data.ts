/**
 * timcode-data.ts — Donnees de simulation Tim Code mode
 * Sujet : "Analyser les couts de production et identifier les gaspillages"
 * Tim (CTOB) lead — Planification + Codage + Debogage + Test
 * Sprint B — Atelier Simulations
 */

import {
  Search,
  GitBranch,
  Database,
  Cpu,
} from "lucide-react";
import type { ThinkingStep } from "../../shared/simulation-types";

// ========== TYPES ==========

export interface PlanStep {
  id: string;
  titre: string;
  description: string;
  status: "pending" | "active" | "done";
}

export interface TimCodeData {
  titre: string;
  contexte: string;
  userTension: string;
  ceoIntro: string;
  ceoThinking: ThinkingStep[];
  plan: PlanStep[];
  codeSnippet: string;
  terminalOutput: string;
  debugMessage: string;
  testOutput: string;
  synthese: string;
}

// ========== DATA ==========

export const TIMCODE_DATA: TimCodeData = {
  titre: "Analyser les couts de production et identifier les gaspillages",

  contexte:
    "L'usine a vu ses couts de production augmenter de 18% sur les 6 derniers mois. " +
    "Les donnees brutes existent dans des fichiers CSV mais personne n'a le temps de les analyser. " +
    "Carl veut un script qui identifie automatiquement les sources de gaspillage.",

  userTension:
    "Tim, j'ai des CSV de production avec les couts par ligne. " +
    "J'ai besoin d'un script Python qui identifie ou on gaspille le plus. Tu peux coder ca?",

  ceoIntro:
    "Parfait Carl, je vais coder un analyseur de couts de production. " +
    "Le plan: d'abord je structure le script pour lire tes CSV, ensuite je calcule les taux de gaspillage " +
    "par ligne de production, et je te sors un top 3 des postes les plus couteux. " +
    "On va aussi ajouter des tests pour s'assurer que les calculs sont solides. Laisse-moi travailler.",

  ceoThinking: [
    { icon: Search, text: "Analyse du code existant et structure CSV" },
    { icon: GitBranch, text: "Identification des patterns de gaspillage" },
    { icon: Database, text: "Plan de refactoring du pipeline de donnees" },
    { icon: Cpu, text: "Preparation de l'environnement d'execution" },
  ],

  plan: [
    {
      id: "plan",
      titre: "Planification",
      description: "Definir la structure du script, les inputs CSV attendus et les metriques de sortie",
      status: "pending",
    },
    {
      id: "code",
      titre: "Codage",
      description: "Ecrire la fonction analyse_couts_production avec lecture CSV et calcul des gaspillages",
      status: "pending",
    },
    {
      id: "debug",
      titre: "Debogage",
      description: "Tester avec des donnees reelles, corriger les edge cases et optimiser",
      status: "pending",
    },
    {
      id: "test",
      titre: "Test",
      description: "Ecrire et executer les tests unitaires pour valider chaque fonction",
      status: "pending",
    },
  ],

  codeSnippet: `import csv
from collections import defaultdict
from typing import Dict, List, Tuple

def analyse_couts_production(fichier_csv: str) -> Dict:
    """Analyse les couts de production et identifie les gaspillages."""
    couts_par_ligne = defaultdict(lambda: {
        "production": 0.0,
        "rebuts": 0.0,
        "heures_sup": 0.0,
        "arrets": 0.0,
    })

    with open(fichier_csv, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            ligne = row["ligne_production"]
            couts_par_ligne[ligne]["production"] += float(row["cout_production"])
            couts_par_ligne[ligne]["rebuts"] += float(row["cout_rebuts"])
            couts_par_ligne[ligne]["heures_sup"] += float(row["cout_heures_sup"])
            couts_par_ligne[ligne]["arrets"] += float(row["cout_arrets"])

    # Calculer le taux de gaspillage par ligne
    gaspillages: List[Tuple[str, float, float]] = []
    for ligne, couts in couts_par_ligne.items():
        total = sum(couts.values())
        gaspillage = couts["rebuts"] + couts["heures_sup"] + couts["arrets"]
        taux = (gaspillage / total * 100) if total > 0 else 0
        gaspillages.append((ligne, gaspillage, taux))

    # Trier par montant de gaspillage decroissant
    gaspillages.sort(key=lambda x: x[1], reverse=True)
    top_3 = gaspillages[:3]

    return {
        "total_production": sum(c["production"] for c in couts_par_ligne.values()),
        "total_gaspillage": sum(g[1] for g in gaspillages),
        "taux_global": sum(g[1] for g in gaspillages) / max(sum(sum(c.values()) for c in couts_par_ligne.values()), 1) * 100,
        "top_3_gaspillages": [
            {"ligne": g[0], "montant": g[1], "taux": g[2]}
            for g in top_3
        ],
        "nb_lignes_analysees": len(couts_par_ligne),
    }`,

  terminalOutput: `$ python3 analyse_couts_production.py --input production_q4_2025.csv

[INFO] Lecture du fichier: production_q4_2025.csv
[INFO] 1,247 lignes de donnees chargees
[INFO] 8 lignes de production identifiees

=== RAPPORT D'ANALYSE DES COUTS ===

Total production:      $2,847,320
Total gaspillage:      $486,219  (17.1%)

--- TOP 3 GASPILLAGES ---
1. Ligne CNC-04     $142,800  (28.3%)  [rebuts: 89K, arrets: 53K]
2. Ligne SOUD-02    $118,450  (22.1%)  [heures_sup: 71K, rebuts: 47K]
3. Ligne ASSE-07     $94,200  (19.8%)  [arrets: 62K, heures_sup: 32K]

[OK] Rapport genere: rapport_gaspillages_q4.json
[OK] Execution terminee en 0.34s`,

  debugMessage:
    "J'ai trouve un bug dans le calcul — quand une ligne de production a zero cout total, " +
    "on avait une division par zero dans le taux de gaspillage. J'ai ajoute un guard " +
    "`if total > 0 else 0` sur la ligne 24. J'ai aussi corrige l'encodage du fichier CSV " +
    "qui plantait sur les accents dans les noms de lignes. Les deux fixes sont integres.",

  testOutput: `$ python3 -m pytest test_analyse_couts.py -v

test_analyse_couts.py::test_lecture_csv_valide          PASSED  [33%]
test_analyse_couts.py::test_calcul_gaspillage_correct   PASSED  [66%]
test_analyse_couts.py::test_top3_tri_decroissant        PASSED  [100%]

======================== 3 passed in 0.12s ========================`,

  synthese:
    "Script termine et teste. L'analyse revele $486K de gaspillage sur Q4 2025, soit 17.1% des couts totaux. " +
    "La ligne CNC-04 est la priorite #1 avec 28.3% de taux de gaspillage (principalement des rebuts). " +
    "Prochaines etapes: automatiser l'execution quotidienne avec un cron job, " +
    "ajouter des alertes quand une ligne depasse 20% de gaspillage, " +
    "et connecter les resultats au dashboard CarlOS pour un suivi en temps reel.",
};
