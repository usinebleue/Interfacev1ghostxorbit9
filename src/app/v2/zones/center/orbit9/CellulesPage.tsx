/**
 * CellulesPage.tsx — Cellules Orbit9 (ex-CerclesPage + Matching absorbe)
 * Les opportunites/matching sont DANS la cellule, pas dans une page separee
 * Cross-links: Marketplace, Gouvernance
 * WIRED: Real API via /api/v1/orbit9/members + /orbit9/matches
 */

import { useEffect, useState } from "react";
import {
  Users, Network, TrendingUp, DollarSign, Search,
  Plus, UserPlus, Eye, MessageSquare, Send, RefreshCw,
  CheckCircle2, CircleDot, Sparkles, Hand, Handshake,
  Crown, Store, Video, Loader2,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { api } from "../../../api/client";
import type { Orbit9Member, Orbit9Match } from "../../../api/types";

interface CellulesPageProps {
  onNavigate?: (section: string) => void;
}

export function CellulesPage({ onNavigate }: CellulesPageProps) {
  const [members, setMembers] = useState<Orbit9Member[]>([]);
  const [matches, setMatches] = useState<Orbit9Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [membersRes, matchesRes] = await Promise.all([
          api.listOrbit9Members(),
          api.listOrbit9Matches(),
        ]);
        if (!cancelled) {
          setMembers(membersRes.members);
          setMatches(matchesRes.matches);
        }
      } catch (err) {
        console.error("CellulesPage load error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const actifs = members.filter(m => m.status === "actif");
  const pris = actifs.length;
  const maxMembers = 9;

  // Discount tiers
  const getDiscount = (n: number) => {
    if (n >= 9) return 25;
    if (n >= 7) return 20;
    if (n >= 5) return 15;
    if (n >= 3) return 10;
    return 0;
  };
  const discount = getDiscount(pris);
  const nextTier = pris < 3 ? 3 : pris < 5 ? 5 : pris < 7 ? 7 : pris < 9 ? 9 : 9;
  const nextDiscount = getDiscount(nextTier);

  // Bot-to-bot connections: n(n-1)/2
  const connections = Math.floor(pris * (pris - 1) / 2);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
        <span className="ml-2 text-sm text-gray-500">Chargement du reseau...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* KPI Cards avec tops colores */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500">
            <Users className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Membres</span>
          </div>
          <div className="px-3 py-2">
            <div className="text-2xl font-bold text-emerald-600">{pris}/{maxMembers}</div>
            <div className="text-[9px] text-gray-500">{maxMembers - pris} places disponibles</div>
          </div>
        </Card>
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500">
            <DollarSign className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Rabais actif</span>
          </div>
          <div className="px-3 py-2">
            <div className="text-2xl font-bold text-emerald-600">-{discount}%</div>
            <div className="text-[9px] text-gray-500">{pris < 9 ? `Prochain palier: -${nextDiscount}% a ${nextTier}` : "Maximum atteint!"}</div>
          </div>
        </Card>
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500">
            <Network className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Connexions Bot-to-Bot</span>
          </div>
          <div className="px-3 py-2">
            <div className="text-2xl font-bold text-blue-600">{connections}</div>
            <div className="text-[9px] text-gray-500">Loi de Metcalfe: n(n-1)/2</div>
          </div>
        </Card>
        <Card className="p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-600 to-green-500">
            <TrendingUp className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Economie collective</span>
          </div>
          <div className="px-3 py-2">
            <div className="text-2xl font-bold text-green-600">{(pris * 450).toLocaleString()}$</div>
            <div className="text-[9px] text-gray-500">/mois pour le cercle</div>
          </div>
        </Card>
      </div>

      {/* Grille progression rabais */}
      <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-emerald-100 to-green-100 px-4 py-2.5 border-b border-emerald-200">
          <span className="text-sm font-bold text-emerald-900">Progression du rabais de groupe</span>
        </div>
        <div className="p-4">
        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <div key={n} className="flex-1 flex flex-col items-center">
              <div className={cn(
                "w-full h-3 rounded-sm transition-all",
                n <= pris ? "bg-emerald-500" : n <= pris + 1 ? "bg-emerald-200" : "bg-gray-100"
              )} />
              <span className="text-[9px] text-gray-400 mt-0.5">{n}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between text-[9px] text-gray-500">
          <span>0% (solo)</span>
          <span className="font-semibold text-emerald-600">← Vous etes ici: -{discount}%</span>
          <span>-25% (9 max)</span>
        </div>
        <p className="text-[9px] text-gray-400 mt-2 italic">Le palier atteint ne redescend JAMAIS, meme si des membres quittent le cercle.</p>
        </div>
      </div>

      {/* Tableau des membres — REAL DATA */}
      <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-blue-100 to-cyan-100 px-4 py-2.5 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-blue-900">Membres de la Cellule Orbit9</span>
            <Button size="sm" className="gap-1.5 text-xs"><UserPlus className="h-3.5 w-3.5" /> Inviter un partenaire</Button>
          </div>
        </div>
        <div className="p-4">
        <p className="text-[9px] text-gray-400 mb-3">Max 9 membres. 1 client = 1 seule cellule. Bots collaborent automatiquement.</p>

        <div className="grid grid-cols-12 gap-2 px-2 py-1.5 bg-gray-50 rounded text-[9px] font-semibold text-gray-500 uppercase mb-1">
          <span className="col-span-4">Entreprise</span>
          <span className="col-span-2">Secteur</span>
          <span className="col-span-1">Role</span>
          <span className="col-span-1">Bots</span>
          <span className="col-span-2">Status</span>
          <span className="col-span-2">Actions</span>
        </div>

        <div className="space-y-1">
          {members.map((m) => (
            <div key={m.id} className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="col-span-4 flex items-center gap-2">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-bold",
                  m.status === "actif" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                )}>{m.avatar || m.nom.slice(0, 2).toUpperCase()}</div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{m.nom}</p>
                  <p className="text-[9px] text-gray-400">{m.ville}</p>
                </div>
              </div>
              <span className="col-span-2 text-xs text-gray-600">{m.secteur}</span>
              <span className="col-span-1 text-xs text-gray-500">{m.role}</span>
              <span className="col-span-1 text-xs text-gray-600">{m.nb_bots > 0 ? `${m.nb_bots} actifs` : "—"}</span>
              <div className="col-span-2">
                <Badge variant="outline" className={cn("text-[9px]",
                  m.status === "actif" ? "text-green-600 border-green-300 bg-green-50" : "text-amber-600 border-amber-300 bg-amber-50"
                )}>
                  {m.status === "actif" ? "En ligne" : m.status === "invite" ? "Invitation envoyee" : "Inactif"}
                </Badge>
              </div>
              <div className="col-span-2 flex gap-1">
                <Button variant="ghost" size="sm" className="h-7 text-[9px] px-2 gap-1"><Eye className="h-3.5 w-3.5" /> Profil</Button>
                <Button variant="ghost" size="sm" className="h-7 text-[9px] px-2 gap-1"><MessageSquare className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          ))}

          {Array.from({ length: Math.max(0, maxMembers - members.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg border border-dashed border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30 cursor-pointer transition-all">
              <div className="col-span-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-300"><Plus className="h-4 w-4" /></div>
                <span className="text-sm text-gray-400">Place disponible</span>
              </div>
              <span className="col-span-8 text-xs text-gray-300">Invitez un partenaire pour debloquer le prochain palier de rabais</span>
            </div>
          ))}
        </div>
      </div>
      </div>

      {/* ── OPPORTUNITES ACTIVES — REAL MATCHES ── */}
      <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-2.5 border-b border-amber-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Handshake className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-bold text-amber-900">Opportunites actives dans la Cellule</span>
            </div>
            <Badge variant="outline" className="text-[9px]">{matches.length} matchings</Badge>
          </div>
        </div>
        <div className="p-4">

        {/* Alerte main levee */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3 mb-3">
          <Hand className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Systeme Main Levee — Repondez rapidement</p>
            <p className="text-xs text-amber-700">Les opportunites sont attribuees au premier partenaire qualifie qui leve la main.</p>
          </div>
        </div>

        {matches.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Aucun matching en cours. Publiez un besoin pour trouver des partenaires.</p>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => {
              const topCandidat = match.candidats?.[0];
              return (
                <Card key={match.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
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
                      <p className="text-xs text-gray-500">
                        {match.criteres.length > 0 && `Criteres: ${match.criteres.join(", ")}`}
                      </p>
                    </div>
                    {topCandidat && (
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">{topCandidat.score}%</p>
                        <p className="text-[9px] text-gray-400">Meilleur match</p>
                      </div>
                    )}
                  </div>

                  {/* Candidats */}
                  {match.candidats && match.candidats.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[9px] font-semibold text-gray-500 uppercase mb-1">Candidats</p>
                      {match.candidats.slice(0, 3).map((c, j) => (
                        <div key={j} className="flex items-center gap-2 text-xs text-gray-600 mb-0.5">
                          <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${c.score}%` }} />
                          </div>
                          <span className="font-medium">{c.nom}</span>
                          <span className="text-gray-400">— {c.raison}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-[9px] text-gray-400">{match.candidats?.length || 0} candidat(s)</span>
                    <div className="flex gap-2">
                      {match.gagnant_ids.length > 0 && (
                        <Button size="sm" className="text-xs gap-1.5 bg-purple-600 hover:bg-purple-700"><Video className="h-3.5 w-3.5" /> Trisociation</Button>
                      )}
                      {match.status === "scout_needed" && (
                        <Button size="sm" variant="outline" className="text-xs gap-1.5 text-amber-700 border-amber-300"><Search className="h-3.5 w-3.5" /> Bot Scout</Button>
                      )}
                      <Button size="sm" variant="outline" className="text-xs gap-1.5"><Eye className="h-3.5 w-3.5" /> Details</Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      </div>

      {/* Activite recente — mock (futur: real events) */}
      <div className="bg-gradient-to-b from-gray-50 to-white border rounded-xl overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-gray-100 to-slate-100 px-4 py-2.5 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-bold text-gray-800">Activite recente</span>
          </div>
        </div>
        <div className="p-4">
        <div className="space-y-2">
          {[
            { time: "Il y a 1h", text: "Bot CTO d'AutomaTech a envoye les specs du cobot a Bot CTO d'Usinage Precision", icon: RefreshCw, color: "blue" },
            { time: "Il y a 3h", text: "Nouveau matching detecte: LogiFlow peut optimiser l'entrepot de MetalPro", icon: Search, color: "green" },
            { time: "Hier", text: "Budget projet soudage mis a jour: 125K$ → 145K$ (ajout formation)", icon: DollarSign, color: "amber" },
            { time: "2 jours", text: "PlastiForm a accepte l'invitation — en attente d'activation", icon: UserPlus, color: "emerald" },
          ].map((act, i) => {
            const AIcon = act.icon;
            return (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0", `bg-${act.color}-100`)}>
                  <AIcon className={cn("h-3.5 w-3.5", `text-${act.color}-600`)} />
                </div>
                <p className="text-xs text-gray-600 flex-1">{act.text}</p>
                <span className="text-[9px] text-gray-400 shrink-0">{act.time}</span>
              </div>
            );
          })}
        </div>
      </div>
      </div>

      {/* Cross-links */}
      <div className="grid grid-cols-2 gap-3">
        {onNavigate && (
          <Card className="p-3 bg-orange-50 border-orange-200 cursor-pointer hover:shadow-sm transition-shadow" onClick={() => onNavigate("marketplace")}>
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-xs font-bold text-orange-800">Publier un besoin sur le Marketplace</p>
                <p className="text-[9px] text-orange-600">CarlOS preparera votre cahier et trouvera les meilleurs candidats</p>
              </div>
            </div>
          </Card>
        )}
        {onNavigate && (
          <Card className="p-3 bg-violet-50 border-violet-200 cursor-pointer hover:shadow-sm transition-shadow" onClick={() => onNavigate("gouvernance")}>
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-violet-600" />
              <div>
                <p className="text-xs font-bold text-violet-800">Gouvernance de cette Cellule</p>
                <p className="text-[9px] text-violet-600">Regles holacratiques, roles et TimeTokens</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* CarlOS Proactif */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">C</div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-blue-800">CarlOS — Facilitateur de Cellule Proactif</h3>
            <p className="text-xs text-blue-600 mt-1 italic">"Carl, j'ai remarque quelque chose. Tu travailles regulierement avec Automation Plus, Acier Quebec et PrecisionCNC. Si vous formiez une Cellule Orbit9, vos bots se coordonneraient et vous economiseriez TOUS 15%. Tu veux que je prepare les invitations?"</p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-700"><Send className="h-3.5 w-3.5" /> Preparer les invitations</Button>
              <Button size="sm" variant="outline" className="text-xs gap-1.5 border-blue-300 text-blue-700"><Users className="h-3.5 w-3.5" /> Voir mes contacts analyses</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
