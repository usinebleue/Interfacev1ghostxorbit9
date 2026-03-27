/**
 * AtelierRealtorClient.tsx — Simulation "The Realtor AI" — Parcours Acheteur Luxe
 * Layout 3 zones: Cockpit ouvert (Brain Team) | Chat | Contenu riche
 * Esthetique: blanc/creme luxe europeen — Engel & Volkers
 * Co-branding: Engel & Volkers x TheRealtor.ai x Brain Team
 * Flow: Landing → Mood Board (style, quartier, pieces, budget) → Matching → Conference AI → Business Case (step-by-step)
 * Tout le portrait = construction du mood board de la maison de reve
 */

"use client";

import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  RotateCcw,
  Home,
  Search,
  Sparkles,
  Crown,
  MapPin,
  DollarSign,
  Palette,
  Heart,
  Star,
  CheckCircle2,
  Lock,
  ArrowRight,
  Video,
  Building2,
  Camera,
  Gem,
  Eye,
  Send,
  Mic,
  Zap,
  TrendingUp,
} from "lucide-react";
import { cn } from "../../../../../components/ui/utils";
import {
  TypewriterText,
  ThinkingAnimation,
  BotAvatar,
} from "../../shared/simulation-components";
import { BOT_COLORS } from "../../shared/simulation-data";

// ========== TYPES & CONSTANTS ==========

type Stage =
  | "landing"
  | "mood-start"
  | "mood-style"
  | "mood-quartier"
  | "mood-rooms"
  | "mood-budget"
  | "mood-complete"
  | "matching-thinking"
  | "matching"
  | "conference"
  | "biz-probleme"
  | "biz-solution"
  | "biz-chiffres";

const STAGE_INDEX: Record<Stage, number> = {
  landing: 0, "mood-start": 1, "mood-style": 2, "mood-rooms": 3,
  "mood-quartier": 4, "mood-budget": 5, "mood-complete": 6,
  "matching-thinking": 7, matching: 8, conference: 9,
  "biz-probleme": 10, "biz-solution": 11, "biz-chiffres": 12,
};

const STAGE_LABELS: Record<Stage, string> = {
  landing: "Accueil", "mood-start": "Demarrage", "mood-style": "Style de vie",
  "mood-rooms": "Ambiances", "mood-quartier": "Quartier & Criteres", "mood-budget": "Budget",
  "mood-complete": "Mood Board", "matching-thinking": "Recherche AI...",
  matching: "Proprietes", conference: "Conference AI",
  "biz-probleme": "Le Probleme", "biz-solution": "La Solution", "biz-chiffres": "Les Chiffres",
};

const TOTAL_STAGES = 13;
const EV_RED = "#CC0000";

// ========== DATA ==========

const BUYER = { name: "Alexandre Fontaine", title: "CEO — Fontaine Precision Inc." };

const STYLE_PHOTOS = [
  { label: "Contemporain", img: "https://uploadcare.engelvoelkers.com/3d273e55-8f76-45da-869f-2f90308df393/" },
  { label: "Classique Luxe", img: "https://uploadcare.engelvoelkers.com/30952ce8-5e68-4f40-b3b8-215e05b9a29b/" },
  { label: "Loft Industriel", img: "https://uploadcare.engelvoelkers.com/4af32ea8-2eac-40b4-837a-a24b034806f7/" },
  { label: "Art Deco", img: "https://uploadcare.engelvoelkers.com/81763fd9-4b86-43c7-8716-8f727c89298c/" },
];

const QUARTIER_PHOTOS = [
  { label: "Vieux-Montreal", img: "https://uploadcare.engelvoelkers.com/49f7f9c5-a972-4a31-901f-708304fff557/" },
  { label: "Griffintown", img: "https://uploadcare.engelvoelkers.com/ccc4afb2-59c2-4d1a-b2db-15ab8999b58d/" },
  { label: "Westmount", img: "https://uploadcare.engelvoelkers.com/cd829a22-dfdf-4b3a-8853-4b30cde38338/" },
  { label: "Mont-Royal", img: "https://uploadcare.engelvoelkers.com/5c48a75c-9622-4a8f-866b-99917b69bc8a/" },
];

// Per-room photo choices — 4 options each, all from real E&V Montreal listings
const UC = (id: string) => `https://uploadcare.engelvoelkers.com/${id}/`;
const ROOM_CHOICES = [
  {
    name: "Salon", desc: "Votre espace de vie principal",
    options: [
      { img: UC("6a237838-3cfc-4f60-b1b6-3245a8839b9d"), label: "Contemporain ouvert" },
      { img: UC("1dfadbe7-9c09-48f4-84da-5e54626920a1"), label: "Mid-century chic" },
      { img: UC("6c85d4f6-d9d8-473b-8835-e5146303575f"), label: "Penthouse panoramique" },
      { img: UC("96d58385-71a5-4e93-ae4b-56e757bcf847"), label: "Loft industriel" },
    ],
  },
  {
    name: "Cuisine", desc: "Le coeur gastronomique de votre maison",
    options: [
      { img: UC("c9fa8277-0ab9-4a37-b703-4134ec739157"), label: "Bois noble & lumiere" },
      { img: UC("107cdf03-77e8-40fe-8115-24f02d4337b6"), label: "Loft industriel" },
      { img: UC("0fc58705-5078-4d8c-9e9f-5c826c921587"), label: "Blanc immacule" },
      { img: UC("b9375803-1f0a-4ef1-916b-f5b0ee970173"), label: "Noir & marbre luxe" },
    ],
  },
  {
    name: "Suite Maitre", desc: "Votre refuge prive",
    options: [
      { img: UC("e4fbbc09-15b0-4eaf-839e-25f78b134ed5"), label: "Foyer & lumiere" },
      { img: UC("40c58200-6c0d-49ae-8d41-b1941d31db50"), label: "Vue sur le lac" },
      { img: UC("c2f6142a-ece1-4b3c-80e3-f6dbbc8b69c6"), label: "Suite royale" },
      { img: UC("82185a38-8891-4ba3-a412-6bf7898e3c07"), label: "Cocon de confort" },
    ],
  },
  {
    name: "Salle de bain", desc: "Votre spa personnel",
    options: [
      { img: UC("48210b7f-b3b1-47d0-b1e7-41834a288e36"), label: "Marbre noir & or" },
      { img: UC("2fdc7b7c-9c71-4ca9-87eb-d36fce3bc600"), label: "Spa avec vue" },
      { img: UC("b694b0c6-52e3-4b4e-a891-4ceab4688143"), label: "Blanc immacule" },
      { img: UC("05cd46fa-d9bf-44ad-800e-da518d756a22"), label: "Marbre & lumiere" },
    ],
  },
  {
    name: "Terrasse", desc: "Votre oasis en plein air",
    options: [
      { img: UC("fa924858-240e-4c5a-8c2e-224dfb13770a"), label: "Rooftop & spa" },
      { img: UC("6eb4b0a7-df98-414a-a7cb-aa6d69498313"), label: "Piscine panoramique" },
      { img: UC("90949d15-8ced-4400-9886-5216f2e14e6f"), label: "Penthouse by night" },
      { img: UC("b9cbc3c0-ec2f-4406-afe2-a97a9ed1c8eb"), label: "Domaine prive" },
    ],
  },
];

const AI_SUGGESTIONS = [
  { img: "https://uploadcare.engelvoelkers.com/75f04815-58e7-408f-9228-84a63297e4cc/", label: "Inspiration similaire" },
  { img: "https://uploadcare.engelvoelkers.com/bdaf5de8-a67a-4959-9cad-3ddaf509d2ac/", label: "Tendance 2026" },
  { img: "https://uploadcare.engelvoelkers.com/cee0aa79-2100-4821-97fc-b05aa085f4b2/", label: "Best-seller E&V" },
];

