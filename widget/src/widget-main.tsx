/**
 * widget-main.tsx — Entry point du widget CarlOS Prospect
 *
 * Usage sur un site externe:
 * <div data-carlos-prospect data-api-url="https://app.usinebleue.ai"></div>
 * <script src="https://app.usinebleue.ai/widget/carlos-prospect.js"></script>
 *
 * Config possible:
 * - data-api-url: URL du backend (default: https://app.usinebleue.ai)
 * - data-mode: "chat" (floating) ou "inline" (default: chat)
 * - data-campaign: ID de campagne fournisseur
 * - data-playbook: ID de playbook client
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { setApiUrl } from './ProspectApi';
import { ProspectChat } from './ProspectChat';

function mountWidget(container: HTMLElement) {
  const apiUrl = container.getAttribute('data-api-url') || 'https://app.usinebleue.ai';
  const mode = container.getAttribute('data-mode') === 'inline' ? 'inline' : 'floating';
  const campaignId = container.getAttribute('data-campaign') || undefined;
  const playbookId = container.getAttribute('data-playbook') || undefined;

  setApiUrl(apiUrl);

  const root = createRoot(container);
  root.render(
    <ProspectChat
      apiUrl={apiUrl}
      mode={mode as 'floating' | 'inline'}
      campaignId={campaignId}
      playbookId={playbookId}
    />
  );
}

// Auto-mount sur tous les elements [data-carlos-prospect]
function init() {
  const containers = document.querySelectorAll<HTMLElement>('[data-carlos-prospect]');
  containers.forEach(mountWidget);

  // Si aucun container trouve, creer un container floating
  if (containers.length === 0) {
    const div = document.createElement('div');
    div.setAttribute('data-carlos-prospect', '');
    document.body.appendChild(div);
    mountWidget(div);
  }
}

// Lancer quand le DOM est pret
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
