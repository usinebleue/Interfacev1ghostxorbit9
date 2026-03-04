/**
 * MarketplacePage.tsx — Marketplace (REFAIT COMPLET)
 * 2 volets controles par l'orchestrateur via prop `volet`:
 *   - "bots" = Fiches CV agents IA (mock — futur Sprint)
 *   - "cahiers" = Mains levees / opportunites (WIRED to /orbit9/matches API)
 * CarlOS = GPS de la plateforme, detecte besoins et guide l'utilisateur
 * Sprint B — Reorganisation Orbit9
 */

import { useEffect, useState } from "react";
import {
  Bot, Search, Star, DollarSign, Zap,
  FileText, Hand, ArrowRight, Send,
  Target, Plus, Eye, MessageSquare,
  TrendingUp, Loader2, Video,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { api } from "../../../api/client";
import type { Orbit9Match } from "../../../api/types";

interface MarketplacePageProps {
  volet?: "bots" | "cahiers";
  onNavigate?: (section: string) => void;
}

export function MarketplacePage({ volet = "bots", onNavigate }: MarketplacePageProps) {
  const [matches, setMatches] = useState<Orbit9Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // Charger les matches quand on est sur le volet cahiers
  useEffect(() => {
    if (volet !== "cahiers") return;
    let cancelled = false;
    setLoadingMatches(true);
    api.listOrbit9Matches()
      .then(res => { if (!cancelled) setMatches(res.matches); })
      .catch(err => console.error("MarketplacePage matches error:", err))
      .finally(() => { if (!cancelled) setLoadingMatches(false); });
    return () => { cancelled = true; };
  }, [volet]);

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

  const totalMainsLevees = matches.reduce((s, m) => s + (m.candidats?.length || 0), 0);
  const totalValeur = matches.length * 75; // Estimation simple

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
                <div className="text-[9px] text-gray-500">Agents specialises</div>
              </div>
            </Card>
            <Card className="p-0 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500">
                <Zap className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">Mes bots actifs</span>
              </div>
              <div className="px-3 py-2">
                <div className="text-2xl font-bold text-blue-600">6</div>
                <div className="text-[9px] text-gray-500">C-Suite complet</div>
              </div>
            </Card>
            <Card className="p-0 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-600 to-violet-500">
                <Target className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">Categories</span>
              </div>
              <div className="px-3 py-2">
                <div className="text-2xl font-bold text-violet-600">12</div>
                <div className="text-[9px] text-gray-500">Secteurs couverts</div>
              </div>
            </Card>
            <Card className="p-0 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-600 to-green-500">
                <DollarSign className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">Economie vs consultants</span>
              </div>
              <div className="px-3 py-2">
                <div className="text-2xl font-bold text-green-600">85%</div>
                <div className="text-[9px] text-gray-500">En moyenne</div>
              </div>
            </Card>
          </div>

          {/* Recherche */}
          <div className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg bg-white">
            <Search className="h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Chercher un bot par industrie, fonction ou besoin..." className="flex-1 text-sm outline-none bg-transparent" />
          </div>

          {/* Grille de bots — style CV / fiche agent */}
          <div className="grid grid-cols-2 gap-3">
            {bots.map((bot, i) => (
              <Card key={i} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0", `bg-${bot.color}-500`)}>
                    {bot.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="text-sm font-bold text-gray-800">{bot.name}</h4>
                    </div>
                    <p className="text-[9px] text-gray-500 mb-2">{bot.role}</p>

                    <div className="flex flex-wrap gap-1 mb-2">
                      {bot.specialites.map((s, j) => (
                        <Badge key={j} variant="outline" className="text-[9px] px-1.5">{s}</Badge>
                      ))}
                    </div>

                    <p className="text-[9px] text-gray-400 mb-2">
                      <span className="font-semibold">Secteurs:</span> {bot.secteurs.join(", ")}
                    </p>
                    <p className="text-[9px] text-gray-500 italic mb-2">{bot.experience}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-3 text-[9px] text-gray-500">
                        <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-amber-500" />{bot.rating}</span>
                        <span>{bot.users} utilisateurs</span>
                        <span className="font-bold text-gray-800">{bot.prix}</span>
                      </div>
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="outline" className="text-[9px] h-7 gap-1.5"><Eye className="h-3.5 w-3.5" /> Fiche</Button>
                        <Button size="sm" className={cn("text-[9px] h-7 gap-1.5", `bg-${bot.color}-600 hover:bg-${bot.color}-700`)}><Plus className="h-3.5 w-3.5" /> Ajouter</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* CTA Bot Custom */}
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">C</div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-blue-800">Votre secteur n'est pas couvert?</h3>
                <p className="text-xs text-blue-600 mt-1">Decrivez votre besoin a CarlOS — il verifiera d'abord si un bot existant peut vous aider. Sinon, il lancera la creation d'un agent IA sur mesure pour votre industrie.</p>
                <p className="text-[9px] text-blue-500 mt-1 italic">"Carl, j'ai besoin d'un bot pour la gestion des normes CSA en electricite." → CarlOS verifie le catalogue → propose le meilleur match ou lance un bot custom.</p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700"><MessageSquare className="h-3.5 w-3.5" /> Demander a CarlOS</Button>
                  <Button size="sm" variant="outline" className="text-xs gap-1.5 border-blue-300 text-blue-700"><FileText className="h-3.5 w-3.5" /> Voir le catalogue complet</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ═══ VOLET 2 — OPPORTUNITES (CAHIERS / MAINS LEVEES) — REAL DATA ═══ */}
      {volet === "cahiers" && (
        <div className="space-y-5">
          {/* KPIs avec tops colores */}
          <div className="grid grid-cols-4 gap-3">
            <Card className="p-0 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500">
                <FileText className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">Matchings actifs</span>
              </div>
              <div className="px-3 py-2">
                <div className="text-2xl font-bold text-blue-600">{matches.length}</div>
                <div className="text-[9px] text-gray-500">Besoins en cours</div>
              </div>
            </Card>
            <Card className="p-0 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-600 to-green-500">
                <Hand className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">Candidats trouves</span>
              </div>
              <div className="px-3 py-2">
                <div className="text-2xl font-bold text-green-600">{totalMainsLevees}</div>
                <div className="text-[9px] text-gray-500">Reponses scoring</div>
              </div>
            </Card>
            <Card className="p-0 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-500">
                <DollarSign className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">Valeur pipeline</span>
              </div>
              <div className="px-3 py-2">
                <div className="text-2xl font-bold text-amber-600">{totalValeur}K$</div>
                <div className="text-[9px] text-gray-500">Projets en cours</div>
              </div>
            </Card>
            <Card className="p-0 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500">
                <TrendingUp className="h-4 w-4 text-white" />
                <span className="text-sm font-bold text-white">Taux conversion</span>
              </div>
              <div className="px-3 py-2">
                <div className="text-2xl font-bold text-emerald-600">72%</div>
                <div className="text-[9px] text-gray-500">Match → Projet</div>
              </div>
            </Card>
          </div>

          {/* Flow pipeline visuel */}
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
                { step: "2", title: "MATCHING", desc: "CarlOS score les membres du reseau", icon: Target, color: "indigo" },
                { step: "3", title: "TRISOCIATION", desc: "Video call 3 participants avec CarlOS IA", icon: Video, color: "emerald" },
              ].map((s, i) => {
                const SIcon = s.icon;
                return (
                  <div key={i} className="flex items-center gap-2 flex-1">
                    <div className={cn("flex-1 p-3 rounded-xl border text-center", `bg-${s.color}-50 border-${s.color}-200`)}>
                      <div className={cn("w-8 h-8 rounded-full mx-auto flex items-center justify-center mb-1", `bg-${s.color}-100`)}>
                        <SIcon className={cn("h-4 w-4", `text-${s.color}-600`)} />
                      </div>
                      <p className={cn("text-xs font-bold", `text-${s.color}-700`)}>{s.title}</p>
                      <p className="text-[9px] text-gray-500">{s.desc}</p>
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
                    <p className="text-[9px] font-bold text-blue-800">Jumelage direct</p>
                    <p className="text-[9px] text-blue-600">Besoin simple → CarlOS trouve le match immediatement</p>
                  </div>
                  <div className="p-2 bg-white/60 rounded-lg border border-blue-100">
                    <p className="text-[9px] font-bold text-blue-800">Cellule Orbit9</p>
                    <p className="text-[9px] text-blue-600">Projet complexe → CarlOS active une Cellule collaborative</p>
                  </div>
                </div>
                {onNavigate && (
                  <button onClick={() => onNavigate("cellules")} className="text-[9px] text-blue-700 underline mt-2 cursor-pointer hover:text-blue-900">
                    Voir les Cellules Orbit9 actives →
                  </button>
                )}
              </div>
            </div>
          </Card>

          {/* Liste de matchings — REAL DATA */}
          {loadingMatches ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              <span className="ml-2 text-sm text-gray-500">Chargement des opportunites...</span>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-800">Matchings actifs</h3>
              {matches.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Aucun matching en cours. Publiez un besoin ci-dessous.</p>
              ) : (
                matches.map((match) => {
                  const topScore = match.candidats?.[0]?.score || 0;
                  return (
                    <Card key={match.id} className={cn("p-4 hover:shadow-md transition-shadow",
                      match.status === "archive" && "opacity-60")}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={cn("text-[9px]",
                              match.status === "complete" ? "bg-green-100 text-green-700" :
                              match.status === "scout_needed" ? "bg-amber-100 text-amber-700" :
                              match.status === "trisociation" ? "bg-purple-100 text-purple-700" :
                              "bg-blue-100 text-blue-700"
                            )}>{match.status.toUpperCase().replace("_", " ")}</Badge>
                          </div>
                          <h4 className="text-sm font-bold text-gray-800">{match.besoin}</h4>
                          <p className="text-[9px] text-gray-400">
                            {match.criteres.length > 0 ? `Criteres: ${match.criteres.join(", ")}` : "Sans criteres specifiques"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600">{topScore}%</p>
                          <p className="text-[9px] text-gray-400">Meilleur score</p>
                        </div>
                      </div>

                      {match.candidats && match.candidats.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {match.candidats.slice(0, 3).map((c, j) => (
                            <Badge key={j} variant="outline" className="text-[9px] px-1.5">
                              {c.nom} ({c.score}%)
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-[9px] text-gray-500">
                          <Hand className="h-3.5 w-3.5 text-green-500" />
                          <span>{match.candidats?.length || 0} candidat(s) scores</span>
                        </div>
                        <div className="flex gap-1.5">
                          <Button size="sm" variant="outline" className="text-[9px] h-7 gap-1.5"><Eye className="h-3.5 w-3.5" /> Details</Button>
                          {match.gagnant_ids.length > 0 && (
                            <Button size="sm" className="text-[9px] h-7 gap-1.5 bg-purple-600 hover:bg-purple-700"><Video className="h-3.5 w-3.5" /> Trisociation</Button>
                          )}
                          {match.status !== "archive" && match.gagnant_ids.length === 0 && (
                            <Button size="sm" className="text-[9px] h-7 gap-1.5 bg-green-600 hover:bg-green-700"><Hand className="h-3.5 w-3.5" /> Lever la main</Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          )}

          {/* CTA publier un besoin */}
          <Card className="p-4 bg-orange-50 border-orange-200">
            <div className="flex items-center gap-3">
              <Plus className="h-8 w-8 text-orange-600 shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-bold text-orange-800">Vous avez un besoin?</h3>
                <p className="text-xs text-orange-600">Decrivez-le a CarlOS — il preparera votre cahier et le publiera sur le Marketplace.</p>
              </div>
              <Button size="sm" className="gap-1.5 text-xs bg-orange-600 hover:bg-orange-700"><Send className="h-3.5 w-3.5" /> Publier</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
