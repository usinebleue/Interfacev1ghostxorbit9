/**
 * ProspectGains.tsx — Dashboard gains de valeur (6 barres horizontales)
 */
import React from 'react';
import type { GainsDashboard } from './ProspectApi';

interface Props {
  dashboard: GainsDashboard;
  primaryColor: string;
  onViewRapport: () => void;
  onStartTrial: () => void;
}

export function ProspectGains({ dashboard, primaryColor, onViewRapport, onStartTrial }: Props) {
  const maxVal = Math.max(...dashboard.bars.map(b => b.valeur), 1);

  return (
    <div style={{ padding: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '20px', textAlign: 'center' }}>
        {dashboard.title}
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {dashboard.bars.map((bar) => (
          <div key={bar.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
              <span style={{ color: '#475569' }}>{bar.label}</span>
              <span style={{ fontWeight: 600, color: '#1e293b' }}>{bar.valeur_formatted}</span>
            </div>
            <div style={{ background: '#e2e8f0', borderRadius: '6px', height: '24px', overflow: 'hidden' }}>
              <div
                style={{
                  background: bar.color,
                  height: '100%',
                  borderRadius: '6px',
                  width: `${Math.max(5, (bar.valeur / maxVal) * 100)}%`,
                  transition: 'width 0.8s ease-out',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: '#f8fafc', borderRadius: '12px', padding: '16px',
        textAlign: 'center', border: '2px solid ' + primaryColor, marginBottom: '16px',
      }}>
        <div style={{ fontSize: '14px', color: '#64748b' }}>TOTAL ANNUEL ESTIMÉ</div>
        <div style={{ fontSize: '28px', fontWeight: 800, color: primaryColor, margin: '4px 0' }}>
          {dashboard.total_annuel_formatted} / AN
        </div>
        <div style={{ fontSize: '16px', color: '#64748b' }}>
          {dashboard.total_mensuel_formatted} / mois
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={onViewRapport}
          style={{
            flex: 1, padding: '12px', borderRadius: '8px',
            border: '1px solid ' + primaryColor, background: 'white',
            color: primaryColor, fontWeight: 600, cursor: 'pointer', fontSize: '14px',
          }}
        >
          Voir mon pré-rapport
        </button>
        <button
          onClick={onStartTrial}
          style={{
            flex: 1, padding: '12px', borderRadius: '8px',
            border: 'none', background: primaryColor,
            color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '14px',
          }}
        >
          Essai gratuit 7 jours
        </button>
      </div>
    </div>
  );
}