const LISTINGS = [
  {
    id: 1, addr: "1420 Rue de la Montagne, PH4", city: "Vieux-Montreal",
    price: "2 195 000 $", sqft: "2 480 pi\u00b2", beds: 3, baths: 2,
    score: 96,
    breakdown: { Salon: 98, Cuisine: 95, Suite: 97, "Salle de bain": 96, Terrasse: 99, Inspiration: 94, Prix: 92 },
    features: ["Penthouse", "Vue 360\u00b0", "Terrasse 800pi\u00b2", "Concierge 24h"],
    badge: "MEILLEUR MATCH",
    img: "https://uploadcare.engelvoelkers.com/e25fad69-8b2f-48a5-9a43-cc5c6f2863f8/",
    desc: "Penthouse spectaculaire au sommet de la Montagne avec vue panoramique 360 degres sur le fleuve Saint-Laurent et le centre-ville. Plafonds de 11 pieds, finitions haut de gamme selectionnees par un designer d'interieur renomme — marbre italien, boiseries sur mesure, eclairage architectural.\n\nTerrasse enveloppante de 800 pi\u00b2 avec spa integre, coin lounge et cuisine exterieure complete. Seulement 12 unites dans l'immeuble avec concierge physique 24h, ratio de service exceptionnel. Deux stationnements interieurs et cave a vin privee.",
  },
  {
    id: 2, addr: "30 Rue des Soeurs Grises, #1802", city: "Vieux-Montreal",
    price: "1 895 000 $", sqft: "2 210 pi\u00b2", beds: 3, baths: 2,
    score: 91,
    breakdown: { Salon: 92, Cuisine: 88, Suite: 90, "Salle de bain": 85, Terrasse: 93, Inspiration: 91, Prix: 94 },
    features: ["Vue fleuve", "Gym prive", "Cave a vin", "2 stationnements"],
    badge: null,
    img: "https://uploadcare.engelvoelkers.com/b3b5fbd9-1f9d-4e25-909f-6717f94b0ea1/",
    desc: "Condo d'exception au 18e etage dans le prestigieux Quartier des Soeurs Grises. Vue directe et degagee sur le fleuve Saint-Laurent depuis chaque piece principale. Cuisine de chef avec ilot en quartz, electromenagers Sub-Zero et Wolf, cave a vin climatisee 200 bouteilles.\n\nSalle de bain principale en marbre de Carrare avec douche a l'italienne et baignoire autoportante. Gym prive reserve aux residents, terrasse commune amenagee au toit. Deux stationnements interieurs et rangement prive. Immeuble certifie LEED avec geothermie.",
  },
  {
    id: 3, addr: "1 McGill, #3201", city: "Vieux-Montreal",
    price: "2 350 000 $", sqft: "2 650 pi\u00b2", beds: 4, baths: 3,
    score: 88,
    breakdown: { Salon: 85, Cuisine: 92, Suite: 88, "Salle de bain": 82, Terrasse: 86, Inspiration: 83, Prix: 90 },
    features: ["4 chambres", "Bureau ferme", "Spa privatif", "Vue port"],
    badge: null,
    img: "https://uploadcare.engelvoelkers.com/09366855-9bef-48b2-adf7-5b57488d4e36/",
    desc: "Unite d'angle premium au 32e etage avec vue spectaculaire sur le Vieux-Port et le pont Jacques-Cartier. 4 chambres spacieuses dont une suite des maitres avec walk-in double et salle de bain en onyx. Bureau ferme avec bibliotheque integree, ideal pour le teletravail.\n\nSpa privatif avec sauna finlandais et douche pluie surdimensionnee. Planchers de bois franc d'ingenierie, fenetres du sol au plafond, systeme domotique Crestron complet. Acces direct au stationnement souterrain avec 3 espaces reserves.",
  },
];

const CONF_MSGS = [
  { from: "CEOB" as const, text: "Bienvenue M. Fontaine. Votre mood board indique un score de compatibilite de 96% avec le penthouse au 1420 Rue de la Montagne. La terrasse de 800 pi\u00b2 avec vue 360\u00b0 est exceptionnelle." },
  { from: "user" as const, text: "C'est impressionnant. Le concierge 24h, c'est un vrai concierge?" },
  { from: "CEOB" as const, text: "Absolument. Concierge physique, equipe rotative. Seulement 12 unites dans l'immeuble — ratio service exceptionnel. Je vous organise une visite privee et exclusive." },
  { from: "CEOB" as const, text: "Je vous prepare aussi un dossier comparatif avec analyse de marche, historique de prix du secteur et projections de valeur. Vous l'aurez dans l'heure." },
  { from: "user" as const, text: "Quand est-ce que je peux visiter?" },
  { from: "CEOB" as const, text: "Cette semaine, en visite exclusive — aucun autre acheteur. Je vous envoie la confirmation. Bienvenue dans l'experience Engel & Volkers." },
];

// ========== BUSINESS CASE DATA (step-by-step discussion) ==========
// FLOW: Le Problème → La Solution → Les Chiffres (perspective Patrice Groleau, E&V owner)

const BIZ_PROBLEM_ITEMS = [
  { stat: "30%", label: "Temps perdu en admin", chat: "Vos agents passent 30% de leur temps en taches administratives — qualifier les leads, preparer les dossiers, faire le suivi. C'est 20 heures par semaine PAR AGENT qui ne generent aucun revenu." },
  { stat: "78%", label: "Leads perdus par lenteur", chat: "78% des acheteurs luxe attendent une reponse en moins d'1 heure. Seulement 25% des agents y arrivent. Chaque heure de delai = un lead perdu au profit d'un concurrent." },
  { stat: "73%", label: "Abandons par friction", chat: "73% des acheteurs de luxe abandonnent un processus trop bureaucratique. Formulaires, paperasse, allers-retours — chaque friction est un client perdu." },
  { stat: "60%", label: "Recherche manuelle inefficace", chat: "Vos agents passent des heures a chercher manuellement sur MLS, Centris, reseaux prives. L'acheteur veut une reponse immediate — pas dans 3 jours." },
  { stat: "0$", label: "Donnees non exploitees", chat: "Chaque interaction client genere des donnees precieuses sur les preferences, budgets et tendances. Aujourd'hui, tout ca disparait. Zero capitalisation." },
];

const BIZ_SOLUTION_ITEMS = [
  { num: "1", label: "Qualification automatique 24/7", chat: "Le mood board AI qualifie chaque lead automatiquement — budget, style, quartier — en 8 secondes. Vos agents recoivent des leads chauds, prets a closer. Pas de temps perdu sur les curieux." },
  { num: "2", label: "12 robots specialises = votre Brain Team", chat: "CEO, CTO, CFO, CMO, CSO, COO + 6 specialistes. Ils font le travail de 550 employes — marketing, analyse, operations, legal, suivi — pour 30x moins cher qu'un employe." },
  { num: "3", label: "Agent libere = agent qui vend", chat: "Les 20h/semaine d'admin sont prises en charge par la Brain Team. Votre agent se concentre sur UNE chose : conclure des ventes. Productivite multipliee par 10." },
  { num: "4", label: "Experience client inegalee", chat: "Le client vit un parcours premium de A a Z — mood board, matching AI, conference preparatoire, dossier complet. Il arrive chez l'agent avec tout en main. C'est du jamais vu dans l'industrie." },
  { num: "5", label: "Actif strategique croissant", chat: "Apres 12 mois, vous possedez la plus grande base de profils acheteurs luxe au Canada. Preferences, budgets, tendances — un actif qui prend de la valeur chaque jour." },
];

const BIZ_CHIFFRES_ITEMS: { type: "gain" | "economie" | "investissement" | "net" | "modele"; chat: string }[] = [
  { type: "gain", chat: "Avec l'AI, vos agents closent 40% plus de transactions. Sur une moyenne de 8 deals/an a 15 000$ de commission, ca fait 3 a 4 deals de plus — soit +45 000$ a +60 000$ de revenus PAR AGENT." },
  { type: "gain", chat: "Pour un bureau de 50 agents, c'est 2.25M$ a 3M$ de revenus supplementaires par annee. Pour vos 3 marches — Montreal, Quebec, Toronto — on parle de +7M$ a +9M$ par an." },
  { type: "economie", chat: "Le 30% de temps admin recupere : 50 agents x 20h/semaine x 50 semaines = 50 000 heures par an. A 50$/h de cout moyen, c'est 2.5M$ de productivite recuperee PAR BUREAU." },
  { type: "investissement", chat: "Votre investissement : 2 500$ par mois par bureau, soit 30 000$ par an. Pour chaque dollar investi, vous generez 75$ a 100$ en retour. Agents illimites inclus." },
  { type: "modele", chat: "Notre modele est simple : licence mensuelle fixe par bureau + un pourcentage sur les transactions facilitees par le matching Orbit9 entre acheteurs et vendeurs du reseau. Plus vous utilisez la plateforme, plus elle genere pour vous — et pour nous." },
  { type: "net", chat: "Le calcul final pour vos 3 bureaux : +7M$ en revenus supplementaires, +7.5M$ en productivite recuperee, moins 90 000$ d'investissement annuel. Impact net : +14M$ par an sur votre operation." },
];

// ========== MAIN COMPONENT ==========

