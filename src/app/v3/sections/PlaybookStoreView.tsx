/**
 * PlaybookStoreView.tsx — Automatisations / Playbooks (pattern SectionView)
 *
 * Extrait de BlueprintDepartement.tsx L5207-7595
 * Contient: PLAYBOOK_STORE_DATA (exporté pour ConferenceAIView)
 * Utilisé par: WorkspacePhasesPanel (section "playbooks")
 */

import { useState, useEffect, Fragment } from "react";
import {
  Activity, AlertTriangle, ArrowDown, ArrowUp, ArrowUpDown, Award, Banknote, BookOpen, Bookmark, Bot,
  Brain, Building2, Calendar, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ClipboardCheck,
  Clock, Cog, Compass, Cpu, Crown, DollarSign, Eye, Factory, FileText, Flame, FolderOpen, Globe,
  GraduationCap, Handshake, HardHat, Headphones, Heart, Info, Layers, LayoutGrid, LayoutList, Lightbulb,
  ListChecks, MapPin, Megaphone, Network, Pause, Plus, Repeat, Rocket, RotateCcw, Route, Scale, Search,
  Settings, Share2, Shield, ShieldAlert, ShieldCheck, ShoppingBag, Sparkles, Star, Stethoscope, Table2,
  Target, Trash2, TrendingUp, Trophy, Upload, User, Users, Video, Wrench, Zap,
} from "lucide-react";
import { Card } from "../../components/ui/card";
import { cn } from "../../components/ui/utils";
import { BOT_AVATAR, BOT_NAME } from "../../v2/api/types";
import { LivingHero } from "./shared/LivingHero";
import { DEPT_COLORS, DEPT_SHORT_LABEL, DEPT_DASH_ICON, DEPT_LABELS, DEPT_ICONS, DEPT_GRADIENT, BOT_DISPLAY, BOT_AVATAR_MAP } from "./shared/dept-data";
import { SF } from "../core/styles";
import { useIsMobile } from "../../components/ui/use-mobile";
import { MobileSidebarSheet } from "../core/MobileSidebarSheet";

// ══════════════════════════════════════════
// PLAYBOOKS — Mes playbooks + Recommandés + Store (layout DocForge)
// ══════════════════════════════════════════

