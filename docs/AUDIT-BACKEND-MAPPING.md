# AUDIT BACKEND — Mapping Complet Backend ↔ Frontend
# Date: 2026-04-14
# Source: Audit automatisé de api_rest.py, database.py, agents.py, bridge_*.py, carlos_livekit_agent.py

---

## 1. SOURCE UNIQUE DES SECTIONS: agents.py FLOW_CONFIG

**Fichier:** `/home/deploy/brain-dev/agents.py:585-961`
**C'est LA source de vérité pour les sections. Le frontend DOIT matcher ces clés.**

### Sections DATA — 12 Départements
| Section Key (backend) | Bot Primaire | Bots Secondaires |
|---|---|---|
| `ventes` | CRO | CMO, CSO |
| `marketing` | CMO | CCO, CRO |
| `finance` | CFO | CEO, COO |
| `operations` | COO | FACTORY, CTO |
| `technologie` | CTO | CIO, CISO |
| `strategie` | CSO | CEO, CFO |
| `innovation` | CINO | CTO, CMO |
| `rh` | CHRO | COO, CEO |
| `juridique` | CLO | CFO, CEO |
| `securite` | CISO | CTO, CIO |
| `communication` | CCO | CMO, CHRO |
| `usine` | FACTORY | COO, CINO |

### Sections DATA — Mon Bureau (6)
| Section Key | Bot Primaire |
|---|---|
| `bureau-idees` | CEO |
| `bureau-projets` | COO |
| `bureau-documents` | CEO |
| `bureau-taches` | COO |
| `bureau-outils` | CTO |
| `bureau-agenda` | CEO |

### Sections DATA — Autres (10)
| Section Key | Bot Primaire |
|---|---|
| `cockpit` | CEO |
| `dashboard` | CEO |
| `sante` | CEO |
| `marketplace` | CEO |
| `gouvernance` | CEO |
| `pionniers` | CEO |
| `nouvelles` | CEO |
| `evenements` | CEO |
| `industrie` | CEO |
| `orbit9` | CEO |

### Sections ACTION — Rooms + Flows (8)
| Section Key | Bot Primaire | Steps | Description |
|---|---|---|---|
| `board-room` | CEO | 5 | Réunion Board Room — tour de table 12 bots |
| `war-room` | CEO | 6 | Gestion crise majeure, COMMAND urgent |
| `think-room` | CEO | 6 | Gros projet, pivot stratégique, innovation |
| `blueprint-live` | CEO | 5 | Création plan d'affaires structuré |
| `jumelage` | CEO | 5 | Matching Orbit9 entre membres |
| `scenarios` | CSO | 5 | Exploration what-if stratégique |
| `cellules` | CEO | 4 | Création cellule Orbit9 |
| `pipeline` | COO | 5 | Orchestration livraison multi-bot |

---

## 2. GPS — Comment le frontend communique sa position au backend

### ChatRequest (ce que le frontend envoie)
```
active_view: str          — "department", "cockpit", "board-room", etc.
active_sub_section: str   — "finance", "idees", "live", etc.
```

### resolve_flow_type() (comment le backend résout)
```
("department", "finance")    → FLOW_CONFIG["finance"]
("espace-bureau", "idees")   → FLOW_CONFIG["bureau-idees"]
("board-room", null)         → FLOW_CONFIG["board-room"]
("blueprint", "live")        → FLOW_CONFIG["blueprint-live"]
("cockpit", null)            → FLOW_CONFIG["cockpit"]
```

---

## 3. TABLES POSTGRESQL (51 tables) — Résumé

### Hiérarchie 4 niveaux (IMMUTABLE — ne pas renommer)
| Table | Clés | Relations |
|---|---|---|
| `chantiers` | id, titre, chaleur, status, bot_codes, section_primaire, categorie | Parent de projets |
| `projets` | id, titre, chantier_id, status, bot_primaire, section | Parent de missions |
| `missions` | id, titre, chantier_id, projet_id, status, section, flow_type | Parent de tâches |
| `taches` | id, titre, mission_id, projet_id, chantier_id, status, section | Éléments atomiques |

### Colonnes communes (présentes dans TOUTES les tables hiérarchiques)
- `user_id`, `tenant_id` — isolation multi-tenant
- `section` — lien GPS vers une section (string libre)
- `categorie` — catégorisation (string)
- `deleted_at` — soft-delete (null = actif)
- `bot_primaire` — bot responsable
- `status` — état courant

### Orbit9 (réseau)
| Table | Description |
|---|---|
| `orbit9_members` | Membres réseau (specialites JSONB, vitaa_scores JSONB, trust_score) |
| `orbit9_cellules` | Cellules (max 9 membres, gouvernance JSONB) |
| `orbit9_matches` | Matching (demandeur_id, candidats JSONB, scores_detail JSONB) |
| `orbit9_cellule_tenants` | Jointure multi-tenant cellules |