export function AtelierRealtorClient({ onBack }: { onBack: () => void }) {
  const [stage, setStage] = useState<Stage>("landing");
  const [typed, setTyped] = useState(false);
  const [styleTyped, setStyleTyped] = useState(false);
  const [quartierTyped, setQuartierTyped] = useState(false);
  const [roomsTyped, setRoomsTyped] = useState(false);
  const [budgetTyped, setBudgetTyped] = useState(false);
  const [completeTyped, setCompleteTyped] = useState(false);
  const [roomPicks, setRoomPicks] = useState<Record<number, number>>({}); // room idx → option idx
  const [currentRoomIdx, setCurrentRoomIdx] = useState(0);

  // Track WHICH photo the user picked (not just "done")
  const [pickedStyleIdx, setPickedStyleIdx] = useState(0);
  const [pickedQuartierIdx, setPickedQuartierIdx] = useState(0);

  // Budget toggle state
  const [selectedBudget, setSelectedBudget] = useState<string | null>(null);
  const [selectedMustHaves, setSelectedMustHaves] = useState<Set<string>>(new Set());

  // AI suggestions added to mood board
  const [aiSuggestionsAdded, setAiSuggestionsAdded] = useState(false);

  // Conference animation
  const [confMsgIdx, setConfMsgIdx] = useState(0);

  // Right panel section fill states
  const [styleDone, setStyleDone] = useState(false);
  const [quartierDone, setQuartierDone] = useState(false);
  const [roomsDone, setRoomsDone] = useState(false);
  const [budgetDone, setBudgetDone] = useState(false);
  const [moodDone, setMoodDone] = useState(false);
  const [matchDone, setMatchDone] = useState(false);
  const [confDone, setConfDone] = useState(false);
  const [bizProbIdx, setBizProbIdx] = useState(0);
  const [bizSolIdx, setBizSolIdx] = useState(0);
  const [bizChifIdx, setBizChifIdx] = useState(0);

  const chatRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; });
  // Right panel scroll sync — follow progression
  useEffect(() => {
    if (rightRef.current) setTimeout(() => { if (rightRef.current) rightRef.current.scrollTop = rightRef.current.scrollHeight; }, 200);
  }, [stage, styleDone, roomsDone, quartierDone, budgetDone, moodDone, matchDone, confDone, bizProbIdx, bizSolIdx, bizChifIdx, roomPicks]);
  // Conference tac-tac-tac animation
  useEffect(() => {
    if (stage === "conference" && confMsgIdx < CONF_MSGS.length) {
      const timer = setTimeout(() => setConfMsgIdx(prev => prev + 1), 1800);
      return () => clearTimeout(timer);
    }
  }, [stage, confMsgIdx]);
  // Business case auto-advance timers
  useEffect(() => {
    if (stage === "biz-probleme" && bizProbIdx < BIZ_PROBLEM_ITEMS.length) {
      const t = setTimeout(() => setBizProbIdx(p => p + 1), 3500);
      return () => clearTimeout(t);
    }
  }, [stage, bizProbIdx]);
  useEffect(() => {
    if (stage === "biz-solution" && bizSolIdx < BIZ_SOLUTION_ITEMS.length) {
      const t = setTimeout(() => setBizSolIdx(p => p + 1), 3500);
      return () => clearTimeout(t);
    }
  }, [stage, bizSolIdx]);
  useEffect(() => {
    if (stage === "biz-chiffres" && bizChifIdx < BIZ_CHIFFRES_ITEMS.length) {
      const t = setTimeout(() => setBizChifIdx(p => p + 1), 4000);
      return () => clearTimeout(t);
    }
  }, [stage, bizChifIdx]);

  const handleReset = () => {
    setStage("landing"); setTyped(false); setStyleTyped(false); setQuartierTyped(false);
    setRoomsTyped(false); setBudgetTyped(false); setCompleteTyped(false);
    setRoomPicks({}); setCurrentRoomIdx(0); setPickedStyleIdx(0); setPickedQuartierIdx(0);
    setSelectedBudget(null); setSelectedMustHaves(new Set()); setAiSuggestionsAdded(false); setConfMsgIdx(0);
    setStyleDone(false); setQuartierDone(false);
    setRoomsDone(false); setBudgetDone(false); setMoodDone(false);
    setMatchDone(false); setConfDone(false); setBizProbIdx(0); setBizSolIdx(0); setBizChifIdx(0);
  };

  const pickRoom = (roomIdx: number, optionIdx: number) => {
    setRoomPicks(prev => ({ ...prev, [roomIdx]: optionIdx }));
    if (roomIdx < ROOM_CHOICES.length - 1) {
      setCurrentRoomIdx(roomIdx + 1);
    }
  };
  const roomPickCount = Object.keys(roomPicks).length;

  const si = STAGE_INDEX[stage];
  const bizDone = si >= 12 && bizChifIdx >= BIZ_CHIFFRES_ITEMS.length;
  const filledCount = (moodDone ? 1 : 0) + (matchDone ? 1 : 0) + (confDone ? 1 : 0) + (bizDone ? 1 : 0);

  // ═══════════════════════════════════════
  // COCKPIT (Left panel — Brain Team style)
  // ═══════════════════════════════════════
  const moodPhotos = [
    ...(styleDone ? [{ img: STYLE_PHOTOS[pickedStyleIdx].img, label: STYLE_PHOTOS[pickedStyleIdx].label }] : []),
    ...Object.entries(roomPicks).map(([ri, oi]) => {
      const room = ROOM_CHOICES[Number(ri)];
      return { img: room.options[oi].img, label: room.name };
    }),
    ...(aiSuggestionsAdded ? AI_SUGGESTIONS.map(s => ({ img: s.img, label: s.label })) : []),
    ...(quartierDone ? [{ img: QUARTIER_PHOTOS[pickedQuartierIdx].img, label: QUARTIER_PHOTOS[pickedQuartierIdx].label }] : []),
  ];

  const cockpit = (
    <div className="w-[220px] shrink-0 bg-white border-r border-gray-200 flex flex-col">
      {/* Brain Team × E&V header */}
      <div className="px-3 py-2.5 border-b border-gray-100 bg-gradient-to-b from-stone-50 to-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg border-2 flex items-center justify-center shrink-0" style={{ borderColor: EV_RED }}>
            <span className="text-[7px] font-black tracking-tight" style={{ color: EV_RED }}>E&V</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-0.5">
              <span className="text-[7px] tracking-[1px] font-bold uppercase" style={{ color: EV_RED }}>The</span>
              <span className="text-[11px] font-black text-gray-800 tracking-tight">Realtor</span>
              <span className="text-[8px] font-bold" style={{ color: EV_RED }}>.ai</span>
            </div>
            <p className="text-[7px] text-gray-400 tracking-wide">Propulse par la <span className="font-bold text-blue-600">Brain Team</span></p>
          </div>
        </div>
      </div>

      {/* CarlOS — Large profile like real SidebarRight */}
      <div className="px-3 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <img src="/agents/generated/ceo-carlos-profil-v3.png" alt="CarlOS" className="w-10 h-10 rounded-xl object-cover border-2 border-blue-200" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-800">CarlOS</p>
            <p className="text-[9px] text-blue-600 font-medium">CEO — Brain Team</p>
            <p className="text-[8px] text-emerald-600 flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
              {si < 2 ? "Pret a vous accueillir" : si < 6 ? "Construction mood board..." : si < 8 ? "Finalisation..." : si < 9 ? "Scan en cours..." : si <= 9 ? "Conference active" : "Presentation d'affaires"}
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic content */}
      <div className="flex-1 overflow-auto">
        {moodPhotos.length > 0 ? (
          <div className="px-3 py-2.5">
            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider mb-2">Votre mood board ({moodPhotos.length} elements)</p>
            <div className="grid grid-cols-2 gap-1.5">
              {moodPhotos.map((p, i) => (
                <div key={i} className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                  <img src={p.img} alt={p.label} className="w-full h-14 object-cover" />
                  <div className="px-1.5 py-0.5 bg-white">
                    <p className="text-[8px] font-bold text-gray-600 truncate">{p.label}</p>
                  </div>
                </div>
              ))}
            </div>
            {si >= 8 && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">Proprietes matchees</p>
                {LISTINGS.map(l => (
                  <div key={l.id} className="flex items-center gap-2 py-1">
                    <img src={l.img} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[8px] text-gray-600 truncate">{l.price}</p>
                    </div>
                    <span className="text-[9px] font-black" style={{ color: EV_RED }}>{l.score}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="px-3 py-2.5">
            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider mb-2">Session active</p>
            <div className="bg-stone-50 rounded-lg p-2.5 border border-gray-100">
              <p className="text-[9px] text-gray-500 leading-relaxed">Votre concierge immobilier AI est pret. Cliquez sur <span className="font-bold text-gray-700">Imaginer ma maison de reve</span> pour commencer le mood board.</p>
            </div>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="px-3 py-2 border-t border-gray-100">
        <div className="flex items-center gap-0.5 justify-center">
          {Array.from({ length: TOTAL_STAGES }, (_, i) => (
            <div key={i} className={cn("h-1 rounded-full transition-all",
              i === si ? "w-4 bg-emerald-500" : i < si ? "w-2" : "w-2 bg-gray-200"
            )} style={i < si ? { backgroundColor: EV_RED } : {}} />
          ))}
        </div>
        <p className="text-[8px] text-gray-400 text-center mt-1">{STAGE_LABELS[stage]}</p>
      </div>

      {/* User */}
      <div className="px-3 py-2 border-t border-gray-100 flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-stone-400 to-stone-500 flex items-center justify-center text-[9px] text-white font-bold shrink-0">AF</div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-gray-700 truncate">{BUYER.name}</p>
          <p className="text-[8px] text-gray-400 truncate">{BUYER.title}</p>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════════════════════
  // CHAT CONTENT
  // ═══════════════════════════════════════
  const chatContent = (
    <>
      {/* === LANDING === */}
      {stage === "landing" && (
        <EVBotBubble code="CEOB">
          <TypewriterText
            text="Bienvenue chez Engel & Volkers. Je suis CarlOS, votre concierge immobilier propulse par la Brain Team. Mon role : transformer votre vision en adresse. On va commencer par imaginer votre maison de reve, piece par piece. Ensuite, notre intelligence artificielle va analyser des milliers de proprietes pour trouver celles qui vous ressemblent. Pret a commencer?"
            speed={9} className="text-sm text-gray-700" onComplete={() => setTyped(true)}
          />
          {typed && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
              <button onClick={() => setStage("mood-start")}
                className="text-xs text-white px-4 py-2 rounded-full flex items-center gap-1.5 font-bold cursor-pointer shadow-md hover:shadow-lg transition-shadow"
                style={{ backgroundColor: EV_RED }}>
                <Sparkles className="h-3.5 w-3.5" /> Imaginer ma maison de reve
              </button>
            </div>
          )}
        </EVBotBubble>
      )}
      {si > 0 && stage !== "landing" && (
        <EVBotBubble code="CEOB" compact>Concierge immobilier Brain Team active.</EVBotBubble>
      )}

      {/* === MOOD START (thinking) === */}
      {stage === "mood-start" && (
        <ThinkingAnimation
          steps={[
            { icon: Sparkles, text: "Activation du concierge immobilier..." },
            { icon: Palette, text: "Preparation du mood board..." },
            { icon: Gem, text: "Calibration du profil premium..." },
          ]}
          botEmoji="" botCode="CEOB" botName="CarlOS"
          onComplete={() => setStage("mood-style")}
        />
      )}
      {si > 1 && <EVStep text="Mood board initialise" />}

      {/* === MOOD STYLE (with photos) === */}
      {si >= 2 && (
        <EVBotBubble code="CEOB">
          {stage === "mood-style" ? (
            <>
              <TypewriterText
                text="Parfait! Commencons votre mood board. Quel univers architectural vous fait vibrer? Cliquez sur le style qui vous inspire le plus — j'ai selectionne des ambiances du portfolio Engel & Volkers pour vous."
                speed={9} className="text-sm text-gray-700" onComplete={() => setStyleTyped(true)}
              />
              {styleTyped && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-1.5">
                    {STYLE_PHOTOS.map((s, idx) => (
                      <button key={s.label} onClick={() => { setPickedStyleIdx(idx); setStyleDone(true); setStage("mood-rooms"); }}
                        className="rounded-xl overflow-hidden border-2 border-gray-200 hover:border-red-400 cursor-pointer transition-all text-left group hover:shadow-md">
                        <img src={s.img} alt={s.label} className="w-full h-20 object-cover group-hover:scale-105 transition-transform" />
                        <div className="px-2.5 py-1.5 bg-white">
                          <span className="text-[11px] font-bold text-gray-700">{s.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : <p className="text-sm text-gray-400">Style selectionne : {STYLE_PHOTOS[pickedStyleIdx].label}</p>}
        </EVBotBubble>
      )}
      {styleDone && si > 2 && <EVUserBubble>{STYLE_PHOTOS[pickedStyleIdx].label} — epure, materiaux nobles, grandes fenetres.</EVUserBubble>}

      {/* === MOOD ROOMS (interactive piece par piece) — NOW STAGE 3 === */}
      {si >= 3 && (
        <EVBotBubble code="CEOB">
          {stage === "mood-rooms" ? (
            <>
              <TypewriterText text="Superbe! Maintenant la partie la plus excitante — composons votre interieur piece par piece! Pour chaque piece, je vous propose 4 ambiances du portfolio E&V. Choisissez celle qui vous fait vibrer."
                speed={9} className="text-sm text-gray-700" onComplete={() => setRoomsTyped(true)} />
              {roomsTyped && roomPickCount > 0 && roomPickCount < ROOM_CHOICES.length && (
                <p className="mt-2 text-[11px] text-blue-600 font-medium">
                  <Sparkles className="h-3.5 w-3.5 inline mr-1" />
                  {ROOM_CHOICES[currentRoomIdx].name} — choisissez votre ambiance a droite...
                </p>
              )}
              {roomsTyped && roomPickCount >= ROOM_CHOICES.length && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                  <p className="text-[11px] text-emerald-600 font-medium">{roomPickCount} pieces selectionnees — votre mood board est magnifique!</p>
                  {/* Pinterest suggestions — AVANT le bouton Continuer */}
                  <div className="bg-blue-50/50 border border-blue-200 rounded-xl px-3 py-2.5">
                    <p className="text-[11px] text-gray-700 mb-2">Pendant que vous choisissiez, j'ai parcouru <span className="font-bold text-blue-600">Pinterest</span>, les portfolios de designers et nos archives E&V — 3 inspirations supplementaires pour vous :</p>
                    <div className="flex gap-1.5">
                      {AI_SUGGESTIONS.map((s, i) => (
                        <div key={i} className="flex-1 rounded-lg overflow-hidden border border-blue-200 shadow-sm">
                          <img src={s.img} alt="" className="w-full h-12 object-cover" />
                          <p className="text-[8px] text-blue-600 px-1.5 py-0.5 bg-blue-50 text-center truncate">{s.label}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-[8px] text-gray-400 italic mt-1">Sources : Pinterest, Architectural Digest, Portfolio E&V Premium</p>
                    {!aiSuggestionsAdded ? (
                      <button onClick={() => setAiSuggestionsAdded(true)}
                        className="mt-2 text-[11px] text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold cursor-pointer shadow-sm"
                        style={{ backgroundColor: EV_RED }}>
                        <Heart className="h-3.5 w-3.5" /> Ajouter au mood board
                      </button>
                    ) : (
                      <p className="mt-2 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Ajoutees a votre mood board!
                      </p>
                    )}
                  </div>
                  <button onClick={() => { setRoomsDone(true); setStage("mood-quartier"); }}
                    className="text-xs text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 font-bold cursor-pointer"
                    style={{ backgroundColor: EV_RED }}>
                    <ArrowRight className="h-3.5 w-3.5" /> Continuer — quartier et criteres
                  </button>
                </div>
              )}
              {roomsTyped && roomPickCount === 0 && (
                <div className="mt-2 flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                  <Sparkles className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                  <span className="text-[11px] text-blue-600 font-medium flex-1">Salon — choisissez votre ambiance dans le panneau de droite</span>
                  <ArrowRight className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                </div>
              )}
            </>
          ) : <p className="text-sm text-gray-400">{roomPickCount} pieces selectionnees pour le mood board</p>}
        </EVBotBubble>
      )}
      {/* Pinterest suggestions now shown INSIDE the mood-rooms block, before "Continuer" */}

      {/* === MOOD QUARTIER — NOW STAGE 4 (search criteria, not mood board) === */}
      {si >= 4 && (
        <EVBotBubble code="CEOB">
          {stage === "mood-quartier" ? (
            <>
              <TypewriterText text="Votre mood board est magnifique! Maintenant, precisons les criteres de recherche. Dans quel quartier voyez-vous votre prochaine adresse?"
                speed={9} className="text-sm text-gray-700" onComplete={() => setQuartierTyped(true)} />
              {quartierTyped && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-1.5">
                    {QUARTIER_PHOTOS.map((q, idx) => (
                      <button key={q.label} onClick={() => { setPickedQuartierIdx(idx); setQuartierDone(true); setStage("mood-budget"); }}
                        className="rounded-xl overflow-hidden border-2 border-gray-200 hover:border-red-400 cursor-pointer transition-all text-left group hover:shadow-md">
                        <img src={q.img} alt={q.label} className="w-full h-16 object-cover group-hover:scale-105 transition-transform" />
                        <div className="px-2.5 py-1.5 bg-white flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-[11px] font-bold text-gray-700">{q.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : <p className="text-sm text-gray-400">Quartier : {QUARTIER_PHOTOS[pickedQuartierIdx].label}</p>}
        </EVBotBubble>
      )}
      {quartierDone && si > 4 && <EVUserBubble>{QUARTIER_PHOTOS[pickedQuartierIdx].label}. Penthouse avec vue sur le fleuve.</EVUserBubble>}

      {/* === MOOD BUDGET === */}
      {si >= 5 && (
        <EVBotBubble code="CEOB">
          {stage === "mood-budget" ? (
            <>
              <TypewriterText text="Votre mood board prend forme — superbe gout! Dernier detail : quel budget avez-vous en tete, et vos 3 must-have non-negociables?"
                speed={9} className="text-sm text-gray-700" onComplete={() => setBudgetTyped(true)} />
              {budgetTyped && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-2.5">
                  <div className="flex flex-wrap gap-1.5">
                    {["1.5M - 2M$", "2M - 3M$", "3M - 5M$", "5M+"].map(b => (
                      <button key={b} onClick={() => setSelectedBudget(b)}
                        className={cn("text-[11px] border px-3 py-1.5 rounded-full cursor-pointer transition-all",
                          selectedBudget === b ? "text-white font-bold shadow-sm" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-red-300 hover:text-red-700")}
                        style={selectedBudget === b ? { backgroundColor: EV_RED, borderColor: EV_RED } : {}}>
                        <DollarSign className="h-3.5 w-3.5 inline mr-0.5" />{b}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {["Terrasse 500pi\u00b2+", "Concierge 24h", "2 stationnements", "Gym prive", "Cave a vin", "Vue fleuve"].map(opt => (
                      <button key={opt} onClick={() => setSelectedMustHaves(prev => {
                          const next = new Set(prev);
                          if (next.has(opt)) next.delete(opt); else next.add(opt);
                          return next;
                        })}
                        className={cn("text-[11px] border px-2.5 py-1 rounded-full cursor-pointer transition-all flex items-center gap-1",
                          selectedMustHaves.has(opt) ? "text-white font-bold shadow-sm" : "bg-stone-50 text-gray-600 border-gray-200 hover:border-red-300")}
                        style={selectedMustHaves.has(opt) ? { backgroundColor: EV_RED, borderColor: EV_RED } : {}}>
                        <Heart className={cn("h-3.5 w-3.5", selectedMustHaves.has(opt) ? "text-white" : "text-gray-300")} /> {opt}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => { setBudgetDone(true); setStage("mood-complete"); }}
                    className="text-xs text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 font-bold cursor-pointer"
                    style={{ backgroundColor: EV_RED }}>
                    <Send className="h-3.5 w-3.5" /> Finaliser mon mood board
                  </button>
                </div>
              )}
            </>
          ) : <p className="text-sm text-gray-400">Budget et priorites definis.</p>}
        </EVBotBubble>
      )}
      {budgetDone && <EVUserBubble>Budget 2M-3M$. Terrasse privee, concierge 24h, vue fleuve.</EVUserBubble>}

      {/* === MOOD COMPLETE === */}
      {si >= 6 && (
        <EVBotBubble code="CEOB">
          {stage === "mood-complete" ? (
            <>
              <TypewriterText
                text="Votre mood board est pret — et il est magnifique! Precision : 93%. Je vois exactement votre maison de reve. Notre AI va maintenant croiser votre profil avec des milliers de proprietes. Pret pour la magie?"
                speed={8} className="text-sm text-gray-700" onComplete={() => { setMoodDone(true); setCompleteTyped(true); }}
              />
              {completeTyped && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <button onClick={() => setStage("matching-thinking")}
                    className="text-xs text-white px-4 py-2 rounded-full flex items-center gap-1.5 font-bold cursor-pointer shadow-md hover:shadow-lg transition-shadow"
                    style={{ backgroundColor: EV_RED }}>
                    <Search className="h-3.5 w-3.5" /> Lancer le matching AI
                  </button>
                </div>
              )}
            </>
          ) : <p className="text-sm text-gray-400">Mood board complete — precision 93%.</p>}
        </EVBotBubble>
      )}

      {/* === MATCHING THINKING === */}
      {stage === "matching-thinking" && (
        <ThinkingAnimation
          steps={[
            { icon: Search, text: "Scan de 8 400 proprietes en cours..." },
            { icon: Star, text: "Croisement avec votre mood board..." },
            { icon: Building2, text: "Analyse de compatibilite multi-criteres..." },
            { icon: Crown, text: "Selection des 3 meilleures proprietes..." },
          ]}
          botEmoji="" botCode="CEOB" botName="CarlOS" speed={900}
          onComplete={() => { setMatchDone(true); setStage("matching"); }}
        />
      )}
      {si > 7 && <EVStep text="8 400 proprietes → 3 matchs identifies" />}

      {/* === MATCHING === */}
      {si >= 8 && (
        <EVBotBubble code="CEOB">
          {stage === "matching" ? (
            <>
              <p className="text-sm text-gray-700">Excellentes nouvelles! 3 proprietes au-dessus de 85%. Le PH4 au 1420 Rue de la Montagne score a 96% — une perle rare. Consultez les details a droite. Souhaitez-vous une conference AI avec un conseiller?</p>
              <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2 flex-wrap">
                <button onClick={() => { setConfDone(true); setStage("conference"); }}
                  className="text-xs text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 font-bold cursor-pointer shadow-sm"
                  style={{ backgroundColor: EV_RED }}>
                  <Video className="h-3.5 w-3.5" /> Conference AI
                </button>
                <button className="text-xs bg-gray-100 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-full cursor-pointer hover:bg-gray-200">
                  Voir les proprietes
                </button>
              </div>
            </>
          ) : <p className="text-sm text-gray-400">3 proprietes matchees — best match 96%.</p>}
        </EVBotBubble>
      )}

      {/* === CONFERENCE AI === */}
      {stage === "conference" && (
        <>
          {/* Conference banner */}
          <div className="mx-1 rounded-xl overflow-hidden border border-red-200 shadow-sm">
            <div className="h-16 relative overflow-hidden">
              <img src={LISTINGS[0].img} alt="PH4" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 flex items-center justify-between px-3">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[9px] text-white font-bold tracking-wide">CONFERENCE AI EN DIRECT</span>
                </div>
                <div className="flex -space-x-2">
                  {["CEOB"].map(c => (
                    <img key={c} src={BOT_COLORS[c]?.avatar} alt="" className="w-7 h-7 rounded-full border-2 border-white object-cover" />
                  ))}
                  <div className="w-7 h-7 rounded-full bg-stone-400 border-2 border-white flex items-center justify-center text-[8px] text-white font-bold">AF</div>
                </div>
              </div>
            </div>
          </div>
          {/* Animated tac-tac-tac conference exchanges */}
          <div className="space-y-3">
            {CONF_MSGS.slice(0, confMsgIdx).map((ex, i) => {
              if (ex.from === "user") return <EVUserBubble key={i}>{ex.text}</EVUserBubble>;
              return (
                <div key={i} className="animate-[fadeSlideIn_0.4s_ease-out]">
                  <EVBotBubble code={ex.from}><p className="text-sm text-gray-700">{ex.text}</p></EVBotBubble>
                </div>
              );
            })}
            {confMsgIdx < CONF_MSGS.length && confMsgIdx > 0 && (
              <div className="flex gap-2.5 ml-10">
                <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 flex items-center gap-1.5">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-[9px] text-gray-400">en train d'ecrire...</span>
                </div>
              </div>
            )}
            {confMsgIdx >= CONF_MSGS.length && (
              <>
                <div className="mx-1 border border-emerald-200 rounded-xl p-3 bg-emerald-50/50">
                  <p className="text-[9px] font-bold text-emerald-800 mb-1.5 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Actions confirmees
                  </p>
                  {["Visite privee exclusive PH4 — cette semaine", "Dossier comparatif avec analyse de marche", "Analyse financiere et projections de valeur"].map((d, i) => (
                    <div key={i} className="flex items-start gap-1.5 mt-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-[11px] text-emerald-900">{d}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center">
                  <button onClick={() => setStage("biz-probleme")}
                    className="text-xs text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 font-bold cursor-pointer"
                    style={{ backgroundColor: EV_RED }}>
                    <Crown className="h-3.5 w-3.5" /> Voir l'opportunite d'affaires
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
      {si > 9 && <EVStep text="Conference completee — visite privee bookee" />}

      {/* === ETAPE 1 — LE PROBLEME === */}
      {si >= 10 && (
        <>
          {stage === "biz-probleme" && si === 10 && (
            <EVBotBubble code="CEOB">
              <p className="text-sm text-gray-700">Patrice, vous venez de voir l'experience client. Maintenant, parlons de <span className="font-bold" style={{ color: EV_RED }}>votre operation</span>. Laissez-moi vous montrer ce qui freine vos agents aujourd'hui.</p>
            </EVBotBubble>
          )}
          {BIZ_PROBLEM_ITEMS.slice(0, stage === "biz-probleme" ? bizProbIdx : si > 10 ? BIZ_PROBLEM_ITEMS.length : 0).map((item, i) => (
            <div key={`bc-${i}`} className="animate-[fadeSlideIn_0.4s_ease-out]">
              <EVBotBubble code="CEOB">
                <p className="text-sm text-gray-700"><span className="font-bold" style={{ color: EV_RED }}>{item.stat}</span> — {item.chat}</p>
              </EVBotBubble>
            </div>
          ))}
          {stage === "biz-probleme" && bizProbIdx < BIZ_PROBLEM_ITEMS.length && (
            <div className="flex gap-2.5 ml-10">
              <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 flex items-center gap-1.5">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-[9px] text-gray-400">{bizProbIdx + 1}/{BIZ_PROBLEM_ITEMS.length}...</span>
              </div>
            </div>
          )}
          {stage === "biz-probleme" && bizProbIdx >= BIZ_PROBLEM_ITEMS.length && (
            <div className="flex justify-center">
              <button onClick={() => setStage("biz-solution")}
                className="text-xs text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 font-bold cursor-pointer"
                style={{ backgroundColor: EV_RED }}>
                <ArrowRight className="h-3.5 w-3.5" /> Voir la solution
              </button>
            </div>
          )}
        </>
      )}
      {si > 10 && <EVStep text="Probleme identifie — 30% du temps perdu" />}

      {/* === ETAPE 2 — LA SOLUTION (Brain Team) === */}
      {si >= 11 && (
        <>
          {stage === "biz-solution" && si === 11 && (
            <EVBotBubble code="CEOB">
              <p className="text-sm text-gray-700">Voici comment la <span className="font-bold" style={{ color: EV_RED }}>Brain Team</span> regle chacun de ces problemes — pour <span className="font-bold text-emerald-600">30 fois moins cher</span> qu'un employe.</p>
            </EVBotBubble>
          )}
          {BIZ_SOLUTION_ITEMS.slice(0, stage === "biz-solution" ? bizSolIdx : si > 11 ? BIZ_SOLUTION_ITEMS.length : 0).map((item, i) => (
            <div key={`be-${i}`} className="animate-[fadeSlideIn_0.4s_ease-out]">
              <EVBotBubble code="CEOB">
                <p className="text-sm text-gray-700"><span className="font-bold" style={{ color: EV_RED }}>#{item.num}</span> — {item.chat}</p>
              </EVBotBubble>
            </div>
          ))}
          {stage === "biz-solution" && bizSolIdx < BIZ_SOLUTION_ITEMS.length && (
            <div className="flex gap-2.5 ml-10">
              <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 flex items-center gap-1.5">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-[9px] text-gray-400">{bizSolIdx + 1}/{BIZ_SOLUTION_ITEMS.length}...</span>
              </div>
            </div>
          )}
          {stage === "biz-solution" && bizSolIdx >= BIZ_SOLUTION_ITEMS.length && (
            <div className="flex justify-center">
              <button onClick={() => setStage("biz-chiffres")}
                className="text-xs text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 font-bold cursor-pointer"
                style={{ backgroundColor: EV_RED }}>
                <ArrowRight className="h-3.5 w-3.5" /> Voir les chiffres
              </button>
            </div>
          )}
        </>
      )}
      {si > 11 && <EVStep text="Solution Brain Team — 12 robots, 30x moins cher" />}

      {/* === ETAPE 3 — LES CHIFFRES (specifique a E&V 3 bureaux) === */}
      {si >= 12 && (
        <>
          {stage === "biz-chiffres" && (
            <EVBotBubble code="CEOB">
              <p className="text-sm text-gray-700">Maintenant, les chiffres concrets <span className="font-bold" style={{ color: EV_RED }}>pour votre operation</span> — Montreal, Quebec et Toronto.</p>
            </EVBotBubble>
          )}
          {BIZ_CHIFFRES_ITEMS.slice(0, stage === "biz-chiffres" ? bizChifIdx : BIZ_CHIFFRES_ITEMS.length).map((item, i) => {
            const color = item.type === "gain" ? "text-emerald-600" : item.type === "economie" ? "text-blue-600" : item.type === "investissement" ? "text-orange-600" : item.type === "modele" ? "text-purple-600" : "text-emerald-700";
            const label = item.type === "gain" ? "REVENUS" : item.type === "economie" ? "ECONOMIES" : item.type === "investissement" ? "INVESTISSEMENT" : item.type === "modele" ? "NOTRE MODELE" : "IMPACT NET";
            return (
              <div key={`bm-${i}`} className="animate-[fadeSlideIn_0.4s_ease-out]">
                <EVBotBubble code="CEOB">
                  <p className="text-sm text-gray-700"><span className={cn("text-xs font-bold uppercase tracking-wider", color)}>{label}</span> — {item.chat}</p>
                </EVBotBubble>
              </div>
            );
          })}
          {stage === "biz-chiffres" && bizChifIdx < BIZ_CHIFFRES_ITEMS.length && (
            <div className="flex gap-2.5 ml-10">
              <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 flex items-center gap-1.5">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-[9px] text-gray-400">{bizChifIdx + 1}/{BIZ_CHIFFRES_ITEMS.length}...</span>
              </div>
            </div>
          )}
          {stage === "biz-chiffres" && bizChifIdx >= BIZ_CHIFFRES_ITEMS.length && (
            <>
              <EVBotBubble code="CEOB">
                <p className="text-sm text-gray-700">Pour resumer : <span className="font-bold" style={{ color: EV_RED }}>+14M$ d'impact annuel</span> sur vos 3 bureaux, pour un investissement de 90 000$ par an. C'est 155$ de retour pour chaque dollar investi. Et vous seriez les <span className="font-bold" style={{ color: EV_RED }}>premiers au Canada</span> a l'adopter.</p>
              </EVBotBubble>
              <div className="flex justify-center gap-2 mt-2">
                <button onClick={handleReset}
                  className="text-xs bg-gray-100 text-gray-500 px-4 py-1.5 rounded-full flex items-center gap-1.5 cursor-pointer border border-gray-200 hover:bg-gray-200">
                  <RotateCcw className="h-3.5 w-3.5" /> Recommencer la demo
                </button>
              </div>
            </>
          )}
        </>
      )}
    </>
  );

  // ═══════════════════════════════════════
  // ATELIER CONTENT (Right panel)
  // ═══════════════════════════════════════
  const atelierContent = (
    <div className="space-y-3">
      {/* E&V Header */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-2.5 flex items-center gap-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg border-2 flex items-center justify-center" style={{ borderColor: EV_RED }}>
              <span className="text-[6px] font-black" style={{ color: EV_RED }}>E&V</span>
            </div>
            <div>
              <p className="text-[7px] font-bold tracking-[2px] text-gray-400 uppercase">Engel & Volkers</p>
              <p className="text-[8px] text-gray-300">Montreal | Quebec | Toronto</p>
            </div>
          </div>
          <div className="text-gray-200 font-thin">&times;</div>
          <div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-[7px] tracking-[1.5px] font-bold uppercase" style={{ color: EV_RED }}>The</span>
              <span className="text-[11px] font-black text-gray-800">Realtor</span>
              <span className="text-[8px] font-bold" style={{ color: EV_RED }}>.ai</span>
            </div>
          </div>
          <div className="ml-auto text-[9px] text-gray-400 font-medium flex gap-3">
            <span>Proprietes</span><span>Conseillers</span><span>Services</span>
          </div>
        </div>
        <div className="h-20 relative overflow-hidden">
          <img src="https://images.ctfassets.net/3g4b24b0tvoz/6uwzGn8yxl9nfhPvverhFT/a15495a198a6fe4d810feab5955ff6f2/Shop-Hero-Montreal.png.jpeg" alt="Montreal" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-2">
            <p className="text-xs text-gray-700 font-medium">Laissez-nous trouver votre maison de reve avec l'intelligence artificielle</p>
          </div>
        </div>
        <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-2">
          <div className="flex-1 bg-gray-100 rounded-full h-1.5">
            <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${(filledCount / 4) * 100}%`, backgroundColor: EV_RED }} />
          </div>
          <span className="text-[9px] font-bold" style={{ color: EV_RED }}>{filledCount}/4</span>
        </div>
      </div>

      {/* MON MOOD BOARD — builds progressively */}
      <EVDocSection title="Ma Maison de Reve" icon={Palette} filled={moodDone} active={si >= 2 && si < 7}>
        <div className="space-y-3">
          {/* Style */}
          {styleDone && (
            <div>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">Style de vie</p>
              <div className="flex items-center gap-2.5 bg-stone-50 rounded-lg p-2 border border-gray-100">
                <img src={STYLE_PHOTOS[pickedStyleIdx].img} alt="Style" className="w-12 h-12 rounded-lg object-cover" />
                <div>
                  <p className="text-[11px] font-bold text-gray-700">{STYLE_PHOTOS[pickedStyleIdx].label}</p>
                  <p className="text-[9px] text-gray-400">Materiaux nobles, lumiere naturelle</p>
                </div>
                <CheckCircle2 className="h-4 w-4 ml-auto shrink-0" style={{ color: EV_RED }} />
              </div>
            </div>
          )}
          {/* Room inspirations — per-room selection (4 options each) */}
          {(si >= 3 && (stage === "mood-rooms" || roomsDone)) && (
            <div className="space-y-3">
              {ROOM_CHOICES.map((room, ri) => {
                const picked = roomPicks[ri];
                const isActive = stage === "mood-rooms" && ri === currentRoomIdx && picked === undefined;
                const isDone = picked !== undefined;
                const isLocked = !isDone && !isActive;
                return (
                  <div key={ri}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      {isDone ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> :
                       isActive ? <Sparkles className="h-3.5 w-3.5" style={{ color: EV_RED }} /> :
                       <Lock className="h-3.5 w-3.5 text-gray-300" />}
                      <p className={cn("text-[9px] font-bold uppercase tracking-wider",
                        isActive ? "text-red-700" : isDone ? "text-emerald-700" : "text-gray-400")}>{room.name}</p>
                      <p className="text-[8px] text-gray-400">— {room.desc}</p>
                    </div>
                    {isDone && (
                      <div className="flex items-center gap-2.5 bg-stone-50 rounded-lg p-2 border border-gray-100">
                        <img src={room.options[picked].img} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        <div>
                          <p className="text-[11px] font-bold text-gray-700">{room.options[picked].label}</p>
                          <p className="text-[9px] text-gray-400">{room.name}</p>
                        </div>
                        <CheckCircle2 className="h-4 w-4 ml-auto shrink-0" style={{ color: EV_RED }} />
                      </div>
                    )}
                    {isActive && (
                      <div className="grid grid-cols-2 gap-1.5">
                        {room.options.map((opt, oi) => (
                          <button key={oi} onClick={() => pickRoom(ri, oi)}
                            className="rounded-xl overflow-hidden border-2 border-gray-200 hover:border-red-400 cursor-pointer transition-all text-left group hover:shadow-md">
                            <div className="h-20 overflow-hidden">
                              <img src={opt.img} alt={opt.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            </div>
                            <div className="bg-white px-2 py-1.5">
                              <p className="text-[9px] font-bold text-gray-700">{opt.label}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {isLocked && (
                      <div className="bg-gray-50 border border-dashed border-gray-200 rounded-lg p-2 text-center">
                        <p className="text-[8px] text-gray-400 italic">En attente...</p>
                      </div>
                    )}
                  </div>
                );
              })}
              {/* Pinterest import */}
              {stage === "mood-rooms" && (
                <div className="mt-1 bg-stone-50 border border-dashed border-gray-200 rounded-lg p-2.5 text-center cursor-pointer hover:bg-stone-100 transition-colors">
                  <Camera className="h-4 w-4 mx-auto text-gray-300" />
                  <p className="text-[9px] text-gray-400 mt-1">Importer depuis Pinterest ou vos photos</p>
                </div>
              )}
            </div>
          )}
          {/* AI Suggestions */}
          {roomsDone && (
            <div>
              <p className="text-[9px] text-blue-500 font-bold flex items-center gap-1 mb-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Inspirations AI supplementaires
              </p>
              <div className="flex gap-1.5">
                {AI_SUGGESTIONS.map((s, i) => (
                  <div key={i} className="flex-1 rounded-lg overflow-hidden border border-blue-200">
                    <img src={s.img} alt="" className="w-full h-12 object-cover" />
                    <p className="text-[8px] text-blue-600 px-1.5 py-0.5 bg-blue-50 text-center truncate">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Quartier — shown after rooms */}
          {quartierDone && (
            <div>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">Quartier</p>
              <div className="flex items-center gap-2.5 bg-stone-50 rounded-lg p-2 border border-gray-100">
                <img src={QUARTIER_PHOTOS[pickedQuartierIdx].img} alt="Quartier" className="w-12 h-12 rounded-lg object-cover" />
                <div>
                  <p className="text-[11px] font-bold text-gray-700">{QUARTIER_PHOTOS[pickedQuartierIdx].label}</p>
                  <p className="text-[9px] text-gray-400">Penthouse, vue fleuve</p>
                </div>
                <CheckCircle2 className="h-4 w-4 ml-auto shrink-0" style={{ color: EV_RED }} />
              </div>
            </div>
          )}
          {/* Budget */}
          {budgetDone && (
            <div>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">Budget & Priorites</p>
              <div className="flex items-center gap-2 mb-1.5">
                <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-[11px] font-bold text-gray-700">2M - 3M$</span>
              </div>
              <div className="flex gap-1 flex-wrap">
                {["Terrasse 500pi\u00b2+", "Concierge 24h", "Vue fleuve"].map(t => (
                  <span key={t} className="text-[8px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "#FEE2E2", color: EV_RED }}>{t}</span>
                ))}
              </div>
            </div>
          )}
          {/* Precision score */}
          {moodDone && (
            <div className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 mt-1">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold" style={{ color: EV_RED }}>Precision du mood board</p>
                <span className="text-sm font-black" style={{ color: EV_RED }}>93%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                <div className="h-full rounded-full" style={{ width: "93%", backgroundColor: EV_RED }} />
              </div>
            </div>
          )}
        </div>
      </EVDocSection>

      {/* MATCHING SCANNING ANIMATION */}
      {stage === "matching-thinking" && (
        <div className="bg-white border border-red-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-2.5 bg-gradient-to-r from-red-50 to-stone-50 border-b border-red-100 flex items-center gap-2">
            <Search className="h-4 w-4 animate-pulse" style={{ color: EV_RED }} />
            <span className="text-xs font-bold" style={{ color: EV_RED }}>Scan AI en cours...</span>
          </div>
          <div className="p-4 space-y-3">
            {/* Scanning visual */}
            <div className="space-y-2">
              {[
                { label: "Scan du reseau E&V Montreal", pct: 100 },
                { label: "Analyse des images et ambiances", pct: 85 },
                { label: "Croisement avec votre mood board", pct: 60 },
                { label: "Scoring multi-criteres", pct: 35 },
                { label: "Selection des meilleures proprietes", pct: 10 },
              ].map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[9px] text-gray-500">{s.label}</span>
                    <span className="text-[9px] font-bold" style={{ color: EV_RED }}>{s.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full animate-pulse" style={{ width: `${s.pct}%`, backgroundColor: EV_RED, transition: "width 2s ease" }} />
                  </div>
                </div>
              ))}
            </div>
            {/* Property preview flashing */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider mb-2">Proprietes en cours d'analyse...</p>
              <div className="grid grid-cols-3 gap-1.5">
                {[LISTINGS[0].img, LISTINGS[1].img, LISTINGS[2].img].map((img, i) => (
                  <div key={i} className="rounded-lg overflow-hidden border border-gray-200 opacity-60 animate-pulse" style={{ animationDelay: `${i * 300}ms` }}>
                    <img src={img} alt="" className="w-full h-12 object-cover" />
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center pt-2">
              <p className="text-[9px] text-gray-400">8 400 proprietes scannees — {moodPhotos.length} criteres de votre mood board</p>
            </div>
          </div>
        </div>
      )}

      {/* PROPRIETES MATCHEES */}
      <EVDocSection title="Proprietes Matchees" icon={Search} filled={matchDone}>
        <div className="space-y-3">
          {LISTINGS.map((l, idx) => (
            <div key={l.id} className={cn("bg-white rounded-xl border overflow-hidden shadow-sm",
              idx === 0 ? "border-red-200 ring-1 ring-red-100" : "border-gray-200")}>
              <div className="h-32 relative flex items-end p-2.5 overflow-hidden">
                <img src={l.img} alt={l.addr} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
                {l.badge && (
                  <div className="absolute top-2 left-2 z-10 text-white text-[7px] font-black px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1"
                    style={{ backgroundColor: EV_RED }}>
                    <Crown className="h-3.5 w-3.5" /> {l.badge}
                  </div>
                )}
                <div className="relative z-10 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm">
                  <p className="text-sm font-black text-gray-800">{l.price}</p>
                  <p className="text-[9px] text-gray-500">{l.beds}ch &middot; {l.baths}sdb &middot; {l.sqft}</p>
                </div>
                <div className={cn("absolute top-2 right-2 z-10 w-11 h-11 rounded-xl flex flex-col items-center justify-center bg-white shadow-sm",
                  idx === 0 ? "ring-2 ring-red-200" : "border border-gray-200")}>
                  <span className={cn("text-sm font-black", idx === 0 ? "" : "text-gray-700")}
                    style={idx === 0 ? { color: EV_RED } : {}}>{l.score}</span>
                  <span className="text-[6px] text-gray-400 uppercase tracking-wider font-bold">match</span>
                </div>
              </div>
              <div className="px-3 py-2">
                <p className="text-[11px] font-bold text-gray-800">{l.addr}</p>
                <p className="text-[9px] text-gray-400">{l.city}</p>
                {l.desc && (
                  <div className="mt-1.5 space-y-1">
                    {l.desc.split("\n\n").map((para, pi) => (
                      <p key={pi} className="text-[9px] text-gray-500 leading-relaxed italic">{para}</p>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-4 gap-x-2.5 gap-y-1.5 mt-2">
                  {Object.entries(l.breakdown).map(([k, v]) => (
                    <div key={k}>
                      <div className="flex justify-between text-[8px] mb-0.5">
                        <span className="text-gray-400">{k}</span>
                        <span className="text-gray-600 font-bold">{v}%</span>
                      </div>
                      <div className="h-1 bg-gray-100 rounded-full">
                        <div className={cn("h-full rounded-full", v >= 95 ? "bg-red-400" : v >= 90 ? "bg-emerald-400" : "bg-blue-400")} style={{ width: `${v}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {l.features.map(f => (
                    <span key={f} className="text-[8px] bg-stone-50 text-gray-500 px-1.5 py-0.5 rounded border border-gray-100">{f}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </EVDocSection>

      {/* CONFERENCE AI */}
      <EVDocSection title="Conference AI" icon={Video} filled={confDone}>
        <div className="space-y-2">
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <div className="h-20 relative">
              <img src={LISTINGS[0].img} alt="PH4" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[8px] text-white font-bold">EN DIRECT</span>
              </div>
              <div className="absolute bottom-2 left-0 right-0 flex justify-center -space-x-2">
                {["CEOB"].map(c => (
                  <img key={c} src={BOT_COLORS[c]?.avatar} alt="" className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-lg" />
                ))}
                <div className="w-9 h-9 rounded-full bg-stone-400 border-2 border-white flex items-center justify-center text-[9px] text-white font-bold shadow-lg">AF</div>
              </div>
            </div>
            <div className="p-2.5 bg-stone-50 grid grid-cols-3 gap-1.5 text-center">
              <div className="bg-white rounded-lg py-1.5 border border-gray-100">
                <Mic className="h-3.5 w-3.5 mx-auto text-emerald-500" />
                <p className="text-[8px] text-gray-500 mt-0.5">Audio</p>
              </div>
              <div className="bg-white rounded-lg py-1.5 border border-gray-100">
                <Video className="h-3.5 w-3.5 mx-auto text-blue-500" />
                <p className="text-[8px] text-gray-500 mt-0.5">Video</p>
              </div>
              <div className="bg-white rounded-lg py-1.5 border border-gray-100">
                <Eye className="h-3.5 w-3.5 mx-auto text-purple-500" />
                <p className="text-[8px] text-gray-500 mt-0.5">Visite 3D</p>
              </div>
            </div>
          </div>
          {["Visite exclusive PH4 planifiee", "Dossier comparatif en preparation", "Analyse financiere personnalisee"].map((d, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-[11px] text-gray-600">{d}</span>
            </div>
          ))}
        </div>
      </EVDocSection>

      {/* OPPORTUNITE D'AFFAIRES — Probleme → Solution → Chiffres */}
      {si >= 10 && (
        <EVDocSection title="Opportunite d'affaires" icon={Crown} filled={bizDone} active={si >= 10 && !bizDone}>
          <div className="space-y-5">

            {/* === ETAPE 1 — LE PROBLEME === */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-orange-500" />
                <p className="text-sm font-bold text-orange-600">Le probleme aujourd'hui</p>
              </div>
              <div className="space-y-2.5">
                {BIZ_PROBLEM_ITEMS.slice(0, stage === "biz-probleme" ? bizProbIdx : BIZ_PROBLEM_ITEMS.length).map((r, i) => (
                  <div key={i} className="flex items-start gap-3 bg-orange-50/50 rounded-xl px-3.5 py-3 border border-orange-100 animate-[fadeSlideIn_0.4s_ease-out]">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-orange-500">
                      <span className="text-xs font-black text-white">{r.stat}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800">{r.label}</p>
                    </div>
                  </div>
                ))}
              </div>
              {stage === "biz-probleme" && bizProbIdx < BIZ_PROBLEM_ITEMS.length && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-2 bg-gray-100 rounded-full flex-1 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500 bg-orange-400" style={{ width: `${(bizProbIdx / BIZ_PROBLEM_ITEMS.length) * 100}%` }} />
                  </div>
                  <span className="text-xs font-bold text-orange-500">{bizProbIdx}/{BIZ_PROBLEM_ITEMS.length}</span>
                </div>
              )}
            </div>

            {/* === ETAPE 2 — LA SOLUTION (Brain Team) === */}
            {si >= 11 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4" style={{ color: EV_RED }} />
                  <p className="text-sm font-bold" style={{ color: EV_RED }}>La solution Brain Team</p>
                </div>
                <div className="space-y-2.5">
                  {BIZ_SOLUTION_ITEMS.slice(0, stage === "biz-solution" ? bizSolIdx : BIZ_SOLUTION_ITEMS.length).map((r, i) => (
                    <div key={i} className="flex items-start gap-3 bg-red-50/40 rounded-xl px-3.5 py-3 border border-red-100 animate-[fadeSlideIn_0.4s_ease-out]">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-white border-2" style={{ borderColor: EV_RED }}>
                        <span className="text-sm font-black" style={{ color: EV_RED }}>{r.num}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800">{r.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {stage === "biz-solution" && bizSolIdx < BIZ_SOLUTION_ITEMS.length && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-2 bg-gray-100 rounded-full flex-1 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(bizSolIdx / BIZ_SOLUTION_ITEMS.length) * 100}%`, backgroundColor: EV_RED }} />
                    </div>
                    <span className="text-xs font-bold" style={{ color: EV_RED }}>{bizSolIdx}/{BIZ_SOLUTION_ITEMS.length}</span>
                  </div>
                )}
              </div>
            )}

            {/* === ETAPE 3 — LES CHIFFRES (specifiques a E&V) === */}
            {si >= 12 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <p className="text-sm font-bold text-emerald-600">Les chiffres pour votre operation</p>
                </div>
                <div className="space-y-2.5">
                  {BIZ_CHIFFRES_ITEMS.slice(0, stage === "biz-chiffres" ? bizChifIdx : BIZ_CHIFFRES_ITEMS.length).map((item, i) => {
                    const bg = item.type === "gain" ? "bg-emerald-50 border-emerald-200" : item.type === "economie" ? "bg-blue-50 border-blue-200" : item.type === "investissement" ? "bg-orange-50 border-orange-200" : item.type === "modele" ? "bg-purple-50 border-purple-200" : "bg-emerald-100 border-emerald-300";
                    const color = item.type === "gain" ? "text-emerald-600" : item.type === "economie" ? "text-blue-600" : item.type === "investissement" ? "text-orange-600" : item.type === "modele" ? "text-purple-600" : "text-emerald-700";
                    const label = item.type === "gain" ? "REVENUS" : item.type === "economie" ? "ECONOMIES" : item.type === "investissement" ? "INVESTISSEMENT" : item.type === "modele" ? "NOTRE MODELE" : "IMPACT NET";
                    return (
                      <div key={i} className={cn("rounded-xl p-3.5 border animate-[fadeSlideIn_0.4s_ease-out]", bg)}>
                        <p className={cn("text-xs font-bold uppercase tracking-wider mb-1", color)}>{label}</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{item.chat}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Synthese finale */}
                {bizDone && (
                  <div className="mt-4 rounded-xl p-4 border-2 animate-[fadeSlideIn_0.4s_ease-out]" style={{ borderColor: EV_RED, backgroundColor: "#FEF2F2" }}>
                    <p className="text-sm font-bold mb-3" style={{ color: EV_RED }}>Resume — Impact annuel pour E&V</p>
                    <div className="space-y-2">
                      {[
                        { label: "Revenus supplementaires (3 bureaux)", value: "+7M$ - 9M$", color: "text-emerald-600" },
                        { label: "Productivite recuperee (3 bureaux)", value: "+7.5M$", color: "text-blue-600" },
                        { label: "Investissement annuel total", value: "- 90 000$", color: "text-orange-600" },
                      ].map((line, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">{line.label}</span>
                          <span className={cn("text-sm font-black", line.color)}>{line.value}</span>
                        </div>
                      ))}
                      <div className="border-t-2 pt-2 mt-2" style={{ borderColor: EV_RED }}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold" style={{ color: EV_RED }}>Impact net annuel</span>
                          <span className="text-lg font-black" style={{ color: EV_RED }}>+14M$</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">155$ de retour pour chaque 1$ investi</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </EVDocSection>
      )}
    </div>
  );

  // ═══════════════════════════════════════
  // ROOT
  // ═══════════════════════════════════════
  return (
    <div className="h-full flex flex-col bg-stone-50">
      <div className="shrink-0 bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-3">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-1.5">
          <span className="text-[7px] tracking-[2px] font-bold uppercase" style={{ color: EV_RED }}>The</span>
          <span className="text-sm font-black text-gray-800 tracking-tight">Realtor</span>
          <span className="text-[9px] font-bold" style={{ color: EV_RED }}>.ai</span>
        </div>
        <span className="text-xs text-gray-400 ml-1">— {STAGE_LABELS[stage]}</span>
        <div className="flex items-center gap-0.5 ml-auto">
          {Array.from({ length: TOTAL_STAGES }, (_, i) => (
            <div key={i} className={cn("h-1 rounded-full transition-all",
              i === si ? "w-4 bg-emerald-500" : i < si ? "w-2" : "w-2 bg-gray-200"
            )} style={i < si ? { backgroundColor: EV_RED } : {}} />
          ))}
        </div>
        <button onClick={handleReset} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors cursor-pointer ml-2" title="Recommencer">
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex-1 flex overflow-hidden">
        {cockpit}
        <div className="w-[34%] min-w-[220px] flex flex-col border-r border-gray-200 bg-white">
          <div ref={chatRef} className="flex-1 overflow-auto p-3 space-y-3">{chatContent}</div>
        </div>
        <div ref={rightRef} className="flex-1 overflow-auto p-3 bg-stone-50">{atelierContent}</div>
      </div>
    </div>
  );
}

// ========== SUB-COMPONENTS ==========

function EVBotBubble({ code, children, compact }: { code: string; children: React.ReactNode; compact?: boolean }) {
  const bot = BOT_COLORS[code];
  if (!bot) return null;
  return (
    <div className="flex gap-2.5">
      <BotAvatar code={code} size="md" />
      <div className={cn("bg-white border rounded-xl rounded-tl-none px-3 py-2.5 max-w-[85%] shadow-sm", `border-l-2 ${bot.border}`)}>
        {!compact && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold" style={{ color: EV_RED }}>{bot.name}</span>
            <span className="text-[9px] text-gray-400">{bot.role} — Brain Team</span>
          </div>
        )}
        {compact ? <p className="text-[11px] text-gray-400">{children}</p> : children}
      </div>
    </div>
  );
}

function EVUserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5 justify-end">
      <div className="bg-blue-50 border border-blue-100 rounded-xl rounded-tr-none px-3 py-2.5 max-w-[80%]">
        <p className="text-sm text-blue-900">{children}</p>
      </div>
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-stone-400 to-stone-500 flex items-center justify-center text-[9px] text-white font-bold shrink-0">AF</div>
    </div>
  );
}

function EVStep({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 ml-10 py-1.5">
      <div className="h-5 w-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
      </div>
      <span className="text-[11px] text-emerald-700 font-medium">{text}</span>
    </div>
  );
}

function EVDocSection({ title, icon: Icon, filled, active, children }: {
  title: string; icon: React.ElementType; filled: boolean; active?: boolean; children?: React.ReactNode;
}) {
  const show = filled || active;
  return (
    <div className={cn("bg-white border rounded-xl overflow-hidden shadow-sm transition-all duration-500",
      show ? "border-gray-200" : "border-dashed border-gray-300 opacity-60")}>
      <div className={cn("px-3 py-2 flex items-center gap-2 border-b",
        show ? "bg-stone-50 border-gray-200" : "bg-stone-50/50 border-gray-200/50")}>
        {filled ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> :
         active ? <Sparkles className="h-3.5 w-3.5" style={{ color: EV_RED }} /> :
         <Lock className="h-3.5 w-3.5 text-gray-300" />}
        <Icon className="h-3.5 w-3.5" style={{ color: show ? EV_RED : "#d1d5db" }} />
        <span className={cn("text-xs font-medium", show ? "text-gray-700" : "text-gray-400")}>{title}</span>
        {!show && <span className="text-[9px] text-gray-400 ml-auto italic">En attente...</span>}
        {active && !filled && <span className="text-[9px] ml-auto font-medium" style={{ color: EV_RED }}>En cours...</span>}
      </div>
      {show && children && <div className="p-3">{children}</div>}
    </div>
  );
}