// 100+ playbooks from RESULT-07 deep search — Catalogue de base gratuit + Premium + Conference AI
export const PLAYBOOK_STORE_DATA: { id: string; nom: string; departement: string; bots: string[]; etapes: number; duree: string; niveau: "Quick Win" | "Standard" | "Avance" | "Enterprise"; prix: string; rating: number; downloads: number; categorie: string; description: string; pilier: string; type: string }[] = [
  // ═══ DIRECTION / CEO (CarlOS) — 9 playbooks ═══
  { id: "pb-001", nom: "Revue hebdomadaire de direction", departement: "CEOB", bots: ["CarlOS", "Frank"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.8, downloads: 1245, categorie: "Performance", pilier: "Temps", description: "Analyse des KPIs, fixation des priorites hebdomadaires, blockers a debloquer.", type: "mission" },
  { id: "pb-002", nom: "Preparation ordre du jour CA", departement: "CEOB", bots: ["CarlOS", "Loulou"], etapes: 7, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.5, downloads: 567, categorie: "Gouvernance", pilier: "Actif", description: "Structure et compilation des donnees pour le conseil d'administration.", type: "document" },
  { id: "pb-003", nom: "Alignement OKR trimestriel", departement: "CEOB", bots: ["CarlOS", "Simone"], etapes: 9, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.7, downloads: 891, categorie: "Strategie", pilier: "Idee", description: "Definition des objectifs cles et resultats attendus, cascade vers les departements.", type: "mission" },
  { id: "pb-004", nom: "Bilan annuel synthetique", departement: "CEOB", bots: ["CarlOS", "Mathilde"], etapes: 12, duree: "1h", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 432, categorie: "Reporting", pilier: "Actif", description: "Agregation des accomplissements pour presentation aux parties prenantes.", type: "document" },
  { id: "pb-005", nom: "Memo direction general", departement: "CEOB", bots: ["CarlOS", "Helene"], etapes: 4, duree: "10min", niveau: "Quick Win", prix: "Gratuit", rating: 4.4, downloads: 678, categorie: "Communication", pilier: "Temps", description: "Redaction et diffusion d'une communication interne structuree.", type: "document" },
  { id: "pb-006", nom: "Triage des urgences", departement: "CEOB", bots: ["CarlOS", "Sebastien"], etapes: 6, duree: "20min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 345, categorie: "Gestion crise", pilier: "Temps", description: "Analyse initiale des crises et assignation des taches par priorite.", type: "tache" },
  { id: "pb-007", nom: "Audit rapide culture entreprise", departement: "CEOB", bots: ["CarlOS", "Helene"], etapes: 8, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 234, categorie: "Culture", pilier: "Actif", description: "Sondage de pouls et analyse du climat organisationnel avec recommandations.", type: "diagnostic" },
  { id: "pb-008", nom: "Matrice RACI de projet", departement: "CEOB", bots: ["CarlOS", "Olivier"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.6, downloads: 789, categorie: "Gestion projet", pilier: "Temps", description: "Assignation claire des responsabilites d'execution (Responsible, Accountable, Consulted, Informed).", type: "tache" },
  { id: "pb-009", nom: "Pre-qualification investisseur", departement: "CEOB", bots: ["CarlOS", "Frank"], etapes: 6, duree: "20min", niveau: "Quick Win", prix: "$49", rating: 4.4, downloads: 156, categorie: "Financement", pilier: "Argent", description: "Analyse preliminaire de l'adequation d'un VC/investisseur avec votre profil.", type: "diagnostic" },
  // ═══ TECHNOLOGIE / CTO (Tim) — 9 playbooks ═══
  { id: "pb-110", nom: "Onboarding logiciel standard", departement: "CTOB", bots: ["Tim", "Helene"], etapes: 6, duree: "20min", niveau: "Standard", prix: "Gratuit", rating: 4.5, downloads: 567, categorie: "Onboarding", pilier: "Temps", description: "Creation des acces aux plateformes SaaS, configuration initiale, checklist securite.", type: "flow" },
  { id: "pb-111", nom: "Inventaire stack technologique", departement: "CTOB", bots: ["Tim", "Frank"], etapes: 8, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.4, downloads: 345, categorie: "Audit", pilier: "Argent", description: "Compilation de tous les abonnements SaaS, couts mensuels et redondances.", type: "diagnostic" },
  { id: "pb-112", nom: "Triage ticket support IT", departement: "CTOB", bots: ["Tim", "Olivier"], etapes: 4, duree: "10min", niveau: "Quick Win", prix: "Gratuit", rating: 4.3, downloads: 890, categorie: "Support", pilier: "Temps", description: "Classification et routage automatise des demandes de depannage technique.", type: "tache" },
  { id: "pb-113", nom: "Verification sauvegardes", departement: "CTOB", bots: ["Tim", "Sebastien"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.7, downloads: 456, categorie: "Securite", pilier: "Actif", description: "Audit automatise des procedures de backup et verification d'integrite.", type: "tache" },
  { id: "pb-114", nom: "Deduplication base de donnees CRM", departement: "CTOB", bots: ["Tim", "Rich"], etapes: 6, duree: "25min", niveau: "Standard", prix: "$49", rating: 4.2, downloads: 234, categorie: "Data quality", pilier: "Actif", description: "Nettoyage et fusion des fiches contacts doublons dans le CRM.", type: "tache" },
  { id: "pb-115", nom: "Revue architecture TI", departement: "CTOB", bots: ["Tim", "CarlOS"], etapes: 9, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 178, categorie: "Architecture", pilier: "Idee", description: "Analyse des points de defaillance uniques (SPOF) et recommandations d'evolution.", type: "diagnostic" },
  { id: "pb-116", nom: "Migration cloud structuree", departement: "CTOB", bots: ["Tim", "Sebastien", "Olivier"], etapes: 16, duree: "6 sem.", niveau: "Enterprise", prix: "$299", rating: 4.7, downloads: 98, categorie: "Infrastructure", pilier: "Actif", description: "Plan de migration cloud complet avec analyse risques, timeline et rollback.", type: "chantier" },
  { id: "pb-117", nom: "Documentation API starter", departement: "CTOB", bots: ["Tim"], etapes: 6, duree: "3 jours", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 456, categorie: "Documentation", pilier: "Actif", description: "Templates et structure pour documenter vos APIs REST avec exemples.", type: "document" },
  { id: "pb-118", nom: "Renouvellement SSL et domaines", departement: "CTOB", bots: ["Tim"], etapes: 3, duree: "5min", niveau: "Quick Win", prix: "Gratuit", rating: 4.8, downloads: 1234, categorie: "Maintenance", pilier: "Actif", description: "Alertes et renouvellement automatique des certificats SSL et noms de domaine.", type: "tache" },
  // ═══ FINANCE / CFO (Frank) — 9 playbooks ═══
  { id: "pb-020", nom: "Facturation fin de mois", departement: "CFOB", bots: ["Frank", "Rich"], etapes: 6, duree: "20min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 678, categorie: "Comptabilite", pilier: "Argent", description: "Compilation et envoi automatise des factures mensuelles aux clients.", type: "flow" },
  { id: "pb-021", nom: "Relance comptes impayes", departement: "CFOB", bots: ["Frank", "CarlOS"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 890, categorie: "Recouvrement", pilier: "Argent", description: "Sequence de courriels echelonnes pour relancer les factures en souffrance.", type: "flow" },
  { id: "pb-022", nom: "Categorisation recus (IA)", departement: "CFOB", bots: ["Frank"], etapes: 8, duree: "25min", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 345, categorie: "Comptabilite", pilier: "Temps", description: "Analyse optique OCR des recus et ventilation automatique au grand livre.", type: "flow" },
  { id: "pb-023", nom: "Rapprochement bancaire", departement: "CFOB", bots: ["Frank"], etapes: 7, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.2, downloads: 567, categorie: "Comptabilite", pilier: "Argent", description: "Tri automatise des transactions selon les extraits bancaires.", type: "flow" },
  { id: "pb-024", nom: "Compilation TPS/TVQ", departement: "CFOB", bots: ["Frank", "Loulou"], etapes: 9, duree: "40min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 456, categorie: "Fiscalite", pilier: "Argent", description: "Preparation des totaux pour les declarations de taxes (TPS/TVQ).", type: "flow" },
  { id: "pb-025", nom: "Flash report sante financiere", departement: "CFOB", bots: ["Frank"], etapes: 4, duree: "10min", niveau: "Quick Win", prix: "Gratuit", rating: 4.7, downloads: 1123, categorie: "Reporting", pilier: "Argent", description: "Synthese en temps reel des liquidites, marges et burn rate.", type: "diagnostic" },
  { id: "pb-026", nom: "Circuit approbation achats", departement: "CFOB", bots: ["Frank", "CarlOS"], etapes: 6, duree: "20min", niveau: "Standard", prix: "$49", rating: 4.1, downloads: 234, categorie: "Controle", pilier: "Argent", description: "Escalade selon les seuils d'autorisation budgetaire (1K, 5K, 10K+).", type: "flow" },
  { id: "pb-027", nom: "Projection tresorerie 30 jours", departement: "CFOB", bots: ["Frank", "Simone"], etapes: 8, duree: "35min", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 345, categorie: "Previsions", pilier: "Argent", description: "Modelisation des flux monetaires a court terme avec scenarios.", type: "diagnostic" },
  { id: "pb-028", nom: "Modelisation financiere startup", departement: "CFOB", bots: ["Frank", "CarlOS"], etapes: 10, duree: "1 sem.", niveau: "Avance", prix: "$149", rating: 4.7, downloads: 178, categorie: "Previsions", pilier: "Argent", description: "Modele financier complet (P&L, CF, bilan) avec projections 36 mois et scenarios.", type: "projet" },
  // ═══ MARKETING / CMO (Mathilde) — 9 playbooks ═══
  { id: "pb-030", nom: "Publication multi-reseaux", departement: "CMOB", bots: ["Mathilde"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 1567, categorie: "Social media", pilier: "Vente", description: "Adaptation du format et programmation du contenu sur LinkedIn, FB, Instagram.", type: "flow" },
  { id: "pb-031", nom: "Recyclage contenu blog", departement: "CMOB", bots: ["Mathilde", "Ines"], etapes: 7, duree: "25min", niveau: "Standard", prix: "Gratuit", rating: 4.4, downloads: 678, categorie: "Contenu", pilier: "Vente", description: "Extraction d'un article de blog en publications sociales, carousel et infographie.", type: "flow" },
  { id: "pb-032", nom: "Creation infolettre mensuelle", departement: "CMOB", bots: ["Mathilde", "Tim"], etapes: 8, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 456, categorie: "Email", pilier: "Vente", description: "Brouillon, curation de liens et mise en page pour newsletter mensuelle.", type: "flow" },
  { id: "pb-033", nom: "Analyse performance campagne", departement: "CMOB", bots: ["Mathilde", "Frank"], etapes: 6, duree: "20min", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 345, categorie: "Analytics", pilier: "Vente", description: "Synthese du cout par acquisition (CPA), ROAS et recommandations d'optimisation.", type: "diagnostic" },
  { id: "pb-034", nom: "Generation brief creatif", departement: "CMOB", bots: ["Mathilde", "Paco"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.2, downloads: 567, categorie: "Branding", pilier: "Idee", description: "Documentation des exigences creatives pour designer externe ou production.", type: "document" },
  { id: "pb-035", nom: "Audit SEO de base", departement: "CMOB", bots: ["Mathilde", "Tim"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.4, downloads: 789, categorie: "SEO", pilier: "Actif", description: "Verification des balises meta, liens brises, vitesse et recommandations.", type: "diagnostic" },
  { id: "pb-036", nom: "Veille concurrentielle basique", departement: "CMOB", bots: ["Mathilde", "Simone"], etapes: 6, duree: "25min", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 345, categorie: "Veille", pilier: "Idee", description: "Scraping de positionnement des 3 principaux rivaux, matrice comparative.", type: "diagnostic" },
  { id: "pb-037", nom: "Creation persona ICP", departement: "CMOB", bots: ["Mathilde", "Rich", "Simone"], etapes: 6, duree: "3 jours", niveau: "Quick Win", prix: "Gratuit", rating: 4.8, downloads: 1234, categorie: "Strategie", pilier: "Vente", description: "Atelier structure pour definir vos personas ICP avec templates et guide d'entrevue.", type: "blueprint" },
  { id: "pb-038", nom: "Lancement campagne digitale", departement: "CMOB", bots: ["Mathilde", "Rich"], etapes: 12, duree: "2 sem.", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 456, categorie: "Campagnes", pilier: "Vente", description: "Planification et execution d'une campagne multi-canal avec tracking ROI.", type: "projet" },
  // ═══ STRATEGIE / CSO (Simone) — 8 playbooks ═══
  { id: "pb-040", nom: "Matrice SWOT flash", departement: "CSOB", bots: ["Simone", "CarlOS"], etapes: 5, duree: "20min", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 890, categorie: "Analyse", pilier: "Idee", description: "Generation des forces, faiblesses, opportunites et menaces en format visuel.", type: "diagnostic" },
  { id: "pb-041", nom: "Cartographie positionnement marche", departement: "CSOB", bots: ["Simone", "Mathilde"], etapes: 7, duree: "35min", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 345, categorie: "Positionnement", pilier: "Idee", description: "Analyse des axes de differenciation vs concurrence avec matrice.", type: "blueprint" },
  { id: "pb-042", nom: "Synthese tendances sectorielles", departement: "CSOB", bots: ["Simone"], etapes: 4, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.4, downloads: 678, categorie: "Veille", pilier: "Idee", description: "Resume executif des rapports de l'industrie et tendances emergentes.", type: "diagnostic" },
  { id: "pb-043", nom: "Scenario perte client majeur", departement: "CSOB", bots: ["Simone", "Frank"], etapes: 6, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 234, categorie: "Risques", pilier: "Actif", description: "Calcul d'impact de la perte du plus gros compte + plan de mitigation.", type: "diagnostic" },
  { id: "pb-044", nom: "Evaluation partenariat strategique", departement: "CSOB", bots: ["Simone", "Rich"], etapes: 5, duree: "20min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 456, categorie: "Alliances", pilier: "Vente", description: "Grille de ponderation pour evaluer les alliances B2B potentielles.", type: "diagnostic" },
  { id: "pb-045", nom: "Business Model Canvas workshop", departement: "CSOB", bots: ["Simone", "CarlOS"], etapes: 4, duree: "1 jour", niveau: "Quick Win", prix: "Gratuit", rating: 4.9, downloads: 1567, categorie: "Innovation", pilier: "Idee", description: "Atelier guide pour completer votre BMC avec exemples sectoriels.", type: "blueprint" },
  { id: "pb-046", nom: "Analyse risques macro-economiques", departement: "CSOB", bots: ["Simone", "Frank"], etapes: 6, duree: "25min", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 189, categorie: "Risques", pilier: "Argent", description: "Impact modelise de l'inflation, taux d'interet et recession sur votre entreprise.", type: "diagnostic" },
  { id: "pb-047", nom: "Analyse concurrentielle 360", departement: "CSOB", bots: ["Simone", "Mathilde"], etapes: 10, duree: "1 sem.", niveau: "Avance", prix: "$99", rating: 4.6, downloads: 234, categorie: "Veille", pilier: "Idee", description: "Analyse approfondie de 5-10 concurrents avec matrice et recommandations strategiques.", type: "projet" },
  // ═══ OPERATIONS / COO (Olivier) — 9 playbooks ═══
  { id: "pb-050", nom: "Standardisation processus (SOP)", departement: "COOB", bots: ["Olivier", "Tim"], etapes: 6, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 567, categorie: "Processus", pilier: "Temps", description: "Extraction de la logique d'un processus et mise en format SOP officiel.", type: "flow" },
  { id: "pb-051", nom: "Plan continuite des affaires", departement: "COOB", bots: ["Olivier", "Sebastien"], etapes: 12, duree: "2 sem.", niveau: "Avance", prix: "$99", rating: 4.5, downloads: 234, categorie: "Resilience", pilier: "Actif", description: "Elaboration d'un PCA complet avec scenarios de crise et procedures de reprise.", type: "chantier" },
  { id: "pb-052", nom: "Inventaire theorique mensuel", departement: "COOB", bots: ["Olivier", "Frank"], etapes: 7, duree: "35min", niveau: "Standard", prix: "$49", rating: 4.2, downloads: 345, categorie: "Inventaire", pilier: "Argent", description: "Rapprochement des ventes et du stock presume, ecarts identifies.", type: "mission" },
  { id: "pb-053", nom: "Commande reapprovisionnement", departement: "COOB", bots: ["Olivier", "Frank"], etapes: 5, duree: "20min", niveau: "Quick Win", prix: "Gratuit", rating: 4.4, downloads: 678, categorie: "Achats", pilier: "Argent", description: "Envoi automatise aux fournisseurs approuves quand seuil atteint.", type: "tache" },
  { id: "pb-054", nom: "Logbook entretien preventif", departement: "COOB", bots: ["Olivier", "Paco"], etapes: 6, duree: "25min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 456, categorie: "Maintenance", pilier: "Actif", description: "Suivi de la maintenance preventive de l'equipement avec alertes echeancier.", type: "mission" },
  { id: "pb-055", nom: "Rapport qualite et non-conformite", departement: "COOB", bots: ["Olivier", "Paco"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 345, categorie: "Qualite", pilier: "Actif", description: "Journalisation des defauts et anomalies avec analyse des causes racines.", type: "tache" },
  { id: "pb-056", nom: "Analyse des temps morts", departement: "COOB", bots: ["Olivier", "CarlOS"], etapes: 8, duree: "40min", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 234, categorie: "Amelioration", pilier: "Temps", description: "Identification des inefficacites operationnelles majeures et plan d'action.", type: "diagnostic" },
  { id: "pb-057", nom: "Cartographie des processus", departement: "COOB", bots: ["Olivier", "Tim"], etapes: 10, duree: "2 sem.", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 178, categorie: "Amelioration", pilier: "Temps", description: "Documentation et optimisation de vos processus cles avec goulots identifies.", type: "projet" },
  { id: "pb-058", nom: "Protocole fermeture bureau", departement: "COOB", bots: ["Olivier", "Sebastien"], etapes: 3, duree: "5min", niveau: "Quick Win", prix: "Gratuit", rating: 4.6, downloads: 890, categorie: "Securite", pilier: "Actif", description: "Checklist de securite et desactivation des systemes en fin de journee.", type: "tache" },
  // ═══ PRODUCTION / CPO (Paco) — 9 playbooks ═══
  { id: "pb-060", nom: "Generation BOM (Bill of Materials)", departement: "CPOB", bots: ["Paco", "Frank"], etapes: 6, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.4, downloads: 345, categorie: "Ingenierie", pilier: "Actif", description: "Compilation des intrants necessaires avec couts unitaires et fournisseurs.", type: "document" },
  { id: "pb-061", nom: "Emission ordre de fabrication", departement: "CPOB", bots: ["Paco", "Olivier"], etapes: 7, duree: "20min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 456, categorie: "Production", pilier: "Temps", description: "Lancement officiel et validation des specifications de fabrication.", type: "document" },
  { id: "pb-062", nom: "Controle qualite fin de ligne", departement: "CPOB", bots: ["Paco", "Loulou"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 567, categorie: "Qualite", pilier: "Actif", description: "Inspection visuelle et consignation des resultats avec photos.", type: "tache" },
  { id: "pb-063", nom: "Journalisation rebuts (scrap log)", departement: "CPOB", bots: ["Paco", "Frank"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.2, downloads: 234, categorie: "Qualite", pilier: "Argent", description: "Suivi et calcul de la perte financiere associee aux rebuts de production.", type: "tache" },
  { id: "pb-064", nom: "Planification quarts de travail", departement: "CPOB", bots: ["Paco", "Helene"], etapes: 6, duree: "25min", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 345, categorie: "Planification", pilier: "Temps", description: "Allocation des ressources humaines sur la chaine de production par quarts.", type: "mission" },
  { id: "pb-065", nom: "Calcul capacite production", departement: "CPOB", bots: ["Paco", "Olivier"], etapes: 7, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 234, categorie: "Planification", pilier: "Temps", description: "Evaluation de la charge vs ressources disponibles avec goulots identifies.", type: "diagnostic" },
  { id: "pb-066", nom: "Mise en place 5S usine", departement: "CPOB", bots: ["Paco", "Olivier"], etapes: 15, duree: "4 sem.", niveau: "Enterprise", prix: "$199", rating: 4.4, downloads: 89, categorie: "Lean", pilier: "Temps", description: "Implementation complete de la methodologie 5S avec audits et suivi.", type: "chantier" },
  { id: "pb-067", nom: "Brief ingenierie prototype", departement: "CPOB", bots: ["Paco", "Ines"], etapes: 8, duree: "40min", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 178, categorie: "R&D", pilier: "Idee", description: "Demande de creation pour de nouveaux modeles avec specs et criteres.", type: "document" },
  { id: "pb-068", nom: "Tracabilite modifications recette", departement: "CPOB", bots: ["Paco", "Ines"], etapes: 6, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 123, categorie: "Qualite", pilier: "Actif", description: "Suivi des versions d'assemblage ou de formulation avec approbations.", type: "flow" },
  // ═══ RH / CHRO (Helene) — 9 playbooks ═══
  { id: "pb-070", nom: "Redaction offre d'emploi", departement: "CHROB", bots: ["Helene", "Mathilde"], etapes: 5, duree: "20min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 789, categorie: "Recrutement", pilier: "Actif", description: "Structure du profil recherche, exigences et affichage multi-plateformes.", type: "document" },
  { id: "pb-071", nom: "Onboarding RH complet", departement: "CHROB", bots: ["Helene", "Loulou"], etapes: 9, duree: "40min", niveau: "Standard", prix: "Gratuit", rating: 4.7, downloads: 1234, categorie: "Integration", pilier: "Temps", description: "Signature contrat, code de conduite, inscription paie et plan 30-60-90 jours.", type: "flow" },
  { id: "pb-072", nom: "Offboarding employe", departement: "CHROB", bots: ["Helene", "Tim"], etapes: 8, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.4, downloads: 456, categorie: "Depart", pilier: "Actif", description: "Desactivation d'acces, remise de materiel, entrevue de depart structuree.", type: "flow" },
  { id: "pb-073", nom: "Evaluation performance annuelle", departement: "CHROB", bots: ["Helene", "CarlOS"], etapes: 6, duree: "25min", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 567, categorie: "Performance", pilier: "Actif", description: "Generation de la grille d'evaluation avec auto-evaluation et feedback 360.", type: "mission" },
  { id: "pb-074", nom: "Approbation conges et absences", departement: "CHROB", bots: ["Helene", "Olivier"], etapes: 4, duree: "10min", niveau: "Quick Win", prix: "Gratuit", rating: 4.6, downloads: 890, categorie: "Administration", pilier: "Temps", description: "Validation et mise a jour du calendrier d'equipe automatiquement.", type: "tache" },
  { id: "pb-075", nom: "Alerte echeance formation CNESST", departement: "CHROB", bots: ["Helene", "Loulou"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.3, downloads: 345, categorie: "Conformite", pilier: "Actif", description: "Suivi des certifications de securite obligatoires avec rappels automatiques.", type: "tache" },
  { id: "pb-076", nom: "Sondage climat de travail", departement: "CHROB", bots: ["Helene", "Simone"], etapes: 7, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 234, categorie: "Culture", pilier: "Actif", description: "Elaboration de questions anonymes, agregation des resultats et recommandations.", type: "diagnostic" },
  { id: "pb-077", nom: "Declaration accident travail CNESST", departement: "CHROB", bots: ["Helene", "Loulou"], etapes: 8, duree: "35min", niveau: "Standard", prix: "Gratuit", rating: 4.2, downloads: 178, categorie: "Conformite", pilier: "Argent", description: "Aide au remplissage du formulaire officiel CNESST avec documentation requise.", type: "document" },
  { id: "pb-078", nom: "Evaluation performance 360", departement: "CHROB", bots: ["Helene", "CarlOS"], etapes: 8, duree: "1 sem.", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 345, categorie: "Performance", pilier: "Actif", description: "Processus complet avec auto-evaluation, feedback collegues et plan de developpement.", type: "mission" },
  // ═══ INNOVATION / CINO (Ines) — 8 playbooks ═══
  { id: "pb-080", nom: "Brainstorming nouveau produit", departement: "CINOB", bots: ["Ines", "Mathilde"], etapes: 6, duree: "40min", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 567, categorie: "Ideation", pilier: "Idee", description: "Seance d'ideation structuree avec matrice de filtres et scoring.", type: "conference" },
  { id: "pb-081", nom: "Recherche anteriorite brevets", departement: "CINOB", bots: ["Ines", "Loulou"], etapes: 5, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 178, categorie: "PI", pilier: "Actif", description: "Balayage preliminaire des bases de donnees publiques de brevets.", type: "diagnostic" },
  { id: "pb-082", nom: "Triage boite a idees", departement: "CINOB", bots: ["Ines", "CarlOS"], etapes: 4, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 789, categorie: "Ideation", pilier: "Idee", description: "Evaluation rapide des suggestions de l'equipe avec criteres de faisabilite.", type: "tache" },
  { id: "pb-083", nom: "Synthese veille technologique", departement: "CINOB", bots: ["Ines", "Tim"], etapes: 5, duree: "20min", niveau: "Quick Win", prix: "Gratuit", rating: 4.4, downloads: 456, categorie: "Veille", pilier: "Idee", description: "Compilation des avancees recentes du secteur avec impact potentiel.", type: "diagnostic" },
  { id: "pb-084", nom: "Evaluation faisabilite technique", departement: "CINOB", bots: ["Ines", "Tim"], etapes: 7, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 234, categorie: "R&D", pilier: "Idee", description: "Analyse d'un nouveau concept de processus avec criteres go/no-go.", type: "diagnostic" },
  { id: "pb-085", nom: "Tracking heures R&D (RS&DE)", departement: "CINOB", bots: ["Ines", "Frank"], etapes: 5, duree: "20min", niveau: "Quick Win", prix: "Gratuit", rating: 4.6, downloads: 345, categorie: "Fiscalite", pilier: "Argent", description: "Log pour recuperation de credits d'impot RS&DE federal et provincial.", type: "flow" },
  { id: "pb-086", nom: "Sprint Design Thinking", departement: "CINOB", bots: ["Ines", "Mathilde", "Rich"], etapes: 10, duree: "1 sem.", niveau: "Avance", prix: "$99", rating: 4.8, downloads: 234, categorie: "Innovation", pilier: "Idee", description: "Sprint de 5 jours base sur le Design Thinking avec livrables concrets.", type: "projet" },
  { id: "pb-087", nom: "Definition POC (Preuve de concept)", departement: "CINOB", bots: ["Ines", "Paco"], etapes: 6, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.4, downloads: 345, categorie: "R&D", pilier: "Idee", description: "Etablissement des criteres de succes et plan d'execution du POC.", type: "document" },
  // ═══ JURIDIQUE / CLO (Loulou) — 5 playbooks ═══
  { id: "pb-090", nom: "Conformite Loi 25 (vie privee)", departement: "CLOB", bots: ["Loulou", "Sebastien", "Tim"], etapes: 14, duree: "4 sem.", niveau: "Enterprise", prix: "$199", rating: 4.6, downloads: 567, categorie: "Conformite", pilier: "Actif", description: "Mise en conformite complete: nomination RPRP, inventaire donnees, politique, registre.", type: "chantier" },
  { id: "pb-091", nom: "Redaction NDA mutuel", departement: "CLOB", bots: ["Loulou"], etapes: 4, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 890, categorie: "Contrats", pilier: "Actif", description: "Generation d'un accord de confidentialite bilingue avec clauses standard.", type: "document" },
  { id: "pb-092", nom: "Revue contrat fournisseur", departement: "CLOB", bots: ["Loulou", "Frank"], etapes: 6, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 345, categorie: "Contrats", pilier: "Actif", description: "Analyse des clauses cles, risques et recommandations de negociation.", type: "diagnostic" },
  { id: "pb-093", nom: "Audit conformite reglementaire", departement: "CLOB", bots: ["Loulou", "CarlOS"], etapes: 10, duree: "1 sem.", niveau: "Avance", prix: "$99", rating: 4.4, downloads: 178, categorie: "Conformite", pilier: "Actif", description: "Verification complete des obligations legales par secteur d'activite.", type: "diagnostic" },
  { id: "pb-094", nom: "Protection marque de commerce", departement: "CLOB", bots: ["Loulou", "Ines"], etapes: 8, duree: "2 sem.", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 234, categorie: "PI", pilier: "Actif", description: "Processus de depot de marque avec recherche de disponibilite et suivi.", type: "projet" },
  // ═══ CYBERSECURITE / CISO (Sebastien) — 5 playbooks ═══
  { id: "pb-100", nom: "Audit securite baseline", departement: "CISOB", bots: ["Sebastien", "Tim"], etapes: 10, duree: "1 sem.", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 345, categorie: "Audit", pilier: "Actif", description: "Evaluation de votre posture de securite: MFA, sauvegardes, acces, vulnerabilites.", type: "diagnostic" },
  { id: "pb-101", nom: "Plan reponse incidents cyber", departement: "CISOB", bots: ["Sebastien", "Tim", "Loulou"], etapes: 12, duree: "2 sem.", niveau: "Avance", prix: "$99", rating: 4.6, downloads: 178, categorie: "Gestion crise", pilier: "Actif", description: "Isolement reseau, evaluation obligations legales, communication de crise.", type: "projet" },
  { id: "pb-102", nom: "Formation anti-hameconnage", departement: "CISOB", bots: ["Sebastien", "Helene"], etapes: 6, duree: "30min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 567, categorie: "Formation", pilier: "Actif", description: "Module de sensibilisation au phishing avec exemples et quiz.", type: "formation" },
  { id: "pb-103", nom: "Revue acces utilisateurs", departement: "CISOB", bots: ["Sebastien", "Tim"], etapes: 5, duree: "20min", niveau: "Quick Win", prix: "Gratuit", rating: 4.3, downloads: 456, categorie: "IAM", pilier: "Actif", description: "Audit des comptes actifs, permissions excessives et comptes orphelins.", type: "tache" },
  { id: "pb-104", nom: "Checklist sauvegarde mensuelle", departement: "CISOB", bots: ["Sebastien"], etapes: 4, duree: "10min", niveau: "Quick Win", prix: "Gratuit", rating: 4.7, downloads: 890, categorie: "Backup", pilier: "Actif", description: "Verification integrite des sauvegardes, test de restauration et rapport.", type: "tache" },
  // ═══ VENTES / CRO (Rich) — 5 playbooks ═══
  { id: "pb-010", nom: "Pipeline prospection B2B", departement: "CROB", bots: ["Rich", "Mathilde"], etapes: 10, duree: "1 sem.", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 567, categorie: "Prospection", pilier: "Vente", description: "Mise en place d'un pipeline B2B structure avec sequences email et relances.", type: "projet" },
  { id: "pb-011", nom: "Onboarding nouveau client", departement: "CROB", bots: ["Rich", "Olivier"], etapes: 8, duree: "2 sem.", niveau: "Standard", prix: "Gratuit", rating: 4.4, downloads: 345, categorie: "Service client", pilier: "Vente", description: "Processus d'accueil structure avec checklist et follow-ups automatises.", type: "flow" },
  { id: "pb-012", nom: "Closing accelerator", departement: "CROB", bots: ["Rich", "Simone"], etapes: 6, duree: "3 jours", niveau: "Avance", prix: "$99", rating: 4.9, downloads: 178, categorie: "Negociation", pilier: "Vente", description: "Techniques avancees de closing avec analyse objections et scripts personnalises.", type: "formation" },
  { id: "pb-013", nom: "Qualification leads BANT", departement: "CROB", bots: ["Rich", "CarlOS"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 890, categorie: "Qualification", pilier: "Vente", description: "Grille Budget-Autorite-Need-Timeline pour qualifier rapidement les opportunites.", type: "tache" },
  { id: "pb-014", nom: "Win/Loss analysis post-vente", departement: "CROB", bots: ["Rich", "Simone"], etapes: 7, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 234, categorie: "Analytics", pilier: "Vente", description: "Analyse post-mortem des ventes gagnees et perdues avec patterns identifies.", type: "diagnostic" },
  // ═══ CONFERENCE AI — 5 playbooks ═══
  { id: "pb-200", nom: "Board Room — Revue strategique", departement: "CEOB", bots: ["CarlOS", "Simone", "Frank", "Rich"], etapes: 6, duree: "2h", niveau: "Standard", prix: "Gratuit", rating: 4.9, downloads: 1234, categorie: "Conference AI", pilier: "Idee", description: "Session de board avec 4 bots pour revue strategique trimestrielle.", type: "conference" },
  { id: "pb-201", nom: "Brainstorm innovation produit", departement: "CINOB", bots: ["Ines", "Mathilde", "Tim", "CarlOS"], etapes: 4, duree: "1h", niveau: "Quick Win", prix: "Gratuit", rating: 4.8, downloads: 890, categorie: "Conference AI", pilier: "Idee", description: "Session collaborative multi-bots pour generer des idees produit disruptives.", type: "conference" },
  { id: "pb-202", nom: "Coaching leadership 1-on-1", departement: "CEOB", bots: ["CarlOS"], etapes: 8, duree: "45min", niveau: "Quick Win", prix: "Gratuit", rating: 4.7, downloads: 567, categorie: "Conference AI", pilier: "Actif", description: "Session de coaching personnalisee sur le leadership avec exercices pratiques.", type: "conference" },
  { id: "pb-203", nom: "War Room — Gestion de crise", departement: "CEOB", bots: ["CarlOS", "Sebastien", "Loulou", "Frank"], etapes: 8, duree: "1h", niveau: "Standard", prix: "Gratuit", rating: 4.8, downloads: 345, categorie: "Conference AI", pilier: "Actif", description: "Session d'urgence multi-bots pour gerer une crise avec plan d'action immediat.", type: "conference" },
  { id: "pb-204", nom: "Podcast interne — Culture talk", departement: "CHROB", bots: ["Helene", "CarlOS"], etapes: 6, duree: "30min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 234, categorie: "Conference AI", pilier: "Actif", description: "Format podcast pour discuter culture, valeurs et engagement d'equipe.", type: "conference" },
  // ═══ TRANSVERSAUX — Playbooks multi-departements ═══
  { id: "pb-300", nom: "Audit annuel complet", departement: "CEOB", bots: ["CarlOS", "Frank", "Loulou", "Sebastien", "Tim"], etapes: 25, duree: "3 mois", niveau: "Enterprise", prix: "$299", rating: 4.8, downloads: 156, categorie: "Audit", pilier: "Actif", description: "Orchestration transversale: lasses fiscales, revue contrats, audit acces, conformite ISO.", type: "chantier" },
  { id: "pb-301", nom: "Go-To-Market nouveau produit", departement: "CMOB", bots: ["Mathilde", "Rich", "Frank", "Paco", "Simone"], etapes: 18, duree: "6 sem.", niveau: "Enterprise", prix: "$199", rating: 4.7, downloads: 234, categorie: "Lancement", pilier: "Vente", description: "Specs produit + strategie prix + plan marketing + pipeline ventes + formation equipe.", type: "chantier" },
  { id: "pb-302", nom: "Integration nouvel employe complete", departement: "CHROB", bots: ["Helene", "Tim", "Loulou", "Olivier"], etapes: 15, duree: "90 jours", niveau: "Avance", prix: "$49", rating: 4.6, downloads: 567, categorie: "Onboarding", pilier: "Temps", description: "Contrat + acces IT + plan 30-60-90 + formation securite + evaluation probation.", type: "flow" },
  { id: "pb-303", nom: "Dossier reclamation RS&DE", departement: "CINOB", bots: ["Ines", "Frank", "Tim", "Sebastien"], etapes: 14, duree: "4 sem.", niveau: "Enterprise", prix: "$199", rating: 4.5, downloads: 178, categorie: "Fiscalite", pilier: "Argent", description: "Logs techniques, narration scientifique, donnees financieres T661 et credit Quebec.", type: "projet" },
  { id: "pb-304", nom: "Plan d'affaires complet", departement: "CEOB", bots: ["CarlOS", "Frank", "Mathilde", "Simone"], etapes: 20, duree: "2 sem.", niveau: "Avance", prix: "$99", rating: 4.7, downloads: 456, categorie: "Strategie", pilier: "Idee", description: "Synthese executive + projections 3 ans + strategie acquisition + analyse macro.", type: "blueprint" },
  // ═══ COLLABORATION ORBIT⁹ — 20 playbooks réseau ═══
  { id: "pb-O9-001", nom: "Qualification match Orbit⁹", departement: "ORBIT9", bots: ["CarlOS", "Simone"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.7, downloads: 890, categorie: "Jumelage", pilier: "Vente", description: "Scoring automatise d'un match potentiel: VITAA croise, complementarite sectorielle, anti-cartel.", type: "diagnostic" },
  { id: "pb-O9-002", nom: "Creation cellule collaborative", departement: "ORBIT9", bots: ["CarlOS", "Olivier"], etapes: 7, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 567, categorie: "Cellules", pilier: "Actif", description: "Wizard de creation de cellule: nom, type, membres, sous-cellules, gouvernance initiale.", type: "flow" },
  { id: "pb-O9-003", nom: "Onboarding nouveau membre reseau", departement: "ORBIT9", bots: ["CarlOS", "Helene"], etapes: 9, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.8, downloads: 1234, categorie: "Integration", pilier: "Temps", description: "Profil entreprise, qualification AI, criteres REAI, charte reseau, premier jumelage.", type: "flow" },
  { id: "pb-O9-004", nom: "Trisociation LiveKit — Meeting 3 bots", departement: "ORBIT9", bots: ["CarlOS", "Simone", "Rich"], etapes: 6, duree: "1h", niveau: "Standard", prix: "Gratuit", rating: 4.9, downloads: 345, categorie: "Conference AI", pilier: "Idee", description: "Session collaborative avec 3 bots en trisociation pour debloquer un chantier inter-entreprises.", type: "conference" },
  { id: "pb-O9-005", nom: "Evaluation VITAA collectif", departement: "ORBIT9", bots: ["CarlOS"], etapes: 5, duree: "20min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 678, categorie: "Scoring", pilier: "Actif", description: "Calcul du score VITAA agrege de la cellule avec formule e^(V*I*T) et Triangle du Feu.", type: "diagnostic" },
  { id: "pb-O9-006", nom: "Sprint recrutement pionniers", departement: "ORBIT9", bots: ["CarlOS", "Rich", "Mathilde"], etapes: 12, duree: "4 sem.", niveau: "Avance", prix: "$149", rating: 4.7, downloads: 234, categorie: "Pionniers", pilier: "Vente", description: "Plan 30 jours de recrutement des 9 pionniers: rencontres, scripts, urgence progressive.", type: "reseau" },
  { id: "pb-O9-007", nom: "Negociation accord collaboration", departement: "ORBIT9", bots: ["CarlOS", "Loulou", "Frank"], etapes: 8, duree: "1 sem.", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 345, categorie: "Juridique", pilier: "Actif", description: "Structuration des termes: portee, duree, PI, TimeTokens, clause de sortie.", type: "reseau" },
  { id: "pb-O9-008", nom: "Mediation proactive CarlOS", departement: "ORBIT9", bots: ["CarlOS"], etapes: 6, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 456, categorie: "Gouvernance", pilier: "Temps", description: "Detection de tensions en meeting, intervention calibree, generation d'action items.", type: "conference" },
  { id: "pb-O9-009", nom: "Distribution TimeTokens mensuelle", departement: "ORBIT9", bots: ["CarlOS", "Frank"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 567, categorie: "TimeTokens", pilier: "Argent", description: "Calcul des contributions, formule 5D (A*D*I*Z*P), attribution et rapport.", type: "flow" },
  { id: "pb-O9-010", nom: "Audit qualite membre reseau", departement: "ORBIT9", bots: ["CarlOS", "Sebastien"], etapes: 8, duree: "35min", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 234, categorie: "Qualite", pilier: "Actif", description: "Verification certifications, assurances, score reputation, litiges, taux livraison.", type: "diagnostic" },
  { id: "pb-O9-011", nom: "Planification evenement reseau", departement: "ORBIT9", bots: ["CarlOS", "Olivier", "Mathilde"], etapes: 10, duree: "2 sem.", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 178, categorie: "Evenements", pilier: "Actif", description: "Organisation meetup/webinaire: logistique, invitations, contenu, suivi post-evenement.", type: "reseau" },
  { id: "pb-O9-012", nom: "Scoring VITAAFAST cellule", departement: "ORBIT9", bots: ["CarlOS"], etapes: 4, duree: "10min", niveau: "Quick Win", prix: "Gratuit", rating: 4.6, downloads: 789, categorie: "Scoring", pilier: "Actif", description: "Evaluation rapide des 5 piliers VITAA pour une cellule specifique avec benchmarks.", type: "diagnostic" },
  { id: "pb-O9-013", nom: "Rotation roles Orbit⁹ (gouvernance)", departement: "ORBIT9", bots: ["CarlOS", "Olivier"], etapes: 6, duree: "20min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 345, categorie: "Gouvernance", pilier: "Temps", description: "Processus de rotation des 4 roles structurels tous les 90 jours.", type: "flow" },
  { id: "pb-O9-014", nom: "Processus de sortie ordonnee", departement: "ORBIT9", bots: ["CarlOS", "Loulou", "Frank"], etapes: 8, duree: "90 jours", niveau: "Avance", prix: "$99", rating: 4.2, downloads: 123, categorie: "Juridique", pilier: "Argent", description: "Protocole selon la matrice 4 quadrants: rachat TT, transition, PI, succession.", type: "reseau" },
  { id: "pb-O9-015", nom: "Qualification fournisseur invite", departement: "ORBIT9", bots: ["CarlOS", "Sebastien"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.7, downloads: 890, categorie: "Qualification", pilier: "Actif", description: "Validation automatisee: reputation web, NEQ, LinkedIn, references, certifications.", type: "diagnostic" },
  { id: "pb-O9-016", nom: "Session jumelage assiste IA", departement: "ORBIT9", bots: ["CarlOS", "Simone", "Rich"], etapes: 6, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.8, downloads: 567, categorie: "Jumelage", pilier: "Vente", description: "Introduction structuree entre 2 entreprises: brief, presentation croisee, next steps.", type: "conference" },
  { id: "pb-O9-017", nom: "Revue trimestrielle cellule", departement: "ORBIT9", bots: ["CarlOS", "Olivier", "Frank"], etapes: 8, duree: "1h", niveau: "Standard", prix: "Gratuit", rating: 4.5, downloads: 456, categorie: "Performance", pilier: "Temps", description: "Bilan VITAA collectif, ROI chantiers, heures sauvees, objectifs Q+1.", type: "mission" },
  { id: "pb-O9-018", nom: "Anti-cartel compliance check", departement: "ORBIT9", bots: ["CarlOS", "Loulou"], etapes: 4, duree: "10min", niveau: "Quick Win", prix: "Gratuit", rating: 4.4, downloads: 345, categorie: "Conformite", pilier: "Actif", description: "Verification automatique qu'aucune cellule ne cree de monopole sectoriel.", type: "tache" },
  { id: "pb-O9-019", nom: "Ghost Delegate — Briefing bot-to-bot", departement: "ORBIT9", bots: ["CarlOS", "Tim"], etapes: 5, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.6, downloads: 678, categorie: "Delegation", pilier: "Temps", description: "CarlOS prepare et envoie un delegue virtuel pour representer l'entreprise dans une cellule.", type: "flow" },
  { id: "pb-O9-020", nom: "Rapport impact reseau annuel", departement: "ORBIT9", bots: ["CarlOS", "Frank", "Simone"], etapes: 12, duree: "1 sem.", niveau: "Avance", prix: "$99", rating: 4.7, downloads: 234, categorie: "Reporting", pilier: "Argent", description: "Bilan complet: economie collective, connexions B2B, ROI reseau, croissance 9→81.", type: "document" },
  // ═══ CONFERENCE AI — 222 Playbooks V4 (Mega-Prompt Gemini Deep Search) ═══
  // --- VENTE & REVENUS (12 playbooks) ---
  { id: "pb-CMOB-VENT-008", nom: "Création Script Cold Call", departement: "CMOB", bots: ["Mathilde"], etapes: 3, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.5, downloads: 567, categorie: "Vente", description: "Arbre de décision téléphonique", pilier: "Vente", type: "conference" },
  { id: "pb-CMOB-VENT-012", nom: "Création Campagne de Réactivation", departement: "CMOB", bots: ["Mathilde"], etapes: 3, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.8, downloads: 308, categorie: "Vente", description: "Séquence courriels de relance", pilier: "Vente", type: "conference" },
  { id: "pb-CROB-VENT-001", nom: "Pitch Deck Animé", departement: "CROB", bots: ["CarlOS"], etapes: 3, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 363, categorie: "Vente", description: "Rapport dengagement client", pilier: "Vente", type: "conference" },
  { id: "pb-CROB-VENT-002", nom: "Démo Produit Live", departement: "CROB", bots: ["Rich"], etapes: 3, duree: "30min", niveau: "Avance", prix: "$99", rating: 4.7, downloads: 758, categorie: "Vente", description: "Vidéo indexée, scoring", pilier: "Vente", type: "conference" },
  { id: "pb-CROB-VENT-003", nom: "Closing Assisté", departement: "CROB", bots: ["Rich", "CarlOS"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.6, downloads: 778, categorie: "Vente", description: "Transcrit annoté", pilier: "Vente", type: "conference" },
  { id: "pb-CROB-VENT-004", nom: "Follow-up Automatique", departement: "CROB", bots: ["Mathilde"], etapes: 3, duree: "15min", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 329, categorie: "Vente", description: "Séquence courriels CRM", pilier: "Vente", type: "conference" },
  { id: "pb-CROB-VENT-005", nom: "Qualification CREDO", departement: "CROB", bots: ["CarlOS"], etapes: 3, duree: "20min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 365, categorie: "Vente", description: "Fiche BANT validée", pilier: "Vente", type: "conference" },
  { id: "pb-CROB-VENT-006", nom: "War Room Négociation", departement: "CROB", bots: ["Rich", "Simone"], etapes: 2, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.8, downloads: 657, categorie: "Vente", description: "Grille tactique", pilier: "Vente", type: "conference" },
  { id: "pb-CROB-VENT-007", nom: "Revue de Compte Stratégique", departement: "CROB", bots: ["Rich"], etapes: 3, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 642, categorie: "Vente", description: "Plan de compte (Account Plan)", pilier: "Vente", type: "conference" },
  { id: "pb-CROB-VENT-009", nom: "Audit Pipeline Ventes", departement: "CROB", bots: ["Rich", "Frank"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 1068, categorie: "Vente", description: "Prévision de ventes (Forecast) ajustée", pilier: "Vente", type: "conference" },
  { id: "pb-CROB-VENT-010", nom: "Négociation Renouvellement SaaS", departement: "CROB", bots: ["Rich"], etapes: 3, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 1164, categorie: "Vente", description: "Argumentaire de rétention", pilier: "Vente", type: "conference" },
  { id: "pb-CROB-VENT-011", nom: "Post-Mortem Deal Perdu", departement: "CROB", bots: ["Rich"], etapes: 3, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 1103, categorie: "Vente", description: "Rapport danalyse compétitive", pilier: "Vente", type: "conference" },
  // --- PODCAST (6 playbooks) ---
  { id: "pb-CMOB-POD-001", nom: "Studio Podcast Complet", departement: "CMOB", bots: ["Mathilde"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.6, downloads: 763, categorie: "Podcast", description: "Fichiers HD séparés", pilier: "Idee", type: "conference" },
  { id: "pb-CMOB-POD-002", nom: "Auto-Clip & Distribution", departement: "CMOB", bots: ["Mathilde"], etapes: 3, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.4, downloads: 810, categorie: "Podcast", description: "5 Shorts/Reels verticaux", pilier: "Idee", type: "conference" },
  { id: "pb-CMOB-POD-003", nom: "Calendrier Éditorial Annuel", departement: "CMOB", bots: ["Mathilde"], etapes: 3, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 1137, categorie: "Podcast", description: "Charte de publication (Gantt)", pilier: "Idee", type: "conference" },
  { id: "pb-CMOB-POD-005", nom: "SEO Épisode Audio", departement: "CMOB", bots: ["Tim", "Mathilde"], etapes: 3, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.7, downloads: 938, categorie: "Podcast", description: "Notes démission (Show notes)", pilier: "Idee", type: "conference" },
  { id: "pb-CMOB-POD-006", nom: "pb-CMOB-POD-006", departement: "CMOB", bots: ["CarlOS"], etapes: 6, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 489, categorie: "Podcast", description: "Conference AI - pb-CMOB-POD-006", pilier: "Idee", type: "conference" },
  { id: "pb-GHOST-POD-006", nom: "Podcast Cognitif", departement: "CEOB", bots: ["CarlOS"], etapes: 3, duree: "45min", niveau: "Enterprise", prix: "$299", rating: 4.8, downloads: 627, categorie: "Podcast", description: "Épisode audio de lavatar", pilier: "Idee", type: "conference" },
  // --- CONTENU & PODCAST (15 playbooks) ---
  { id: "pb-CFOB-CONT-017", nom: "Rapport Annuel Investisseurs", departement: "CFOB", bots: ["Frank", "Mathilde"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.3, downloads: 510, categorie: "Contenu", description: "Squelette du rapport financier", pilier: "Actif", type: "document" },
  { id: "pb-CHROB-CONT-015", nom: "Audit Marque Employeur", departement: "CHROB", bots: ["Helene"], etapes: 2, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.7, downloads: 481, categorie: "Contenu", description: "Diagnostic dattractivité RH", pilier: "Actif", type: "document" },
  { id: "pb-CINOB-CONT-020", nom: "Dossier de Brevet (Brouillon)", departement: "CINOB", bots: ["Ines", "Loulou"], etapes: 2, duree: "2h", niveau: "Enterprise", prix: "$149", rating: 4.6, downloads: 1129, categorie: "Contenu", description: "Pré-dossier propriété intellectuelle", pilier: "Actif", type: "document" },
  { id: "pb-CLOB-CONT-018", nom: "Rédaction Contrat Standardisé", departement: "CLOB", bots: ["Loulou"], etapes: 3, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 738, categorie: "Contenu", description: "Template (NDA, Prestation)", pilier: "Actif", type: "document" },
  { id: "pb-CMOB-CONT-007", nom: "Rédaction Article Expert", departement: "CMOB", bots: ["Mathilde"], etapes: 3, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.5, downloads: 458, categorie: "Contenu", description: "Article SEO de 1500 mots", pilier: "Actif", type: "document" },
  { id: "pb-CMOB-CONT-008", nom: "Copywriting Landing Page", departement: "CMOB", bots: ["Mathilde"], etapes: 2, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.9, downloads: 852, categorie: "Contenu", description: "Wireframe textuel", pilier: "Actif", type: "document" },
  { id: "pb-CMOB-CONT-009", nom: "Script Vidéo Corporative", departement: "CMOB", bots: ["Mathilde"], etapes: 3, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 1163, categorie: "Contenu", description: "Scénario à deux colonnes (A/V)", pilier: "Actif", type: "document" },
  { id: "pb-CMOB-CONT-010", nom: "Séquence Lead Nurturing", departement: "CMOB", bots: ["Mathilde"], etapes: 2, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 1051, categorie: "Contenu", description: "Drip campaign formatée", pilier: "Actif", type: "document" },
  { id: "pb-CMOB-CONT-011", nom: "Audit SEO Sémantique", departement: "CMOB", bots: ["Tim"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.9, downloads: 715, categorie: "Contenu", description: "Plan de correction technique", pilier: "Actif", type: "document" },
  { id: "pb-CMOB-CONT-012", nom: "Ghostwriting LinkedIn B2B", departement: "CMOB", bots: ["Mathilde"], etapes: 3, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.2, downloads: 969, categorie: "Contenu", description: "12 publications formatées", pilier: "Actif", type: "document" },
  { id: "pb-CMOB-CONT-013", nom: "Création Étude de Cas (Case Study)", departement: "CMOB", bots: ["Mathilde"], etapes: 3, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 565, categorie: "Contenu", description: "Document PDF prêt à designer", pilier: "Actif", type: "document" },
  { id: "pb-CMOB-CONT-014", nom: "Préparation Webinaire Live", departement: "CMOB", bots: ["Mathilde"], etapes: 2, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 782, categorie: "Contenu", description: "Conducteur (Run of Show)", pilier: "Actif", type: "document" },
  { id: "pb-CPOB-CONT-019", nom: "Manuel d'Instructions Produit", departement: "CPOB", bots: ["Paco"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 346, categorie: "Contenu", description: "Livret utilisateur (User Guide)", pilier: "Actif", type: "document" },
  { id: "pb-CROSS-CONT-021", nom: "Livre Blanc (Whitepaper) Industrie", departement: "ORBIT9", bots: ["Mathilde", "Tim"], etapes: 3, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 445, categorie: "Contenu", description: "Document de recherche de 10 pages", pilier: "Actif", type: "document" },
  { id: "pb-CTOB-CONT-016", nom: "Documentation API Technique", departement: "CTOB", bots: ["Tim"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 995, categorie: "Contenu", description: "Doc Swagger/OpenAPI", pilier: "Actif", type: "document" },
  // --- PRE-ENTREVUE & RH (9 playbooks) ---
  { id: "pb-CHROB-PRE-001", nom: "Entrevue Candidat Complète", departement: "CHROB", bots: ["Helene"], etapes: 3, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.8, downloads: 720, categorie: "Pre-entrevue", description: "Enregistrement et score", pilier: "Actif", type: "conference" },
  { id: "pb-CHROB-PRE-002", nom: "Grille FAAS-F (Fit Culturel)", departement: "CHROB", bots: ["Helene"], etapes: 2, duree: "15min", niveau: "Quick Win", prix: "Gratuit", rating: 4.3, downloads: 824, categorie: "Pre-entrevue", description: "Score dalignement culturel", pilier: "Actif", type: "conference" },
  { id: "pb-CHROB-PRE-003", nom: "Rapport Structuré Exécutif", departement: "CHROB", bots: ["Helene"], etapes: 3, duree: "10min", niveau: "Quick Win", prix: "Gratuit", rating: 4.3, downloads: 458, categorie: "Pre-entrevue", description: "Fiche de recommandation", pilier: "Actif", type: "conference" },
  { id: "pb-CHROB-PRE-004", nom: "Shortlist CV Automatisée", departement: "CHROB", bots: ["CarlOS"], etapes: 3, duree: "20min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 416, categorie: "Pre-entrevue", description: "Tableau de candidats qualifiés", pilier: "Actif", type: "conference" },
  { id: "pb-CHROB-PRE-006", nom: "Prise de Références Automatisée", departement: "CHROB", bots: ["Helene"], etapes: 2, duree: "20min", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 456, categorie: "Pre-entrevue", description: "Rapport de vérification dantécédents", pilier: "Actif", type: "conference" },
  { id: "pb-CHROB-PRE-012", nom: "Entrevue de Départ", departement: "CHROB", bots: ["CarlOS"], etapes: 4, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 338, categorie: "Pre-entrevue", description: "Conference AI - Entrevue de Départ", pilier: "Actif", type: "conference" },
  { id: "pb-CMOB-PRE-014", nom: "Simulation Cas Marketing", departement: "CMOB", bots: ["Mathilde"], etapes: 3, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 486, categorie: "Pre-entrevue", description: "Évaluation de la pensée stratégique", pilier: "Actif", type: "conference" },
  { id: "pb-CPOB-PRE-013", nom: "Simulation Technique Usine", departement: "CPOB", bots: ["Paco"], etapes: 2, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 686, categorie: "Pre-entrevue", description: "Score de conformité SST", pilier: "Actif", type: "conference" },
  { id: "pb-CTOB-PRE-005", nom: "Simulation Technique Programmation", departement: "CTOB", bots: ["Tim"], etapes: 2, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.8, downloads: 948, categorie: "Pre-entrevue", description: "Évaluation des capacités de code", pilier: "Actif", type: "conference" },
  // --- RESSOURCES HUMAINES (6 playbooks) ---
  { id: "pb-CHROB-RH-007", nom: "Rédaction Offre d'Emploi", departement: "CHROB", bots: ["Helene"], etapes: 3, duree: "15min", niveau: "Standard", prix: "Gratuit", rating: 4.4, downloads: 1048, categorie: "Ressources humaines", description: "Description de poste publiée", pilier: "Actif", type: "conference" },
  { id: "pb-CHROB-RH-008", nom: "Création Grille Salariale", departement: "CHROB", bots: ["Frank", "Helene"], etapes: 2, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.9, downloads: 1147, categorie: "Ressources humaines", description: "Matrice de rémunération", pilier: "Actif", type: "conference" },
  { id: "pb-CHROB-RH-009", nom: "Audit Loi Équité Salariale", departement: "CHROB", bots: ["Helene", "Loulou"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 808, categorie: "Ressources humaines", description: "Déclaration CNESST déquité", pilier: "Actif", type: "conference" },
  { id: "pb-CHROB-RH-010", nom: "Cartographie de Relève (Succession)", departement: "CHROB", bots: ["Helene"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 1103, categorie: "Ressources humaines", description: "Matrice de plan de relève (9-box)", pilier: "Actif", type: "conference" },
  { id: "pb-CHROB-RH-011", nom: "Sondage eNPS (Engagement)", departement: "CHROB", bots: ["Helene"], etapes: 3, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 566, categorie: "Ressources humaines", description: "Score net de promoteur employé", pilier: "Actif", type: "conference" },
  { id: "pb-CHROB-RH-012", nom: "Entrevue de Départ (Offboarding)", departement: "CHROB", bots: ["Helene"], etapes: 2, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.5, downloads: 545, categorie: "Ressources humaines", description: "Rapport dattrition (Churn report)", pilier: "Actif", type: "conference" },
  // --- CREATIVITE & INNOVATION (29 playbooks) ---
  { id: "pb-CEOB-CREA-003", nom: "pb-CEOB-CREA-003", departement: "CEOB", bots: ["CarlOS"], etapes: 4, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.2, downloads: 381, categorie: "Creativite", description: "Conference AI - pb-CEOB-CREA-003", pilier: "Idee", type: "conference" },
  { id: "pb-CEOB-CREA-005", nom: "Lightning Decision Jam (LDJ) Dirigeants", departement: "CEOB", bots: ["CarlOS"], etapes: 3, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 504, categorie: "Creativite", description: "Plan daction priorisé et assigné", pilier: "Idee", type: "conference" },
  { id: "pb-CFOB-CREA-009", nom: "Six Hats Investissement (CAPEX)", departement: "CFOB", bots: ["Frank"], etapes: 1, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 534, categorie: "Creativite", description: "Mémorandum dinvestissement", pilier: "Idee", type: "conference" },
  { id: "pb-CFOB-CREA-017", nom: "Kaizen Blitz (Jour 1-2) Planification", departement: "CFOB", bots: ["Frank"], etapes: 2, duree: "1h", niveau: "Enterprise", prix: "$149", rating: 4.8, downloads: 821, categorie: "Creativite", description: "Diagnostic de létat présent.29", pilier: "Idee", type: "conference" },
  { id: "pb-CFOB-CREA-018", nom: "Kaizen Blitz (Jour 3-5) Exécution", departement: "CFOB", bots: ["Frank"], etapes: 3, duree: "1h", niveau: "Enterprise", prix: "$149", rating: 4.5, downloads: 293, categorie: "Creativite", description: "Nouveau standard de travail", pilier: "Idee", type: "conference" },
  { id: "pb-CHROB-CREA-007", nom: "LDJ Rétention RH", departement: "CHROB", bots: ["Helene"], etapes: 2, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 419, categorie: "Creativite", description: "Initiatives RH immédiates", pilier: "Idee", type: "conference" },
  { id: "pb-CHROB-CREA-024", nom: "Design de Parcours Employé", departement: "CHROB", bots: ["Helene"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 744, categorie: "Creativite", description: "Blueprint de lexpérience RH", pilier: "Idee", type: "conference" },
  { id: "pb-CINOB-CREA-001", nom: "Design Thinking (Atelier Complet)", departement: "CINOB", bots: ["Ines"], etapes: 4, duree: "2h", niveau: "Avance", prix: "$99", rating: 4.4, downloads: 1111, categorie: "Creativite", description: "Concept de solution testable", pilier: "Idee", type: "conference" },
  { id: "pb-CINOB-CREA-002", nom: "SCAMPER Méthode Produit", departement: "CINOB", bots: ["Ines"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 333, categorie: "Creativite", description: "7 concepts dérivés", pilier: "Idee", type: "conference" },
  { id: "pb-CINOB-CREA-007", nom: "Trisociation Koestler", departement: "CINOB", bots: ["CarlOS"], etapes: 7, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.4, downloads: 703, categorie: "Creativite", description: "Conference AI - Trisociation Koestler", pilier: "Idee", type: "conference" },
  { id: "pb-CINOB-CREA-014", nom: "Trisociation de Koestler (R&D)", departement: "CINOB", bots: ["Ines"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 140, categorie: "Creativite", description: "Description de brevet/concept.16", pilier: "Idee", type: "conference" },
  { id: "pb-CISOB-CREA-019", nom: "Red Team Exercice (Cybersécurité)", departement: "CISOB", bots: ["Sebastien"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.4, downloads: 552, categorie: "Creativite", description: "Rapport de failles critiques", pilier: "Idee", type: "conference" },
  { id: "pb-CLOB-CREA-010", nom: "Six Hats Risque Légal", departement: "CLOB", bots: ["Loulou"], etapes: 1, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 937, categorie: "Creativite", description: "Recommandation de révision de clause", pilier: "Idee", type: "conference" },
  { id: "pb-CMOB-CREA-004", nom: "SCAMPER Campagne Marketing", departement: "CMOB", bots: ["Mathilde"], etapes: 2, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 967, categorie: "Creativite", description: "Nouvelle stratégie publicitaire", pilier: "Idee", type: "conference" },
  { id: "pb-CMOB-CREA-005", nom: "Reverse Brainstorming", departement: "CMOB", bots: ["CarlOS"], etapes: 6, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 881, categorie: "Creativite", description: "Conference AI - Reverse Brainstorming", pilier: "Idee", type: "conference" },
  { id: "pb-CMOB-CREA-011", nom: "Reverse Brainstorming Produit", departement: "CMOB", bots: ["Mathilde"], etapes: 2, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 150, categorie: "Creativite", description: "Liste dinnovations défensives", pilier: "Idee", type: "conference" },
  { id: "pb-CMOB-CREA-015", nom: "Trisociation Marketing", departement: "CMOB", bots: ["Mathilde"], etapes: 1, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 1037, categorie: "Creativite", description: "Pitch de campagne disruptive", pilier: "Idee", type: "conference" },
  { id: "pb-CMOB-CREA-022", nom: "Futuristic Thinking (3 Horizons)", departement: "CMOB", bots: ["Mathilde"], etapes: 4, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 463, categorie: "Creativite", description: "Vision stratégique H3", pilier: "Idee", type: "conference" },
  { id: "pb-COOB-CREA-006", nom: "LDJ Opérationnel (Logistique)", departement: "COOB", bots: ["Olivier"], etapes: 3, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 1191, categorie: "Creativite", description: "Tâches correctives d'usine", pilier: "Idee", type: "conference" },
  { id: "pb-CPOB-CREA-021", nom: "Crazy 8s (Sketching UX/Design)", departement: "CPOB", bots: ["Paco"], etapes: 3, duree: "15min", niveau: "Standard", prix: "Gratuit", rating: 4.9, downloads: 1124, categorie: "Creativite", description: "8 maquettes ou wireframes basiques", pilier: "Idee", type: "conference" },
  { id: "pb-CROB-CREA-012", nom: "Reverse Brainstorming Ventes", departement: "CROB", bots: ["Rich"], etapes: 2, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 158, categorie: "Creativite", description: "Procédure de sauvetage client", pilier: "Idee", type: "conference" },
  { id: "pb-CROSS-CREA-013", nom: "World Café Method", departement: "ORBIT9", bots: ["CarlOS"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.8, downloads: 456, categorie: "Creativite", description: "Fresque didées unifiée", pilier: "Idee", type: "conference" },
  { id: "pb-CSOB-CREA-008", nom: "Six Thinking Hats (Général)", departement: "CSOB", bots: ["Simone"], etapes: 1, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.8, downloads: 191, categorie: "Creativite", description: "Bilan analytique 360°.25", pilier: "Idee", type: "conference" },
  { id: "pb-CSOB-CREA-020", nom: "Red Team Stratégie d'Affaires", departement: "CSOB", bots: ["Simone"], etapes: 2, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.7, downloads: 513, categorie: "Creativite", description: "Stratégie de mitigation", pilier: "Idee", type: "conference" },
  { id: "pb-CSOB-CREA-023", nom: "Blue Ocean Strategy Formulation", departement: "CSOB", bots: ["Simone"], etapes: 2, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.4, downloads: 898, categorie: "Creativite", description: "Proposition de valeur Blue Ocean", pilier: "Idee", type: "conference" },
  { id: "pb-CSOB-CREA-025", nom: "Business Model Canvas (Création)", departement: "CSOB", bots: ["Simone"], etapes: 3, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.9, downloads: 1190, categorie: "Creativite", description: "BMC complété et exportable", pilier: "Idee", type: "conference" },
  { id: "pb-CSOB-CREA-026", nom: "Business Model Canvas", departement: "CSOB", bots: ["CarlOS"], etapes: 6, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.9, downloads: 338, categorie: "Creativite", description: "Conference AI - Business Model Canvas", pilier: "Idee", type: "conference" },
  { id: "pb-CTOB-CREA-003", nom: "SCAMPER Processus TI", departement: "CTOB", bots: ["Tim"], etapes: 1, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 876, categorie: "Creativite", description: "Nouveau diagramme de flux optimisé", pilier: "Idee", type: "conference" },
  { id: "pb-CTOB-CREA-016", nom: "Hackathon Express (Développement)", departement: "CTOB", bots: ["Tim"], etapes: 3, duree: "2h", niveau: "Avance", prix: "$99", rating: 4.8, downloads: 544, categorie: "Creativite", description: "Code brut (Minimum Viable Product)", pilier: "Idee", type: "conference" },
  // --- MEDIATION (22 playbooks) ---
  { id: "pb-CEOB-MED-015", nom: "Médiation Conseil d'Administration", departement: "CEOB", bots: ["CarlOS"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.8, downloads: 1044, categorie: "Mediation", description: "Résolution unanime du CA", pilier: "Actif", type: "conference" },
  { id: "pb-CFOB-MED-008", nom: "Médiation Conflit Budgétaire", departement: "CFOB", bots: ["Frank"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 864, categorie: "Mediation", description: "Réallocation des fonds", pilier: "Actif", type: "conference" },
  { id: "pb-CHROB-MED-002", nom: "Médiation Interpersonnelle (RH)", departement: "CHROB", bots: ["Helene"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.8, downloads: 717, categorie: "Mediation", description: "Charte dinteraction", pilier: "Actif", type: "conference" },
  { id: "pb-CHROB-MED-003", nom: "Médiation Syndicale (Grief)", departement: "CHROB", bots: ["Helene"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.7, downloads: 739, categorie: "Mediation", description: "Accord de grief", pilier: "Actif", type: "conference" },
  { id: "pb-CHROB-MED-012", nom: "Médiation Harcèlement Psychologique", departement: "CHROB", bots: ["Helene"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.8, downloads: 667, categorie: "Mediation", description: "Rapport préliminaire denquête", pilier: "Actif", type: "conference" },
  { id: "pb-CHROB-MED-016", nom: "Médiation Multigénérationnelle", departement: "CHROB", bots: ["Helene"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 803, categorie: "Mediation", description: "Mode demploi collaboratif déquipe", pilier: "Actif", type: "conference" },
  { id: "pb-CINOB-MED-014", nom: "Médiation Propriété Intellectuelle", departement: "CINOB", bots: ["Ines"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 1048, categorie: "Mediation", description: "Document de cession de droits", pilier: "Actif", type: "conference" },
  { id: "pb-CISOB-MED-010", nom: "Médiation Sécurité vs Opérations", departement: "CISOB", bots: ["Sebastien"], etapes: 2, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.2, downloads: 846, categorie: "Mediation", description: "Politique de sécurité ajustée", pilier: "Actif", type: "conference" },
  { id: "pb-CLOB-MED-001", nom: "Médiation Commerciale (B2B)", departement: "CLOB", bots: ["Loulou"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.5, downloads: 730, categorie: "Mediation", description: "Entente de règlement", pilier: "Actif", type: "conference" },
  { id: "pb-CLOB-MED-011", nom: "Médiation Plainte Client (Escalade)", departement: "CLOB", bots: ["Loulou"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 943, categorie: "Mediation", description: "Offre de compensation acceptée", pilier: "Actif", type: "conference" },
  { id: "pb-CLOB-MED-020", nom: "Médiation Fin de Contrat Bailleur", departement: "CLOB", bots: ["Loulou"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 650, categorie: "Mediation", description: "Entente de résiliation de bail commercial", pilier: "Actif", type: "conference" },
  { id: "pb-CMOB-MED-009", nom: "Médiation Conflit Créatif (Marketing)", departement: "CMOB", bots: ["Mathilde"], etapes: 3, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.8, downloads: 374, categorie: "Mediation", description: "Ligne directrice de campagne validée", pilier: "Actif", type: "conference" },
  { id: "pb-COOB-MED-013", nom: "Médiation Conflit de Plannings", departement: "COOB", bots: ["Olivier"], etapes: 3, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.5, downloads: 758, categorie: "Mediation", description: "Nouveau calendrier de production", pilier: "Actif", type: "conference" },
  { id: "pb-CPOB-MED-006", nom: "Médiation Fournisseur (Pénalités)", departement: "CPOB", bots: ["Paco"], etapes: 3, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 225, categorie: "Mediation", description: "Plan de relance dexpédition", pilier: "Actif", type: "conference" },
  { id: "pb-CPOB-MED-019", nom: "Médiation Qualité vs Quantité", departement: "CPOB", bots: ["Paco"], etapes: 2, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 1102, categorie: "Mediation", description: "Norme de qualité minimale révisée", pilier: "Actif", type: "conference" },
  { id: "pb-CROB-MED-017", nom: "Médiation Conflit de Territoire Ventes", departement: "CROB", bots: ["Rich"], etapes: 3, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.9, downloads: 616, categorie: "Mediation", description: "Règle dattribution actée", pilier: "Actif", type: "conference" },
  { id: "pb-CROSS-MED-004", nom: "Médiation Inter-Départementale", departement: "ORBIT9", bots: ["CarlOS"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 622, categorie: "Mediation", description: "Contrat de service interne (SLA)", pilier: "Actif", type: "conference" },
  { id: "pb-CROSS-MED-018", nom: "Médiation Retour au Bureau (RTO)", departement: "ORBIT9", bots: ["Helene"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 528, categorie: "Mediation", description: "Avenant de télétravail", pilier: "Actif", type: "conference" },
  { id: "pb-CTOB-MED-007", nom: "Médiation Conflit Architectural (TI)", departement: "CTOB", bots: ["Tim"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 653, categorie: "Mediation", description: "Document dArchitecture (ADR)", pilier: "Actif", type: "conference" },
  { id: "pb-DEST-MED-003", nom: "Succession Entreprise Familiale", departement: "CEOB", bots: ["Loulou"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.5, downloads: 703, categorie: "Mediation", description: "Protocole pré-succession", pilier: "Actif", type: "conference" },
  { id: "pb-DEST-MED-005", nom: "Médiation Actionnaires / Associés", departement: "CEOB", bots: ["Loulou"], etapes: 3, duree: "2h", niveau: "Avance", prix: "$99", rating: 4.3, downloads: 226, categorie: "Mediation", description: "Avenant à la convention", pilier: "Actif", type: "conference" },
  { id: "pb-DEST-MED-021", nom: "Médiation Divorce/Séparation Dirigeant", departement: "CEOB", bots: ["Loulou"], etapes: 2, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.9, downloads: 711, categorie: "Mediation", description: "Protocole financier de séparation", pilier: "Actif", type: "conference" },
  // --- GESTION DE CRISE (15 playbooks) ---
  { id: "pb-CEOB-CRISE-008", nom: "Crise Disparition/Décès Dirigeant", departement: "CEOB", bots: ["CarlOS"], etapes: 3, duree: "2h", niveau: "Enterprise", prix: "$149", rating: 4.9, downloads: 109, categorie: "Gestion crise", description: "Plan de continuité des affaires", pilier: "Temps", type: "conference" },
  { id: "pb-CFOB-CRISE-006", nom: "Crise Liquidité (Cashflow) Extrême", departement: "CFOB", bots: ["Frank"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.7, downloads: 822, categorie: "Gestion crise", description: "Plan de sauvetage financier", pilier: "Temps", type: "conference" },
  { id: "pb-CHROB-CRISE-003", nom: "Crise Restructuration/Mises à pied", departement: "CHROB", bots: ["Helene"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.6, downloads: 554, categorie: "Gestion crise", description: "Plan de licenciement massif", pilier: "Temps", type: "conference" },
  { id: "pb-CHROB-CRISE-005", nom: "Crise CNESST (Accident Grave)", departement: "CHROB", bots: ["Helene"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.9, downloads: 694, categorie: "Gestion crise", description: "Rapport préliminaire denquête", pilier: "Temps", type: "conference" },
  { id: "pb-CINOB-CRISE-014", nom: "Crise Vol de Propriété Intellectuelle", departement: "CINOB", bots: ["Ines"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.2, downloads: 414, categorie: "Gestion crise", description: "Dossier de preuve pour litige", pilier: "Temps", type: "conference" },
  { id: "pb-CISOB-CRISE-001", nom: "Crise Cybersécurité Complete", departement: "CISOB", bots: ["Sebastien"], etapes: 4, duree: "2h", niveau: "Enterprise", prix: "$149", rating: 4.7, downloads: 229, categorie: "Gestion crise", description: "Bilan de brèche Loi 25", pilier: "Temps", type: "conference" },
  { id: "pb-CLOB-CRISE-002", nom: "Crise Juridique (PR) ou Scandale", departement: "CLOB", bots: ["Loulou"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.5, downloads: 1027, categorie: "Gestion crise", description: "Kit de Relations Publiques", pilier: "Temps", type: "conference" },
  { id: "pb-CLOB-CRISE-013", nom: "Crise Saisie ou Inspection Fiscale (ARC)", departement: "CLOB", bots: ["Loulou"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.7, downloads: 403, categorie: "Gestion crise", description: "Checklist dinspection gouvernementale", pilier: "Temps", type: "conference" },
  { id: "pb-CMOB-CRISE-010", nom: "Crise Bad Buzz Médias Sociaux", departement: "CMOB", bots: ["Mathilde"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.9, downloads: 528, categorie: "Gestion crise", description: "Protocole de communication sociale", pilier: "Temps", type: "conference" },
  { id: "pb-COOB-CRISE-012", nom: "Crise Grève ou Piquetage", departement: "COOB", bots: ["Olivier"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.6, downloads: 515, categorie: "Gestion crise", description: "Plan de contingence de grève", pilier: "Temps", type: "conference" },
  { id: "pb-CPOB-CRISE-004", nom: "Crise Supply Chain Majeure", departement: "CPOB", bots: ["Paco"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 505, categorie: "Gestion crise", description: "Plan de contingence logistique", pilier: "Temps", type: "conference" },
  { id: "pb-CPOB-CRISE-007", nom: "Crise HACCP / Rappel de Produit", departement: "CPOB", bots: ["Paco"], etapes: 3, duree: "2h", niveau: "Enterprise", prix: "$149", rating: 4.8, downloads: 620, categorie: "Gestion crise", description: "Logistique de rappel de produit", pilier: "Temps", type: "conference" },
  { id: "pb-CROB-CRISE-011", nom: "Crise Perte Client Majeur (80/20)", departement: "CROB", bots: ["Rich"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 348, categorie: "Gestion crise", description: "Plan de redressement commercial", pilier: "Temps", type: "conference" },
  { id: "pb-CROSS-CRISE-015", nom: "Crise Désastre Naturel (Feu/Inondation)", departement: "ORBIT9", bots: ["CarlOS"], etapes: 3, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 569, categorie: "Gestion crise", description: "Déclaration de sinistre complète", pilier: "Temps", type: "conference" },
  { id: "pb-CTOB-CRISE-009", nom: "Crise Panne Majeure Serveurs (Downtime)", departement: "CTOB", bots: ["Tim"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 718, categorie: "Gestion crise", description: "Rapport dincident (Post-mortem)", pilier: "Temps", type: "conference" },
  // --- EXPRESS (29 playbooks) ---
  { id: "pb-CEOB-EXP-006", nom: "Daily Standup Direction", departement: "CEOB", bots: ["CarlOS"], etapes: 3, duree: "15min", niveau: "Standard", prix: "Gratuit", rating: 4.7, downloads: 739, categorie: "Express", description: "Notes directionnelles", pilier: "Temps", type: "conference" },
  { id: "pb-CFOB-EXP-016", nom: "Approbation Budget Express", departement: "CFOB", bots: ["Frank"], etapes: 3, duree: "5min", niveau: "Quick Win", prix: "Gratuit", rating: 4.7, downloads: 175, categorie: "Express", description: "Trace dapprobation financière", pilier: "Temps", type: "conference" },
  { id: "pb-CFOB-EXP-024", nom: "Alerte Dépassement Budget", departement: "CFOB", bots: ["Frank"], etapes: 3, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 583, categorie: "Express", description: "Note de dérogation", pilier: "Temps", type: "conference" },
  { id: "pb-CHROB-EXP-018", nom: "Pouls d'Équipe Flash", departement: "CHROB", bots: ["Helene"], etapes: 2, duree: "5min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 414, categorie: "Express", description: "Indicateur de moral affiché", pilier: "Temps", type: "conference" },
  { id: "pb-CHROB-EXP-023", nom: "Gestion Plainte Flash (Conflit)", departement: "CHROB", bots: ["Helene"], etapes: 2, duree: "15min", niveau: "Standard", prix: "Gratuit", rating: 4.4, downloads: 1096, categorie: "Express", description: "Ouverture de dossier RH", pilier: "Temps", type: "conference" },
  { id: "pb-CISOB-EXP-005", nom: "Triage Urgence Cyber", departement: "CISOB", bots: ["CarlOS"], etapes: 6, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.8, downloads: 106, categorie: "Express", description: "Conference AI - Triage Urgence Cyber", pilier: "Temps", type: "conference" },
  { id: "pb-CISOB-EXP-013", nom: "Triage Urgence Cybersécurité", departement: "CISOB", bots: ["Sebastien"], etapes: 2, duree: "5min", niveau: "Quick Win", prix: "Gratuit", rating: 4.6, downloads: 1023, categorie: "Express", description: "Alerte rouge déclenchée ou verte", pilier: "Temps", type: "conference" },
  { id: "pb-CLOB-EXP-010", nom: "Briefing Juridique Express", departement: "CLOB", bots: ["CarlOS"], etapes: 5, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.7, downloads: 448, categorie: "Express", description: "Conference AI - Briefing Juridique Express", pilier: "Temps", type: "conference" },
  { id: "pb-CLOB-EXP-019", nom: "Briefing Juridique Express", departement: "CLOB", bots: ["Loulou"], etapes: 3, duree: "10min", niveau: "Standard", prix: "Gratuit", rating: 4.7, downloads: 545, categorie: "Express", description: "Avis juridique flash documenté", pilier: "Temps", type: "conference" },
  { id: "pb-CMOB-EXP-004", nom: "Daily Standup Marketing", departement: "CMOB", bots: ["Mathilde"], etapes: 3, duree: "15min", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 361, categorie: "Express", description: "Ajustements de budget média", pilier: "Temps", type: "conference" },
  { id: "pb-CMOB-EXP-021", nom: "Validation Visuel Express", departement: "CMOB", bots: ["Mathilde"], etapes: 3, duree: "5min", niveau: "Quick Win", prix: "Gratuit", rating: 4.3, downloads: 122, categorie: "Express", description: "Fichier visuel certifié", pilier: "Temps", type: "conference" },
  { id: "pb-COOB-EXP-001", nom: "Daily Standup Opérations", departement: "COOB", bots: ["Olivier"], etapes: 3, duree: "15min", niveau: "Standard", prix: "Gratuit", rating: 4.7, downloads: 517, categorie: "Express", description: "Assignation Jira/Trello auto", pilier: "Temps", type: "conference" },
  { id: "pb-COOB-EXP-003", nom: "Shift Handoff", departement: "COOB", bots: ["CarlOS"], etapes: 4, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.5, downloads: 452, categorie: "Express", description: "Conference AI - Shift Handoff", pilier: "Temps", type: "conference" },
  { id: "pb-COOB-EXP-009", nom: "Shift Handoff (Logistique)", departement: "COOB", bots: ["Olivier"], etapes: 3, duree: "10min", niveau: "Standard", prix: "Gratuit", rating: 4.9, downloads: 1010, categorie: "Express", description: "Log textuel de transfert", pilier: "Temps", type: "conference" },
  { id: "pb-CPOB-EXP-002", nom: "Go/No-Go Express", departement: "CPOB", bots: ["CarlOS"], etapes: 7, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 487, categorie: "Express", description: "Conference AI - Go/No-Go Express", pilier: "Temps", type: "conference" },
  { id: "pb-CPOB-EXP-005", nom: "Daily Standup Production", departement: "CPOB", bots: ["Paco"], etapes: 3, duree: "15min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 502, categorie: "Express", description: "Planification journalière", pilier: "Temps", type: "conference" },
  { id: "pb-CPOB-EXP-007", nom: "Go/No-Go Express (Production)", departement: "CPOB", bots: ["Paco"], etapes: 3, duree: "10min", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 381, categorie: "Express", description: "Bilan dautorisation", pilier: "Temps", type: "conference" },
  { id: "pb-CPOB-EXP-010", nom: "Shift Handoff (Usine de nuit/jour)", departement: "CPOB", bots: ["Paco"], etapes: 2, duree: "10min", niveau: "Standard", prix: "Gratuit", rating: 4.5, downloads: 898, categorie: "Express", description: "Rapport de fin de quart", pilier: "Temps", type: "conference" },
  { id: "pb-CPOB-EXP-011", nom: "Check Qualité Express", departement: "CPOB", bots: ["CarlOS"], etapes: 4, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 743, categorie: "Express", description: "Conference AI - Check Qualité Express", pilier: "Temps", type: "conference" },
  { id: "pb-CPOB-EXP-014", nom: "Triage Urgence Brisure Machine", departement: "CPOB", bots: ["Paco"], etapes: 3, duree: "5min", niveau: "Quick Win", prix: "Gratuit", rating: 4.6, downloads: 287, categorie: "Express", description: "Ticket de maintenance priorisé", pilier: "Temps", type: "conference" },
  { id: "pb-CPOB-EXP-020", nom: "Check Qualité Express (Lot)", departement: "CPOB", bots: ["Paco"], etapes: 3, duree: "10min", niveau: "Standard", prix: "Gratuit", rating: 4.4, downloads: 491, categorie: "Express", description: "Billet dassurance qualité", pilier: "Temps", type: "conference" },
  { id: "pb-CROB-EXP-003", nom: "Daily Standup Ventes", departement: "CROB", bots: ["Rich"], etapes: 3, duree: "15min", niveau: "Standard", prix: "Gratuit", rating: 4.5, downloads: 1079, categorie: "Express", description: "Mise à jour CRM", pilier: "Temps", type: "conference" },
  { id: "pb-CROB-EXP-012", nom: "Debrief Flash Rencontre Client", departement: "CROB", bots: ["Rich"], etapes: 3, duree: "10min", niveau: "Standard", prix: "Gratuit", rating: 4.4, downloads: 1117, categorie: "Express", description: "Note CRM détaillée", pilier: "Temps", type: "conference" },
  { id: "pb-CROB-EXP-015", nom: "Quick Check-in Pipeline Deal", departement: "CROB", bots: ["Rich"], etapes: 3, duree: "10min", niveau: "Standard", prix: "Gratuit", rating: 4.7, downloads: 617, categorie: "Express", description: "Statut CRM actualisé", pilier: "Temps", type: "conference" },
  { id: "pb-CROSS-EXP-011", nom: "Debrief Flash Événementiel", departement: "ORBIT9", bots: ["CarlOS"], etapes: 2, duree: "15min", niveau: "Standard", prix: "Gratuit", rating: 4.5, downloads: 1016, categorie: "Express", description: "Micro-bilan post-mortem daction", pilier: "Temps", type: "conference" },
  { id: "pb-CSOB-EXP-022", nom: "Alignement Objectif Express", departement: "CSOB", bots: ["Simone"], etapes: 3, duree: "10min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 110, categorie: "Express", description: "Re-priorisation de lagenda", pilier: "Temps", type: "conference" },
  { id: "pb-CTOB-EXP-002", nom: "Daily Standup Développement", departement: "CTOB", bots: ["Tim"], etapes: 3, duree: "15min", niveau: "Standard", prix: "Gratuit", rating: 4.7, downloads: 884, categorie: "Express", description: "Ticket update système", pilier: "Temps", type: "conference" },
  { id: "pb-CTOB-EXP-008", nom: "Go/No-Go Express (Déploiement TI)", departement: "CTOB", bots: ["Tim"], etapes: 3, duree: "10min", niveau: "Standard", prix: "Gratuit", rating: 4.9, downloads: 473, categorie: "Express", description: "Autorisation de mise en prod", pilier: "Temps", type: "conference" },
  { id: "pb-CTOB-EXP-017", nom: "Review Code Express (Merge)", departement: "CTOB", bots: ["Tim"], etapes: 3, duree: "15min", niveau: "Standard", prix: "Gratuit", rating: 4.7, downloads: 560, categorie: "Express", description: "Notes intégrées dans Git", pilier: "Temps", type: "conference" },
  // --- RECURRENTS (12 playbooks) ---
  { id: "pb-CEOB-REC-001", nom: "Morning Brief CEO", departement: "CEOB", bots: ["CarlOS"], etapes: 3, duree: "10min", niveau: "Quick Win", prix: "Gratuit", rating: 4.8, downloads: 125, categorie: "Recurrent", description: "Microcast audio personnalisé", pilier: "Temps", type: "flow" },
  { id: "pb-CEOB-REC-012", nom: "Annual Plan Initialization", departement: "CEOB", bots: ["CarlOS"], etapes: 3, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 702, categorie: "Recurrent", description: "Fichiers de préparation N+1", pilier: "Temps", type: "flow" },
  { id: "pb-CFOB-REC-002", nom: "Weekly Digest Financier", departement: "CFOB", bots: ["Frank"], etapes: 3, duree: "15min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 591, categorie: "Recurrent", description: "Dashboard PDF automatisé", pilier: "Temps", type: "flow" },
  { id: "pb-CHROB-REC-007", nom: "Monthly HR Dashboard", departement: "CHROB", bots: ["Helene"], etapes: 3, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.5, downloads: 453, categorie: "Recurrent", description: "Tableau de bord RH exécutif", pilier: "Temps", type: "flow" },
  { id: "pb-CISOB-REC-008", nom: "Weekly Digest Menaces (Cyber)", departement: "CISOB", bots: ["Sebastien"], etapes: 3, duree: "10min", niveau: "Quick Win", prix: "Gratuit", rating: 4.7, downloads: 971, categorie: "Recurrent", description: "Score de santé sécurité", pilier: "Temps", type: "flow" },
  { id: "pb-CLOB-REC-010", nom: "Monthly Compliance Tracker", departement: "CLOB", bots: ["Loulou"], etapes: 2, duree: "10min", niveau: "Quick Win", prix: "Gratuit", rating: 4.2, downloads: 543, categorie: "Recurrent", description: "Alertes de dates dexpiration", pilier: "Temps", type: "flow" },
  { id: "pb-CMOB-REC-004", nom: "Weekly Digest Marketing (ROAS)", departement: "CMOB", bots: ["Mathilde"], etapes: 3, duree: "15min", niveau: "Standard", prix: "Gratuit", rating: 4.5, downloads: 818, categorie: "Recurrent", description: "Recommandation budgétaire", pilier: "Temps", type: "flow" },
  { id: "pb-COOB-REC-009", nom: "Weekly Digest Logistique", departement: "COOB", bots: ["Olivier"], etapes: 2, duree: "15min", niveau: "Standard", prix: "Gratuit", rating: 4.4, downloads: 532, categorie: "Recurrent", description: "Liste dachat priorisée", pilier: "Temps", type: "flow" },
  { id: "pb-CPOB-REC-006", nom: "Weekly Digest Qualité Usine", departement: "CPOB", bots: ["Paco"], etapes: 2, duree: "15min", niveau: "Standard", prix: "Gratuit", rating: 4.8, downloads: 342, categorie: "Recurrent", description: "Rapport opérationnel usine", pilier: "Temps", type: "flow" },
  { id: "pb-CROB-REC-005", nom: "Monthly Sales Dashboard", departement: "CROB", bots: ["Rich"], etapes: 3, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.5, downloads: 519, categorie: "Recurrent", description: "Rapport des ventes mensuel", pilier: "Temps", type: "flow" },
  { id: "pb-CSOB-REC-011", nom: "Quarterly Strategic Sync", departement: "CSOB", bots: ["Simone"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 458, categorie: "Recurrent", description: "Bilan stratégique (QBR)", pilier: "Temps", type: "flow" },
  { id: "pb-CTOB-REC-003", nom: "Watchdog Serveurs & Uptime", departement: "CTOB", bots: ["Tim"], etapes: 3, duree: "5min", niveau: "Quick Win", prix: "Gratuit", rating: 4.4, downloads: 663, categorie: "Recurrent", description: "Rapport de SLA technique", pilier: "Temps", type: "flow" },
  // --- REUNIONS (14 playbooks) ---
  { id: "pb-CEOB-REU-001", nom: "Board Meeting (C.A.)", departement: "CEOB", bots: ["CarlOS"], etapes: 3, duree: "2h", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 894, categorie: "Reunion", description: "Procès-verbal formel et actions", pilier: "Temps", type: "conference" },
  { id: "pb-CEOB-REU-002", nom: "Brainstorming Dirigé 8+1", departement: "CEOB", bots: ["CarlOS"], etapes: 3, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.2, downloads: 606, categorie: "Reunion", description: "Top 3 des idées retenues", pilier: "Temps", type: "conference" },
  { id: "pb-CEOB-REU-012", nom: "Town Hall (Assemblée Générale)", departement: "CEOB", bots: ["CarlOS"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 611, categorie: "Reunion", description: "FAQ interne et sondage de moral", pilier: "Temps", type: "conference" },
  { id: "pb-CFOB-REU-004", nom: "Revue Financière Exécutive", departement: "CFOB", bots: ["Frank"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 706, categorie: "Reunion", description: "Rapport financier consolidé", pilier: "Temps", type: "conference" },
  { id: "pb-CHROB-REU-008", nom: "Comité Santé/Sécurité (CNESST)", departement: "CHROB", bots: ["Helene"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 773, categorie: "Reunion", description: "PV réglementaire SST", pilier: "Temps", type: "conference" },
  { id: "pb-CINOB-REU-009", nom: "Comité Innovation & R&D", departement: "CINOB", bots: ["Ines"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 346, categorie: "Reunion", description: "Dossier de justification RS&DE", pilier: "Temps", type: "conference" },
  { id: "pb-CLOB-REU-010", nom: "Comité Gouvernance & Risques", departement: "CLOB", bots: ["Loulou"], etapes: 2, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.4, downloads: 953, categorie: "Reunion", description: "Registre des risques corporatifs", pilier: "Temps", type: "conference" },
  { id: "pb-CMOB-REU-006", nom: "Comité Marketing & ROAS", departement: "CMOB", bots: ["Mathilde"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.2, downloads: 654, categorie: "Reunion", description: "Stratégie doptimisation média", pilier: "Temps", type: "conference" },
  { id: "pb-CPOB-REU-007", nom: "Comité Production (Gemba)", departement: "CPOB", bots: ["Paco"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.2, downloads: 1098, categorie: "Reunion", description: "Planification des arrêts machines", pilier: "Temps", type: "conference" },
  { id: "pb-CROB-REU-013", nom: "Revue des Ventes (Sales Sync)", departement: "CROB", bots: ["Rich"], etapes: 3, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 1152, categorie: "Reunion", description: "Plan daction commercial de la semaine", pilier: "Temps", type: "conference" },
  { id: "pb-CROSS-REU-005", nom: "Cellule de Crise Exécutive", departement: "ORBIT9", bots: ["CarlOS et dir."], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.4, downloads: 282, categorie: "Reunion", description: "Plan de mitigation de crise durgence", pilier: "Temps", type: "conference" },
  { id: "pb-CROSS-REU-014", nom: "Kick-off Projet Inter-Départemental", departement: "ORBIT9", bots: ["CarlOS"], etapes: 3, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.9, downloads: 493, categorie: "Reunion", description: "Charte de projet validée", pilier: "Temps", type: "conference" },
  { id: "pb-CSOB-REU-011", nom: "Revue Stratégique OKR", departement: "CSOB", bots: ["Simone"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 513, categorie: "Reunion", description: "Tableau de bord de performance OKR", pilier: "Temps", type: "conference" },
  { id: "pb-CTOB-REU-003", nom: "Rétrospective Sprint Agile", departement: "CTOB", bots: ["Tim"], etapes: 3, duree: "1h", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 102, categorie: "Reunion", description: "Backlog technique damélioration", pilier: "Temps", type: "conference" },
  // --- VERTICAUX INDUSTRIE (20 playbooks) ---
  { id: "pb-CFOB-VERT-005", nom: "Fintech/Finance : Revue AML/KYC", departement: "CFOB", bots: ["Frank"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.6, downloads: 1014, categorie: "Verticaux", description: "Dossier risque client", pilier: "Actif", type: "diagnostic" },
  { id: "pb-CFOB-VERT-011", nom: "Immobilier : Audit OACIQ", departement: "CFOB", bots: ["Frank"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 115, categorie: "Verticaux", description: "Registre de conformité OACIQ", pilier: "Actif", type: "diagnostic" },
  { id: "pb-CHROB-VERT-007", nom: "Santé : Conformité HIPAA/Loi 3", departement: "CHROB", bots: ["Loulou"], etapes: 2, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.9, downloads: 911, categorie: "Verticaux", description: "Document de sécurité des données de santé", pilier: "Actif", type: "diagnostic" },
  { id: "pb-CHROB-VERT-017", nom: "Éducation : Conformité MEQ", departement: "CHROB", bots: ["Helene"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 400, categorie: "Verticaux", description: "Rapport de conformité ministérielle", pilier: "Actif", type: "diagnostic" },
  { id: "pb-CISOB-VERT-002", nom: "Technologies : Audit Loi 25", departement: "CISOB", bots: ["Sebastien"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.6, downloads: 954, categorie: "Verticaux", description: "Registre de conformité CAI", pilier: "Actif", type: "diagnostic" },
  { id: "pb-CLOB-VERT-014", nom: "OBNL / Charité : Audit ARC", departement: "CLOB", bots: ["Frank"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.8, downloads: 202, categorie: "Verticaux", description: "Préparation de la déclaration T3010", pilier: "Actif", type: "diagnostic" },
  { id: "pb-CMOB-VERT-010", nom: "Détail (Retail) : Audit PCI-DSS", departement: "CMOB", bots: ["Sebastien"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.2, downloads: 1187, categorie: "Verticaux", description: "Attestation de conformité (AoC)", pilier: "Actif", type: "diagnostic" },
  { id: "pb-COOB-VERT-003", nom: "Construction : Conformité CCQ", departement: "COOB", bots: ["Olivier"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 377, categorie: "Verticaux", description: "Rapport de risque solidaire", pilier: "Actif", type: "diagnostic" },
  { id: "pb-COOB-VERT-009", nom: "Logistique : Certification C-TPAT", departement: "COOB", bots: ["Olivier"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 258, categorie: "Verticaux", description: "Déclaration de sécurité frontalière", pilier: "Actif", type: "diagnostic" },
  { id: "pb-COOB-VERT-013", nom: "Transport : Conformité SAAQ (Loi 430)", departement: "COOB", bots: ["Olivier"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.2, downloads: 853, categorie: "Verticaux", description: "Bilan de comportement de la flotte (PEVL)", pilier: "Actif", type: "diagnostic" },
  { id: "pb-COOB-VERT-016", nom: "Environnement : ISO 14001", departement: "COOB", bots: ["Paco"], etapes: 2, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.5, downloads: 109, categorie: "Verticaux", description: "Bilan dimpact écologique", pilier: "Actif", type: "diagnostic" },
  { id: "pb-CPOB-VERT-001", nom: "Agroalimentaire : Audit HACCP", departement: "CPOB", bots: ["Paco"], etapes: 4, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.7, downloads: 529, categorie: "Verticaux", description: "Registre HACCP complété", pilier: "Actif", type: "diagnostic" },
  { id: "pb-CPOB-VERT-006", nom: "Aérospatiale : Norme AS9100", departement: "CPOB", bots: ["Paco"], etapes: 2, duree: "2h", niveau: "Enterprise", prix: "$149", rating: 4.6, downloads: 525, categorie: "Verticaux", description: "Rapport de non-conformité (NC)", pilier: "Actif", type: "diagnostic" },
  { id: "pb-CPOB-VERT-008", nom: "Automobile : Norme IATF 16949", departement: "CPOB", bots: ["Paco"], etapes: 2, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.8, downloads: 415, categorie: "Verticaux", description: "Plan de contrôle qualité", pilier: "Actif", type: "diagnostic" },
  { id: "pb-CPOB-VERT-012", nom: "Pharmaceutique : Bonnes Pratiques (BPF)", departement: "CPOB", bots: ["Paco"], etapes: 2, duree: "2h", niveau: "Enterprise", prix: "$149", rating: 4.2, downloads: 749, categorie: "Verticaux", description: "Dossier de lot approuvé", pilier: "Actif", type: "diagnostic" },
  { id: "pb-CPOB-VERT-015", nom: "Manufacturier : ISO 9001:2015", departement: "CPOB", bots: ["Paco"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.2, downloads: 815, categorie: "Verticaux", description: "Manuel Qualité révisé", pilier: "Actif", type: "diagnostic" },
  { id: "pb-CPOB-VERT-019", nom: "Cosmétiques : Conformité Santé Canada", departement: "CPOB", bots: ["Paco"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 217, categorie: "Verticaux", description: "Formulaire de déclaration cosmétique", pilier: "Actif", type: "diagnostic" },
  { id: "pb-CROSS-VERT-020", nom: "Agriculture : Certification Biologique (CARTV)", departement: "ORBIT9", bots: ["Paco"], etapes: 3, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 939, categorie: "Verticaux", description: "Plan de gestion biologique", pilier: "Actif", type: "diagnostic" },
  { id: "pb-CTOB-VERT-004", nom: "SaaS Cloud : Préparation SOC2", departement: "CTOB", bots: ["Tim"], etapes: 3, duree: "2h", niveau: "Enterprise", prix: "$149", rating: 4.2, downloads: 422, categorie: "Verticaux", description: "Checklist de readiness SOC2", pilier: "Actif", type: "diagnostic" },
  { id: "pb-CTOB-VERT-018", nom: "Jeux Vidéo : Certification Console", departement: "CTOB", bots: ["Tim"], etapes: 2, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.7, downloads: 135, categorie: "Verticaux", description: "Checklist de soumission (Lot Check)", pilier: "Actif", type: "diagnostic" },
  // --- ORBIT9 CROSS-ENTREPRISE (12 playbooks) ---
  { id: "pb-CROSS-ORB-001", nom: "Speed Matching Réseau (Orbit9)", departement: "ORBIT9", bots: ["CarlOS"], etapes: 2, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 206, categorie: "Collaboration", description: "Liste de contacts pré-qualifiés", pilier: "Vente", type: "conference" },
  { id: "pb-CROSS-ORB-002", nom: "Club d'Achat Groupé (Commodités)", departement: "ORBIT9", bots: ["Frank"], etapes: 2, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.6, downloads: 617, categorie: "Collaboration", description: "Appel doffres commun", pilier: "Vente", type: "conference" },
  { id: "pb-CROSS-ORB-003", nom: "Mentorat Croisé Inter-Entreprises", departement: "ORBIT9", bots: ["Helene"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 1081, categorie: "Collaboration", description: "Rapport de session de mentorat", pilier: "Vente", type: "conference" },
  { id: "pb-CROSS-ORB-004", nom: "Guest Matching Orbit9", departement: "ORBIT9", bots: ["CarlOS"], etapes: 3, duree: "10min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 806, categorie: "Collaboration", description: "5 profils B2B qualifiés", pilier: "Vente", type: "conference" },
  { id: "pb-CROSS-ORB-005", nom: "Cellule Innovation Communes (R&D)", departement: "ORBIT9", bots: ["Ines"], etapes: 2, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.5, downloads: 623, categorie: "Collaboration", description: "Charte de projet commun", pilier: "Vente", type: "conference" },
  { id: "pb-CROSS-ORB-006", nom: "Export & Alliances Stratégiques", departement: "ORBIT9", bots: ["Rich"], etapes: 2, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.7, downloads: 962, categorie: "Collaboration", description: "Plan de co-entreprise (JV)", pilier: "Vente", type: "conference" },
  { id: "pb-CROSS-ORB-007", nom: "Partage de Flotte/Ressources", departement: "ORBIT9", bots: ["Olivier"], etapes: 2, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 598, categorie: "Collaboration", description: "Calendrier de prêt déquipement", pilier: "Vente", type: "conference" },
  { id: "pb-CROSS-ORB-008", nom: "Pool de Talents Partagés", departement: "ORBIT9", bots: ["Helene"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 675, categorie: "Collaboration", description: "Contrat de prêt demployé", pilier: "Vente", type: "conference" },
  { id: "pb-CROSS-ORB-009", nom: "Benchmarking Financier Anonyme", departement: "ORBIT9", bots: ["Frank"], etapes: 2, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 1097, categorie: "Collaboration", description: "Rapport de performance relative", pilier: "Vente", type: "conference" },
  { id: "pb-CROSS-ORB-010", nom: "Mutualisation des Audits de Qualité", departement: "ORBIT9", bots: ["Paco"], etapes: 2, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 815, categorie: "Collaboration", description: "Protocole daudit partagé", pilier: "Vente", type: "conference" },
  { id: "pb-CROSS-ORB-011", nom: "Table Ronde Secteur Industriel", departement: "ORBIT9", bots: ["CarlOS"], etapes: 2, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.5, downloads: 927, categorie: "Collaboration", description: "Livre blanc de lindustrie", pilier: "Vente", type: "conference" },
  { id: "pb-CROSS-ORB-012", nom: "Partage de CTI (Cyber Threat Intel)", departement: "ORBIT9", bots: ["Sebastien"], etapes: 2, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 1093, categorie: "Collaboration", description: "Alerte de sécurité réseau", pilier: "Vente", type: "conference" },
  // --- FORMATION (4 playbooks) ---
  { id: "pb-CHROB-FORM-001", nom: "Onboarding Employé", departement: "CHROB", bots: ["CarlOS"], etapes: 4, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.7, downloads: 658, categorie: "Formation", description: "Conference AI - Onboarding Employé", pilier: "Actif", type: "formation" },
  { id: "pb-CHROB-FORM-004", nom: "Certification Interne", departement: "CHROB", bots: ["CarlOS"], etapes: 4, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 132, categorie: "Formation", description: "Conference AI - Certification Interne", pilier: "Actif", type: "formation" },
  { id: "pb-CROB-FORM-003", nom: "Simulation Négociation", departement: "CROB", bots: ["CarlOS"], etapes: 6, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 821, categorie: "Formation", description: "Conference AI - Simulation Négociation", pilier: "Actif", type: "formation" },
  { id: "pb-CROSS-FORM-002", nom: "Coaching Ghost Cognitif", departement: "ORBIT9", bots: ["CarlOS"], etapes: 4, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.2, downloads: 333, categorie: "Formation", description: "Conference AI - Coaching Ghost Cognitif", pilier: "Actif", type: "formation" },
  // --- SAISONNIERS (3 playbooks) ---
  { id: "pb-CFOB-SAIS-024", nom: "Prep Budget Année Suivante", departement: "CFOB", bots: ["CarlOS"], etapes: 5, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.4, downloads: 854, categorie: "Saisonnier", description: "Conference AI - Prep Budget Année Suivante", pilier: "Temps", type: "flow" },
  { id: "pb-CHROB-SAIS-037", nom: "Déclaration CNESST", departement: "CHROB", bots: ["CarlOS"], etapes: 4, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 833, categorie: "Saisonnier", description: "Conference AI - Déclaration CNESST", pilier: "Temps", type: "flow" },
  { id: "pb-COOB-SAIS-019", nom: "Shutdown Vacances CCQ", departement: "COOB", bots: ["CarlOS"], etapes: 6, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.8, downloads: 847, categorie: "Saisonnier", description: "Conference AI - Shutdown Vacances CCQ", pilier: "Temps", type: "flow" },
  // --- PERSONNEL & DESTINY (14 playbooks) ---
  { id: "pb-DEST-PERS-001", nom: "Speed Dating AI", departement: "CEOB", bots: ["CarlOS"], etapes: 3, duree: "20min", niveau: "Standard", prix: "Gratuit", rating: 4.7, downloads: 1154, categorie: "Personnel", description: "Score de compatibilité", pilier: "Idee", type: "conference" },
  { id: "pb-DEST-PERS-002", nom: "Coaching de Couple", departement: "CEOB", bots: ["Helene"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.2, downloads: 523, categorie: "Personnel", description: "Charte dengagement relationnel", pilier: "Idee", type: "conference" },
  { id: "pb-DEST-PERS-004", nom: "Préparation Mariage / Vie Commune", departement: "CEOB", bots: ["Frank"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 699, categorie: "Personnel", description: "Plan nuptial ou budgétaire", pilier: "Idee", type: "conference" },
  { id: "pb-DEST-PERS-005", nom: "Thérapie Assistée", departement: "CEOB", bots: ["CarlOS"], etapes: 2, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 824, categorie: "Personnel", description: "Notes chiffrées pour thérapeute", pilier: "Idee", type: "conference" },
  { id: "pb-DEST-PERS-006", nom: "Coaching de Carrière", departement: "CEOB", bots: ["CarlOS"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 331, categorie: "Personnel", description: "Plan de développement", pilier: "Idee", type: "conference" },
  { id: "pb-DEST-PERS-007", nom: "Gestion Stress du Dirigeant", departement: "CEOB", bots: ["CarlOS"], etapes: 3, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.7, downloads: 927, categorie: "Personnel", description: "Baisse de tension évaluée", pilier: "Idee", type: "conference" },
  { id: "pb-DEST-PERS-008", nom: "Préparation à la Retraite", departement: "CEOB", bots: ["Frank"], etapes: 3, duree: "1h", niveau: "Avance", prix: "$99", rating: 4.4, downloads: 1148, categorie: "Personnel", description: "Blueprint transition Retraite", pilier: "Idee", type: "conference" },
  { id: "pb-DEST-PERS-009", nom: "Deuil Entrepreneurial", departement: "CEOB", bots: ["CarlOS"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 222, categorie: "Personnel", description: "Journal de résilience", pilier: "Idee", type: "conference" },
  { id: "pb-DEST-PERS-010", nom: "Conciliation Travail-Vie Personnelle", departement: "CEOB", bots: ["CarlOS"], etapes: 4, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.8, downloads: 528, categorie: "Personnel", description: "Emploi du temps purgé", pilier: "Idee", type: "conference" },
  { id: "pb-DEST-PERS-011", nom: "Préparation Parentalité (Maternité/Paternité)", departement: "CEOB", bots: ["CarlOS"], etapes: 2, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.7, downloads: 606, categorie: "Personnel", description: "Plan de transition de congé", pilier: "Idee", type: "conference" },
  { id: "pb-DEST-PERS-012", nom: "Réorientation de Carrière Complète", departement: "CEOB", bots: ["CarlOS"], etapes: 3, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.8, downloads: 242, categorie: "Personnel", description: "Plan daction de réorientation", pilier: "Idee", type: "conference" },
  { id: "pb-DEST-PERS-013", nom: "Gestion de la Solitude Exécutive", departement: "CEOB", bots: ["CarlOS"], etapes: 2, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 322, categorie: "Personnel", description: "Notes effacées ou encryptées", pilier: "Idee", type: "conference" },
  { id: "pb-DEST-PERS-014", nom: "Préparation Discours (Allocution)", departement: "CEOB", bots: ["CarlOS"], etapes: 2, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.9, downloads: 850, categorie: "Personnel", description: "Score déloquence et corrections", pilier: "Idee", type: "conference" },
  { id: "pb-DEST-PERS-015", nom: "Bilan de Compétences 360°", departement: "CEOB", bots: ["CarlOS"], etapes: 3, duree: "30min", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 114, categorie: "Personnel", description: "Matrice de leadership.11", pilier: "Idee", type: "conference" },
  // ═══ V5 FINAL — 66 Playbooks (Formation + Ghost Cognitifs + Saisonniers) ═══
  // --- GAP-FILL V2 (2) ---
  { id: "pb-CMOB-MRQ-012", nom: "Audit Express Marque Employeur", departement: "CMOB", bots: ["Mathilde", "Helene"], etapes: 5, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.8, downloads: 489, categorie: "Marque employeur", description: "Analyse des evaluations externes et friction recrutement.", pilier: "Actif", type: "diagnostic" },
  { id: "pb-COOB-OP-005", nom: "Resolution Goulot Logistique", departement: "COOB", bots: ["Olivier"], etapes: 5, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 750, categorie: "Operations", description: "Cartographie processus, identification contrainte, simulation scenarios.", pilier: "Temps", type: "conference" },
  // --- FORMATION (20) ---
  { id: "pb-CMOB-MRQ-012", nom: "Audit Express Marque Employeur", departement: "CMOB", bots: ["Mathilde", "Helene"], etapes: 5, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.8, downloads: 489, categorie: "Marque employeur", description: "Analyse des evaluations externes et friction recrutement.", pilier: "Actif", type: "diagnostic" },
  { id: "pb-COOB-OP-005", nom: "Resolution Goulot Logistique", departement: "COOB", bots: ["Olivier"], etapes: 5, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 750, categorie: "Operations", description: "Cartographie processus, identification contrainte, simulation scenarios.", pilier: "Temps", type: "conference" },
  { id: "pb-CHROB-FOR-001", nom: "Onboarding Employe Immersif", departement: "CHROB", bots: ["Helene"], etapes: 6, duree: "3h", niveau: "Avance", prix: "$149", rating: 4.8, downloads: 266, categorie: "Formation", description: "Decouverte culture, formation outils, evaluations dynamiques, attestation.", pilier: "Actif", type: "formation" },
  { id: "pb-CHROB-FOR-002", nom: "Coaching Ghost Cognitif Individuel", departement: "CHROB", bots: ["CarlOS"], etapes: 5, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 314, categorie: "Formation", description: "Session avec empreinte numerique d'un dirigeant, plan d'action.", pilier: "Idee", type: "formation" },
  { id: "pb-CROB-FOR-003", nom: "Simulation Negociation Avancee", departement: "CROB", bots: ["Rich"], etapes: 5, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 818, categorie: "Formation", description: "IA profils psychologiques variables, score empathie, enregistrement annote.", pilier: "Vente", type: "formation" },
  { id: "pb-CINOB-FOR-004", nom: "Certification Interne IA", departement: "CINOB", bots: ["Ines"], etapes: 6, duree: "1h30", niveau: "Avance", prix: "$99", rating: 4.9, downloads: 763, categorie: "Formation", description: "Examens chronometres, diplome numerique blockchain.", pilier: "Actif", type: "formation" },
  { id: "pb-CROSS-FOR-005", nom: "Mentorat Cross-Entreprise Orbit9", departement: "ORBIT9", bots: ["Simone"], etapes: 5, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.2, downloads: 750, categorie: "Formation", description: "Appariement anonyme professionnels differentes organisations.", pilier: "Idee", type: "formation" },
  { id: "pb-CTOB-FOR-006", nom: "Bootcamp Developpeur Accelere", departement: "CTOB", bots: ["Tim"], etapes: 7, duree: "2h", niveau: "Avance", prix: "$99", rating: 4.3, downloads: 846, categorie: "Formation", description: "Revision code en pair-programming IA, exercices pratiques.", pilier: "Actif", type: "formation" },
  { id: "pb-CTOB-FOR-007", nom: "Formation Architecture Cloud Securisee", departement: "CTOB", bots: ["Tim", "Sebastien"], etapes: 6, duree: "1h30", niveau: "Avance", prix: "$99", rating: 4.4, downloads: 573, categorie: "Formation", description: "Optimisation couts infrastructure, securite cloud native.", pilier: "Actif", type: "formation" },
  { id: "pb-CTOB-FOR-008", nom: "Certification Agile Simulation", departement: "CTOB", bots: ["Tim", "Olivier"], etapes: 8, duree: "3h", niveau: "Enterprise", prix: "$149", rating: 4.5, downloads: 755, categorie: "Formation", description: "Simulations planification sprints, retrospectives, velocity.", pilier: "Temps", type: "formation" },
  { id: "pb-CFOB-FOR-009", nom: "Comptabilite pour Non-Comptables", departement: "CFOB", bots: ["Frank"], etapes: 5, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 324, categorie: "Formation", description: "Dechiffrer etats financiers, ratios cles, P&L.", pilier: "Argent", type: "formation" },
  { id: "pb-CFOB-FOR-010", nom: "Maitrise Flux de Tresorerie", departement: "CFOB", bots: ["Frank"], etapes: 5, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 886, categorie: "Formation", description: "Analyse fonds de roulement, previsions cash-flow.", pilier: "Argent", type: "formation" },
  { id: "pb-CMOB-FOR-011", nom: "Masterclass Redaction Persuasive", departement: "CMOB", bots: ["Mathilde"], etapes: 5, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 334, categorie: "Formation", description: "Cadres cognitifs acquisition, techniques copywriting.", pilier: "Vente", type: "formation" },
  { id: "pb-CMOB-FOR-012", nom: "Formation Referencement Strategique SEO", departement: "CMOB", bots: ["Mathilde", "Tim"], etapes: 6, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.8, downloads: 423, categorie: "Formation", description: "Recherche mots-cles, optimisation on-page, strategie backlinks.", pilier: "Vente", type: "formation" },
  { id: "pb-CMOB-FOR-013", nom: "Analyse Donnees Marketing Avancee", departement: "CMOB", bots: ["Mathilde"], etapes: 6, duree: "1h30", niveau: "Avance", prix: "$49", rating: 4.5, downloads: 167, categorie: "Formation", description: "Modelisation attribution, analytics, KPIs marketing.", pilier: "Idee", type: "formation" },
  { id: "pb-COOB-FOR-014", nom: "Formation Lean Manufacturing", departement: "COOB", bots: ["Olivier"], etapes: 6, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 680, categorie: "Formation", description: "Elimination gaspillages, 5S, value stream mapping.", pilier: "Temps", type: "formation" },
  { id: "pb-COOB-FOR-015", nom: "Gestion Risques Logistiques", departement: "COOB", bots: ["Olivier"], etapes: 5, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.8, downloads: 422, categorie: "Formation", description: "Identification risques supply chain, plans contingence.", pilier: "Actif", type: "formation" },
  { id: "pb-CPOB-FOR-016", nom: "Securite Machine et Verrouillage", departement: "CPOB", bots: ["Paco"], etapes: 5, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 611, categorie: "Formation", description: "Conformite normes industrielles, prevention accidents, LOTO.", pilier: "Actif", type: "formation" },
  { id: "pb-CHROB-FOR-017", nom: "Prevention du Harcelement", departement: "CHROB", bots: ["Helene"], etapes: 6, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 758, categorie: "Formation", description: "Scenarios signalement, cadre legal, politique interne.", pilier: "Actif", type: "formation" },
  { id: "pb-CROB-FOR-018", nom: "Techniques Avancees Conclusion Ventes", departement: "CROB", bots: ["Rich"], etapes: 6, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 371, categorie: "Formation", description: "Methodes closing, gestion objections, signaux achat.", pilier: "Vente", type: "formation" },
  { id: "pb-CLOB-FOR-019", nom: "Formation Loi 25 pour Employes", departement: "CLOB", bots: ["Loulou"], etapes: 5, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.3, downloads: 862, categorie: "Formation", description: "Obligations consentement, renseignements personnels Quebec.", pilier: "Actif", type: "formation" },
  { id: "pb-CISOB-FOR-020", nom: "Sensibilisation Anti-Hameconnage", departement: "CISOB", bots: ["Sebastien"], etapes: 4, duree: "30min", niveau: "Quick Win", prix: "Gratuit", rating: 4.6, downloads: 369, categorie: "Formation", description: "Simulations attaques ingenierie sociale, perimetres humains.", pilier: "Actif", type: "formation" },
  // --- GHOST COGNITIFS (8) ---
  { id: "pb-GHO-HER-001", nom: "Atelier Video Heritage — Session 1 Histoire", departement: "CEOB", bots: ["CarlOS"], etapes: 6, duree: "2h", niveau: "Enterprise", prix: "$299", rating: 4.7, downloads: 538, categorie: "Ghost Cognitif", description: "Exploration histoire personnelle, echecs formateurs, valeurs philosophiques.", pilier: "Idee", type: "cognitif" },
  { id: "pb-GHO-HER-002", nom: "Atelier Video Heritage — Session 2 Expertise", departement: "CEOB", bots: ["CarlOS", "Tim"], etapes: 6, duree: "2h", niveau: "Enterprise", prix: "$299", rating: 4.8, downloads: 508, categorie: "Ghost Cognitif", description: "Extraction heuristiques techniques, methodes non documentees.", pilier: "Idee", type: "cognitif" },
  { id: "pb-GHO-HER-003", nom: "Atelier Video Heritage — Session 3 Dilemmes", departement: "CEOB", bots: ["CarlOS", "Simone"], etapes: 6, duree: "2h", niveau: "Enterprise", prix: "$299", rating: 4.5, downloads: 241, categorie: "Ghost Cognitif", description: "Dilemmes operationnels et moraux, cartographie arbre decisionnel.", pilier: "Idee", type: "cognitif" },
  { id: "pb-GHO-TEC-004", nom: "Assemblage Ghost Cognitif", departement: "CTOB", bots: ["Tim"], etapes: 8, duree: "1 sem.", niveau: "Enterprise", prix: "$299", rating: 4.6, downloads: 193, categorie: "Ghost Cognitif", description: "Fine-tuning modele linguistique, synthese vocale, recueil apprentissages.", pilier: "Actif", type: "cognitif" },
  { id: "pb-GHO-USE-005", nom: "Session Coaching avec Ghost", departement: "CEOB", bots: ["CarlOS"], etapes: 5, duree: "45min", niveau: "Avance", prix: "$99", rating: 4.7, downloads: 212, categorie: "Ghost Cognitif", description: "Soumettre problematique au Ghost, conseils selon schemas du dirigeant.", pilier: "Idee", type: "cognitif" },
  { id: "pb-GHO-USE-006", nom: "Trisociation Ghost Cognitif", departement: "CEOB", bots: ["CarlOS", "Simone", "Rich"], etapes: 6, duree: "1h", niveau: "Enterprise", prix: "$149", rating: 4.3, downloads: 263, categorie: "Ghost Cognitif", description: "Croisement Ghost interne avec 2 modeles historiques pour innovation.", pilier: "Idee", type: "cognitif" },
  { id: "pb-GHO-MED-007", nom: "Podcast Automatise Ghost", departement: "CMOB", bots: ["Mathilde"], etapes: 5, duree: "45min", niveau: "Enterprise", prix: "$149", rating: 4.8, downloads: 532, categorie: "Ghost Cognitif", description: "Le Ghost co-anime contenus mediatiques automatiquement.", pilier: "Idee", type: "cognitif" },
  { id: "pb-GHO-MNT-008", nom: "Calibration Periodique Ghost", departement: "CTOB", bots: ["Tim"], etapes: 4, duree: "30min", niveau: "Avance", prix: "$99", rating: 4.6, downloads: 494, categorie: "Ghost Cognitif", description: "Integration experiences recentes, recalibration modele.", pilier: "Actif", type: "cognitif" },
  // --- SAISONNIERS (36) ---
  { id: "pb-CEOB-SAIS-01", nom: "Bilan Annuel Direction", departement: "CEOB", bots: ["CarlOS", "Frank"], etapes: 6, duree: "1h", niveau: "Standard", prix: "Gratuit", rating: 4.5, downloads: 579, categorie: "Saisonnier", description: "Analyse resultats, axes strategiques, objectifs annuels.", pilier: "Temps", type: "flow" },
  { id: "pb-CSOB-SAIS-02", nom: "Structuration OKR Annuels", departement: "CSOB", bots: ["Simone"], etapes: 5, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 666, categorie: "Saisonnier", description: "Definition objectifs cles et resultats attendus.", pilier: "Idee", type: "flow" },
  { id: "pb-CFOB-SAIS-03", nom: "Cloture Comptable Annuelle", departement: "CFOB", bots: ["Frank"], etapes: 8, duree: "2h", niveau: "Avance", prix: "$49", rating: 4.8, downloads: 111, categorie: "Saisonnier", description: "Etats financiers preliminaires, rapprochements bancaires.", pilier: "Argent", type: "flow" },
  { id: "pb-CHROB-SAIS-04", nom: "Optimisation REER Employes", departement: "CHROB", bots: ["Helene", "Frank"], etapes: 5, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.7, downloads: 217, categorie: "Saisonnier", description: "Simulations impact fiscal, rappel date limite REER.", pilier: "Argent", type: "flow" },
  { id: "pb-CROB-SAIS-05", nom: "Nettoyage Pipeline Ventes Q1", departement: "CROB", bots: ["Rich"], etapes: 4, duree: "30min", niveau: "Quick Win", prix: "Gratuit", rating: 4.7, downloads: 649, categorie: "Saisonnier", description: "Purge opportunites mortes, requalification leads.", pilier: "Vente", type: "flow" },
  { id: "pb-COOB-SAIS-06", nom: "Planification Logistique Chantiers", departement: "COOB", bots: ["Olivier"], etapes: 5, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.7, downloads: 887, categorie: "Saisonnier", description: "Preparation offensive operationnelle printemps.", pilier: "Temps", type: "flow" },
  { id: "pb-CFOB-SAIS-07", nom: "Cloture Q1 — Declarations Fiduciaires", departement: "CFOB", bots: ["Frank"], etapes: 6, duree: "1h", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 214, categorie: "Saisonnier", description: "Production declarations, formulaires fiduciaires T3.", pilier: "Argent", type: "flow" },
  { id: "pb-CLOB-SAIS-08", nom: "Revue Conformite Annuelle Loi 25", departement: "CLOB", bots: ["Loulou", "Sebastien"], etapes: 6, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.4, downloads: 261, categorie: "Saisonnier", description: "Audit registre incidents confidentialite, mise a jour politiques.", pilier: "Actif", type: "flow" },
  { id: "pb-CHROB-SAIS-09", nom: "Declaration Masse Salariale CNESST", departement: "CHROB", bots: ["Helene", "Frank"], etapes: 5, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.5, downloads: 839, categorie: "Saisonnier", description: "Compilation donnees salariales, date butoir 15 mars.", pilier: "Argent", type: "flow" },
  { id: "pb-CFOB-SAIS-10", nom: "Preparation Impots Particuliers", departement: "CFOB", bots: ["Frank"], etapes: 6, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.8, downloads: 369, categorie: "Saisonnier", description: "Date limite 30 avril, declarations T1/TP1.", pilier: "Argent", type: "flow" },
  { id: "pb-CFOB-SAIS-11", nom: "Impots Corporatifs", departement: "CFOB", bots: ["Frank", "Loulou"], etapes: 8, duree: "2h", niveau: "Avance", prix: "$99", rating: 4.9, downloads: 880, categorie: "Saisonnier", description: "Declarations T2, credits recherche, deductions.", pilier: "Argent", type: "flow" },
  { id: "pb-CEOB-SAIS-12", nom: "Audit Interne Q2", departement: "CEOB", bots: ["CarlOS", "Frank"], etapes: 5, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.3, downloads: 208, categorie: "Saisonnier", description: "Analyse ecarts budgetaires, ajustements strategiques.", pilier: "Temps", type: "flow" },
  { id: "pb-CFOB-SAIS-13", nom: "Calcul Interets Travailleurs Autonomes", departement: "CFOB", bots: ["Frank"], etapes: 4, duree: "30min", niveau: "Quick Win", prix: "Gratuit", rating: 4.8, downloads: 405, categorie: "Saisonnier", description: "Echeance 1er mai, calcul acomptes provisionnels.", pilier: "Argent", type: "flow" },
  { id: "pb-COOB-SAIS-14", nom: "Renegociation Contrats Fournisseurs", departement: "COOB", bots: ["Olivier", "Rich"], etapes: 6, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.8, downloads: 619, categorie: "Saisonnier", description: "Analyse marche, benchmark prix, strategies negociation.", pilier: "Argent", type: "flow" },
  { id: "pb-CMOB-SAIS-15", nom: "Planification Evenementielle Q2", departement: "CMOB", bots: ["Mathilde"], etapes: 5, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 256, categorie: "Saisonnier", description: "Calendrier evenements, salons, webinaires ete.", pilier: "Vente", type: "flow" },
  { id: "pb-CFOB-SAIS-16", nom: "Declaration Travailleurs Autonomes", departement: "CFOB", bots: ["Frank"], etapes: 5, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.5, downloads: 265, categorie: "Saisonnier", description: "Echeance 15 juin, production declarations.", pilier: "Argent", type: "flow" },
  { id: "pb-CHROB-SAIS-17", nom: "Evaluations Performance Mi-Annee", departement: "CHROB", bots: ["Helene"], etapes: 6, duree: "1h", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 897, categorie: "Saisonnier", description: "Reviews 360, calibration performance, objectifs H2.", pilier: "Actif", type: "flow" },
  { id: "pb-COOB-SAIS-18", nom: "Preparation Fermeture Estivale", departement: "COOB", bots: ["Olivier"], etapes: 5, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.8, downloads: 100, categorie: "Saisonnier", description: "Logistique pre-vacances construction CCQ.", pilier: "Temps", type: "flow" },
  { id: "pb-COOB-SAIS-19", nom: "Fermeture Estivale CCQ Juillet", departement: "COOB", bots: ["Olivier"], etapes: 7, duree: "1h", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 600, categorie: "Saisonnier", description: "Securisation chantiers, 19 juillet au 1er aout.", pilier: "Temps", type: "flow" },
  { id: "pb-CSOB-SAIS-20", nom: "Feuille de Route Strategique Q3", departement: "CSOB", bots: ["Simone"], etapes: 5, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.2, downloads: 471, categorie: "Saisonnier", description: "Planification strategique deuxieme semestre.", pilier: "Idee", type: "flow" },
  { id: "pb-CEOB-SAIS-21", nom: "Revue Direction Ete", departement: "CEOB", bots: ["CarlOS"], etapes: 5, duree: "30min", niveau: "Quick Win", prix: "Gratuit", rating: 4.8, downloads: 414, categorie: "Saisonnier", description: "Point rapide pendant periode estivale reduite.", pilier: "Temps", type: "flow" },
  { id: "pb-COOB-SAIS-22", nom: "Redemarrage Infrastructures Aout", departement: "COOB", bots: ["Olivier", "Tim"], etapes: 6, duree: "1h", niveau: "Standard", prix: "Gratuit", rating: 4.4, downloads: 346, categorie: "Saisonnier", description: "Reprise operations post-vacances, checks systemes.", pilier: "Temps", type: "flow" },
  { id: "pb-CHROB-SAIS-23", nom: "Campagne Recrutement Rentree", departement: "CHROB", bots: ["Helene", "Mathilde"], etapes: 7, duree: "1 sem.", niveau: "Avance", prix: "$49", rating: 4.8, downloads: 180, categorie: "Saisonnier", description: "Recrutement intensif septembre, affichages, entrevues.", pilier: "Actif", type: "flow" },
  { id: "pb-CFOB-SAIS-24", nom: "Modelisation Budgets Annee Suivante", departement: "CFOB", bots: ["Frank", "CarlOS"], etapes: 8, duree: "2h", niveau: "Avance", prix: "$49", rating: 4.3, downloads: 597, categorie: "Saisonnier", description: "Budget previsionnel N+1, scenarios optimiste/pessimiste.", pilier: "Argent", type: "flow" },
  { id: "pb-CROB-SAIS-25", nom: "Effort Vente Final Q4", departement: "CROB", bots: ["Rich"], etapes: 5, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.8, downloads: 878, categorie: "Saisonnier", description: "Sprint ventes dernier trimestre, objectifs annuels.", pilier: "Vente", type: "flow" },
  { id: "pb-CLOB-SAIS-26", nom: "Renouvellement Polices Assurance", departement: "CLOB", bots: ["Loulou"], etapes: 5, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.6, downloads: 228, categorie: "Saisonnier", description: "Audit couvertures, comparaison soumissions, negociation.", pilier: "Argent", type: "flow" },
  { id: "pb-CISOB-SAIS-27", nom: "Acomptes Provisionnels Septembre", departement: "CISOB", bots: ["Frank"], etapes: 4, duree: "30min", niveau: "Quick Win", prix: "Gratuit", rating: 4.3, downloads: 586, categorie: "Saisonnier", description: "Calcul et versement avant 15 septembre.", pilier: "Argent", type: "flow" },
  { id: "pb-CFOB-SAIS-28", nom: "Strategie Bonus et Dividendes", departement: "CFOB", bots: ["Frank", "CarlOS"], etapes: 6, duree: "1h", niveau: "Standard", prix: "$49", rating: 4.9, downloads: 269, categorie: "Saisonnier", description: "Optimisation fiscale bonus vs dividendes, scenarios.", pilier: "Argent", type: "flow" },
  { id: "pb-CISOB-SAIS-29", nom: "Audit Intrusion Cybersecurite Annuel", departement: "CISOB", bots: ["Sebastien", "Tim"], etapes: 8, duree: "2h", niveau: "Avance", prix: "$99", rating: 4.4, downloads: 721, categorie: "Saisonnier", description: "Tests penetration, scan vulnerabilites, rapport remediation.", pilier: "Actif", type: "flow" },
  { id: "pb-CHROB-SAIS-30", nom: "Evaluations Salariales Fin Annee", departement: "CHROB", bots: ["Helene", "Frank"], etapes: 6, duree: "1h", niveau: "Standard", prix: "Gratuit", rating: 4.5, downloads: 316, categorie: "Saisonnier", description: "Revue equite salariale, ajustements, benchmarks.", pilier: "Actif", type: "flow" },
  { id: "pb-CMOB-SAIS-31", nom: "Evenements Promotionnels Novembre", departement: "CMOB", bots: ["Mathilde"], etapes: 5, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.9, downloads: 873, categorie: "Saisonnier", description: "Black Friday, Cyber Monday, campagnes fin annee.", pilier: "Vente", type: "flow" },
  { id: "pb-CEOB-SAIS-32", nom: "Approbation Budgets par le CA", departement: "CEOB", bots: ["CarlOS", "Frank"], etapes: 6, duree: "1h", niveau: "Standard", prix: "Gratuit", rating: 4.7, downloads: 305, categorie: "Saisonnier", description: "Presentation budget N+1 au conseil d'administration.", pilier: "Argent", type: "flow" },
  { id: "pb-COOB-SAIS-33", nom: "Securisation Ententes Fournisseurs", departement: "COOB", bots: ["Olivier", "Loulou"], etapes: 5, duree: "45min", niveau: "Standard", prix: "$49", rating: 4.7, downloads: 508, categorie: "Saisonnier", description: "Renouvellement contrats critiques avant fin annee.", pilier: "Actif", type: "flow" },
  { id: "pb-COOB-SAIS-34", nom: "Fermeture Hivernale Decembre", departement: "COOB", bots: ["Olivier"], etapes: 7, duree: "1h", niveau: "Standard", prix: "Gratuit", rating: 4.9, downloads: 765, categorie: "Saisonnier", description: "Protocole fermeture 20 dec au 2 jan, securisation sites.", pilier: "Temps", type: "flow" },
  { id: "pb-CFOB-SAIS-35", nom: "Acompte Provisionnel Q4 Decembre", departement: "CFOB", bots: ["Frank"], etapes: 4, duree: "30min", niveau: "Quick Win", prix: "Gratuit", rating: 4.5, downloads: 629, categorie: "Saisonnier", description: "Paiement 4e acompte avant 15 decembre.", pilier: "Argent", type: "flow" },
  { id: "pb-CHROB-SAIS-36", nom: "Bilan Social Annuel IA", departement: "CHROB", bots: ["Helene", "CarlOS"], etapes: 8, duree: "2h", niveau: "Avance", prix: "$49", rating: 4.5, downloads: 353, categorie: "Saisonnier", description: "Rapport complet climat, retention, formation, diversite.", pilier: "Actif", type: "flow" },
  // ══ MODES COGNITIFS — 8+1 Réunions de Réflexion ══
  { id: "pb-GHO-COG-001", nom: "Reunion Analyse — Decortiquer un sujet", departement: "CEOB", bots: ["CarlOS", "Tim"], etapes: 5, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.7, downloads: 0, categorie: "Cognitif", description: "Session structuree d'analyse approfondie. L'IA guide l'exploration systematique d'un sujet complexe.", pilier: "Idee", type: "cognitif" },
  { id: "pb-GHO-COG-002", nom: "Reunion Debat — Confronter les perspectives", departement: "CEOB", bots: ["CarlOS", "Simone"], etapes: 6, duree: "1h", niveau: "Standard", prix: "Gratuit", rating: 4.6, downloads: 0, categorie: "Cognitif", description: "Debat structure ou l'IA presente des arguments opposes pour tester la robustesse de vos decisions.", pilier: "Idee", type: "cognitif" },
  { id: "pb-GHO-COG-003", nom: "Reunion Brainstorm — Generer des idees", departement: "CEOB", bots: ["CarlOS", "Ines"], etapes: 5, duree: "45min", niveau: "Standard", prix: "Gratuit", rating: 4.8, downloads: 0, categorie: "Cognitif", description: "Brainstorming assiste par IA avec techniques SCAMPER, mind mapping et association libre.", pilier: "Idee", type: "cognitif" },
  { id: "pb-GHO-COG-004", nom: "Reunion Strategie — Planifier le futur", departement: "CEOB", bots: ["CarlOS", "Simone", "Frank"], etapes: 7, duree: "1h30", niveau: "Avance", prix: "Gratuit", rating: 4.7, downloads: 0, categorie: "Cognitif", description: "Session de planification strategique avec analyse SWOT, scenarios et feuille de route.", pilier: "Idee", type: "cognitif" },
  { id: "pb-GHO-COG-005", nom: "Reunion Innovation — Explorer le possible", departement: "CEOB", bots: ["CarlOS", "Ines", "Tim"], etapes: 6, duree: "1h", niveau: "Standard", prix: "Gratuit", rating: 4.5, downloads: 0, categorie: "Cognitif", description: "Exploration d'innovations potentielles avec veille technologique et design thinking.", pilier: "Idee", type: "cognitif" },
  { id: "pb-GHO-COG-006", nom: "Reunion Decision — Trancher avec methode", departement: "CEOB", bots: ["CarlOS", "Frank"], etapes: 5, duree: "30min", niveau: "Standard", prix: "Gratuit", rating: 4.9, downloads: 0, categorie: "Cognitif", description: "Prise de decision assistee avec matrices de criteres, analyse risques et recommandation finale.", pilier: "Idee", type: "cognitif" },
  { id: "pb-GHO-COG-007", nom: "Reunion Crise — Reagir sous pression", departement: "CEOB", bots: ["CarlOS", "Olivier", "Sebastien"], etapes: 6, duree: "30min", niveau: "Avance", prix: "Gratuit", rating: 4.6, downloads: 0, categorie: "Cognitif", description: "Gestion de crise en temps reel avec triage, plan d'action immediat et communication.", pilier: "Actif", type: "cognitif" },
  { id: "pb-GHO-COG-008", nom: "Reunion Deep Resonance — Reflexion profonde", departement: "CEOB", bots: ["CarlOS"], etapes: 4, duree: "1h", niveau: "Avance", prix: "Gratuit", rating: 4.8, downloads: 0, categorie: "Cognitif", description: "Session de reflexion profonde avec connexions interdisciplinaires et insights emergents.", pilier: "Idee", type: "cognitif" },
  { id: "pb-GHO-COG-009", nom: "Reunion CREDO — Protocole complet", departement: "CEOB", bots: ["CarlOS"], etapes: 5, duree: "1h", niveau: "Standard", prix: "Gratuit", rating: 4.7, downloads: 0, categorie: "Cognitif", description: "Session CREDO complete: Connecter, Rechercher, Exposer, Demontrer, Obtenir.", pilier: "Idee", type: "cognitif" },
];

const INSTALLED_PLAYBOOKS = ["pb-001", "pb-003", "pb-008", "pb-020", "pb-025", "pb-030", "pb-037", "pb-050", "pb-058", "pb-071", "pb-074", "pb-082", "pb-090", "pb-091", "pb-104", "pb-200", "pb-202"];

const RECOMMENDED_PLAYBOOKS: { playbookId: string; raison: string; pilier: string }[] = [
  { playbookId: "pb-012", raison: "Score VITAA Ventes a 38% — closing accelerator pour remonter le pipeline", pilier: "Vente" },
  { playbookId: "pb-028", raison: "Aucune modelisation financiere — essentiel pour levee de fonds ou acquisition", pilier: "Argent" },
  { playbookId: "pb-086", raison: "Score Innovation a 42% — sprint Design Thinking pour pipeline produit", pilier: "Idee" },
  { playbookId: "pb-051", raison: "Aucun PCA en place — risque operationnel critique si sinistre", pilier: "Actif" },
  { playbookId: "pb-100", raison: "Score Securite a 22% — audit baseline urgent (MFA partiel, 0 pentest)", pilier: "Actif" },
  { playbookId: "pb-044", raison: "Score FAAS Alliance a 35% — evaluer et structurer les partenariats B2B", pilier: "Vente" },
  { playbookId: "pb-076", raison: "Score FAAS Fraternite a 52% — sondage climat pour retention talents", pilier: "Actif" },
  { playbookId: "pb-047", raison: "Aucun benchmark concurrentiel recent — analyse 360 urgente", pilier: "Idee" },
];

const NIVEAU_BADGE: Record<string, { bg: string; text: string }> = {
  "Quick Win": { bg: "bg-green-50", text: "text-green-700" },
  "Standard": { bg: "bg-blue-50", text: "text-blue-700" },
  "Avance": { bg: "bg-purple-50", text: "text-purple-700" },
  "Enterprise": { bg: "bg-orange-50", text: "text-orange-700" },
};

// Mock data: playbooks en cours d'execution
const RUNNING_PLAYBOOKS: { playbookId: string; progress: number; etapeActuelle: string; botActif: string; tempsRestant: string; statut: "actif" | "pause"; actionRequise?: string }[] = [
  { playbookId: "pb-028", progress: 45, etapeActuelle: "Calcul des ratios de liquidite", botActif: "Frank", tempsRestant: "1h 15m", statut: "pause", actionRequise: "Frank a besoin du Bilan Q3" },
  { playbookId: "pb-038", progress: 85, etapeActuelle: "Redaction du brief creatif", botActif: "Mathilde", tempsRestant: "2 jours", statut: "actif" },
];

// Mock data: playbooks recemment completes
const COMPLETED_PLAYBOOKS: { playbookId: string; completeLe: string; impact: string; pilierImpact: string }[] = [
  { playbookId: "pb-100", completeLe: "12 oct.", impact: "Risque -40%", pilierImpact: "Actif" },
  { playbookId: "pb-071", completeLe: "05 oct.", impact: "Temps +10pts", pilierImpact: "Temps" },
  { playbookId: "pb-047", completeLe: "28 sep.", impact: "Idee +15pts", pilierImpact: "Idee" },
];

// Mock data: saisonnalite Quebec
const SEASONAL_PLAYBOOKS: { playbookId: string; raison: string; echeance: string }[] = [
  { playbookId: "pb-090", raison: "Loi 25 — Echeance annuelle de declaration aupres de la CAI", echeance: "31 dec. 2026" },
  { playbookId: "pb-075", raison: "CNESST — Renouvellement des formations SST obligatoires", echeance: "1 jan. 2027" },
];

const PILIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Vente: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  Idee: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  Temps: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  Argent: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  Actif: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};

// ── Collections V2 (12 collections curateés) ──
const STORE_COLLECTIONS_V2: { id: string; label: string; description: string; icon: React.ElementType; gradient: string; playbookIds: string[] }[] = [
  { id: "essentiels", label: "Les Essentiels pour demarrer", description: "Les 6 playbooks fondamentaux que chaque PME devrait activer en premier", icon: Star, gradient: "from-blue-500 to-indigo-500", playbookIds: ["pb-001", "pb-071", "pb-100", "pb-025", "pb-050", "pb-091"] },
  { id: "conformite", label: "Kit Conformite Quebec", description: "Respectez la Loi 25, CNESST, normes SST et obligations environnementales", icon: Shield, gradient: "from-emerald-500 to-teal-500", playbookIds: ["pb-090", "pb-075", "pb-024", "pb-077", "pb-085", "pb-104"] },
  { id: "croissance", label: "Accelerateurs de Croissance", description: "Boostez vos ventes, marketing et expansion avec des workflows automatises", icon: Rocket, gradient: "from-orange-500 to-red-500", playbookIds: ["pb-010", "pb-012", "pb-038", "pb-037", "pb-045", "pb-028"] },
  { id: "nouveau-ceo", label: "Kit Nouveau CEO", description: "Les 10 premiers playbooks qu'un nouveau dirigeant devrait activer", icon: Crown, gradient: "from-purple-500 to-pink-500", playbookIds: ["pb-001", "pb-028", "pb-100", "pb-071", "pb-050", "pb-091", "pb-003", "pb-008", "pb-025", "pb-030"] },
  { id: "diagnostic", label: "Diagnostic Complet", description: "Passez votre entreprise au scanner — finance, tech, RH, securite, operations", icon: Search, gradient: "from-cyan-500 to-blue-500", playbookIds: ["pb-028", "pb-100", "pb-047", "pb-050", "pb-071", "pb-037"] },
  { id: "crise", label: "Kit Urgence & Crise", description: "Playbooks d'urgence pour les situations critiques — cash flow, incident, rappel produit", icon: ShieldAlert, gradient: "from-red-500 to-rose-500", playbookIds: ["pb-028", "pb-100", "pb-085", "pb-104", "pb-090"] },
  { id: "operations", label: "Automatisation Operations", description: "Production, inventaire, qualite, maintenance — automatisez le plancher", icon: Settings, gradient: "from-gray-500 to-slate-500", playbookIds: ["pb-050", "pb-058", "pb-060", "pb-062", "pb-064"] },
  { id: "scale-up", label: "Scale-Up Pack", description: "Pour les entreprises T3-T5 (50+ employes) pretes a passer au niveau superieur", icon: TrendingUp, gradient: "from-violet-500 to-purple-500", playbookIds: ["pb-010", "pb-012", "pb-037", "pb-045", "pb-003"] },
  { id: "manufacturier", label: "Kit Manufacturier", description: "Specifiquement concu pour les PME manufacturieres quebecoises", icon: HardHat, gradient: "from-amber-500 to-yellow-500", playbookIds: ["pb-050", "pb-058", "pb-060", "pb-062", "pb-090", "pb-075"] },
  { id: "intelligence", label: "Intelligence Concurrentielle", description: "SWOT, veille concurrentielle, positionnement, analyse de marche", icon: Eye, gradient: "from-indigo-500 to-blue-500", playbookIds: ["pb-047", "pb-045", "pb-037", "pb-010"] },
  { id: "rh-complet", label: "Kit RH Complet", description: "Recrutement, onboarding, evaluation de performance, plan de formation", icon: Heart, gradient: "from-pink-500 to-rose-500", playbookIds: ["pb-071", "pb-074", "pb-077", "pb-082"] },
  { id: "planification", label: "Planification Strategique Annuelle", description: "Budget, OKR, plan d'action annuel, revue de performance — tout le cycle", icon: Calendar, gradient: "from-teal-500 to-emerald-500", playbookIds: ["pb-001", "pb-003", "pb-008", "pb-010", "pb-028"] },
];

// Playbook de la semaine (hero)
// Top 3 playbooks de la semaine
const FEATURED_PLAYBOOKS: { playbookId: string; editorial: string; rank: number; gradient: string }[] = [
  { playbookId: "pb-028", editorial: "Le diagnostic financier le plus complet. Frank et CarlOS analysent vos donnees et generent un plan d'action concret.", rank: 1, gradient: "from-blue-600 via-indigo-600 to-purple-600" },
  { playbookId: "pb-045", editorial: "L'atelier BMC le plus populaire du Store. Simone et CarlOS vous guident pas a pas pour structurer votre modele d'affaires.", rank: 2, gradient: "from-rose-600 via-pink-600 to-fuchsia-600" },
  { playbookId: "pb-100", editorial: "Votre premiere ligne de defense. Sebastien et Tim auditent votre posture securite et identifient les failles critiques.", rank: 3, gradient: "from-emerald-600 via-teal-600 to-cyan-600" },
];

// ── Workflows reels par playbook ──
export const PLAYBOOK_WORKFLOWS: Record<string, { num: number; label: string; bot: string; duree: string; input?: string; validation?: boolean; livrable?: string }[]> = {
  "pb-028": [
    { num: 1, label: "Collecte des parametres et perimetre d'analyse", bot: "CarlOS", duree: "~1 min", input: "Confirmez le perimetre" },
    { num: 2, label: "Import des donnees financieres", bot: "Frank", duree: "~2 min" },
    { num: 3, label: "Calcul des ratios de liquidite et solvabilite", bot: "Frank", duree: "~3 min" },
    { num: 4, label: "Analyse comparative sectorielle", bot: "Frank", duree: "~3 min", validation: true },
    { num: 5, label: "Generation du rapport PDF", bot: "Frank", duree: "~2 min" },
    { num: 6, label: "Recommandations strategiques priorisees", bot: "CarlOS", duree: "~2 min" },
    { num: 7, label: "Livraison et plan d'action", bot: "CarlOS", duree: "~2 min", livrable: "rapport_diagnostic_financier.pdf" },
  ],
  "pb-100": [
    { num: 1, label: "Inventaire des actifs informatiques", bot: "Sebastien", duree: "~5 min" },
    { num: 2, label: "Analyse des configurations de securite", bot: "Sebastien", duree: "~10 min" },
    { num: 3, label: "Verification MFA et politiques d'acces", bot: "Sebastien", duree: "~5 min", validation: true },
    { num: 4, label: "Scan des vulnerabilites connues", bot: "Tim", duree: "~10 min" },
    { num: 5, label: "Evaluation des sauvegardes", bot: "Sebastien", duree: "~5 min" },
    { num: 6, label: "Generation du rapport d'audit", bot: "Sebastien", duree: "~5 min", livrable: "rapport_audit_securite.pdf" },
  ],
};

// ── Reviews mock ──
const PLAYBOOK_REVIEWS_FALLBACK: { auteur: string; role: string; industrie: string; rating: number; titre: string; texte: string; date: string; resultat?: string }[] = [
  { auteur: "Martin R.", role: "CEO", industrie: "Services, Quebec", rating: 5, titre: "Exactement ce qu'il nous fallait", texte: "Le workflow est clair, les bots livrent rapidement et le resultat est professionnel. On l'a adopte dans notre routine.", date: "2026-03-20", resultat: "Gain de temps estime +30%" },
  { auteur: "Nathalie P.", role: "Dir. Operations", industrie: "Manufacturier, Levis", rating: 4, titre: "Tres utile, bien structure", texte: "Facile a suivre etape par etape. Les livrables sont pertinents et actionnables. Je recommande.", date: "2026-02-28" },
  { auteur: "Yves C.", role: "VP Ventes", industrie: "Distribution, Laval", rating: 5, titre: "ROI immediat", texte: "On a vu des resultats concrets des la premiere semaine. L'equipe IA est impressionnante.", date: "2026-03-05", resultat: "Pipeline +25% en 2 semaines" },
];
const PLAYBOOK_REVIEWS: Record<string, { auteur: string; role: string; industrie: string; rating: number; titre: string; texte: string; date: string; resultat?: string }[]> = {
  "pb-012": [
    { auteur: "Francois M.", role: "VP Ventes", industrie: "SaaS, Montreal", rating: 5, titre: "Notre taux de closing a bondi", texte: "Les scripts personnalises et l'analyse d'objections ont transforme notre approche. Rich et Simone ont identifie nos 3 plus grosses failles dans le pitch.", date: "2026-03-18", resultat: "Taux de closing +22%" },
    { auteur: "Annie L.", role: "Dir. Commerciale", industrie: "Manufacturier, Drummondville", rating: 5, titre: "Game changer pour l'equipe ventes", texte: "Chaque vendeur a maintenant un script adapte a son style. Les objections sont anticipees et les reponses sont naturelles.", date: "2026-02-25", resultat: "Cycle de vente -15 jours" },
    { auteur: "Patrick T.", role: "CEO", industrie: "Services B2B, Quebec", rating: 4, titre: "Excellent pour structurer le closing", texte: "On improvisait avant. Maintenant on a un processus. Seul bemol: necessite du coaching pour bien integrer les scripts.", date: "2026-03-08" },
  ],
  "pb-028": [
    { auteur: "Marc D.", role: "Dir. Operations", industrie: "Manufacturier, Quebec", rating: 5, titre: "Exactement ce dont on avait besoin", texte: "Le diagnostic a revele 3 problemes qu'on ne voyait pas. Le plan d'action etait concret et applicable.", date: "2026-03-15", resultat: "Temps de diagnostic reduit de 40%" },
    { auteur: "Julie L.", role: "CFO", industrie: "Distribution, Montreal", rating: 4, titre: "Tres bon mais manque de granularite", texte: "L'analyse est pertinente mais j'aurais aime plus de details sur les ratios sectoriels.", date: "2026-02-10" },
    { auteur: "Pierre B.", role: "CEO", industrie: "Alimentaire, Trois-Rivieres", rating: 5, titre: "On l'utilise chaque trimestre maintenant", texte: "Simple, rapide, et le rapport est professionnel. Nos investisseurs sont impressionnes.", date: "2026-01-28", resultat: "Adopte comme outil trimestriel" },
  ],
  "pb-100": [
    { auteur: "Sophie G.", role: "Dir. TI", industrie: "Logistique, Laval", rating: 5, titre: "A revele des failles critiques", texte: "On pensait etre OK. L'audit a trouve 7 failles dont 2 critiques. Corrigees en 48h grace au plan.", date: "2026-03-01", resultat: "Score securite +35 points" },
    { auteur: "Eric T.", role: "CEO", industrie: "Manufacturier, Sherbrooke", rating: 4, titre: "Bon point de depart", texte: "Pour le prix, c'est un excellent premier audit. On a enchaine avec le plan de reponse incidents.", date: "2026-02-20" },
  ],
};

// ── Livrables mock ──
export const PLAYBOOK_LIVRABLES: Record<string, { nom: string; type: string; icon: React.ElementType }[]> = {
  "pb-028": [
    { nom: "Rapport de diagnostic financier", type: "PDF", icon: FileText },
    { nom: "Tableau comparatif industrie", type: "Excel", icon: Table2 },
    { nom: "Plan d'action priorise", type: "PDF", icon: CheckCircle2 },
  ],
  "pb-100": [
    { nom: "Rapport d'audit securite", type: "PDF", icon: Shield },
    { nom: "Matrice de risques", type: "Excel", icon: ClipboardCheck },
    { nom: "Plan de correction (12 actions)", type: "PDF", icon: Wrench },
  ],
};

// ── Dept icons mapping for category grid ──
// ── ICÔNES OFFICIELLES DÉPARTEMENTS (source unique — catalogue Section B) ──
export const DEPT_DASH_ICON: Record<string, React.ElementType> = {
  CEOB: Crown, CFOB: DollarSign, CTOB: Cpu, CPOB: Factory, COOB: Settings,
  CROB: TrendingUp, CMOB: Megaphone, CSOB: Compass, CHROB: Users,
  CISOB: ShieldCheck, CLOB: Scale, CINOB: Lightbulb,
};
// DEPT_ICONS importé depuis dept-data (alias de DEPT_DASH_ICON)

// ── PLAYBOOK_TYPES — 12 types de livrables ──
const PLAYBOOK_TYPES: Record<string, { label: string; icon: React.ElementType; description: string; bg: string; text: string; gradient: string }> = {
  chantier:    { label: "Chantier",    icon: Flame,          description: "Transformations completes (2-12 mois)",    bg: "bg-blue-50",    text: "text-blue-700",    gradient: "from-blue-600 to-blue-500" },
  projet:      { label: "Projet",      icon: FolderOpen,     description: "Livrables structures (1-3 mois)",          bg: "bg-indigo-50",  text: "text-indigo-700",  gradient: "from-indigo-600 to-indigo-500" },
  mission:     { label: "Mission",     icon: Target,         description: "Actions recurrentes (1-4 sem)",             bg: "bg-amber-50",   text: "text-amber-700",   gradient: "from-amber-600 to-amber-500" },
  tache:       { label: "Tache",       icon: ListChecks,     description: "Checklists/actions atomiques",              bg: "bg-emerald-50", text: "text-emerald-700", gradient: "from-emerald-600 to-emerald-500" },
  conference:  { label: "Conference",  icon: Video,          description: "Sessions temps reel",                       bg: "bg-pink-50",    text: "text-pink-700",    gradient: "from-pink-600 to-pink-500" },
  document:    { label: "Document",    icon: FileText,       description: "Fichiers generes (Word/Excel/PDF)",         bg: "bg-gray-50",    text: "text-gray-700",    gradient: "from-gray-600 to-gray-500" },
  flow:        { label: "Flow",        icon: Repeat,         description: "Workflows automatises (COMMAND)",           bg: "bg-violet-50",  text: "text-violet-700",  gradient: "from-violet-600 to-violet-500" },
  diagnostic:  { label: "Diagnostic",  icon: Stethoscope,    description: "Evaluations/scoring",                      bg: "bg-red-50",     text: "text-red-700",     gradient: "from-red-600 to-red-500" },
  formation:   { label: "Formation",   icon: GraduationCap,  description: "Parcours apprentissage/coaching",           bg: "bg-teal-50",    text: "text-teal-700",    gradient: "from-teal-600 to-teal-500" },
  blueprint:   { label: "Blueprint",   icon: MapPin,         description: "Documents strategiques",                    bg: "bg-purple-50",  text: "text-purple-700",  gradient: "from-purple-600 to-purple-500" },
  cognitif:    { label: "Cognitif",    icon: Cog,            description: "Cerveaux experts uploades",                 bg: "bg-orange-50",  text: "text-orange-700",  gradient: "from-orange-600 to-orange-500" },
  reseau:      { label: "Reseau",      icon: Network,        description: "Collaborations Orbit9",                    bg: "bg-cyan-50",    text: "text-cyan-700",    gradient: "from-cyan-600 to-cyan-500" },
};

// ── Descriptions longues pour la fiche detail ──
export const PLAYBOOK_LONG_DESC: Record<string, string> = {
  "pb-012": "Rich et Simone analysent vos objections recurrentes et generent des scripts de closing personnalises pour votre industrie. Augmentez votre taux de closing de 15 a 25% avec un processus structure et repeatable.",
  "pb-028": "Frank calcule 25+ ratios financiers et compare vos resultats aux moyennes de votre secteur au Quebec. Vous recevez un rapport executif PDF avec des recommandations priorisees par impact.",
  "pb-100": "Sebastien et Tim auditent vos actifs informatiques, configurations de securite et politiques d'acces. Le rapport inclut une matrice de risques et un plan de correction en 12 actions concretes.",
};

// Precomputed thresholds for card badges
const _sortedByDownloads = [...PLAYBOOK_STORE_DATA].sort((a, b) => b.downloads - a.downloads);
const _bestsellersTop20 = new Set(_sortedByDownloads.slice(0, 20).map(p => p.id));
const _sortedByRating = [...PLAYBOOK_STORE_DATA].sort((a, b) => b.rating - a.rating);
const _trendingTop10 = new Set(_sortedByRating.slice(0, 10).map(p => p.id));
const _newestIds = new Set(PLAYBOOK_STORE_DATA.slice(-Math.ceil(PLAYBOOK_STORE_DATA.length * 0.1)).map(p => p.id));

export function PlaybookCardV2({ pb, installed, recommended, badge, onOpenDetail }: { pb: typeof PLAYBOOK_STORE_DATA[0]; installed?: boolean; recommended?: boolean; badge?: "nouveau" | "populaire" | "trending"; onOpenDetail?: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void }) {
  const niveauStyle = NIVEAU_BADGE[pb.niveau] || NIVEAU_BADGE.Standard;
  const DeptIcon = DEPT_ICONS[pb.departement] || Building2;
  const isInstalled = installed || INSTALLED_PLAYBOOKS.includes(pb.id);

  // Compute auto-badges from data
  const isBestseller = _bestsellersTop20.has(pb.id);
  const isTrending = _trendingTop10.has(pb.id);
  const isNew = _newestIds.has(pb.id);

  const badgeEl = badge === "nouveau" ? <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 shrink-0">Nouveau</span>
    : badge === "populaire" ? <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 shrink-0">Populaire</span>
    : badge === "trending" ? <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 shrink-0">Trending</span>
    : recommended ? <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-green-50 text-green-700 shrink-0">IA Recommande</span>
    : isInstalled ? <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 shrink-0 flex items-center gap-0.5"><CheckCircle2 className="h-3.5 w-3.5" />Installe</span>
    : null;

  // 5-star visual rating
  const fullStars = Math.floor(pb.rating);
  const hasHalf = pb.rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="relative rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all cursor-pointer" onClick={() => onOpenDetail?.(pb)}>
      {/* Absolute corner badges */}
      {!badge && (isBestseller || isTrending || isNew) && (
        <div className="absolute top-0 right-0 z-10 flex flex-col gap-0.5 p-1">
          {isBestseller && <span className="text-[7px] font-bold px-1.5 py-0.5 rounded-bl rounded-tr-xl bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-0.5"><Trophy className="h-3.5 w-3.5" />Best</span>}
          {isTrending && !isBestseller && <span className="text-[7px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 flex items-center gap-0.5"><Flame className="h-3.5 w-3.5" />Trend</span>}
          {isNew && !isBestseller && !isTrending && <span className="text-[7px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 flex items-center gap-0.5"><Sparkles className="h-3.5 w-3.5" />New</span>}
        </div>
      )}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
        <DeptIcon className="h-4 w-4 text-gray-900 stroke-[2.5]" />
        <span className="text-sm font-bold text-gray-900 flex-1 truncate">{pb.nom}</span>
        {badgeEl}
      </div>
      <div className="px-4 py-3 space-y-2.5">
        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{pb.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-wrap">
            {pb.bots.slice(0, 3).map((bot, i) => (
              <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{bot}</span>
            ))}
            {pb.bots.length > 3 && <span className="text-[10px] text-gray-400">+{pb.bots.length - 3}</span>}
          </div>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: fullStars }).map((_, i) => <Star key={`f${i}`} className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />)}
            {hasHalf && <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-200" />}
            {Array.from({ length: emptyStars }).map((_, i) => <Star key={`e${i}`} className="h-3.5 w-3.5 text-gray-200" />)}
            <span className="text-[10px] font-bold text-gray-700 ml-1">{pb.rating}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded", niveauStyle.bg, niveauStyle.text)}>{pb.niveau}</span>
          {pb.type && PLAYBOOK_TYPES[pb.type] && (() => { const t = PLAYBOOK_TYPES[pb.type]; const TIcon = t.icon; return <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-0.5", t.bg, t.text)}><TIcon className="h-3.5 w-3.5" />{t.label}</span>; })()}
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded", pb.prix === "Gratuit" ? "bg-emerald-50 text-emerald-700" : "bg-purple-50 text-purple-700")}>{pb.prix === "Gratuit" ? "Inclus" : pb.prix}</span>
          <span className="text-[10px] text-gray-500">{pb.duree}</span>
          <span className="text-[10px] text-gray-500">{pb.etapes} etapes</span>
        </div>
      </div>
    </div>
  );
}

// ── Fiche Playbook Detaillee INLINE (PAS de modal — drill-down dans le panel) ──
function PlaybookFicheDetailInline({ pb, onBack }: { pb: typeof PLAYBOOK_STORE_DATA[0]; onBack: () => void }) {
  const niveauStyle = NIVEAU_BADGE[pb.niveau] || NIVEAU_BADGE.Standard;
  const isInstalled = INSTALLED_PLAYBOOKS.includes(pb.id);
  const pilierColor = PILIER_COLORS[pb.pilier] || PILIER_COLORS.Actif;
  const workflows = PLAYBOOK_WORKFLOWS[pb.id] || Array.from({ length: pb.etapes }, (_, i) => ({
    num: i + 1, label: i === 0 ? "Collecte des donnees et parametres" : i === pb.etapes - 1 ? "Generation du livrable final" : `Etape ${i + 1} — Traitement automatise`, bot: pb.bots[i % pb.bots.length], duree: "~2 min", validation: i === Math.floor(pb.etapes / 2),
  }));
  const reviews = PLAYBOOK_REVIEWS[pb.id] || PLAYBOOK_REVIEWS_FALLBACK;
  const livrables = PLAYBOOK_LIVRABLES[pb.id] || [];
  const similarDept = PLAYBOOK_STORE_DATA.filter(p => p.departement === pb.departement && p.id !== pb.id).slice(0, 3);
  const similarPilier = PLAYBOOK_STORE_DATA.filter(p => p.pilier === pb.pilier && p.id !== pb.id && p.departement !== pb.departement).slice(0, 3);

  // Resolve bot name → code for avatars
  const botNameToCode = Object.fromEntries(Object.entries(BOT_DISPLAY).map(([code, d]) => [d.name, code]));
  const deptColor = DEPT_COLORS[pb.departement] || DEPT_COLORS.CEOB;
  const DeptIcon = DEPT_ICONS[pb.departement] || Building2;

  return (
    <div className="space-y-3">
      {/* Back button */}
      <button onClick={onBack} className="text-xs text-blue-600 hover:text-blue-800 font-bold cursor-pointer flex items-center gap-1">
        <ChevronRight className="h-3.5 w-3.5 rotate-180" /> Retour au Store
      </button>

      {/* Section 1 — Hero + Details side by side */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Hero (3/5) — style Top 3 gradient */}
        <div className={cn("col-span-3 relative bg-gradient-to-r rounded-xl overflow-hidden shadow-sm", deptColor.gradient)}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative p-4 space-y-3">
            <h3 className="text-lg font-bold text-white leading-tight flex items-center gap-2">
              <DeptIcon className="h-5 w-5 text-white shrink-0" />
              {pb.nom}
            </h3>
            <p className="text-xs text-white/80 leading-relaxed">{PLAYBOOK_LONG_DESC[pb.id] || pb.description}</p>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={cn("h-3.5 w-3.5", s <= Math.round(pb.rating) ? "text-amber-300 fill-amber-300" : "text-white/20")} />
                ))}
              </div>
              <span className="text-xs text-white font-bold">{pb.rating}/5</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-white/70">
              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{pb.downloads} activations</span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{pb.duree}</span>
              <span className="flex items-center gap-1"><Activity className="h-3.5 w-3.5" />{pb.etapes} etapes</span>
              <span className="font-medium px-1.5 py-0.5 rounded bg-white/15 text-white">v1.0</span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              {isInstalled ? (
                <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-900 bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-all">
                  <Rocket className="h-3.5 w-3.5" /> Executer
                </button>
              ) : pb.prix === "Gratuit" ? (
                <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-900 bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-all">
                  <Plus className="h-3.5 w-3.5" /> Activer ce playbook
                </button>
              ) : (
                <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-gray-900 bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-all">
                  <ShoppingBag className="h-3.5 w-3.5" /> Acheter {pb.prix}
                </button>
              )}
              <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-white/15 hover:bg-white/25 rounded-lg cursor-pointer transition-colors">
                <Eye className="h-3.5 w-3.5" /> Previsualiser
              </button>
            </div>
          </div>
        </div>

        {/* Details (2/5) */}
        <div className="col-span-2 rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white flex flex-col">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <Settings className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Details</span>
          </div>
          <div className="px-4 py-3 flex-1 flex flex-col">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Departement</span>
                <span className="text-xs font-bold text-gray-700">{DEPT_LABELS[pb.departement] || pb.departement}</span>
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Categorie</span>
                <span className="text-xs font-bold text-gray-700">{pb.categorie}</span>
              </div>
              {pb.type && PLAYBOOK_TYPES[pb.type] && (() => { const t = PLAYBOOK_TYPES[pb.type]; const TIcon = t.icon; return (
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Type</span>
                <span className={cn("text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1", t.bg, t.text)}><TIcon className="h-3.5 w-3.5" />{t.label}</span>
              </div>); })()}
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Pilier VITAA</span>
                <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", pilierColor.bg, pilierColor.text, pilierColor.border, "border")}>{pb.pilier}</span>
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Createur</span>
                <span className="text-xs font-bold text-gray-700">Brain Team</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2+3 — Ce que ce playbook fait + Equipe (side by side) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Ce que ce playbook fait */}
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <CheckCircle2 className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Ce que ce playbook fait</span>
          </div>
          <div className="px-4 py-3 space-y-2">
            {(pb.description + ". Analyse automatique de vos donnees. Generation d'un rapport complet. Plan d'action priorise.").split(". ").filter(Boolean).slice(0, 4).map((point, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-xs text-gray-700 leading-relaxed">{point.trim()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Equipe IA impliquee */}
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <Users className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Equipe IA</span>
          </div>
          <div className="px-4 py-3 space-y-2">
            {pb.bots.map((bot, i) => {
              const bCode = botNameToCode[bot] || "CEOB";
              const bAvatar = BOT_AVATAR_MAP[bCode] || BOT_AVATAR_MAP.CEOB;
              const bDisplay = BOT_DISPLAY[bCode];
              return (
                <div key={i} className="flex items-center gap-2.5 bg-gray-50 rounded-lg px-3 py-2">
                  <img src={bAvatar} className="h-7 w-7 rounded-full ring-2 ring-white/80 object-cover shrink-0" alt="" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-gray-800 block">{bot}</span>
                    <span className="text-[10px] text-gray-500">{bDisplay?.role || "Agent"} — {bDisplay?.dept || ""}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{i === 0 ? "Pilote" : i === 1 ? "Analyste" : "Support"}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section 4 — Workflow */}
      <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
          <Activity className="h-4 w-4 text-gray-900 stroke-[2.5]" />
          <span className="text-sm font-bold text-gray-900">Workflow</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 ml-auto">{workflows.length} etapes</span>
        </div>
        <div className="px-4 py-3 space-y-1">
          {workflows.map((step) => {
            const sCode = botNameToCode[step.bot] || "CEOB";
            const sAvatar = BOT_AVATAR_MAP[sCode] || BOT_AVATAR_MAP.CEOB;
            return (
              <div key={step.num} className="flex items-center gap-3 py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-[10px] font-bold text-white bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center shrink-0">{step.num}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-gray-800">{step.label}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    {step.validation && <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5"><AlertTriangle className="h-3.5 w-3.5" /> Validation requise</span>}
                    {step.livrable && <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5"><FileText className="h-3.5 w-3.5" /> {step.livrable}</span>}
                    {step.input && <span className="text-[10px] text-gray-500 italic">{step.input}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <img src={sAvatar} className="h-5 w-5 rounded-full object-cover" alt="" />
                  <span className="text-[10px] font-bold text-blue-600">{step.bot}</span>
                </div>
                <span className="text-[10px] text-gray-400 shrink-0">{step.duree}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 5 — Ce que vous recevez (livrables) */}
      {livrables.length > 0 && (
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <FileText className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Ce que vous recevez</span>
          </div>
          <div className="px-4 py-3 space-y-2">
            {livrables.map((l, i) => {
              const LivIcon = l.icon;
              return (
                <div key={i} className="flex items-center gap-2.5 bg-gray-50 rounded-lg px-3 py-2">
                  <LivIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-700 flex-1">{l.nom}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-200 text-gray-600">{l.type}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 6 — Avis utilisateurs */}
      {reviews.length > 0 && (
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <Star className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Avis utilisateurs</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 ml-auto">{reviews.length} avis</span>
          </div>
          <div className="px-4 py-3 space-y-3">
            {/* Rating distribution */}
            <div className="space-y-0.5">
              {[5,4,3,2,1].map(stars => {
                const count = reviews.filter(r => r.rating === stars).length;
                const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-500 w-3">{stars}</span>
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    <div className="flex-1 bg-gray-100 rounded-full h-2"><div className="bg-amber-400 rounded-full h-2 transition-all" style={{ width: `${pct}%` }} /></div>
                    <span className="text-[10px] text-gray-400 w-4 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
            {/* Reviews */}
            <div className="space-y-2.5">
              {reviews.map((r, i) => (
                <div key={i} className="border-t border-gray-100 pt-2.5">
                  <div className="flex items-center gap-1 mb-1">
                    {[1,2,3,4,5].map(s => <Star key={s} className={cn("h-3.5 w-3.5", s <= r.rating ? "text-amber-400 fill-amber-400" : "text-gray-200")} />)}
                    <span className="text-xs font-bold text-gray-800 ml-1.5">{r.titre}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{r.texte}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400">
                    <span className="font-medium">{r.auteur}, {r.role}</span>
                    <span>{r.industrie}</span>
                    {r.resultat && <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">{r.resultat}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section 7 — Playbooks similaires */}
      {(similarDept.length > 0 || similarPilier.length > 0) && (
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
            <Zap className="h-4 w-4 text-gray-900 stroke-[2.5]" />
            <span className="text-sm font-bold text-gray-900">Playbooks similaires</span>
          </div>
          <div className="px-4 py-3 space-y-3">
            {similarDept.length > 0 && (
              <div>
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Souvent active ensemble</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {similarDept.map(sp => {
                    const spCode = botNameToCode[sp.bots[0]] || "CEOB";
                    const spAvatar = BOT_AVATAR_MAP[spCode] || BOT_AVATAR_MAP.CEOB;
                    return (
                      <div key={sp.id} className="bg-gray-50 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-1.5 mb-1">
                          <img src={spAvatar} className="h-5 w-5 rounded-full object-cover" alt="" />
                          <span className="text-[10px] text-gray-500">{sp.bots[0]}</span>
                        </div>
                        <div className="text-xs font-bold text-gray-800 line-clamp-2">{sp.nom}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{sp.niveau} · {sp.prix}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {similarPilier.length > 0 && (
              <div>
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Vous pourriez aussi aimer</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {similarPilier.map(sp => {
                    const spCode = botNameToCode[sp.bots[0]] || "CEOB";
                    const spAvatar = BOT_AVATAR_MAP[spCode] || BOT_AVATAR_MAP.CEOB;
                    return (
                      <div key={sp.id} className="bg-gray-50 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-1.5 mb-1">
                          <img src={spAvatar} className="h-5 w-5 rounded-full object-cover" alt="" />
                          <span className="text-[10px] text-gray-500">{sp.bots[0]}</span>
                        </div>
                        <div className="text-xs font-bold text-gray-800 line-clamp-2">{sp.nom}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{sp.niveau} · {sp.prix}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

// ══════════════════════════════════════════
// PLAYBOOK STORE — Vues individuelles
// ══════════════════════════════════════════

type PlaybookStoreView = "decouvrir" | "categorie" | "types" | "conferenceai" | "collections" | "installed" | "encours" | "historique" | "builder";

// ── Vue DECOUVRIR (homepage du Store) ──
function PlaybookDecouvrir({ botCode, onOpenDetail, onNavigate }: { botCode: string; onOpenDetail: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void; onNavigate: (view: PlaybookStoreView, extra?: { dept?: string; collection?: string }) => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterNiveau, setFilterNiveau] = useState<string>("all");
  const [filterPrix, setFilterPrix] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("populaires");
  const [viewMode, setViewMode] = useState<"cards" | "list" | "table">("cards");

  const hasFilters = searchTerm.trim() || filterDept !== "all" || filterType !== "all" || filterNiveau !== "all" || filterPrix !== "all";

  // Base pool: CEOB = tout, autre = priorise son département
  const basePool = botCode === "CEOB" ? PLAYBOOK_STORE_DATA : [...PLAYBOOK_STORE_DATA.filter(p => p.departement === botCode), ...PLAYBOOK_STORE_DATA.filter(p => p.departement !== botCode)];

  // Filtered pool
  let filteredPool = basePool.filter(pb => {
    if (searchTerm.trim() && !pb.nom.toLowerCase().includes(searchTerm.toLowerCase()) && !pb.categorie.toLowerCase().includes(searchTerm.toLowerCase()) && !pb.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterDept !== "all" && pb.departement !== filterDept) return false;
    if (filterType !== "all" && pb.type !== filterType) return false;
    if (filterNiveau !== "all" && pb.niveau !== filterNiveau) return false;
    if (filterPrix === "gratuit" && pb.prix !== "Gratuit") return false;
    if (filterPrix === "premium" && pb.prix === "Gratuit") return false;
    return true;
  });

  if (sortBy === "populaires") filteredPool.sort((a, b) => b.downloads - a.downloads);
  else if (sortBy === "rating") filteredPool.sort((a, b) => b.rating - a.rating);
  else if (sortBy === "alpha") filteredPool.sort((a, b) => a.nom.localeCompare(b.nom));

  // Curated sections — filtré par département quand non-CEOB
  const deptPool = botCode !== "CEOB" ? PLAYBOOK_STORE_DATA.filter(p => p.departement === botCode) : PLAYBOOK_STORE_DATA;
  const bestsellers = [...deptPool].sort((a, b) => b.downloads - a.downloads).slice(0, 8);
  const recent = [...deptPool].slice(-8).reverse();
  const gratuits = [...deptPool].filter(p => p.prix === "Gratuit").sort((a, b) => b.downloads - a.downloads).slice(0, 8);

  // Section row helper — respecte viewMode global
  const SectionRow = ({ title, icon: Icon, iconColor, items, badge, seeAllAction }: { title: string; icon: React.ElementType; iconColor: string; items: typeof PLAYBOOK_STORE_DATA; badge?: "nouveau" | "populaire" | "trending"; seeAllAction?: () => void }) => {
    if (items.length === 0) return null;
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><Icon className={cn("h-3.5 w-3.5", iconColor)} /> {title}</h3>
          {seeAllAction && <button onClick={seeAllAction} className="text-[9px] text-blue-500 hover:text-blue-700 cursor-pointer font-bold">Voir tout →</button>}
        </div>
        <PlaybookMultiView playbooks={items.slice(0, 8)} viewMode={viewMode} onOpenDetail={onOpenDetail} />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* ═══ TOOLBAR — 2 lignes équilibrées ═══ */}
      <div className="space-y-2">
        {/* Ligne 1 : Recherche pleine largeur */}
        <div className={SF.searchWrap}>
          <Search className={SF.searchIcon} />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Rechercher un playbook..." className={SF.searchInput} />
        </div>
        {/* Ligne 2 : Filtres + Classement + Mode de vue + Count */}
        <div className="flex items-center gap-2">
          {botCode === "CEOB" && (
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className={SF.select}>
              <option value="all">Departement</option>
              {Object.entries(DEPT_SHORT_LABEL).filter(([code]) => code !== "ORBIT9").map(([code, label]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
          )}
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className={SF.select}>
            <option value="all">Type</option>
            {Object.entries(PLAYBOOK_TYPES).map(([key, t]) => <option key={key} value={key}>{t.label}</option>)}
          </select>
          <select value={filterNiveau} onChange={e => setFilterNiveau(e.target.value)} className={SF.select}>
            <option value="all">Niveau</option>
            <option value="Quick Win">Quick Win</option>
            <option value="Standard">Standard</option>
            <option value="Avance">Avance</option>
            <option value="Enterprise">Enterprise</option>
          </select>
          <select value={filterPrix} onChange={e => setFilterPrix(e.target.value)} className={SF.select}>
            <option value="all">Prix</option>
            <option value="gratuit">Inclus</option>
            <option value="premium">Premium</option>
          </select>
          <div className="flex-1" />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={SF.select}>
            <option value="populaires">Populaires</option>
            <option value="rating">Mieux notes</option>
            <option value="alpha">A-Z</option>
          </select>
          <PlaybookViewToggle viewMode={viewMode} setViewMode={setViewMode} />
          <span className={SF.itemCount}>{hasFilters ? `${filteredPool.length} trouves` : `${basePool.length} playbooks`}</span>
        </div>
      </div>

      {/* ═══ FILTERED RESULTS (when filters active) ═══ */}
      {hasFilters ? (
        filteredPool.length > 0 ? (
          <PlaybookMultiView playbooks={filteredPool} viewMode={viewMode} onOpenDetail={onOpenDetail} />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="h-8 w-8 text-gray-200 mb-3" />
            <p className="text-xs text-gray-400 mb-2">Aucun playbook ne correspond a vos criteres</p>
            <button onClick={() => { setSearchTerm(""); setFilterDept("all"); setFilterType("all"); setFilterNiveau("all"); setFilterPrix("all"); }} className="text-[9px] text-blue-600 font-bold cursor-pointer">Reinitialiser les filtres</button>
          </div>
        )
      ) : (
        <>
          {/* ═══ CURATED SECTIONS (no filters) ═══ */}

          {/* Section 1 — Bestsellers */}
          <SectionRow title="Bestsellers" icon={Trophy} iconColor="text-amber-500" items={bestsellers} badge="populaire" />

          {/* Section 2 — Nouveautes */}
          <SectionRow title={botCode !== "CEOB" ? `Nouveautes ${DEPT_SHORT_LABEL[botCode] || botCode}` : "Nouveautes"} icon={Sparkles} iconColor="text-blue-500" items={recent} badge="nouveau" />

          {/* Section 3 — Gratuits populaires */}
          <SectionRow title="Gratuits populaires" icon={Award} iconColor="text-emerald-500" items={gratuits} />

          {/* Section 5 — Collections vedettes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><Bookmark className="h-3.5 w-3.5 text-purple-500" /> Collections vedettes</h3>
              <button onClick={() => onNavigate("collections")} className="text-[9px] text-blue-500 hover:text-blue-700 cursor-pointer font-bold">Voir tout →</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {STORE_COLLECTIONS_V2.slice(0, 4).map(col => {
                const ColIcon = col.icon;
                return (
                  <Card key={col.id} className="p-0 gap-0 overflow-hidden rounded-xl cursor-pointer hover:shadow-md transition-all" onClick={() => onNavigate("collections", { collection: col.id })}>
                    <div className={cn("bg-gradient-to-r px-3 py-3", col.gradient)}>
                      <ColIcon className="h-4 w-4 text-white mb-1" />
                      <div className="text-[10px] font-bold text-white">{col.label}</div>
                      <div className="text-[8px] text-white/70 mt-0.5 line-clamp-1">{col.description}</div>
                      <div className="text-[8px] text-white/60 mt-1">{col.playbookIds.length} playbooks</div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Section 6 — Explorer par departement (CEOB only) */}
          {botCode === "CEOB" && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><LayoutGrid className="h-3.5 w-3.5 text-gray-500" /> Explorer par departement</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.entries(DEPT_LABELS).filter(([code]) => code !== "ORBIT9").map(([code, label]) => {
                  const DIcon = DEPT_ICONS[code] || Building2;
                  const deptPlaybooks = PLAYBOOK_STORE_DATA.filter(p => p.departement === code);
                  const count = deptPlaybooks.length;
                  const avgRating = count > 0 ? (deptPlaybooks.reduce((s, p) => s + p.rating, 0) / count).toFixed(1) : "0";
                  const avatarSrc = BOT_AVATAR[code];
                  const botName = BOT_NAME[code] || code;
                  return (
                    <div key={code} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all cursor-pointer" onClick={() => onNavigate("categorie", { dept: code })}>
                      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
                        {avatarSrc ? (
                          <img src={avatarSrc} alt={botName} className="h-6 w-6 rounded-full ring-1 ring-white/80 object-cover shrink-0" />
                        ) : (
                          <DIcon className="h-4 w-4 text-gray-900 stroke-[2.5] shrink-0" />
                        )}
                        <span className="text-xs font-bold text-gray-900 flex-1 truncate">{label}</span>
                      </div>
                      <div className="px-3 py-2 flex items-center gap-3 text-[10px] text-gray-500">
                        <span className="font-bold text-gray-700">{count}</span>
                        <span className="flex items-center gap-0.5"><Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />{avgRating}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 7 — Explorer par type */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><Layers className="h-3.5 w-3.5 text-indigo-500" /> {botCode !== "CEOB" ? `Types ${DEPT_SHORT_LABEL[botCode] || botCode}` : "Explorer par type"}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(PLAYBOOK_TYPES).map(([key, t]) => {
                const TIcon = t.icon;
                const typePlaybooks = botCode !== "CEOB"
                  ? PLAYBOOK_STORE_DATA.filter(p => p.type === key && p.departement === botCode)
                  : PLAYBOOK_STORE_DATA.filter(p => p.type === key);
                const count = typePlaybooks.length;
                if (count === 0) return null;
                return (
                  <div key={key} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all cursor-pointer" onClick={() => onNavigate("types", { dept: key })}>
                    <div className={cn("flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gradient-to-r text-white", t.gradient)}>
                      <TIcon className="h-3.5 w-3.5 text-white shrink-0" />
                      <span className="text-[10px] font-bold text-white">{t.label}</span>
                    </div>
                    <div className="px-3 py-2 text-[10px] text-gray-500">
                      <span className="font-bold text-gray-700">{count}</span> playbooks
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Bandeau Marketplace */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-lg px-3 py-2 flex items-center gap-2">
        <Info className="h-3.5 w-3.5 text-blue-500 shrink-0" />
        <span className="text-[9px] text-blue-700">Playbook · {botCode !== "CEOB" ? `${PLAYBOOK_STORE_DATA.filter(p => p.departement === botCode).length} playbooks ${DEPT_SHORT_LABEL[botCode] || botCode}` : `${PLAYBOOK_STORE_DATA.length} playbooks disponibles`} · 85% createur / 15% plateforme</span>
        <button onClick={() => onNavigate("builder")} className="text-[9px] text-blue-600 hover:text-blue-800 font-bold cursor-pointer ml-auto shrink-0">Publiez le votre →</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// CONFERENCE AI — Mega Section (toutes les familles)
// ══════════════════════════════════════════

export const CONFERENCE_FAMILIES: Record<string, { label: string; icon: React.ElementType; description: string; gradient: string; bg: string; text: string }> = {
  VENT: { label: "Vente & Revenus", icon: Banknote, description: "Pitch decks, closing assiste, prospection, negociation", gradient: "from-emerald-600 to-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
  POD: { label: "Podcast & Audio", icon: Headphones, description: "Studio podcast, distribution, guest matching, SEO audio", gradient: "from-violet-600 to-violet-500", bg: "bg-violet-50", text: "text-violet-700" },
  CONT: { label: "Contenu & Redaction", icon: FileText, description: "Articles, copywriting, whitepapers, documentation", gradient: "from-blue-600 to-blue-500", bg: "bg-blue-50", text: "text-blue-700" },
  PRE: { label: "Pre-Entrevue & RH", icon: User, description: "Entrevues candidats, grilles evaluation, rapports", gradient: "from-pink-600 to-pink-500", bg: "bg-pink-50", text: "text-pink-700" },
  RH: { label: "Ressources Humaines", icon: Heart, description: "Evaluations, plans individuels, entrevues de depart", gradient: "from-rose-600 to-rose-500", bg: "bg-rose-50", text: "text-rose-700" },
  CREA: { label: "Creativite & Innovation", icon: Sparkles, description: "Design Thinking, SCAMPER, brainstorming, Kaizen", gradient: "from-amber-600 to-amber-500", bg: "bg-amber-50", text: "text-amber-700" },
  MED: { label: "Mediation", icon: Handshake, description: "Mediation commerciale, syndicale, succession familiale", gradient: "from-teal-600 to-teal-500", bg: "bg-teal-50", text: "text-teal-700" },
  CRISE: { label: "Gestion de Crise", icon: ShieldAlert, description: "Cybersecurite, restructuration, rappels produits", gradient: "from-red-600 to-red-500", bg: "bg-red-50", text: "text-red-700" },
  EXP: { label: "Express (<15min)", icon: Zap, description: "Daily standups, triage urgent, reviews rapides", gradient: "from-orange-600 to-orange-500", bg: "bg-orange-50", text: "text-orange-700" },
  REC: { label: "Recurrents", icon: Repeat, description: "Bilans hebdo, digests financiers, revues strategiques", gradient: "from-cyan-600 to-cyan-500", bg: "bg-cyan-50", text: "text-cyan-700" },
  REU: { label: "Reunions Structurees", icon: Video, description: "Board meetings, comites techniques, retrospectives", gradient: "from-indigo-600 to-indigo-500", bg: "bg-indigo-50", text: "text-indigo-700" },
  VERT: { label: "Verticaux Industrie", icon: HardHat, description: "HACCP, CCQ, SOC 2, Loi 25, aerospatiale, cosmetiques", gradient: "from-gray-700 to-gray-600", bg: "bg-gray-100", text: "text-gray-700" },
  ORB: { label: "Orbit9 Cross-Entreprise", icon: Globe, description: "Matching, achats groupes, export, mentorat croise", gradient: "from-purple-600 to-purple-500", bg: "bg-purple-50", text: "text-purple-700" },
  FORM: { label: "Formation & Coaching", icon: GraduationCap, description: "Onboarding, certifications, bootcamps, simulations", gradient: "from-sky-600 to-sky-500", bg: "bg-sky-50", text: "text-sky-700" },
  SAIS: { label: "Saisonniers", icon: Calendar, description: "Fiscalite, REER, CNESST, fermetures CCQ, budgets", gradient: "from-lime-600 to-lime-500", bg: "bg-lime-50", text: "text-lime-700" },
  PERS: { label: "Personnel & Destiny", icon: Route, description: "Coaching couple, retraite, stress, deuil entrepreneurial", gradient: "from-fuchsia-600 to-fuchsia-500", bg: "bg-fuchsia-50", text: "text-fuchsia-700" },
  COG: { label: "Cognitif — Modes de Reflexion", icon: Brain, description: "8+1 modes: Analyse, Debat, Brainstorm, Strategie, Innovation, Decision, Crise, Deep, CREDO", gradient: "from-indigo-600 to-indigo-500", bg: "bg-indigo-50", text: "text-indigo-700" },
};

export function getPlaybookFamily(pb: typeof PLAYBOOK_STORE_DATA[0]): string {
  const match = pb.id.match(/^pb-[A-Z]+-([A-Z]+)-/);
  if (match) return match[1];
  if (pb.id.startsWith("pb-GHO-")) return "GHO";
  return "";
}

// ── Vue interne Conference AI (contenu principal dans la section) ──
function ConferenceAIContent({ onOpenDetail, onSelectFamily, selectedFamily }: {
  onOpenDetail: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void;
  onSelectFamily: (family: string | null) => void;
  selectedFamily: string | null;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"rating" | "downloads" | "nom" | "prix">("rating");

  const allConferencePlaybooks = PLAYBOOK_STORE_DATA.filter(pb => {
    const family = getPlaybookFamily(pb);
    return family !== "" && CONFERENCE_FAMILIES[family] !== undefined || pb.id.startsWith("pb-GHO-") || pb.type === "conference" || pb.type === "formation" || pb.type === "cognitif";
  });

  const conferenceCount = allConferencePlaybooks.length;

  if (selectedFamily) {
    const familyInfo = CONFERENCE_FAMILIES[selectedFamily];
    const familyPlaybooks = allConferencePlaybooks.filter(pb => getPlaybookFamily(pb) === selectedFamily)
    .filter(pb => !searchTerm || pb.nom.toLowerCase().includes(searchTerm.toLowerCase()) || pb.description.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(pb => filterDept === "all" || pb.departement === filterDept);

    const sortedPlaybooks = [...familyPlaybooks].sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "downloads") return b.downloads - a.downloads;
      if (sortBy === "nom") return a.nom.localeCompare(b.nom);
      return (a.prix === "Gratuit" ? 0 : 1) - (b.prix === "Gratuit" ? 0 : 1);
    });

    const FIcon = familyInfo?.icon || Video;
    const depts = [...new Set(familyPlaybooks.map(p => p.departement))];

    return (
      <div className="space-y-3">
        <div className={cn("bg-gradient-to-r rounded-xl px-5 py-4 text-white", familyInfo?.gradient || "from-blue-600 to-blue-500")}>
          <button onClick={() => onSelectFamily(null)} className="text-[10px] text-white/70 hover:text-white mb-2 flex items-center gap-1 cursor-pointer"><ChevronLeft className="h-3.5 w-3.5" /> Retour aux familles</button>
          <div className="flex items-center gap-3">
            <FIcon className="h-7 w-7 text-white" />
            <div>
              <h2 className="text-base font-bold">{familyInfo?.label || selectedFamily}</h2>
              <p className="text-[11px] text-white/80">{familyInfo?.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 text-[10px] text-white/70">
            <span>{familyPlaybooks.length} playbooks</span>
            <span>{familyPlaybooks.filter(p => p.prix === "Gratuit").length} gratuits</span>
            <span>{depts.length} departements</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[120px]">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full text-xs pl-7 pr-2 py-1.5 rounded-lg border border-gray-200 focus:border-blue-300 focus:ring-1 focus:ring-blue-200 outline-none" />
          </div>
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 bg-white cursor-pointer">
            <option value="all">Tous les depts</option>
            {depts.map(d => <option key={d} value={d}>{DEPT_LABELS[d] || d}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 bg-white cursor-pointer">
            <option value="rating">Note</option>
            <option value="downloads">Populaire</option>
            <option value="nom">A-Z</option>
            <option value="prix">Prix</option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {sortedPlaybooks.map(pb => (
            <PlaybookCardV2 key={pb.id} pb={pb} onOpenDetail={onOpenDetail} />
          ))}
        </div>
        {sortedPlaybooks.length === 0 && <p className="text-xs text-gray-400 text-center py-6">Aucun playbook ne correspond a vos filtres</p>}
      </div>
    );
  }

  const topFamilies = Object.entries(CONFERENCE_FAMILIES).map(([key, info]) => {
    const pbs = allConferencePlaybooks.filter(pb => getPlaybookFamily(pb) === key);
    return { key, ...info, count: pbs.length, avgRating: pbs.length > 0 ? (pbs.reduce((s, p) => s + p.rating, 0) / pbs.length).toFixed(1) : "0", gratuit: pbs.filter(p => p.prix === "Gratuit").length };
  }).filter(f => f.count > 0).sort((a, b) => b.count - a.count);

  const featuredPlaybooks = [...allConferencePlaybooks].sort((a, b) => b.rating - a.rating).slice(0, 6);
  const ghostPlaybooks = allConferencePlaybooks.filter(pb => pb.id.startsWith("pb-GHO-"));
  const saisonniersPlaybooks = allConferencePlaybooks.filter(pb => getPlaybookFamily(pb) === "SAIS");

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl px-5 py-5 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Video className="h-8 w-8 text-white" />
          <div>
            <h2 className="text-lg font-bold">Conference AI</h2>
            <p className="text-[11px] text-white/70">Sessions interactives video, vocal et texte avec vos 12 bots Brain Team</p>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-3 text-[10px] text-white/70">
          <span className="flex items-center gap-1"><Video className="h-3.5 w-3.5" /> {conferenceCount} playbooks</span>
          <span className="flex items-center gap-1"><Layers className="h-3.5 w-3.5" /> {topFamilies.length} familles</span>
          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> 12 bots</span>
          <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5" /> 5 modes de travail</span>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/20 text-white/90">Discussion</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-400/30 text-white/90">Reflexion</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-400/30 text-white/90">Conception</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-400/30 text-white/90">Execution</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-teal-400/30 text-white/90">Retroaction</span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-amber-500" /> Vedettes Conference AI</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {featuredPlaybooks.map(pb => (
            <PlaybookCardV2 key={pb.id} pb={pb} badge="populaire" onOpenDetail={onOpenDetail} />
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><LayoutGrid className="h-3.5 w-3.5 text-indigo-500" /> Explorer par famille</h3>
          <span className="text-[9px] text-gray-400">{topFamilies.length} familles · {conferenceCount} playbooks</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {topFamilies.map(f => {
            const FIcon = f.icon;
            return (
              <div key={f.key} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md hover:border-blue-200 transition-all cursor-pointer" onClick={() => onSelectFamily(f.key)}>
                <div className={cn("flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-gradient-to-r text-white", f.gradient)}>
                  <FIcon className="h-4 w-4 text-white shrink-0" />
                  <span className="text-xs font-bold text-white flex-1 truncate">{f.label}</span>
                </div>
                <div className="px-4 py-3 space-y-2">
                  <p className="text-[10px] text-gray-500 leading-snug line-clamp-2">{f.description}</p>
                  <div className="flex items-center gap-1.5">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded", f.bg, f.text)}>{f.count} playbooks</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-gray-500">
                    <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /> <span className="text-xs font-bold text-gray-800">{f.avgRating}</span></span>
                    <span>{f.gratuit} gratuits</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {ghostPlaybooks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><Brain className="h-3.5 w-3.5 text-orange-500" /> Ghost Cognitifs</h3>
            <span className="text-[9px] text-gray-400">{ghostPlaybooks.length} playbooks</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {ghostPlaybooks.map(pb => (
              <PlaybookCardV2 key={pb.id} pb={pb} onOpenDetail={onOpenDetail} />
            ))}
          </div>
        </div>
      )}

      {saisonniersPlaybooks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-lime-500" /> Calendrier Saisonnier</h3>
            <button onClick={() => onSelectFamily("SAIS")} className="text-[9px] text-blue-500 hover:text-blue-700 cursor-pointer font-bold">Voir les {saisonniersPlaybooks.length}</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {saisonniersPlaybooks.slice(0, 6).map(pb => (
              <div key={pb.id} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white hover:shadow-md hover:border-lime-200 transition-all cursor-pointer" onClick={() => onOpenDetail(pb)}>
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-[#00B4D8]/10">
                  <Calendar className="h-3.5 w-3.5 text-lime-600 shrink-0" />
                  <span className="text-[11px] font-bold text-gray-900 flex-1 truncate">{pb.nom}</span>
                </div>
                <div className="px-3 py-2">
                  <p className="text-[10px] text-gray-500 line-clamp-1">{pb.description}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[9px] text-gray-400">{pb.duree}</span>
                    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", pb.prix === "Gratuit" ? "bg-emerald-50 text-emerald-700" : "bg-purple-50 text-purple-700")}>{pb.prix === "Gratuit" ? "Inclus" : pb.prix}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50/50 border border-blue-100 rounded-lg px-3 py-2 flex items-center gap-2">
        <Video className="h-3.5 w-3.5 text-blue-500 shrink-0" />
        <span className="text-[9px] text-blue-700">Conference AI · {conferenceCount} playbooks · {topFamilies.length} familles · 3 modes communication · 5 modes de travail cognitifs</span>
      </div>
    </div>
  );
}

// ── Vue CATEGORIE (filtree par departement) ──
function PlaybookCategorie({ botCode, selectedDept, onOpenDetail, onBack }: { botCode: string; selectedDept: string; onOpenDetail: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void; onBack: () => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterNiveau, setFilterNiveau] = useState<string>("all");
  const [filterPrix, setFilterPrix] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("populaires");
  const [viewMode, setViewMode] = useState<"cards" | "list" | "table">("cards");

  const deptColor = DEPT_COLORS[selectedDept] || DEPT_COLORS.CEOB;
  const deptLabel = DEPT_LABELS[selectedDept] || selectedDept;
  const DIcon = DEPT_ICONS[selectedDept] || Building2;

  let filtered = PLAYBOOK_STORE_DATA.filter(pb => {
    if (pb.departement !== selectedDept) return false;
    if (searchTerm && !pb.nom.toLowerCase().includes(searchTerm.toLowerCase()) && !pb.categorie.toLowerCase().includes(searchTerm.toLowerCase()) && !pb.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterNiveau !== "all" && pb.niveau !== filterNiveau) return false;
    if (filterPrix === "gratuit" && pb.prix !== "Gratuit") return false;
    if (filterPrix === "premium" && pb.prix === "Gratuit") return false;
    if (filterType !== "all" && pb.type !== filterType) return false;
    return true;
  });

  if (sortBy === "populaires") filtered.sort((a, b) => b.downloads - a.downloads);
  else if (sortBy === "rating") filtered.sort((a, b) => b.rating - a.rating);
  else if (sortBy === "alpha") filtered.sort((a, b) => a.nom.localeCompare(b.nom));

  const installedCount = filtered.filter(p => INSTALLED_PLAYBOOKS.includes(p.id)).length;
  const runningCount = RUNNING_PLAYBOOKS.filter(r => { const p = PLAYBOOK_STORE_DATA.find(x => x.id === r.playbookId); return p?.departement === selectedDept; }).length;

  return (
    <div className="space-y-3">
      {/* Header gradient */}
      <div className={cn("bg-gradient-to-r rounded-xl px-4 py-3", deptColor.gradient)}>
        <div className="flex items-center gap-2">
          <DIcon className="h-4 w-4 text-white" />
          <h3 className="text-sm font-bold text-white">Playbooks — {deptLabel}</h3>
        </div>
        <div className="text-[9px] text-white/70 mt-1">{filtered.length} playbooks · {installedCount} installes · {runningCount} en cours</div>
      </div>

      {/* Barre filtres + view toggle — SF standard */}
      <div className={SF.toolbarWrap}>
        <div className={SF.searchWrap}>
          <Search className={SF.searchIcon} />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Rechercher..." className={SF.searchInput} />
        </div>
        <select value={filterNiveau} onChange={e => setFilterNiveau(e.target.value)} className={SF.select}>
          <option value="all">Difficulte</option>
          <option value="Quick Win">Quick Win</option>
          <option value="Standard">Standard</option>
          <option value="Avance">Avance</option>
          <option value="Enterprise">Enterprise</option>
        </select>
        <select value={filterPrix} onChange={e => setFilterPrix(e.target.value)} className={SF.select}>
          <option value="all">Prix</option>
          <option value="gratuit">Inclus</option>
          <option value="premium">Premium</option>
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className={SF.select}>
          <option value="all">Type</option>
          {Object.entries(PLAYBOOK_TYPES).map(([key, t]) => <option key={key} value={key}>{t.label}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={SF.select}>
          <option value="populaires">Populaires</option>
          <option value="rating">Mieux notes</option>
          <option value="alpha">Alphabetique</option>
        </select>
        <PlaybookViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        <span className={SF.itemCount}>{filtered.length} trouves</span>
      </div>

      {/* Contenu selon viewMode */}
      {filtered.length > 0 ? (
        <>
          <PlaybookMultiView playbooks={filtered} viewMode={viewMode} onOpenDetail={onOpenDetail} />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-8 w-8 text-gray-200 mb-3" />
          <p className="text-xs text-gray-400 mb-2">Aucun playbook ne correspond a vos criteres</p>
          <button onClick={() => { setSearchTerm(""); setFilterNiveau("all"); setFilterPrix("all"); setFilterType("all"); }} className="text-[9px] text-blue-600 font-bold cursor-pointer">Reinitialiser les filtres</button>
        </div>
      )}
    </div>
  );
}

// ── Vue PAR TYPE (filtree par type de livrable) ──
function PlaybookParType({ selectedType, onOpenDetail, onBack }: { selectedType: string; onOpenDetail: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void; onBack: () => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterNiveau, setFilterNiveau] = useState<string>("all");
  const [filterPrix, setFilterPrix] = useState<string>("all");
  const [filterDept, setFilterDept] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("populaires");
  const [viewMode, setViewMode] = useState<"cards" | "list" | "table">("cards");

  const typeInfo = PLAYBOOK_TYPES[selectedType];
  if (!typeInfo) return null;
  const TIcon = typeInfo.icon;

  let filtered = PLAYBOOK_STORE_DATA.filter(pb => {
    if (pb.type !== selectedType) return false;
    if (searchTerm && !pb.nom.toLowerCase().includes(searchTerm.toLowerCase()) && !pb.categorie.toLowerCase().includes(searchTerm.toLowerCase()) && !pb.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterNiveau !== "all" && pb.niveau !== filterNiveau) return false;
    if (filterPrix === "gratuit" && pb.prix !== "Gratuit") return false;
    if (filterPrix === "premium" && pb.prix === "Gratuit") return false;
    if (filterDept !== "all" && pb.departement !== filterDept) return false;
    return true;
  });

  if (sortBy === "populaires") filtered.sort((a, b) => b.downloads - a.downloads);
  else if (sortBy === "rating") filtered.sort((a, b) => b.rating - a.rating);
  else if (sortBy === "alpha") filtered.sort((a, b) => a.nom.localeCompare(b.nom));

  const installedCount = filtered.filter(p => INSTALLED_PLAYBOOKS.includes(p.id)).length;

  return (
    <div className="space-y-3">
      {/* Header gradient */}
      <div className={cn("bg-gradient-to-r rounded-xl px-4 py-3", typeInfo.gradient)}>
        <div className="flex items-center gap-2">
          <TIcon className="h-4 w-4 text-white" />
          <h3 className="text-sm font-bold text-white">Playbooks — {typeInfo.label}</h3>
        </div>
        <div className="text-[9px] text-white/70 mt-1">{typeInfo.description} · {filtered.length} playbooks · {installedCount} installes</div>
      </div>

      {/* Barre filtres + view toggle — SF standard */}
      <div className={SF.toolbarWrap}>
        <div className={SF.searchWrap}>
          <Search className={SF.searchIcon} />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Rechercher..." className={SF.searchInput} />
        </div>
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className={SF.select}>
          <option value="all">Departement</option>
          {Object.entries(DEPT_LABELS).map(([code, label]) => <option key={code} value={code}>{label}</option>)}
        </select>
        <select value={filterNiveau} onChange={e => setFilterNiveau(e.target.value)} className={SF.select}>
          <option value="all">Difficulte</option>
          <option value="Quick Win">Quick Win</option>
          <option value="Standard">Standard</option>
          <option value="Avance">Avance</option>
          <option value="Enterprise">Enterprise</option>
        </select>
        <select value={filterPrix} onChange={e => setFilterPrix(e.target.value)} className={SF.select}>
          <option value="all">Prix</option>
          <option value="gratuit">Inclus</option>
          <option value="premium">Premium</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={SF.select}>
          <option value="populaires">Populaires</option>
          <option value="rating">Mieux notes</option>
          <option value="alpha">Alphabetique</option>
        </select>
        <PlaybookViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        <span className={SF.itemCount}>{filtered.length} trouves</span>
      </div>

      {/* Contenu selon viewMode */}
      {filtered.length > 0 ? (
        <PlaybookMultiView playbooks={filtered} viewMode={viewMode} onOpenDetail={onOpenDetail} />
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-8 w-8 text-gray-200 mb-3" />
          <p className="text-xs text-gray-400 mb-2">Aucun playbook ne correspond a vos criteres</p>
          <button onClick={() => { setSearchTerm(""); setFilterNiveau("all"); setFilterPrix("all"); setFilterDept("all"); }} className="text-[9px] text-blue-600 font-bold cursor-pointer">Reinitialiser les filtres</button>
        </div>
      )}
    </div>
  );
}

// ── Vue COLLECTIONS ──
// ── Composant reutilisable: rendu liste/tableur pour playbooks ──
function PlaybookListView({ playbooks, onOpenDetail }: { playbooks: typeof PLAYBOOK_STORE_DATA; onOpenDetail: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void }) {
  return (
    <div className="space-y-0.5">
      {playbooks.map(pb => {
        const niveauStyle = NIVEAU_BADGE[pb.niveau] || NIVEAU_BADGE.Standard;
        const isInstalled = INSTALLED_PLAYBOOKS.includes(pb.id);
        const PbIcon = DEPT_ICONS[pb.departement] || Building2;
        return (
          <div key={pb.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer group" onClick={() => onOpenDetail(pb)}>
            <PbIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <span className="text-[10px] font-bold text-gray-800 flex-1 truncate">{pb.nom}</span>
            <div className="flex items-center gap-1 shrink-0">
              {pb.bots.slice(0, 2).map((bot, i) => <span key={i} className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{bot}</span>)}
            </div>
            <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0", niveauStyle.bg, niveauStyle.text)}>{pb.niveau}</span>
            {pb.type && PLAYBOOK_TYPES[pb.type] && <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0", PLAYBOOK_TYPES[pb.type].bg, PLAYBOOK_TYPES[pb.type].text)}>{PLAYBOOK_TYPES[pb.type].label}</span>}
            <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0", pb.prix === "Gratuit" ? "bg-emerald-50 text-emerald-700" : "bg-purple-50 text-purple-700")}>{pb.prix === "Gratuit" ? "Inclus" : pb.prix}</span>
            <div className="flex items-center gap-0.5 shrink-0">
              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              <span className="text-[10px] font-bold text-gray-700">{pb.rating}</span>
            </div>
            {isInstalled && <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />}
            <ChevronRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500 shrink-0" />
          </div>
        );
      })}
    </div>
  );
}

function PlaybookTableView({ playbooks, onOpenDetail }: { playbooks: typeof PLAYBOOK_STORE_DATA; onOpenDetail: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void }) {
  const [tblSort, setTblSort] = useState<{ field: string; dir: "asc" | "desc" }>({ field: "nom", dir: "asc" });
  const toggleSort = (f: string) => setTblSort(prev => prev.field === f ? { field: f, dir: prev.dir === "asc" ? "desc" : "asc" } : { field: f, dir: "asc" });
  const SortCol = ({ field, w, children }: { field: string; w: string; children: React.ReactNode }) => {
    const active = tblSort.field === field;
    const Icon = active ? (tblSort.dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
    return (
      <button onClick={() => toggleSort(field)} className={cn("text-left text-[9px] font-bold uppercase cursor-pointer select-none flex items-center gap-0.5", w, active ? "text-blue-500" : "text-gray-500")}>
        {children}<Icon className={cn("h-3.5 w-3.5", active ? "text-blue-500" : "text-gray-300")} />
      </button>
    );
  };
  const sorted = [...playbooks].sort((a, b) => {
    const dir = tblSort.dir === "asc" ? 1 : -1;
    switch (tblSort.field) {
      case "nom": return dir * a.nom.localeCompare(b.nom);
      case "categorie": return dir * a.categorie.localeCompare(b.categorie);
      case "type": return dir * (a.type || "").localeCompare(b.type || "");
      case "niveau": return dir * a.niveau.localeCompare(b.niveau);
      case "prix": return dir * ((a.prix === "Gratuit" ? 0 : 1) - (b.prix === "Gratuit" ? 0 : 1));
      case "rating": return dir * (a.rating - b.rating);
      case "etapes": return dir * (a.etapes - b.etapes);
      default: return 0;
    }
  });
  return (
    <div className="space-y-0">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-200">
        <SortCol field="nom" w="flex-1">Nom</SortCol>
        <SortCol field="categorie" w="w-[70px] shrink-0">Categorie</SortCol>
        <SortCol field="type" w="w-[65px] shrink-0">Type</SortCol>
        <SortCol field="niveau" w="w-[70px] shrink-0">Niveau</SortCol>
        <SortCol field="prix" w="w-[55px] shrink-0">Prix</SortCol>
        <SortCol field="rating" w="w-[50px] shrink-0">Rating</SortCol>
        <span className="text-[9px] font-bold text-gray-500 uppercase w-[55px] shrink-0">Duree</span>
        <SortCol field="etapes" w="w-[50px] shrink-0">Etapes</SortCol>
      </div>
      {sorted.map(pb => {
        const niveauStyle = NIVEAU_BADGE[pb.niveau] || NIVEAU_BADGE.Standard;
        const PbIcon = DEPT_ICONS[pb.departement] || Building2;
        return (
          <div key={pb.id} className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-100 hover:bg-gray-50 cursor-pointer group" onClick={() => onOpenDetail(pb)}>
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <PbIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <span className="text-[9px] font-medium text-gray-800 truncate">{pb.nom}</span>
            </div>
            <span className="text-[9px] text-gray-500 w-[70px] shrink-0 truncate">{pb.categorie}</span>
            {pb.type && PLAYBOOK_TYPES[pb.type] ? <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded w-[65px] shrink-0", PLAYBOOK_TYPES[pb.type].bg, PLAYBOOK_TYPES[pb.type].text)}>{PLAYBOOK_TYPES[pb.type].label}</span> : <span className="w-[65px] shrink-0" />}
            <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded w-[70px] shrink-0", niveauStyle.bg, niveauStyle.text)}>{pb.niveau}</span>
            <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded w-[55px] shrink-0", pb.prix === "Gratuit" ? "bg-emerald-50 text-emerald-700" : "bg-purple-50 text-purple-700")}>{pb.prix === "Gratuit" ? "Inclus" : pb.prix}</span>
            <span className="text-[9px] text-gray-700 w-[50px] shrink-0 flex items-center gap-0.5"><Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />{pb.rating}</span>
            <span className="text-[9px] text-gray-400 w-[55px] shrink-0">{pb.duree}</span>
            <span className="text-[9px] text-gray-400 w-[50px] shrink-0">{pb.etapes} etapes</span>
          </div>
        );
      })}
    </div>
  );
}

function PlaybookViewToggle({ viewMode, setViewMode }: { viewMode: "cards" | "list" | "table"; setViewMode: (m: "cards" | "list" | "table") => void }) {
  return (
    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shrink-0">
      {([["list", LayoutList], ["cards", LayoutGrid], ["table", Table2]] as ["list" | "cards" | "table", React.ElementType][]).map(([mode, Icon]) => (
        <button key={mode} onClick={() => setViewMode(mode)} className={cn("p-1.5 transition-colors cursor-pointer", viewMode === mode ? "bg-blue-600 text-white" : "bg-white text-gray-400 hover:text-gray-600")}>
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}

function PlaybookMultiView({ playbooks, viewMode, onOpenDetail }: { playbooks: typeof PLAYBOOK_STORE_DATA; viewMode: "cards" | "list" | "table"; onOpenDetail: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void }) {
  if (playbooks.length === 0) return <p className="text-[9px] text-gray-400 text-center py-8">Aucun playbook a afficher</p>;
  if (viewMode === "list") return <PlaybookListView playbooks={playbooks} onOpenDetail={onOpenDetail} />;
  if (viewMode === "table") return <PlaybookTableView playbooks={playbooks} onOpenDetail={onOpenDetail} />;
  return (
    <div className="grid grid-cols-2 gap-3">
      {playbooks.map(pb => <PlaybookCardV2 key={pb.id} pb={pb} onOpenDetail={onOpenDetail} />)}
    </div>
  );
}

function PlaybookCollectionsView({ selectedCollection, onOpenDetail, onSelectCollection, onBack }: { selectedCollection: string | null; onOpenDetail: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void; onSelectCollection: (id: string | null) => void; onBack: () => void }) {
  const [viewMode, setViewMode] = useState<"cards" | "list" | "table">("cards");
  if (selectedCollection) {
    const col = STORE_COLLECTIONS_V2.find(c => c.id === selectedCollection);
    if (!col) return null;
    const ColIcon = col.icon;
    const playbooks = col.playbookIds.map(id => PLAYBOOK_STORE_DATA.find(p => p.id === id)).filter(Boolean) as typeof PLAYBOOK_STORE_DATA;
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <button onClick={() => onSelectCollection(null)} className="text-[9px] text-blue-600 hover:text-blue-800 font-bold cursor-pointer flex items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 rotate-180" /> Retour aux collections
          </button>
          <PlaybookViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        </div>
        <div className={cn("bg-gradient-to-r rounded-xl px-4 py-3", col.gradient)}>
          <ColIcon className="h-4 w-4 text-white mb-1" />
          <h3 className="text-sm font-bold text-white">{col.label}</h3>
          <p className="text-[9px] text-white/80 mt-1">{col.description}</p>
          <span className="text-[8px] text-white/60 mt-1 block">{playbooks.length} playbooks</span>
        </div>
        <PlaybookMultiView playbooks={playbooks} viewMode={viewMode} onOpenDetail={onOpenDetail} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {STORE_COLLECTIONS_V2.map(col => {
          const ColIcon = col.icon;
          return (
            <Card key={col.id} className="p-0 gap-0 overflow-hidden rounded-xl cursor-pointer hover:shadow-md transition-all" onClick={() => onSelectCollection(col.id)}>
              <div className={cn("bg-gradient-to-r px-3 py-3", col.gradient)}>
                <ColIcon className="h-4 w-4 text-white mb-1" />
                <div className="text-[10px] font-bold text-white">{col.label}</div>
                <div className="text-[8px] text-white/70 mt-0.5 line-clamp-2">{col.description}</div>
                <div className="text-[8px] text-white/60 mt-1">{col.playbookIds.length} playbooks</div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Vue MES PLAYBOOKS (installes seulement) ──
function PlaybookMesInstalledView({ botCode, onOpenDetail }: { botCode: string; onOpenDetail: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "list" | "table">("cards");
  const [filterNiveau, setFilterNiveau] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("populaires");
  const installed = PLAYBOOK_STORE_DATA.filter(pb => INSTALLED_PLAYBOOKS.includes(pb.id) && (botCode === "CEOB" || pb.departement === botCode));
  let filtered = installed.filter(pb => {
    if (searchTerm && !pb.nom.toLowerCase().includes(searchTerm.toLowerCase()) && !pb.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterNiveau !== "all" && pb.niveau !== filterNiveau) return false;
    return true;
  });
  if (sortBy === "populaires") filtered.sort((a, b) => b.downloads - a.downloads);
  else if (sortBy === "rating") filtered.sort((a, b) => b.rating - a.rating);
  else if (sortBy === "alpha") filtered.sort((a, b) => a.nom.localeCompare(b.nom));

  return (
    <div className="space-y-3">
      {/* Header gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-white" />
          <h3 className="text-sm font-bold text-white">Mes playbooks installes</h3>
        </div>
        <div className="text-[9px] text-white/70 mt-1">{installed.length} playbooks installes · {[...new Set(installed.map(p => p.departement))].length} departements</div>
      </div>

      {/* Barre filtres + view toggle — SF standard */}
      <div className={SF.toolbarWrap}>
        <div className={SF.searchWrap}>
          <Search className={SF.searchIcon} />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Rechercher..." className={SF.searchInput} />
        </div>
        <select value={filterNiveau} onChange={e => setFilterNiveau(e.target.value)} className={SF.select}>
          <option value="all">Difficulte</option>
          <option value="Quick Win">Quick Win</option>
          <option value="Standard">Standard</option>
          <option value="Avance">Avance</option>
          <option value="Enterprise">Enterprise</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={SF.select}>
          <option value="populaires">Populaires</option>
          <option value="rating">Mieux notes</option>
          <option value="alpha">Alphabetique</option>
        </select>
        <PlaybookViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        <span className={SF.itemCount}>{filtered.length} trouves</span>
      </div>

      {/* Contenu */}
      {filtered.length > 0 ? (
        <PlaybookMultiView playbooks={filtered} viewMode={viewMode} onOpenDetail={onOpenDetail} />
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-8 w-8 text-gray-200 mb-3" />
          <p className="text-xs text-gray-400 mb-2">{installed.length === 0 ? "Aucun playbook installe — explorez le Store" : "Aucun playbook ne correspond a vos criteres"}</p>
          {installed.length > 0 && <button onClick={() => { setSearchTerm(""); setFilterNiveau("all"); }} className="text-[9px] text-blue-600 font-bold cursor-pointer">Reinitialiser les filtres</button>}
        </div>
      )}
    </div>
  );
}

// ── Vue EN COURS (executions actives) ──
function PlaybookEnCours({ onOpenDetail }: { onOpenDetail: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void }) {
  const [viewMode, setViewMode] = useState<"cards" | "list" | "table">("cards");
  const [searchTerm, setSearchTerm] = useState("");
  const runningPbs = RUNNING_PLAYBOOKS.map(r => PLAYBOOK_STORE_DATA.find(p => p.id === r.playbookId)).filter(Boolean) as typeof PLAYBOOK_STORE_DATA;
  const filtered = searchTerm ? runningPbs.filter(pb => pb.nom.toLowerCase().includes(searchTerm.toLowerCase())) : runningPbs;
  const activeCount = RUNNING_PLAYBOOKS.filter(r => r.statut === "actif").length;
  const pauseCount = RUNNING_PLAYBOOKS.length - activeCount;

  return (
    <div className="space-y-3">
      {/* Header gradient */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-white" />
          <h3 className="text-sm font-bold text-white">Playbooks en cours</h3>
        </div>
        <div className="text-[9px] text-white/70 mt-1">{RUNNING_PLAYBOOKS.length} en cours · {activeCount} actifs · {pauseCount} en pause</div>
      </div>

      {/* Barre filtres + view toggle — SF standard */}
      <div className={SF.toolbarWrap}>
        <div className={SF.searchWrap}>
          <Search className={SF.searchIcon} />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Rechercher..." className={SF.searchInput} />
        </div>
        <PlaybookViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        <span className={SF.itemCount}>{filtered.length} trouves</span>
      </div>

      {/* Contenu */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Activity className="h-8 w-8 text-gray-200 mb-3" />
          <p className="text-xs text-gray-400 mb-1">{RUNNING_PLAYBOOKS.length === 0 ? "Aucun playbook en cours d'execution" : "Aucun resultat"}</p>
          <p className="text-[9px] text-gray-300">Lancez-en un depuis le Store</p>
        </div>
      ) : viewMode === "cards" ? (
        <div className="space-y-3">
          {RUNNING_PLAYBOOKS.filter(r => {
            const pb = PLAYBOOK_STORE_DATA.find(p => p.id === r.playbookId);
            return pb && (!searchTerm || pb.nom.toLowerCase().includes(searchTerm.toLowerCase()));
          }).map(run => {
            const pb = PLAYBOOK_STORE_DATA.find(p => p.id === run.playbookId)!;
            return (
              <Card key={run.playbookId} className="p-0 gap-0 overflow-hidden rounded-xl border-l-4 border-l-emerald-500">
                <div className="px-3 py-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1", run.statut === "actif" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                        {run.statut === "actif" && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />}
                        {run.statut === "actif" ? "Actif" : "En pause"}
                      </span>
                      <span className="text-xs font-bold text-gray-800 cursor-pointer hover:text-blue-600" onClick={() => onOpenDetail(pb)}>{pb.nom}</span>
                    </div>
                    <span className="text-[9px] font-bold text-gray-500">{run.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${run.progress}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-gray-500">
                    <span>Etape: <span className="text-gray-700">{run.etapeActuelle}</span></span>
                    <span>Bot actif: <span className="font-bold text-gray-700">{run.botActif}</span></span>
                  </div>
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="text-gray-400">Temps restant: {run.tempsRestant}</span>
                    <div className="flex items-center gap-1">
                      {pb.bots.map((bot, i) => (
                        <span key={i} className={cn("px-1.5 py-0.5 rounded text-[8px]", bot === run.botActif ? "bg-emerald-100 text-emerald-700 font-bold" : "bg-gray-100 text-gray-400")}>{bot}</span>
                      ))}
                    </div>
                  </div>
                  {run.actionRequise && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2 flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <span className="text-[9px] text-amber-700 flex-1">{run.actionRequise}</span>
                      <button className="text-[9px] font-bold text-amber-700 bg-amber-200 hover:bg-amber-300 px-2.5 py-1 rounded cursor-pointer">Fournir</button>
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <button className="flex items-center gap-1 text-[9px] font-bold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg cursor-pointer transition-colors">
                      <Pause className="h-3.5 w-3.5" /> Pause
                    </button>
                    <button className="flex items-center gap-1 text-[9px] font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg cursor-pointer transition-colors">
                      <Trash2 className="h-3.5 w-3.5" /> Annuler
                    </button>
                    <button onClick={() => onOpenDetail(pb)} className="flex items-center gap-1 text-[9px] font-bold text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg cursor-pointer transition-colors ml-auto">
                      <FileText className="h-3.5 w-3.5" /> Details
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <PlaybookMultiView playbooks={filtered} viewMode={viewMode} onOpenDetail={onOpenDetail} />
      )}
    </div>
  );
}

// ── Vue HISTORIQUE (completes + livrables) ──
function PlaybookHistorique({ onOpenDetail }: { onOpenDetail: (pb: typeof PLAYBOOK_STORE_DATA[0]) => void }) {
  const [viewMode, setViewMode] = useState<"cards" | "list" | "table">("cards");
  const [searchTerm, setSearchTerm] = useState("");
  const completedPbs = COMPLETED_PLAYBOOKS.map(cp => PLAYBOOK_STORE_DATA.find(p => p.id === cp.playbookId)).filter(Boolean) as typeof PLAYBOOK_STORE_DATA;
  const filtered = searchTerm ? completedPbs.filter(pb => pb.nom.toLowerCase().includes(searchTerm.toLowerCase())) : completedPbs;
  const totalLivrables = COMPLETED_PLAYBOOKS.reduce((s, cp) => s + (PLAYBOOK_LIVRABLES[cp.playbookId]?.length || 0), 0);

  return (
    <div className="space-y-3">
      {/* Header gradient */}
      <div className="bg-gradient-to-r from-slate-600 to-slate-500 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-white" />
          <h3 className="text-sm font-bold text-white">Historique</h3>
        </div>
        <div className="text-[9px] text-white/70 mt-1">{COMPLETED_PLAYBOOKS.length} completes · {totalLivrables} livrables generes</div>
      </div>

      {/* Barre filtres + view toggle — SF standard */}
      <div className={SF.toolbarWrap}>
        <div className={SF.searchWrap}>
          <Search className={SF.searchIcon} />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Rechercher..." className={SF.searchInput} />
        </div>
        <PlaybookViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        <span className={SF.itemCount}>{filtered.length} trouves</span>
      </div>

      {/* Contenu */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Clock className="h-8 w-8 text-gray-200 mb-3" />
          <p className="text-xs text-gray-400 mb-1">{COMPLETED_PLAYBOOKS.length === 0 ? "Aucun playbook complete" : "Aucun resultat"}</p>
          <p className="text-[9px] text-gray-300">Vos playbooks termines apparaitront ici avec leurs livrables</p>
        </div>
      ) : viewMode === "cards" ? (
        <div className="space-y-3">
          {COMPLETED_PLAYBOOKS.filter(cp => {
            const pb = PLAYBOOK_STORE_DATA.find(p => p.id === cp.playbookId);
            return pb && (!searchTerm || pb.nom.toLowerCase().includes(searchTerm.toLowerCase()));
          }).map(cp => {
            const pb = PLAYBOOK_STORE_DATA.find(p => p.id === cp.playbookId)!;
            const pilierColor = PILIER_COLORS[cp.pilierImpact] || PILIER_COLORS.Actif;
            const livrables = PLAYBOOK_LIVRABLES[pb.id] || [];
            return (
              <Card key={cp.playbookId} className="p-0 gap-0 overflow-hidden rounded-xl">
                <div className="px-3 py-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 cursor-pointer" onClick={() => onOpenDetail(pb)}>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span className="text-xs font-bold text-gray-800">{pb.nom}</span>
                      </div>
                      <div className="text-[9px] text-gray-400 mt-0.5 ml-5">Complete le {cp.completeLe}</div>
                    </div>
                    <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded shrink-0", pilierColor.bg, pilierColor.text)}>Impact: {cp.impact}</span>
                  </div>
                  <div className="flex items-center gap-1 ml-5">
                    {pb.bots.map((bot, i) => (
                      <span key={i} className="text-[8px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{bot}</span>
                    ))}
                  </div>
                  {livrables.length > 0 && (
                    <div className="ml-5 space-y-1">
                      <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wider">Livrables</span>
                      {livrables.map((l, i) => {
                        const LivIcon = l.icon;
                        return (
                          <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1">
                            <LivIcon className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-[9px] text-gray-700 flex-1">{l.nom}</span>
                            <span className="text-[8px] text-gray-400">{l.type}</span>
                            <button className="text-[8px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer">Ouvrir</button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="flex items-center gap-2 ml-5 pt-1">
                    <button className="flex items-center gap-1 text-[9px] font-bold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg cursor-pointer transition-colors">
                      <RotateCcw className="h-3.5 w-3.5" /> Relancer
                    </button>
                    <button className="flex items-center gap-1 text-[9px] font-bold text-amber-500 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg cursor-pointer transition-colors">
                      <Star className="h-3.5 w-3.5" /> Evaluer
                    </button>
                    <button className="flex items-center gap-1 text-[9px] font-bold text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg cursor-pointer transition-colors">
                      <Share2 className="h-3.5 w-3.5" /> Partager
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <PlaybookMultiView playbooks={filtered} viewMode={viewMode} onOpenDetail={onOpenDetail} />
      )}
    </div>
  );
}

// ── Vue PLAYBOOK BUILDER (mock) ──
function PlaybookBuilder() {
  return (
    <div className="space-y-4">
      <div className="text-center py-4">
        <Wrench className="h-8 w-8 text-gray-300 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-gray-800">Playbook Builder</h3>
        <p className="text-[9px] text-gray-500 mt-1 max-w-sm mx-auto">Creez vos propres playbooks et publiez-les dans le Playbook.</p>
      </div>

      {/* KPIs mock */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: "Mes brouillons", value: "0", icon: FileText, color: "text-gray-500" },
          { label: "Publies", value: "0", icon: Upload, color: "text-blue-500" },
          { label: "Revenus", value: "0.00$", icon: DollarSign, color: "text-emerald-500" },
        ].map(kpi => (
          <Card key={kpi.label} className="p-0 gap-0 overflow-hidden rounded-xl shadow-sm">
            <div className="px-3 py-2.5 text-center">
              <kpi.icon className={cn("h-4 w-4 mx-auto mb-1", kpi.color)} />
              <div className="text-sm font-bold text-gray-800">{kpi.value}</div>
              <div className="text-[8px] text-gray-400">{kpi.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* CTA disabled */}
      <button className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed" disabled>
        <Plus className="h-3.5 w-3.5" /> Creer un nouveau playbook
      </button>

      {/* Comment ca marche */}
      <Card className="p-0 gap-0 overflow-hidden rounded-xl shadow-sm">
        <div className="px-4 py-3">
          <h4 className="text-[9px] font-bold text-gray-700 uppercase tracking-wider mb-2">Comment ca marche</h4>
          <div className="space-y-2">
            {[
              "Definissez les etapes du workflow",
              "Assignez les bots a chaque etape",
              "Testez avec vos donnees",
              "Publiez dans le Store (85% createur / 15% plateforme)",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[8px] font-bold text-white bg-blue-600 rounded-full w-5 h-5 flex items-center justify-center shrink-0">{i + 1}</span>
                <span className="text-[9px] text-gray-700">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Marketplace CTA */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-xl px-4 py-4 text-center space-y-2">
        <Sparkles className="h-5 w-5 text-purple-500 mx-auto" />
        <p className="text-xs font-bold text-gray-800">Creez votre propre playbook et vendez-le sur le Store</p>
        <p className="text-[10px] text-purple-700 font-semibold">85% createur / 15% plateforme</p>
        <p className="text-[9px] text-gray-500">Les meilleurs createurs gagnent 2000-5000$/mois avec leurs playbooks.</p>
        <p className="text-[8px] text-purple-400">Bientot disponible</p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
// BLUEPRINT PLAYBOOKS — Conteneur principal avec sidebar 8 items
// ══════════════════════════════════════════

export function PlaybookStoreView({ botCode, headerGradient, showHeader = false }: { botCode: string; headerGradient: string; showHeader?: boolean }) {
  const [activeView, setActiveView] = useState<PlaybookStoreView>("decouvrir");
  const [selectedPlaybook, setSelectedPlaybook] = useState<typeof PLAYBOOK_STORE_DATA[0] | null>(null);
  const [expandCategories, setExpandCategories] = useState(false);
  const [expandTypes, setExpandTypes] = useState(false);
  const [selectedCategorie, setSelectedCategorie] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedConferenceFamily, setSelectedConferenceFamily] = useState<string | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  const isMobile = useIsMobile();

  // Synchroniser quand botCode change — revenir à l'accueil (le contenu s'adapte via PlaybookDecouvrir)
  useEffect(() => {
    setSelectedPlaybook(null);
    setActiveView("decouvrir");
    setSelectedCategorie(null);
    setSelectedType(null);
  }, [botCode]);

  const handleNavigate = (view: PlaybookStoreView, extra?: { dept?: string; collection?: string }) => {
    setSelectedPlaybook(null);
    if (view === "types" && extra?.dept) { setSelectedType(extra.dept); setActiveView("types"); }
    else if (extra?.dept) { setSelectedCategorie(extra.dept); setActiveView("categorie"); }
    else if (extra?.collection) { setSelectedCollection(extra.collection); setActiveView("collections"); }
    else setActiveView(view);
  };

  const handleOpenDetail = (pb: typeof PLAYBOOK_STORE_DATA[0]) => setSelectedPlaybook(pb);
  const handleBack = () => setSelectedPlaybook(null);

  const pbIsNonCEOB = botCode !== "CEOB";
  const pbDeptCount = pbIsNonCEOB ? PLAYBOOK_STORE_DATA.filter(p => p.departement === botCode).length : PLAYBOOK_STORE_DATA.length;
  const SIDEBAR_ITEMS: { id: PlaybookStoreView; label: string; icon: React.ElementType; count?: number; dot?: boolean; separator?: boolean }[] = [
    { id: "decouvrir", label: "Decouvrir", icon: Sparkles, count: pbDeptCount },
    // Poupée russe: non-CEOB = pas d'explorateur départements (on est déjà DANS un département)
    ...(pbIsNonCEOB ? [] : [{ id: "categorie" as PlaybookStoreView, label: "Departements", icon: LayoutGrid }]),
    { id: "types", label: "Types", icon: FolderOpen },
    { id: "conferenceai", label: "Conference AI", icon: Video, count: (pbIsNonCEOB ? PLAYBOOK_STORE_DATA.filter(p => p.departement === botCode && (p.type === "conference" || p.type === "formation" || p.type === "cognitif" || p.id.startsWith("pb-GHO-") || p.id.match(/^pb-[A-Z]+-[A-Z]+-/))) : PLAYBOOK_STORE_DATA.filter(p => p.type === "conference" || p.type === "formation" || p.type === "cognitif" || p.id.startsWith("pb-GHO-") || p.id.match(/^pb-[A-Z]+-[A-Z]+-/))).length },
    { id: "collections", label: "Collections", icon: Bookmark, count: STORE_COLLECTIONS_V2.length },
    { id: "installed", label: "Mes Playbooks", icon: BookOpen, count: INSTALLED_PLAYBOOKS.length, separator: true },
    { id: "encours", label: "En cours", icon: Activity, count: RUNNING_PLAYBOOKS.length, dot: RUNNING_PLAYBOOKS.length > 0 },
    { id: "historique", label: "Historique", icon: Clock, count: COMPLETED_PLAYBOOKS.length },
    { id: "builder", label: "Playbook Builder", icon: Wrench, separator: true },
  ];

  const VIEW_LABELS: Record<PlaybookStoreView, string> = {
    decouvrir: "Decouvrir", categorie: "Departements", types: "Types", collections: "Collections",
    installed: "Mes Playbooks", encours: "En cours", historique: "Historique", builder: "Playbook Builder",
  };

  return (
    <div className="space-y-3">
      {/* Hero — Living Heroes V20 Playbook Store */}
      {showHeader && (
        <LivingHero
          blur1="bg-cyan-100/60" blur2="bg-blue-100/40"
          title="Lancez, c'est fait."
          description="Des automatisations prêtes à déclencher."
        >
          <div className="relative w-[380px] h-[160px] flex items-center">
            <div className="absolute right-[20px] flex flex-row items-center gap-0 w-[340px]">
              {/* Step 1 */}
              <div className="pb-node w-24 h-24 flex flex-col items-center justify-center anim-p-node-1 relative z-10">
                <div className="w-8 h-8 rounded bg-cyan-50 text-cyan-500 flex items-center justify-center mb-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></div>
                <div className="w-12 h-1 bg-slate-200 rounded-full" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full anim-p-pulse-1" />
              </div>
              {/* Connection Line 1 */}
              <div className="w-16 h-1 bg-slate-200 relative -ml-1 -mr-1 z-0"><div className="absolute left-0 top-0 bottom-0 bg-cyan-400 shadow-[0_0_8px_#22d3ee] anim-p-line-1" /></div>
              {/* Step 2 */}
              <div className="pb-node w-24 h-24 flex flex-col items-center justify-center anim-p-node-2 relative z-10">
                <div className="w-8 h-8 rounded bg-blue-50 text-blue-500 flex items-center justify-center mb-2"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg></div>
                <div className="w-12 h-1 bg-slate-200 rounded-full" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full anim-p-pulse-2" />
              </div>
              {/* Connection Line 2 */}
              <div className="w-16 h-1 bg-slate-200 relative -ml-1 -mr-1 z-0"><div className="absolute left-0 top-0 bottom-0 bg-blue-400 shadow-[0_0_8px_#3b82f6] anim-p-line-2" /></div>
              {/* Step 3 */}
              <div className="pb-node anim-p-node-3 anim-p-node-3-activate w-24 h-24 flex flex-col items-center justify-center text-white shadow-lg relative z-10 bg-blue-500">
                <div className="w-8 h-8 flex items-center justify-center mb-1 drop-shadow-md"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg></div>
                <div className="w-12 h-1.5 bg-white/50 rounded-full" />
              </div>
            </div>
          </div>
        </LivingHero>
      )}

      {/* Blocs pleine largeur — Top 3 (au-dessus du sidebar) */}
      {activeView === "decouvrir" && !selectedPlaybook && (
        <>
          {/* Top 3 Playbooks de la semaine — adaptatif au département */}
          {(() => {
            // Poupée russe: non-CEOB = top 3 du département par rating, CEOB = featured hardcodés
            const featuredItems = botCode !== "CEOB"
              ? [...PLAYBOOK_STORE_DATA]
                  .filter(p => p.departement === botCode)
                  .sort((a, b) => b.rating - a.rating || b.downloads - a.downloads)
                  .slice(0, 3)
                  .map((pb, i) => ({
                    playbookId: pb.id,
                    editorial: pb.description,
                    rank: i + 1,
                    gradient: DEPT_GRADIENT[botCode] || DEPT_GRADIENT.CEOB,
                    pb,
                  }))
              : FEATURED_PLAYBOOKS.map(f => ({ ...f, pb: PLAYBOOK_STORE_DATA.find(p => p.id === f.playbookId) })).filter(f => f.pb);
            if (featuredItems.length === 0) return null;
            return (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <h3 className="text-xs font-bold text-gray-800">{botCode !== "CEOB" ? `Top 3 — ${DEPT_SHORT_LABEL[botCode] || botCode}` : "Top 3 — Playbooks de la semaine"}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {featuredItems.map(f => {
                    if (!f.pb) return null;
                    return (
                      <div key={f.playbookId} className={cn("relative bg-gradient-to-r rounded-xl overflow-hidden cursor-pointer group hover:shadow-lg transition-shadow", f.gradient)} onClick={() => handleOpenDetail(f.pb!)}>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                        <div className="relative p-4">
                          <div className="flex items-center gap-1.5 mb-2.5">
                            <span className={cn("text-[9px] font-bold w-6 h-6 rounded-full flex items-center justify-center gap-0.5", f.rank === 1 ? "bg-amber-400 text-amber-900" : "bg-white/20 text-white")}>
                              {f.rank === 1 && <Crown className="h-3.5 w-3.5" />}
                              {f.rank !== 1 && f.rank}
                            </span>
                            <span className="text-[8px] font-medium px-2 py-0.5 rounded-full bg-white/15 text-white">{f.pb.niveau}</span>
                            <span className="text-[8px] font-medium px-2 py-0.5 rounded-full bg-white/15 text-white">{f.pb.prix === "Gratuit" ? "Inclus" : f.pb.prix}</span>
                          </div>
                          <h4 className="text-sm font-bold text-white leading-tight">{f.pb.nom}</h4>
                          <p className="text-[9px] text-white/80 mt-1.5 line-clamp-3 leading-relaxed">{f.editorial}</p>
                          <div className="flex items-center gap-1.5 mt-3">
                            <div className="flex items-center gap-0.5">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} className={cn("h-3.5 w-3.5", s <= Math.round(f.pb!.rating) ? "text-amber-300 fill-amber-300" : "text-white/20")} />
                              ))}
                            </div>
                            <span className="text-[9px] text-white font-bold">{f.pb.rating}/5</span>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-[8px] text-white/70">
                            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{f.pb.downloads} activations</span>
                            <span>{f.pb.etapes} etapes</span>
                            <span>{f.pb.duree}</span>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <button className="flex-1 px-3 py-2 text-[9px] font-bold bg-white text-gray-900 rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-all flex items-center justify-center gap-1">
                              <Rocket className="h-3.5 w-3.5" /> Decouvrir
                            </button>
                            <button className="flex-1 px-3 py-2 text-[9px] font-bold text-white bg-white/15 hover:bg-white/25 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1">
                              <Eye className="h-3.5 w-3.5" /> Previsualiser
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </>
      )}

      {/* Header pleine largeur — masqué si showHeader est actif (évite le dédoublement) */}
      {!showHeader && (
        <div className={cn("bg-gradient-to-r rounded-lg px-4 py-2.5", headerGradient)}>
          <h2 className="text-sm font-bold text-white">Playbook{activeView !== "decouvrir" ? ` — ${VIEW_LABELS[activeView]}` : ""}</h2>
        </div>
      )}

    <div className={cn("flex gap-3", isMobile && "flex-col gap-0")}>
      {/* Sidebar TOC */}
      {(() => {
        const sidebarContent = (<>
          {SIDEBAR_ITEMS.map((item, idx) => {
            const isActive = activeView === item.id;
            return (
              <div key={item.id}>
                {item.separator && idx > 0 && <div className={SF.separator} />}
                <button
                  onClick={() => {
                    if (item.id === "categorie") { setExpandCategories(!expandCategories); }
                    else if (item.id === "types") { setExpandTypes(!expandTypes); }
                    else { setActiveView(item.id); setSelectedPlaybook(null); }
                  }}
                  className={cn(
                    "w-full px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer",
                    isActive ? "bg-blue-50 border border-blue-200 shadow-sm" : "hover:bg-gray-50 border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <item.icon className={cn("h-3.5 w-3.5", isActive ? "text-blue-500" : "text-gray-400")} />
                    <span className={cn("text-[10px] font-bold flex-1 leading-tight", isActive ? "text-blue-700" : "text-gray-700")}>{item.label}</span>
                    {item.dot && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />}
                    {item.count !== undefined && <span className="text-[9px] text-gray-400">{item.count}</span>}
                    {item.id === "categorie" && <ChevronDown className={cn("h-3.5 w-3.5 text-gray-400 transition-transform", expandCategories && "rotate-180")} />}
                    {item.id === "types" && <ChevronDown className={cn("h-3.5 w-3.5 text-gray-400 transition-transform", expandTypes && "rotate-180")} />}
                  </div>
                </button>
                {/* Expandable categories (departements) — CEOB seulement */}
                {!pbIsNonCEOB && item.id === "categorie" && expandCategories && (
                  <div className="ml-3 mt-0.5 space-y-0.5">
                    {Object.entries(DEPT_LABELS).map(([code, label]) => {
                      const isActiveDept = activeView === "categorie" && selectedCategorie === code;
                      return (
                        <button key={code} onClick={() => { setSelectedCategorie(code); setActiveView("categorie"); setSelectedPlaybook(null); }}
                          className={cn("w-full px-2 py-1 rounded text-left text-[9px] cursor-pointer transition-all",
                            isActiveDept ? "bg-blue-50 text-blue-700 font-bold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                          )}>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}
                {/* Expandable types */}
                {item.id === "types" && expandTypes && (
                  <div className="ml-3 mt-0.5 space-y-0.5">
                    {Object.entries(PLAYBOOK_TYPES).map(([key, t]) => {
                      const TIcon = t.icon;
                      const isActiveType = activeView === "types" && selectedType === key;
                      const count = PLAYBOOK_STORE_DATA.filter(p => p.type === key).length;
                      return (
                        <button key={key} onClick={() => { setSelectedType(key); setActiveView("types"); setSelectedPlaybook(null); }}
                          className={cn("w-full px-2 py-1 rounded text-left text-[9px] cursor-pointer transition-all flex items-center gap-1",
                            isActiveType ? "bg-blue-50 text-blue-700 font-bold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                          )}>
                          <TIcon className="h-3.5 w-3.5 shrink-0" />
                          <span className="flex-1">{t.label}</span>
                          <span className="text-[8px] text-gray-400">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </>);
        const activeLabel = SIDEBAR_ITEMS.find(i => i.id === activeView)?.label ?? "Playbooks";
        return isMobile ? (
          <MobileSidebarSheet currentLabel={activeLabel} itemCount={SIDEBAR_ITEMS.length}>
            {sidebarContent}
          </MobileSidebarSheet>
        ) : (
          <div className={SF.sidebarW}>
            {sidebarContent}
          </div>
        );
      })()}

      {/* Contenu */}
      <div className="flex-1 min-w-0 space-y-2">

        {/* Fiche detaillee INLINE (drill-down) */}
        {selectedPlaybook ? (
          <PlaybookFicheDetailInline pb={selectedPlaybook} onBack={handleBack} />
        ) : (
          <>
            {activeView === "decouvrir" && <PlaybookDecouvrir botCode={botCode} onOpenDetail={handleOpenDetail} onNavigate={handleNavigate} />}
            {activeView === "categorie" && selectedCategorie && <PlaybookCategorie botCode={botCode} selectedDept={selectedCategorie} onOpenDetail={handleOpenDetail} onBack={() => setActiveView("decouvrir")} />}
            {activeView === "categorie" && !selectedCategorie && <PlaybookDecouvrir botCode={botCode} onOpenDetail={handleOpenDetail} onNavigate={handleNavigate} />}
            {activeView === "types" && selectedType && <PlaybookParType selectedType={selectedType} onOpenDetail={handleOpenDetail} onBack={() => setActiveView("decouvrir")} />}
            {activeView === "types" && !selectedType && <PlaybookDecouvrir botCode={botCode} onOpenDetail={handleOpenDetail} onNavigate={handleNavigate} />}
            {activeView === "collections" && <PlaybookCollectionsView selectedCollection={selectedCollection} onOpenDetail={handleOpenDetail} onSelectCollection={setSelectedCollection} onBack={() => setActiveView("decouvrir")} />}
            {activeView === "conferenceai" && <ConferenceAIContent onOpenDetail={handleOpenDetail} onSelectFamily={setSelectedConferenceFamily} selectedFamily={selectedConferenceFamily} />}
            {activeView === "installed" && <PlaybookMesInstalledView botCode={botCode} onOpenDetail={handleOpenDetail} />}
            {activeView === "encours" && <PlaybookEnCours onOpenDetail={handleOpenDetail} />}
            {activeView === "historique" && <PlaybookHistorique onOpenDetail={handleOpenDetail} />}
            {activeView === "builder" && <PlaybookBuilder />}
          </>
        )}
      </div>
    </div>
    </div>
  );
}