### COMMAND + Gouvernance
| Table | Description |
|---|---|
| `command_missions` | Missions COMMAND (stage: pending→scan→strategy→execution→bilan→done) |
| `tensions` | Tensions VITAA atomiques (type_vitaa, intensite) |
| `decision_log` | Traçabilité décisions (bot_code, type_decision, section) |
| `pending_approvals` | Approbations en attente (severity, status) |

### DocForge
| Table | Description |
|---|---|
| `docforge_templates` | Templates de documents (alias unique, sections JSONB) |
| `docforge_libraries` | Bibliothèques créées (template_alias, completude_pct) |
| `docforge_blocks` | Blocs de contenu (section_id, contenu_md, confiance) |
| `docforge_facts` | Faits extraits (sujet, valeur, status) |

### Auth + Multi-tenant
| Table | Description |
|---|---|
| `users` | Utilisateurs (email, password_hash) |
| `tenants` | Organisations (name, slug, plan_type) |
| `memberships` | User ↔ Tenant (role, department_scope) |
| `session_states` | État state machine par user |

### Autres tables critiques
| Table | Description |
|---|---|
| `diagnostics` | Diagnostic vivant VITAA (score_vente/idee/temps/argent/actif) |
| `diagnostic_ia` | Diagnostic IA 12 départements |
| `bureau_items` | Espace Bureau (type_item: document/outil) |
| `entreprise_profils` | Profil entreprise (SWOT, VITAA) |
| `canvas_items` | Canvas (type_canvas: swot/lean_canvas/vitaa_canvas/bmc) |
| `meetings` | Réunions LiveKit |
| `trust_reviews` | Reviews confiance réseau |

---

## 4. CANVAS ACTIONS — Types backend

```python
class CanvasAction(BaseModel):
    type: str          # navigate | push_content | split_screen | execute | context_widget | annotate
    layer: str         # bouche | cerveau | coeur
    view: Optional[str]
    params: Optional[dict]
    data: Optional[dict]
    message: Optional[str]
    priority: str = "normal"
    bot: Optional[str]
```

---

## 5. MAPPING FRONTEND ACTUEL → BACKEND

