/**
 * CellulesPage.tsx — Cellules Orbit9 (ex-CerclesPage + Matching absorbe)
 * Les opportunites/matching sont DANS la cellule, pas dans une page separee
 * Cross-links: Marketplace, Gouvernance
 */

import {
  Users, Network, TrendingUp, DollarSign, Search,
  Plus, UserPlus, Eye, MessageSquare, Send, RefreshCw,
  CheckCircle2, CircleDot, Sparkles, Hand, Handshake,
  Crown, Store,
} from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";

interface CellulesPageProps {
  onNavigate?: (section: string) => void;
}

export function CellulesPage({ onNavigate }: CellulesPageProps) {
  const members = [
    { name: "Usinage Precision QC", sector: "Usinage CNC", status: "actif" as const, role: "Fondateur", since: "Fev 2026", avatar: "UP", bots: 6 },
    { name: "MetalPro Inc.", sector: "Soudage robotise", status: "actif" as const, role: "Membre", since: "Fev 2026", avatar: "MP", bots: 3 },
    { name: "AutomaTech", sector: "Integration robotique", status: "actif" as const, role: "Membre", since: "Mars 2026", avatar: "AT", bots: 6 },
    { name: "LogiFlow", sector: "Logistique 4.0", status: "actif" as const, role: "Membre", since: "Mars 2026", avatar: "LF", bots: 1 },
    { name: "PlastiForm", sector: "Moulage plastique", status: "invite" as const, role: "—", since: "—", avatar: "PF", bots: 0 },
  ];

  const pris = members.filter(m => m.status === "actif").length;

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-400 uppercase">Membres</span>
            <Users className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{pris}/9</div>
          <div className="text-[10px] text-gray-500">{9 - pris} places disponibles</div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-400 uppercase">Rabais actif</span>
            <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">-15%</div>
          <div className="text-[10px] text-gray-500">Prochain palier: -20% a 7</div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-400 uppercase">Connexions Bot-to-Bot</span>
            <Network className="h-3.5 w-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-600">10</div>
          <div className="text-[10px] text-gray-500">Loi de Metcalfe: n(n-1)/2</div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-400 uppercase">Economie collective</span>
            <TrendingUp className="h-3.5 w-3.5 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-green-600">2,700$</div>
          <div className="text-[10px] text-gray-500">/mois pour le cercle</div>
        </Card>
      </div>

      {/* Grille progression rabais */}
      <Card className="p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Progression du rabais de groupe</h3>
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
        <div className="flex items-center justify-between text-[10px] text-gray-500">
          <span>0% (solo)</span>
          <span className="font-semibold text-emerald-600">← Vous etes ici: -15%</span>
          <span>-25% (9 max)</span>
        </div>
        <p className="text-[10px] text-gray-400 mt-2 italic">Le palier atteint ne redescend JAMAIS, meme si des membres quittent le cercle.</p>
      </Card>

      {/* Tableau des membres */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-gray-800">Membres de la Cellule Orbit9</h3>
            <p className="text-[10px] text-gray-400">Max 9 membres. 1 client = 1 seule cellule. Bots collaborent automatiquement.</p>
          </div>
          <Button size="sm" className="gap-1.5 text-xs"><UserPlus className="h-3 w-3" /> Inviter un partenaire</Button>
        </div>

        <div className="grid grid-cols-12 gap-2 px-2 py-1.5 bg-gray-50 rounded text-[10px] font-semibold text-gray-500 uppercase mb-1">
          <span className="col-span-4">Entreprise</span>
          <span className="col-span-2">Secteur</span>
          <span className="col-span-1">Role</span>
          <span className="col-span-1">Bots</span>
          <span className="col-span-2">Status</span>
          <span className="col-span-2">Actions</span>
        </div>

        <div className="space-y-1">
          {members.map((m, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="col-span-4 flex items-center gap-2">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold",
                  m.status === "actif" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                )}>{m.avatar}</div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{m.name}</p>
                  <p className="text-[10px] text-gray-400">Depuis {m.since}</p>
                </div>
              </div>
              <span className="col-span-2 text-xs text-gray-600">{m.sector}</span>
              <span className="col-span-1 text-xs text-gray-500">{m.role}</span>
              <span className="col-span-1 text-xs text-gray-600">{m.bots > 0 ? `${m.bots} actifs` : "—"}</span>
              <div className="col-span-2">
                <Badge variant="outline" className={cn("text-[10px]",
                  m.status === "actif" ? "text-green-600 border-green-300 bg-green-50" : "text-amber-600 border-amber-300 bg-amber-50"
                )}>
                  {m.status === "actif" ? "En ligne" : "Invitation envoyee"}
                </Badge>
              </div>
              <div className="col-span-2 flex gap-1">
                <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2 gap-1"><Eye className="h-3 w-3" /> Profil</Button>
                <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2 gap-1"><MessageSquare className="h-3 w-3" /></Button>
              </div>
            </div>
          ))}

          {Array.from({ length: 9 - members.length }).map((_, i) => (
            <div key={`empty-${i}`} className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg border border-dashed border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30 cursor-pointer transition-all">
              <div className="col-span-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-300"><Plus className="h-4 w-4" /></div>
                <span className="text-sm text-gray-400">Place disponible</span>
              </div>
              <span className="col-span-8 text-xs text-gray-300">Invitez un partenaire pour debloquer le prochain palier de rabais</span>
            </div>
          ))}
        </div>
      </Card>

      {/* ── OPPORTUNITES ACTIVES (absorbe du Matching) ── */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Handshake className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-bold text-gray-800">Opportunites actives dans la Cellule</h3>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-[10px] cursor-pointer">Toutes</Badge>
            <Badge variant="outline" className="text-[10px] cursor-pointer">Intra-Cellule</Badge>
            <Badge variant="outline" className="text-[10px] cursor-pointer">Inter-Cellules</Badge>
          </div>
        </div>

        {/* Alerte main levee */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3 mb-3">
          <Hand className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Systeme Main Levee — Repondez rapidement</p>
            <p className="text-xs text-amber-700">Les opportunites sont attribuees au premier partenaire qualifie qui leve la main.</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            {
              title: "Robot de soudage collaboratif",
              client: "Usinage Precision QC",
              match: "AutomaTech",
              score: 94,
              budget: "125-175K$",
              timeline: "90 jours",
              status: "negociation" as const,
              type: "intra",
              missions: ["Evaluation faisabilite cobot", "Specs integration cellule", "Formation operateurs"],
              competences: ["Expertise robotique industrielle", "Integration soudure automatisee", "Programmation cobot"],
            },
            {
              title: "Certification ISO 13485 — Pharmaceutique",
              client: "PlastiForm",
              match: "Expert externe (reseau)",
              score: 87,
              budget: "12-18K$",
              timeline: "120 jours",
              status: "disponible" as const,
              type: "inter",
              missions: ["Audit documentation existante", "Gap analysis ISO 13485", "Plan de remediation"],
              competences: ["Certification ISO", "Connaissance secteur pharmaceutique", "Audit qualite"],
            },
            {
              title: "Optimisation logistique entrepot",
              client: "MetalPro Inc.",
              match: "LogiFlow",
              score: 91,
              budget: "35-55K$",
              timeline: "60 jours",
              status: "negociation" as const,
              type: "intra",
              missions: ["Analyse flux actuels", "Design nouveau layout", "Implementation WMS"],
              competences: ["Logistique 4.0", "Systemes WMS", "Optimisation flux"],
            },
          ].map((opp, i) => (
            <Card key={i} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {opp.status === "disponible" && <Badge className="bg-green-100 text-green-700 text-[9px]">NOUVELLE OPPORTUNITE</Badge>}
                    <Badge variant="outline" className={cn("text-[9px]", opp.type === "intra" ? "text-blue-600 border-blue-300" : "text-purple-600 border-purple-300")}>{opp.type === "intra" ? "Intra-Cellule" : "Inter-Cellules"}</Badge>
                  </div>
                  <h4 className="text-sm font-bold text-gray-800">{opp.title}</h4>
                  <p className="text-xs text-gray-500">{opp.client} · {opp.timeline}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">{opp.budget}</p>
                  <p className="text-[10px] text-gray-400">Budget estime</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1">Missions a realiser</p>
                  {opp.missions.map((m, j) => (
                    <div key={j} className="flex items-center gap-1.5 text-xs text-gray-600 mb-0.5">
                      <CheckCircle2 className="h-3 w-3 text-green-500 shrink-0" /> {m}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1">Competences requises</p>
                  {opp.competences.map((c, j) => (
                    <div key={j} className="flex items-center gap-1.5 text-xs text-gray-600 mb-0.5">
                      <CircleDot className="h-3 w-3 text-blue-500 shrink-0" /> {c}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Match:</span>
                  <div className="w-20 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${opp.score}%` }} />
                  </div>
                  <span className="text-xs font-bold text-blue-600">{opp.score}%</span>
                </div>
                <div className="flex gap-2">
                  {opp.status === "disponible" ? (
                    <Button size="sm" className="text-xs gap-1 bg-green-600 hover:bg-green-700"><Hand className="h-3 w-3" /> Lever la main</Button>
                  ) : (
                    <Button size="sm" variant="outline" className="text-xs gap-1"><Eye className="h-3 w-3" /> Voir negociation</Button>
                  )}
                  <Button size="sm" variant="outline" className="text-xs gap-1"><MessageSquare className="h-3 w-3" /> Details</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Activite recente */}
      <Card className="p-4">
        <h3 className="text-sm font-bold text-gray-800 mb-3">Activite recente</h3>
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
                <span className="text-[10px] text-gray-400 shrink-0">{act.time}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Cross-links */}
      <div className="grid grid-cols-2 gap-3">
        {/* Cross-link Marketplace */}
        {onNavigate && (
          <Card className="p-3 bg-orange-50 border-orange-200 cursor-pointer hover:shadow-sm transition-shadow" onClick={() => onNavigate("marketplace")}>
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-xs font-bold text-orange-800">Publier un besoin sur le Marketplace</p>
                <p className="text-[10px] text-orange-600">CarlOS preparera votre cahier et trouvera les meilleurs candidats</p>
              </div>
            </div>
          </Card>
        )}

        {/* Cross-link Gouvernance */}
        {onNavigate && (
          <Card className="p-3 bg-violet-50 border-violet-200 cursor-pointer hover:shadow-sm transition-shadow" onClick={() => onNavigate("gouvernance")}>
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-violet-600" />
              <div>
                <p className="text-xs font-bold text-violet-800">Gouvernance de cette Cellule</p>
                <p className="text-[10px] text-violet-600">Regles holacratiques, roles et TimeTokens</p>
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
              <Button size="sm" className="text-xs gap-1 bg-blue-600 hover:bg-blue-700"><Send className="h-3 w-3" /> Preparer les invitations</Button>
              <Button size="sm" variant="outline" className="text-xs gap-1 border-blue-300 text-blue-700"><Users className="h-3 w-3" /> Voir mes contacts analyses</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
