/**
 * TrustRatingModal.tsx — Modal d'evaluation trust bidirectionnelle (F7)
 * 5 criteres (qualite, delai, communication, prix, fiabilite)
 * Anti-burst: verifie canReview avant d'afficher le formulaire
 */

import { useState, useEffect } from "react";
import { X, Send, Loader2, Shield, AlertCircle } from "lucide-react";
import { cn } from "../../../../components/ui/utils";
import { Button } from "../../../../components/ui/button";
import { api } from "../../../api/client";
import { TrustStarsInput } from "./TrustStars";

interface TrustRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewerOrgId: number;
  reviewedOrgId: number;
  reviewedName: string;
  reviewerRole?: "client" | "fournisseur";
  interactionType?: string;
  interactionId?: number;
  onSuccess?: () => void;
}

const CRITERIA = [
  { key: "score_qualite", label: "Qualite des produits/services" },
  { key: "score_delai", label: "Respect des delais" },
  { key: "score_communication", label: "Communication" },
  { key: "score_prix", label: "Rapport qualite-prix" },
  { key: "score_fiabilite", label: "Fiabilite generale" },
] as const;

export function TrustRatingModal({
  isOpen,
  onClose,
  reviewerOrgId,
  reviewedOrgId,
  reviewedName,
  reviewerRole = "client",
  interactionType = "",
  interactionId,
  onSuccess,
}: TrustRatingModalProps) {
  const [scores, setScores] = useState<Record<string, number>>({
    score_qualite: 0,
    score_delai: 0,
    score_communication: 0,
    score_prix: 0,
    score_fiabilite: 0,
  });
  const [commentaire, setCommentaire] = useState("");
  const [loading, setLoading] = useState(false);
  const [canReview, setCanReview] = useState<boolean | null>(null);
  const [blockReason, setBlockReason] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Verifier anti-burst au montage
  useEffect(() => {
    if (!isOpen) return;
    setCanReview(null);
    setError("");
    setSuccess(false);
    api.trustCanReview(reviewerOrgId, reviewedOrgId)
      .then(res => {
        setCanReview(res.can_review);
        if (!res.can_review) setBlockReason(res.reason || "Evaluation non autorisee");
      })
      .catch(() => setCanReview(true)); // fallback: autoriser
  }, [isOpen, reviewerOrgId, reviewedOrgId]);

  const allScored = Object.values(scores).every(s => s > 0);

  const handleSubmit = async () => {
    if (!allScored) return;
    setLoading(true);
    setError("");
    try {
      await api.trustReviewCreate({
        reviewer_org_id: reviewerOrgId,
        reviewed_org_id: reviewedOrgId,
        reviewer_role: reviewerRole,
        score_qualite: scores.score_qualite,
        score_delai: scores.score_delai,
        score_communication: scores.score_communication,
        score_prix: scores.score_prix,
        score_fiabilite: scores.score_fiabilite,
        commentaire,
        interaction_type: interactionType,
        interaction_id: interactionId,
      });
      setSuccess(true);
      onSuccess?.();
      setTimeout(onClose, 1500);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erreur lors de la soumission";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-bold text-gray-900">Evaluer {reviewedName}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Loading check */}
          {canReview === null && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          )}

          {/* Bloque par anti-burst */}
          {canReview === false && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">Evaluation non disponible</p>
                <p className="text-xs text-amber-600 mt-1">{blockReason}</p>
              </div>
            </div>
          )}

          {/* Formulaire */}
          {canReview === true && !success && (
            <>
              <p className="text-xs text-gray-500">
                Evaluez votre experience avec {reviewedName} sur 5 criteres.
              </p>

              {/* 5 criteres */}
              <div className="space-y-3">
                {CRITERIA.map(({ key, label }) => (
                  <TrustStarsInput
                    key={key}
                    label={label}
                    value={scores[key]}
                    onChange={(v) => setScores(prev => ({ ...prev, [key]: v }))}
                    size="md"
                  />
                ))}
              </div>

              {/* Commentaire */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">
                  Commentaire (optionnel)
                </label>
                <textarea
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                  rows={3}
                  placeholder="Decrivez votre experience..."
                  value={commentaire}
                  onChange={e => setCommentaire(e.target.value)}
                  maxLength={1000}
                />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {error}
                </div>
              )}
            </>
          )}

          {/* Success */}
          {success && (
            <div className="flex flex-col items-center py-6 gap-2">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">Evaluation soumise</p>
              <p className="text-xs text-gray-500">Merci pour votre retour!</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {canReview === true && !success && (
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t bg-gray-50 rounded-b-xl">
            <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
              Annuler
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!allScored || loading}
              className="text-xs gap-1.5"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Soumettre
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