| Frontend (V3 rightSection) | active_view envoyé | active_sub_section | Backend FLOW_CONFIG key |
|---|---|---|---|
| `cockpit` | cockpit | — | cockpit |
| `chantiers` | department | {dept} | {dept} (ex: ventes, finance) |
| `blueprint` | blueprint | — | `blueprint-live` (ACTION flow — 5 steps création plan d'affaires) |
| `dataroom` | espace-bureau | documents | bureau-documents → `bureau_items` + `docforge_*` (5 tables, 45+ endpoints) |
| `playbooks` | playbooks | — | 46 JSON playbooks + `prospect_playbooks` table + 7 endpoints CRUD/deploy |
| `conferenceai` | conferenceai | — | `meetings` table + 30+ types dans bridge_meetings.py + 11 endpoints LIVE |
| (Orbit9 sections) | orbit9 | {section} | `orbit9_members` + `orbit9_cellules` + `orbit9_matches` + 15 endpoints |

### ÉTAT RÉEL BACKEND (Deep Audit 2026-04-14)

#### Playbooks — BACKEND RÉEL
- **46 fichiers JSON** dans `/playbooks/` (pb-STR-*, pb-FIN-*, pb-MKT-*, pb-O9-*, etc.)
- **Table `prospect_playbooks`** (id, tenant_id, playbook_id, status, config JSONB, results JSONB)
- **7 endpoints API**: GET/POST catalogue, GET/POST detail, POST deploy/{id}, GET status/{deploy_id}, POST execute-step
- **Deployer** crée de vrais chantiers/projets/missions dans la DB
- **GAP frontend**: PlaybookStoreView V3 a du mock data local — doit brancher aux endpoints

#### Conference AI — BACKEND ENTIÈREMENT LIVE
- **Table `meetings`** (type, status, room_name, recording_url, transcript, participants JSONB)
- **30+ types de meetings** dans bridge_meetings.py (board_room, war_room, think_room, dept_*, audit_*, etc.)
- **Chaque type** a: system_prompt, flow steps, invited_bots, bot_roles
- **11 endpoints API**: POST create, GET list, GET detail, POST join, POST end, GET transcript, POST recording, etc.
- **LiveKit** multi-bot dispatch (jusqu'à 12 bots), enregistrement, transcription, podcast generation
- **GAP frontend**: ConferenceAIView V3 a du mock data local — doit brancher aux endpoints meetings

#### Data Room / DocForge — BACKEND RÉEL
- **5 tables DocForge**: docforge_templates, docforge_libraries, docforge_blocks, docforge_facts, docforge_versions
- **Table `bureau_items`**: type_item (document/outil), upload fichiers réels
- **45+ endpoints API**: CRUD templates/libraries/blocks/facts + pipeline 8 étapes
- **Pipeline DocForge**: ingest → classify → extract → dedup → factcheck → assemble → review → publish
- **bridge_documents.py** (916 lignes): Template→PDF pipeline, génération multi-format
- **GAP frontend**: DataRoomView V3 a du mock data local — doit brancher aux endpoints bureau_items + docforge

#### Blueprint — PARTIELLEMENT BACKEND
- **FLOW_CONFIG `blueprint-live`** = ACTION flow (5 steps création plan d'affaires structuré)
- **Pas de section DATA** dédiée dans FLOW_CONFIG pour la consultation blueprint
- **GAP**: BlueprintView frontend = visualisation de données département, le backend `blueprint-live` = flow conversationnel de création

#### Chantiers — BACKEND COMPLET
- **4 tables hiérarchiques** avec FK: chantiers → projets → missions → tâches
- **CRUD complet** sur chaque niveau (GET/POST/PUT/DELETE)
- **Frontend V3** ChantierView drill-down 5 niveaux = aligné avec la structure backend

---

## 6. BOT CODES — 12 codes IMMUTABLES

| Code | Nom | Rôle |
|---|---|---|
| CEOB | CarlOS | CEO |
| CTOB | Tim | CTO |
| CFOB | Frank | CFO |
| CMOB | Mathilde | CMO |
| CSOB | Simone | CSO |
| COOB | Olivier | COO |
| CPOB | Paco | CPO/Usine |
| CHROB | Hélène | CHRO |
| CINOB | Inès | CINO |
| CROB | Rich | CRO |
| CLOB | Loulou | CLO |
| CISOB | Sébastien | CISO |

---

## 7. STATUTS ET CONSTANTES BACKEND (NE PAS RENOMMER)

### Statuts
```
Chantiers: active, en_attente, complete, archive
Missions: a-faire, en-cours, completee, bloque, archivee
Tâches: a-faire, en-cours, complete, bloque, archivee
Discussions: active, parked, closed_promoted, closed_archived
Command: pending, scan, strategy, execution, bilan, done, failed
```

### Chaleur (Triangle du Feu)
```
brule (3+ piliers VITAA ≥50)
couve (2 piliers ≥50)
meurt (0-1 pilier ≥50)
```

### VITAA (5 piliers)
```
score_vente, score_idee, score_temps, score_argent, score_actif (0-100)
```

### Types
```
type_chantier: strategique, technologique, organisationnel, culturel, environnemental, operationnel
type_vitaa: vente, idee, temps, argent, actif
flow_type: data, action
type_item (bureau): document, outil
```

---

## 8. ENDPOINTS PRINCIPAUX (285 total, 20-30 patterns)

### CRUD Standard (par entité)
```
GET    /api/v1/{entité}          — liste (filtres: status, chaleur, categorie, tenant)
GET    /api/v1/{entité}/{id}     — détail
POST   /api/v1/{entité}          — créer
PUT    /api/v1/{entité}/{id}     — MAJ
DELETE /api/v1/{entité}/{id}     — soft delete
```

### Chat (GPS intégré)
```
POST   /api/v1/chat              — message + active_view + active_sub_section
POST   /api/v1/chat/stream       — streaming
```

### Voice
```
POST   /api/v1/voice/token       — LiveKit token
POST   /api/v1/voice/event       — webhook vocal
GET    /api/v1/voice/events/{room} — poll événements
```

### COMMAND
```
POST   /api/v1/command/detect    — détecter besoin COMMAND
POST   /api/v1/command/start     — lancer mission
GET    /api/v1/command/status/{id} — statut
POST   /api/v1/command/compile/daily — briefing quotidien
```

### Orbit9
```
GET/POST /api/v1/orbit9/members  — membres
GET/POST /api/v1/orbit9/cellules — cellules
POST     /api/v1/orbit9/match    — matching
POST     /api/v1/orbit9/trisociation/start — trisociation LiveKit
```

### Playbooks
```
GET    /api/v1/playbooks              — catalogue (46 JSON)
POST   /api/v1/playbooks              — créer
GET    /api/v1/playbooks/{id}         — détail
POST   /api/v1/playbooks/deploy/{id}  — déployer (crée chantiers/projets/missions)
GET    /api/v1/playbooks/status/{id}  — statut déploiement
POST   /api/v1/playbooks/execute-step — exécuter étape
```

### Meetings (Conference AI)
```
POST   /api/v1/meetings              — créer (30+ types)
GET    /api/v1/meetings              — liste
GET    /api/v1/meetings/{id}         — détail
POST   /api/v1/meetings/{id}/join    — rejoindre (LiveKit token)
POST   /api/v1/meetings/{id}/end     — terminer
GET    /api/v1/meetings/{id}/transcript — transcription
POST   /api/v1/meetings/{id}/recording — enregistrement
```

### DocForge
```
GET/POST   /api/v1/docforge/templates    — templates
GET/POST   /api/v1/docforge/libraries    — bibliothèques
GET/POST   /api/v1/docforge/blocks       — blocs de contenu
GET/POST   /api/v1/docforge/facts        — faits extraits
POST       /api/v1/docforge/ingest       — pipeline ingestion
POST       /api/v1/docforge/assemble/{id} — assembler document
```

### Flow GPS
```
GET    /api/v1/flow/step/{section_key}    — état actuel
POST   /api/v1/flow/advance/{section_key} — avancer
GET    /api/v1/flow/config/{section_key}  — config section
```
