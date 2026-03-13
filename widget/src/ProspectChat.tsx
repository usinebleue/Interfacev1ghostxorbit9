/**
 * ProspectChat.tsx — Chat conversationnel CarlOS Prospect
 * PAS un wizard question/reponse — un vrai chat avec CarlOS qui mene la conversation
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  createSession, sendMessage, captureContact, getGains, getPreRapport,
  type ProspectSession, type MessageResponse, type GainsDashboard, type PreRapport,
} from './ProspectApi';
import { ProspectGains } from './ProspectGains';
import { ProspectPreRapport } from './ProspectPreRapport';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  apiUrl: string;
  campaignId?: string;
  playbookId?: string;
  mode?: 'floating' | 'inline';
}

export function ProspectChat({ apiUrl, campaignId, playbookId, mode = 'floating' }: Props) {
  const [isOpen, setIsOpen] = useState(mode === 'inline');
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState('');
  const [progress, setProgress] = useState({ step: 0, total_steps: 6, pct: 0, label: '' });
  const [companyName, setCompanyName] = useState('Usine Bleue');
  const [primaryColor, setPrimaryColor] = useState('#1e3a5f');
  const [error, setError] = useState('');
  // Email gate
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  // Gains & rapport views
  const [view, setView] = useState<'chat' | 'gains' | 'rapport'>('chat');
  const [gainsDashboard, setGainsDashboard] = useState<GainsDashboard | null>(null);
  const [rapport, setRapport] = useState<PreRapport | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(scrollToBottom, [messages, scrollToBottom]);

  // Init session quand le chat s'ouvre
  useEffect(() => {
    if (isOpen && !sessionId) {
      initSession();
    }
  }, [isOpen]);

  async function initSession() {
    setLoading(true);
    setError('');
    try {
      const session = await createSession('widget', undefined, campaignId, playbookId);
      setSessionId(session.session_id);
      setMessages([{ role: 'assistant', content: session.message }]);
      setPhase(session.phase);
      if (session.playbook) {
        setCompanyName(session.playbook.company_name);
        setPrimaryColor(session.playbook.primary_color);
      }
    } catch (e: any) {
      setError(e.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    if (!input.trim() || !sessionId || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    setError('');

    try {
      const res = await sendMessage(sessionId, userMsg);
      setMessages(prev => [...prev, { role: 'assistant', content: res.message }]);
      setPhase(res.phase);
      setProgress(res.progress);

      // Si on est en phase gains/rapport et pas d'email → montrer le formulaire
      if ((res.phase === 'phase_c_gains' || res.phase === 'phase_c_rapport') && !emailCaptured) {
        setShowEmailForm(true);
      }
    } catch (e: any) {
      setError(e.message || 'Erreur');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  async function handleEmailCapture() {
    if (!emailInput.trim() || !sessionId) return;
    try {
      await captureContact(sessionId, { email: emailInput.trim() });
      setEmailCaptured(true);
      setShowEmailForm(false);
      // Charger les gains
      const gainsRes = await getGains(sessionId);
      setGainsDashboard(gainsRes.dashboard);
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function handleViewRapport() {
    if (!sessionId) return;
    try {
      const rapportRes = await getPreRapport(sessionId);
      setRapport(rapportRes.rapport);
      setView('rapport');
    } catch (e: any) {
      setError(e.message);
    }
  }

  function handleStartTrial() {
    // TODO: integrer Stripe checkout ou redirect
    window.open('https://app.usinebleue.ai/signup?trial=7days', '_blank');
  }

  // --- RENDER ---

  const widgetStyle: React.CSSProperties = mode === 'floating' ? {
    position: 'fixed', bottom: '20px', right: '20px', zIndex: 99999,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  } : {
    width: '100%', maxWidth: '420px', margin: '0 auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  };

  // Bouton flottant
  if (mode === 'floating' && !isOpen) {
    return (
      <div style={widgetStyle}>
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: primaryColor, border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div style={widgetStyle}>
      <div style={{
        width: mode === 'floating' ? '380px' : '100%',
        maxHeight: mode === 'floating' ? '600px' : 'none',
        borderRadius: '16px',
        boxShadow: mode === 'floating' ? '0 8px 40px rgba(0,0,0,0.15)' : 'none',
        background: 'white',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
      }}>
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
          padding: '16px', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px',
            }}>
              C
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>CarlOS</div>
              <div style={{ fontSize: '11px', opacity: 0.8 }}>{companyName}</div>
            </div>
          </div>
          {mode === 'floating' && (
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none', border: 'none', color: 'white',
                cursor: 'pointer', fontSize: '20px', padding: '4px',
              }}
            >
              ×
            </button>
          )}
        </div>

        {/* Progress bar */}
        {progress.pct > 0 && (
          <div style={{ padding: '0 16px', paddingTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
              <span>{progress.label}</span>
              <span>{progress.step}/{progress.total_steps}</span>
            </div>
            <div style={{ background: '#e2e8f0', borderRadius: '4px', height: '4px' }}>
              <div style={{
                background: primaryColor, height: '100%', borderRadius: '4px',
                width: `${progress.pct}%`, transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        )}

        {/* Content area */}
        <div style={{ flex: 1, overflow: 'auto', maxHeight: mode === 'floating' ? '400px' : '500px' }}>
          {view === 'gains' && gainsDashboard ? (
            <ProspectGains
              dashboard={gainsDashboard}
              primaryColor={primaryColor}
              onViewRapport={handleViewRapport}
              onStartTrial={handleStartTrial}
            />
          ) : view === 'rapport' && rapport ? (
            <ProspectPreRapport
              rapport={rapport}
              primaryColor={primaryColor}
              onStartTrial={handleStartTrial}
            />
          ) : (
            /* Chat messages */
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div style={{
                    maxWidth: '85%', padding: '10px 14px', borderRadius: '14px',
                    background: msg.role === 'user' ? primaryColor : '#f1f5f9',
                    color: msg.role === 'user' ? 'white' : '#1e293b',
                    fontSize: '14px', lineHeight: '1.5',
                    borderBottomRightRadius: msg.role === 'user' ? '4px' : '14px',
                    borderBottomLeftRadius: msg.role === 'assistant' ? '4px' : '14px',
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{
                    padding: '10px 14px', borderRadius: '14px', borderBottomLeftRadius: '4px',
                    background: '#f1f5f9', fontSize: '14px', color: '#94a3b8',
                  }}>
                    <span style={{ animation: 'carlos-typing 1s infinite' }}>...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Email capture form */}
        {showEmailForm && (
          <div style={{
            padding: '12px 16px', background: '#fef3c7', borderTop: '1px solid #fbbf24',
          }}>
            <p style={{ fontSize: '13px', color: '#92400e', marginBottom: '8px' }}>
              Pour voir vos résultats, entrez votre email :
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                placeholder="votre@email.com"
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: '8px',
                  border: '1px solid #d1d5db', fontSize: '14px', outline: 'none',
                }}
                onKeyDown={e => e.key === 'Enter' && handleEmailCapture()}
              />
              <button
                onClick={handleEmailCapture}
                style={{
                  padding: '8px 16px', borderRadius: '8px',
                  background: primaryColor, color: 'white', border: 'none',
                  cursor: 'pointer', fontWeight: 600, fontSize: '13px',
                }}
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* Gains buttons (after email captured) */}
        {emailCaptured && view === 'chat' && gainsDashboard && (
          <div style={{ padding: '8px 16px', display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setView('gains')}
              style={{
                flex: 1, padding: '10px', borderRadius: '8px',
                background: `${primaryColor}10`, color: primaryColor,
                border: `1px solid ${primaryColor}30`, cursor: 'pointer',
                fontWeight: 600, fontSize: '13px',
              }}
            >
              Voir mes gains
            </button>
            <button
              onClick={handleViewRapport}
              style={{
                flex: 1, padding: '10px', borderRadius: '8px',
                background: primaryColor, color: 'white',
                border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: '13px',
              }}
            >
              Mon pré-rapport
            </button>
          </div>
        )}

        {/* Back to chat button */}
        {view !== 'chat' && (
          <button
            onClick={() => setView('chat')}
            style={{
              padding: '8px', background: '#f8fafc', border: 'none',
              borderTop: '1px solid #e2e8f0', cursor: 'pointer',
              fontSize: '13px', color: '#64748b',
            }}
          >
            ← Retour au chat
          </button>
        )}

        {/* Input */}
        {view === 'chat' && (
          <div style={{
            padding: '12px 16px', borderTop: '1px solid #e2e8f0',
            display: 'flex', gap: '8px', alignItems: 'center',
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Écrivez votre message..."
              disabled={loading}
              style={{
                flex: 1, padding: '10px 14px', borderRadius: '10px',
                border: '1px solid #e2e8f0', fontSize: '14px',
                outline: 'none', background: '#f8fafc',
              }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: input.trim() ? primaryColor : '#e2e8f0',
                border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            padding: '8px 16px', background: '#fef2f2',
            fontSize: '12px', color: '#dc2626', textAlign: 'center',
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Typing animation CSS */}
      <style>{`
        @keyframes carlos-typing {
          0%, 60% { opacity: 1; }
          30% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
