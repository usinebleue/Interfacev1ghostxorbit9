/**
 * ProspectPreRapport.tsx — Pré-rapport teaser "Costco tasting"
 * Assez pour impressionner, pas assez pour nourrir
 */
import React from 'react';
import type { PreRapport } from './ProspectApi';

interface Props {
  rapport: PreRapport;
  primaryColor: string;
  onStartTrial: () => void;
}

export function ProspectPreRapport({ rapport, primaryColor, onStartTrial }: Props) {
  return (
    <div style={{ padding: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
        PRÉ-RAPPORT
      </h2>
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
        {rapport.entreprise}
      </p>

      {/* Score cercle */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '120px', height: '120px', borderRadius: '50%',
          border: `6px solid ${rapport.niveau_color}`,
          background: `${rapport.niveau_color}10`,
        }}>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: rapport.niveau_color }}>
              {rapport.score_dia}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>/100</div>
          </div>
        </div>
        <div style={{
          marginTop: '8px', padding: '4px 16px', borderRadius: '20px',
          display: 'inline-block',
          background: `${rapport.niveau_color}20`, color: rapport.niveau_color,
          fontWeight: 700, fontSize: '13px',
        }}>
          {rapport.niveau}
        </div>
      </div>

      {/* Top gains */}
      {rapport.top_gains.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
            Top {rapport.top_gains.length} gains identifiés
          </h3>
          {rapport.top_gains.map((g, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '8px 12px', borderRadius: '8px',
              background: i === 0 ? `${primaryColor}10` : '#f8fafc',
              marginBottom: '4px',
            }}>
              <span style={{ fontSize: '13px', color: '#475569' }}>{i + 1}. {g.label}</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: primaryColor }}>
                +{g.valeur_formatted}/an
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Total */}
      <div style={{
        textAlign: 'center', padding: '12px',
        background: `${primaryColor}08`, borderRadius: '8px',
        marginBottom: '20px',
      }}>
        <span style={{ fontSize: '13px', color: '#64748b' }}>Potentiel total: </span>
        <span style={{ fontSize: '18px', fontWeight: 700, color: primaryColor }}>
          {rapport.total_gains_formatted}/an
        </span>
      </div>

      {/* Recommandations floues */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
          Recommandations CarlOS
        </h3>
        {rapport.recommandations_floues.map((r, i) => (
          <div key={i} style={{
            padding: '8px 12px', borderRadius: '8px',
            background: '#f1f5f9', marginBottom: '4px',
            fontSize: '13px', color: '#94a3b8',
            filter: 'blur(3px)', userSelect: 'none',
          }}>
            {r}
          </div>
        ))}
        <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center', marginTop: '8px' }}>
          Débloquez les recommandations détaillées + plan 90 jours
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={onStartTrial}
        style={{
          width: '100%', padding: '14px', borderRadius: '10px',
          border: 'none', background: primaryColor,
          color: 'white', fontWeight: 700, cursor: 'pointer',
          fontSize: '15px',
        }}
      >
        {rapport.cta_text}
      </button>
    </div>
  );
}
