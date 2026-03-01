/**
 * MarketplacePage.tsx — Marketplace (REFAIT COMPLET)
 * 2 volets controles par l'orchestrateur via prop `volet`:
 *   - "bots" = Fiches CV agents IA
 *   - "cahiers" = Mains levees / opportunites
 * CarlOS = GPS de la plateforme, detecte besoins et guide l'utilisateur
 * Sprint B — Reorganisation Orbit9
 */

import {
  Bot, Search, Star, DollarSign, Zap,
  FileText, Hand, ArrowRight, Send,
  Target, Plus, Eye, MessageSquare,
  TrendingUp,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";

interface MarketplacePageProps {
  volet?: "bots" | "cahiers";
  onNavigate?: (section: string) => void;
}

export function MarketplacePage({ volet = "bots", onNavigate }: MarketplacePageProps) {

  const bots = [
    {
      name: "Bot Qualite ISO",
      avatar: "QI",
      role: "Agent Qualite & Conformite",
      specialites: ["ISO 9001", "ISO 13485", "Audit interne", "Plans d'action corrective"],
      secteurs: ["Manufacturier", "Pharmaceutique", "Alimentaire"],
      experience: "Formation sur 12+ audits reels",
      rating: 4.8,
      prix: "95$/mois",
      users: 14,
      color: "emerald",
    },
    {
      name: "Bot Soudage Cobot",
      avatar: "SC",
      role: "Agent Integration Robotique Soudure",
      specialites: ["Programmation cobot", "Specs cellule soudage", "ROI automatisation", "Formation operateurs"],
      secteurs: ["Metal", "Soudage", "Assemblage"],
      experience: "Specialise cobots UR, Fanuc, ABB",
      rating: 4.9,
      prix: "125$/mois",
      users: 8,
      color: "blue",
    },
    {
      name: "Bot Logistique AMR",
      avatar: "LA",
      role: "Agent Logistique & Entreposage 4.0",
      specialites: ["Optimisation flux", "WMS", "AGV/AMR", "Layout entrepot"],
      secteurs: ["Logistique", "Distribution", "Manufacturier"],
      experience: "Donnees sectorielles 200+ entrepots",
      rating: 4.7,
      prix: "110$/mois",
      users: 11,
      color: "amber",
    },
    {
      name: "Bot Subventions",
      avatar: "SB",
      role: "Agent Financement & Programmes Gouvernementaux",
      specialites: ["RS&DE", "CDAE", "Programme ESSOR", "Credits d'impot"],
      secteurs: ["Tous secteurs"],
      experience: "Base de 150+ programmes actifs",
      rating: 4.6,
      prix: "85$/mois",
      users: 22,
      color: "green",
    },
    {
      name: "Bot Securite OT",
      avatar: "SO",
      role: "Agent Cybersecurite Industrielle",
      specialites: ["Audit OT/IT", "NIST Framework", "Segmentation reseau", "Plan de reponse"],
      secteurs: ["Manufacturier", "Infrastructure", "Energie"],
      experience: "Aligne NIST + normes IEC 62443",
      rating: 4.8,
      prix: "135$/mois",
      users: 6,
      color: "red",
    },
    {
      name: "Bot RH-Recrutement",
      avatar: "RH",
      role: "Agent Ressources Humaines & Talents",
      specialites: ["Description de poste", "Strategie retention", "Marque employeur", "Benchmarks salaires"],
      secteurs: ["Manufacturier", "Tech", "Services"],
      experience: "Donnees salariales Quebec a jour",
      rating: 4.5,
      prix: "90$/mois",
      users: 18,
      color: "violet",
    },
    {
      name: "Bot Alimentaire HACCP",
      avatar: "HA",
      role: "Agent Securite Alimentaire & HACCP",
      specialites: ["Plan HACCP", "SQF", "BRC", "Tracabilite", "Audit FDA"],
      secteurs: ["Alimentaire", "Transformation", "Emballage"],
      experience: "Normes GFSI + reglementations ACIA",
      rating: 4.7,
      prix: "105$/mois",
      users: 9,
      color: "orange",
    },
    {
      name: "Bot Pharmaceutique",
      avatar: "PH",
      role: "Agent Conformite Pharma & GMP",
      specialites: ["GMP/BPF", "Validation procedes", "Documentation qualite", "Gestion deviations"],
      secteurs: ["Pharmaceutique", "Medical", "Biotechnologie"],
      experience: "Aligne Sante Canada + FDA 21 CFR",
      rating: 4.9,
      prix: "145$/mois",
      users: 5,
      color: "indigo",
    },
  ];

  const cahiers = [
    {
      title: "Installation Cobot Soudage — Cellule Automatisee",
      type: "EXPERTISE" as const,
      budget: "125-175K$",
      deadline: "15 avril 2026",
      competences: ["Integration robotique", "Soudure MIG/TIG", "Programmation cobot"],
      mainsLevees: 3,
      client: "Usinage Precision QC",
      statut: "actif" as const,
    },
    {
      title: "2 Soudeurs CWB certifies — Contrat 3 mois",
      type: "MANPOWER" as const,
      budget: "45-60K$",
      deadline: "1er mars 2026",
      competences: ["CWB W47.1", "Soudure structurale", "Lecture de plans"],
      mainsLevees: 5,
      client: "MetalPro Inc.",
      statut: "actif" as const,
    },
    {
      title: "Certification ISO 13485 — Gap Analysis + Remediation",
      type: "EXPERTISE" as const,
      budget: "12-18K$",
      deadline: "30 juin 2026",
      competences: ["ISO 13485", "Audit qualite", "Secteur pharmaceutique"],
      mainsLevees: 2,
      client: "PlastiForm",
      statut: "actif" as const,
    },
    {
      title: "Optimisation Layout Entrepot — 5,000 pi2",
      type: "EXPERTISE" as const,
      budget: "35-55K$",
      deadline: "20 mars 2026",
      competences: ["Logistique 4.0", "Design entrepot", "WMS"],
      mainsLevees: 1,
      client: "LogiFlow",
      statut: "ferme" as const,
    },
  ];

  return (
    <div className="space-y-5">
      {/* ═══ VOLET 1 — BOTS & AGENTS ═══ */}
      {volet === "bots" && (
        <div className="space-y-5">
          {/* KPIs avec tops colores */}
          <div className="grid grid-cols-4 gap-3">
            <Card className="p-0 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-orange-600 to-orange-500">
                <Bot className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">Bots disponibles</span>
              </div>
              <div className="px-3 py-2">
                <div className="text-2xl font-bold text-orange-600">{bots.length}</div>
                <div className="text-[10px] text-gray-500">Agents specialises</div>
              </div>
            </Card>
            <Card className="p-0 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500">
                <Zap className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">Mes bots actifs</span>
              </div>
              <div className="px-3 py-2">
                <div className="text-2xl font-bold text-blue-600">6</div>
                <div className="text-[10px] text-gray-500">C-Suite complet</div>
              </div>
            </Card>
            <Card className="p-0 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-600 to-violet-500">
                <Target className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">Categories</span>
              </div>
              <div className="px-3 py-2">
                <div className="text-2xl font-bold text-violet-600">12</div>
                <div className="text-[10px] text-gray-500">Secteurs couverts</div>
              </div>
            </Card>
            <Card className="p-0 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-600 to-green-500">
                <DollarSign className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">Economie vs consultants</span>
              </div>
              <div className="px-3 py-2">
                <div className="text-2xl font-bold text-green-600">85%</div>
                <div className="text-[10px] text-gray-500">En moyenne</div>
              </div>
            </Card>
          </div>

          {/* Recherche */}
          <div className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg bg-white">
            <Search className="h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Chercher un bot par industrie, fonction ou besoin..." className="flex-1 text-sm outline-none bg-transparent" readOnly />
          </div>

          {/* Grille de bots — style CV / fiche agent */}
          <div className="grid grid-cols-2 gap-3">
            {bots.map((bot, i) => (
              <Card key={i} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0", `bg-${bot.color}-500`)}>
                    {bot.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Nom + role */}
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="text-sm font-bold text-gray-800">{bot.name}</h4>
                    </div>
                    <p className="text-[10px] text-gray-500 mb-2">{bot.role}</p>

                    {/* Specialites (comme competences CV) */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {bot.specialites.map((s, j) => (
                        <Badge key={j} variant="outline" className="text-[9px] px-1.5">{s}</Badge>
                      ))}
                    </div>

                    {/* Secteurs */}
                    <p className="text-[10px] text-gray-400 mb-2">
                      <span className="font-semibold">Secteurs:</span> {bot.secteurs.join(", ")}
                    </p>

                    {/* Experience / formation */}
                    <p className="text-[10px] text-gray-500 italic mb-2">{bot.experience}</p>

                    {/* Footer: rating, prix, actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-3 text-[10px] text-gray-500">
                        <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-500" />{bot.rating}</span>
                        <span>{bot.users} utilisateurs</span>
                        <span className="font-bold text-gray-800">{bot.prix}</span>
                      </div>
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="outline" className="text-[10px] h-7 gap-1"><Eye className="h-3 w-3" /> Fiche</Button>
                        <Button size="sm" className={cn("text-[10px] h-7 gap-1", `bg-${bot.color}-600 hover:bg-${bot.color}-700`)}><Plus className="h-3 w-3" /> Ajouter</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* CTA Bot Custom — CarlOS detecte si un bot existe deja */}
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">C</div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-blue-800">Votre secteur n'est pas couvert?</h3>
                <p className="text-xs text-blue-600 mt-1">Decrivez votre besoin a CarlOS — il verifiera d'abord si un bot existant peut vous aider. Sinon, il lancera la creation d'un agent IA sur mesure pour votre industrie.</p>
                <p className="text-[10px] text-blue-500 mt-1 italic">"Carl, j'ai besoin d'un bot pour la gestion des normes CSA en electricite." → CarlOS verifie le catalogue → propose le meilleur match ou lance un bot custom.</p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="text-xs gap-1 bg-blue-600 hover:bg-blue-700"><MessageSquare className="h-3 w-3" /> Demander a CarlOS</Button>
                  <Button size="sm" variant="outline" className="text-xs gap-1 border-blue-300 text-blue-700"><FileText className="h-3 w-3" /> Voir le catalogue complet</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ═══ VOLET 2 — OPPORTUNITES (CAHIERS / MAINS LEVEES) ═══ */}
      {volet === "cahiers" && (
        <div className="space-y-5">
          {/* KPIs avec tops colores */}
          <div className="grid grid-cols-4 gap-3">
            <Card className="p-0 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500">
                <FileText className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">Cahiers publies</span>
              </div>
              <div className="px-3 py-2">
                <div className="text-2xl font-bold text-blue-600">{cahiers.length}</div>
                <div className="text-[10px] text-gray-500">Besoins documentes</div>
              </div>
            </Card>
            <Card className="p-0 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-600 to-green-500">
                <Hand className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">Mains levees actives</span>
              </div>
              <div className="px-3 py-2">
                <div className="text-2xl font-bold text-green-600">{cahiers.reduce((s, c) => s + c.mainsLevees, 0)}</div>
                <div className="text-[10px] text-gray-500">Reponses recues</div>
              </div>
            </Card>
            <Card className="p-0 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-500">
                <DollarSign className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">Valeur pipeline</span>
              </div>
              <div className="px-3 py-2">
                <div className="text-2xl font-bold text-amber-600">285K$</div>
                <div className="text-[10px] text-gray-500">Projets en cours</div>
              </div>
            </Card>
            <Card className="p-0 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500">
                <TrendingUp className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">Taux conversion</span>
              </div>
              <div className="px-3 py-2">
                <div className="text-2xl font-bold text-emerald-600">72%</div>
                <div className="text-[10px] text-gray-500">Cahier → Projet</div>
              </div>
            </Card>
          </div>

          {/* Flow pipeline visuel — 3 etapes */}
          <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-2.5 border-b border-blue-200">
              <div className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-bold text-blue-900">Comment ca fonctionne</span>
              </div>
            </div>
            <div className="p-4">
            <div className="flex items-center gap-2">
              {[
                { step: "1", title: "BESOIN", desc: "Le client decrit son besoin a CarlOS", icon: MessageSquare, color: "blue" },
                { step: "2", title: "CAHIER", desc: "CarlOS genere et publie le cahier", icon: FileText, color: "indigo" },
                { step: "3", title: "SELECTION", desc: "Expert leve la main → Projet demarre", icon: Hand, color: "emerald" },
              ].map((s, i) => {
                const SIcon = s.icon;
                return (
                  <div key={i} className="flex items-center gap-2 flex-1">
                    <div className={cn("flex-1 p-3 rounded-xl border text-center", `bg-${s.color}-50 border-${s.color}-200`)}>
                      <div className={cn("w-8 h-8 rounded-full mx-auto flex items-center justify-center mb-1", `bg-${s.color}-100`)}>
                        <SIcon className={cn("h-4 w-4", `text-${s.color}-600`)} />
                      </div>
                      <p className={cn("text-xs font-bold", `text-${s.color}-700`)}>{s.title}</p>
                      <p className="text-[10px] text-gray-500">{s.desc}</p>
                    </div>
                    {i < 2 && <ArrowRight className="h-4 w-4 text-gray-300 shrink-0" />}
                  </div>
                );
              })}
            </div>
            </div>
          </div>

          {/* Card routeur CarlOS */}
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">C</div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-blue-800">CarlOS — Routeur Intelligent</h3>
                <p className="text-xs text-blue-600 mt-1">CarlOS analyse chaque besoin et decide du meilleur chemin:</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="p-2 bg-white/60 rounded-lg border border-blue-100">
                    <p className="text-[10px] font-bold text-blue-800">Jumelage direct</p>
                    <p className="text-[10px] text-blue-600">Besoin simple → CarlOS trouve le match immediatement</p>
                  </div>
                  <div className="p-2 bg-white/60 rounded-lg border border-blue-100">
                    <p className="text-[10px] font-bold text-blue-800">Cellule Orbit9</p>
                    <p className="text-[10px] text-blue-600">Projet complexe → CarlOS active une Cellule collaborative</p>
                  </div>
                </div>
                {onNavigate && (
                  <button onClick={() => onNavigate("cellules")} className="text-[10px] text-blue-700 underline mt-2 cursor-pointer hover:text-blue-900">
                    Voir les Cellules Orbit9 actives →
                  </button>
                )}
              </div>
            </div>
          </Card>

          {/* Liste de cahiers */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-800">Cahiers actifs</h3>
            {cahiers.map((cahier, i) => (
              <Card key={i} className={cn("p-4 hover:shadow-md transition-shadow", cahier.statut === "ferme" && "opacity-60")}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={cn("text-[9px]",
                        cahier.type === "EXPERTISE" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                      )}>{cahier.type}</Badge>
                      {cahier.statut === "ferme" && <Badge variant="outline" className="text-[9px] text-gray-500">ATTRIBUE</Badge>}
                    </div>
                    <h4 className="text-sm font-bold text-gray-800">{cahier.title}</h4>
                    <p className="text-[10px] text-gray-400">Par {cahier.client} · Avant le {cahier.deadline}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">{cahier.budget}</p>
                    <p className="text-[10px] text-gray-400">Budget estime</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {cahier.competences.map((c, j) => (
                    <Badge key={j} variant="outline" className="text-[9px] px-1.5">{c}</Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-[10px] text-gray-500">
                    <Hand className="h-3 w-3 text-green-500" />
                    <span>{cahier.mainsLevees} main{cahier.mainsLevees > 1 ? "s" : ""} levee{cahier.mainsLevees > 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="outline" className="text-[10px] h-7 gap-1"><Eye className="h-3 w-3" /> Voir cahier</Button>
                    {cahier.statut === "actif" && (
                      <Button size="sm" className="text-[10px] h-7 gap-1 bg-green-600 hover:bg-green-700"><Hand className="h-3 w-3" /> Lever la main</Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* CTA publier un besoin */}
          <Card className="p-4 bg-orange-50 border-orange-200">
            <div className="flex items-center gap-3">
              <Plus className="h-8 w-8 text-orange-600 shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-bold text-orange-800">Vous avez un besoin?</h3>
                <p className="text-xs text-orange-600">Decrivez-le a CarlOS — il preparera votre cahier et le publiera sur le Marketplace.</p>
              </div>
              <Button size="sm" className="gap-1 text-xs bg-orange-600 hover:bg-orange-700"><Send className="h-3 w-3" /> Publier</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
