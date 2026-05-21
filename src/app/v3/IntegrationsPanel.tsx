/**
 * IntegrationsPanel.tsx — Hub de connexions de données par département
 *
 * Grille 3 colonnes avec vrais logos de marque (Clearbit Logo API).
 * Cliquer sur une carte ouvre le formulaire pleine largeur sous la grille.
 * Organisation par département — même logique que les 12 bots.
 */

import { useState, useEffect } from "react";
import { X, Check, Loader2, Search, ExternalLink, Plus } from "lucide-react";
import { cn } from "../components/ui/utils";
import { api } from "../v2/api/client";

// ── Logo composant multi-source ───────────────────────────────────────────────
// Ordre de priorité :
//   1. Google S2 Favicons (universel, fonctionne pour tous les domaines)
//   2. Clearbit (meilleure qualité, mais peut être indisponible selon réseau)
//   3. Lettre initiale colorée (fallback garanti)

function BrandLogo({ domain, name, color }: { domain: string; name: string; color: string }) {
  const [srcIndex, setSrcIndex] = useState(0);

  const sources = domain ? [
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
    `https://logo.clearbit.com/${domain}`,
  ] : [];

  const handleError = () => {
    setSrcIndex(prev => prev + 1);
  };

  if (!domain || srcIndex >= sources.length) {
    return (
      <div className={cn(
        "h-10 w-10 rounded-xl flex items-center justify-center text-white text-sm font-black shrink-0",
        color
      )}>
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      key={srcIndex}
      src={sources[srcIndex]}
      alt={name}
      onError={handleError}
      className="h-10 w-10 rounded-xl object-contain bg-white border border-gray-100 p-1.5 shrink-0"
    />
  );
}

// ── Registre complet ──────────────────────────────────────────────────────────

type Field = { key: string; label: string; placeholder: string; type?: string; hint?: string };
type IntegrationDef = {
  provider: string;
  name: string;
  logoDomain: string;       // domaine optimisé pour Clearbit
  color: string;            // fallback couleur
  category: string;
  description: string;
  fields: Field[];
  docsUrl?: string;
  badge?: string;
};

const INTEGRATIONS: IntegrationDef[] = [
  // ── Finance & Comptabilité ──
  { provider: "acomba",      name: "Acomba",          logoDomain: "acomba.com",                color: "bg-blue-700",   category: "Finance & Comptabilité",  badge: "Québec", description: "Comptabilité la plus utilisée au Québec", fields: [{ key: "api_url", label: "URL serveur", placeholder: "http://localhost:5500/api" }, { key: "company_code", label: "Code compagnie", placeholder: "MON_CO" }, { key: "username", label: "Utilisateur", placeholder: "admin" }, { key: "password", label: "Mot de passe", placeholder: "...", type: "password" }] },
  { provider: "avantage",    name: "Avantage",        logoDomain: "avantage-erp.com",          color: "bg-indigo-700", category: "Finance & Comptabilité",  badge: "Québec", description: "ERP manufacturiers québécois", fields: [{ key: "api_url", label: "URL API", placeholder: "https://serveur/avantage/api" }, { key: "api_key", label: "Clé API", placeholder: "...", type: "password" }] },
  { provider: "quickbooks",  name: "QuickBooks",      logoDomain: "intuit.com",                color: "bg-green-600",  category: "Finance & Comptabilité",  description: "Comptabilité, factures, états financiers", fields: [{ key: "client_id", label: "Client ID", placeholder: "..." }, { key: "client_secret", label: "Client Secret", placeholder: "...", type: "password" }, { key: "company_id", label: "Realm ID", placeholder: "123456789" }, { key: "refresh_token", label: "Refresh Token", placeholder: "...", type: "password" }], docsUrl: "https://developer.intuit.com/app/developer/qbo/docs/get-started" },
  { provider: "sage50",      name: "Sage 50",         logoDomain: "sage.com",                  color: "bg-emerald-600",category: "Finance & Comptabilité",  description: "Grand livre, payables, recevables PME", fields: [{ key: "api_key", label: "Clé API", placeholder: "...", type: "password" }, { key: "company_db", label: "Base entreprise", placeholder: "MonEntreprise.sai" }] },
  { provider: "xero",        name: "Xero",            logoDomain: "xero.com",                  color: "bg-sky-500",    category: "Finance & Comptabilité",  description: "Comptabilité cloud, facturation", fields: [{ key: "client_id", label: "Client ID", placeholder: "..." }, { key: "client_secret", label: "Client Secret", placeholder: "...", type: "password" }, { key: "refresh_token", label: "Refresh Token", placeholder: "...", type: "password" }], docsUrl: "https://developer.xero.com/documentation/guides/oauth2/overview/" },
  { provider: "netsuite",    name: "NetSuite",        logoDomain: "netsuite.com",              color: "bg-red-600",    category: "Finance & Comptabilité",  description: "ERP cloud Oracle — finance, inventaire", fields: [{ key: "account_id", label: "Account ID", placeholder: "XXXXXXX" }, { key: "consumer_key", label: "Consumer Key", placeholder: "...", type: "password" }, { key: "consumer_secret", label: "Consumer Secret", placeholder: "...", type: "password" }, { key: "token_id", label: "Token ID", placeholder: "..." }, { key: "token_secret", label: "Token Secret", placeholder: "...", type: "password" }], docsUrl: "https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4247337891.html" },
  { provider: "stripe",      name: "Stripe",          logoDomain: "stripe.com",                color: "bg-violet-600", category: "Finance & Comptabilité",  description: "Paiements, abonnements, revenus", fields: [{ key: "secret_key", label: "Clé secrète", placeholder: "sk_live_...", type: "password" }], docsUrl: "https://dashboard.stripe.com/apikeys" },

  // ── RH & Paie ──
  { provider: "folks_hr",    name: "Folks RH",        logoDomain: "folksrh.com",               color: "bg-teal-600",   category: "RH & Paie",               badge: "Québec", description: "RH et employés — conçu pour le Québec", fields: [{ key: "api_key", label: "Clé API", placeholder: "...", type: "password" }, { key: "company_id", label: "ID Entreprise", placeholder: "..." }], docsUrl: "https://folksrh.com/api-documentation" },
  { provider: "nethris",     name: "Nethris",         logoDomain: "nethris.com",               color: "bg-blue-700",   category: "RH & Paie",               badge: "Québec", description: "Paie et RH cloud — leader au Québec", fields: [{ key: "client_id", label: "Client ID", placeholder: "..." }, { key: "client_secret", label: "Client Secret", placeholder: "...", type: "password" }, { key: "company_code", label: "Code entreprise", placeholder: "..." }] },
  { provider: "agendrix",    name: "Agendrix",        logoDomain: "agendrix.com",              color: "bg-blue-500",   category: "RH & Paie",               badge: "Québec", description: "Horaires, pointage, quarts de travail", fields: [{ key: "api_key", label: "Clé API", placeholder: "...", type: "password" }] },
  { provider: "adp",         name: "ADP",             logoDomain: "adp.com",                   color: "bg-red-600",    category: "RH & Paie",               description: "Paie, RH, gestion de la main-d'œuvre", fields: [{ key: "client_id", label: "Client ID", placeholder: "..." }, { key: "client_secret", label: "Client Secret", placeholder: "...", type: "password" }, { key: "org_oid", label: "Organization OID", placeholder: "..." }], docsUrl: "https://developers.adp.com/articles/guides/get-started-with-adp-api" },
  { provider: "bamboohr",    name: "BambooHR",        logoDomain: "bamboohr.com",              color: "bg-green-600",  category: "RH & Paie",               description: "RH, recrutement, performance", fields: [{ key: "api_key", label: "Clé API", placeholder: "...", type: "password" }, { key: "subdomain", label: "Sous-domaine", placeholder: "votre-entreprise" }], docsUrl: "https://documentation.bamboohr.com/docs/getting-started" },

  // ── Marketing & Croissance ──
  { provider: "brevo",          name: "Brevo",           logoDomain: "brevo.com",              color: "bg-blue-600",   category: "Marketing & Croissance",  description: "Email, SMS, campagnes marketing", fields: [{ key: "api_key", label: "Clé API", placeholder: "xkeysib-...", type: "password" }], docsUrl: "https://app.brevo.com/settings/keys/api" },
  { provider: "mailchimp",      name: "Mailchimp",       logoDomain: "mailchimp.com",          color: "bg-yellow-500", category: "Marketing & Croissance",  description: "Email marketing, audiences", fields: [{ key: "api_key", label: "Clé API", placeholder: "xxxx-us1", type: "password" }], docsUrl: "https://mailchimp.com/developer/marketing/guides/quick-start/" },
  { provider: "google_analytics",name:"Google Analytics",logoDomain: "analytics.google.com",  color: "bg-orange-500", category: "Marketing & Croissance",  description: "Trafic web, conversions, comportement", fields: [{ key: "property_id", label: "GA4 Property ID", placeholder: "123456789" }, { key: "service_account_json", label: "Service Account JSON", placeholder: '{"type":"service_account",...}', type: "password" }], docsUrl: "https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart-client-libraries" },
  { provider: "meta_ads",       name: "Meta Ads",        logoDomain: "facebook.com",           color: "bg-blue-600",   category: "Marketing & Croissance",  description: "Facebook & Instagram — publicités", fields: [{ key: "access_token", label: "Access Token", placeholder: "EAAx...", type: "password" }, { key: "ad_account_id", label: "Ad Account ID", placeholder: "act_123456789" }], docsUrl: "https://developers.facebook.com/docs/marketing-apis/get-started" },
  { provider: "klaviyo",        name: "Klaviyo",         logoDomain: "klaviyo.com",            color: "bg-green-700",  category: "Marketing & Croissance",  description: "Email & SMS marketing e-commerce", fields: [{ key: "api_key", label: "Clé API", placeholder: "pk_...", type: "password" }], docsUrl: "https://developers.klaviyo.com/en/docs/retrieve-api-credentials" },

  // ── CRM & Ventes ──
  { provider: "hubspot",     name: "HubSpot",         logoDomain: "hubspot.com",               color: "bg-orange-500", category: "CRM & Ventes",            description: "CRM — contacts, deals, pipeline", fields: [{ key: "api_key", label: "Private App Token", placeholder: "pat-na1-...", type: "password" }], docsUrl: "https://developers.hubspot.com/docs/api/private-apps" },
  { provider: "salesforce",  name: "Salesforce",      logoDomain: "salesforce.com",            color: "bg-sky-600",    category: "CRM & Ventes",            description: "CRM enterprise — opportunités, comptes", fields: [{ key: "instance_url", label: "URL instance", placeholder: "https://yourorg.salesforce.com" }, { key: "client_id", label: "Consumer Key", placeholder: "..." }, { key: "client_secret", label: "Consumer Secret", placeholder: "...", type: "password" }, { key: "refresh_token", label: "Refresh Token", placeholder: "...", type: "password" }], docsUrl: "https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/quickstart.htm" },
  { provider: "pipedrive",   name: "Pipedrive",       logoDomain: "pipedrive.com",             color: "bg-green-600",  category: "CRM & Ventes",            description: "Pipeline visuel, activités, prévisions", fields: [{ key: "api_token", label: "API Token", placeholder: "...", type: "password" }], docsUrl: "https://developers.pipedrive.com/docs/api/v1" },
  { provider: "zoho_crm",    name: "Zoho CRM",        logoDomain: "zoho.com",                  color: "bg-red-500",    category: "CRM & Ventes",            description: "CRM PME — leads, contacts, devis", fields: [{ key: "client_id", label: "Client ID", placeholder: "..." }, { key: "client_secret", label: "Client Secret", placeholder: "...", type: "password" }, { key: "refresh_token", label: "Refresh Token", placeholder: "...", type: "password" }, { key: "region", label: "Région", placeholder: "com" }], docsUrl: "https://www.zoho.com/crm/developer/docs/api/v6/" },

  // ── Opérations & Production ──
  { provider: "monday",      name: "Monday.com",      logoDomain: "monday.com",                color: "bg-red-500",    category: "Opérations & Production", description: "Gestion de projets, suivi ops", fields: [{ key: "api_key", label: "Clé API", placeholder: "eyJ...", type: "password" }, { key: "board_id", label: "ID tableau (optionnel)", placeholder: "123456789" }], docsUrl: "https://developer.monday.com/apps/docs/mondayapi" },
  { provider: "shopify",     name: "Shopify",         logoDomain: "shopify.com",               color: "bg-green-600",  category: "Opérations & Production", description: "E-commerce, inventaire, commandes", fields: [{ key: "shop_domain", label: "Domaine boutique", placeholder: "ma-boutique.myshopify.com" }, { key: "access_token", label: "Admin API Token", placeholder: "shpat_...", type: "password" }], docsUrl: "https://shopify.dev/docs/api/admin-rest" },
  { provider: "cin7",        name: "Cin7",            logoDomain: "cin7.com",                  color: "bg-blue-600",   category: "Opérations & Production", description: "Inventaire, bons de commande, production", fields: [{ key: "account_id", label: "Account ID", placeholder: "..." }, { key: "application_key", label: "Application Key", placeholder: "...", type: "password" }], docsUrl: "https://dearinventory.docs.apiary.io/" },
  { provider: "fishbowl",    name: "Fishbowl",        logoDomain: "fishbowlinventory.com",     color: "bg-orange-600", category: "Opérations & Production", description: "Inventaire et manufacturing", fields: [{ key: "server_url", label: "URL serveur", placeholder: "http://localhost:28192" }, { key: "username", label: "Utilisateur", placeholder: "admin" }, { key: "password", label: "Mot de passe", placeholder: "...", type: "password" }] },
  { provider: "katana",      name: "Katana MRP",      logoDomain: "katanamrp.com",             color: "bg-purple-600", category: "Opérations & Production", description: "Planification production, nomenclatures", fields: [{ key: "api_key", label: "Clé API", placeholder: "...", type: "password" }], docsUrl: "https://developer.katanamrp.com/reference/authentication" },
  { provider: "lightspeed",  name: "Lightspeed",      logoDomain: "lightspeedhq.com",          color: "bg-red-500",    category: "Opérations & Production", badge: "Québec", description: "POS, inventaire — populaire au Québec", fields: [{ key: "client_id", label: "Client ID", placeholder: "..." }, { key: "client_secret", label: "Client Secret", placeholder: "...", type: "password" }, { key: "refresh_token", label: "Refresh Token", placeholder: "...", type: "password" }], docsUrl: "https://developers.lightspeedhq.com/ecom/introduction/introduction/" },

  // ── Communication ──
  { provider: "slack",       name: "Slack",           logoDomain: "slack.com",                 color: "bg-purple-600", category: "Communication",           description: "Notifications dans vos channels", fields: [{ key: "webhook_url", label: "Webhook URL", placeholder: "https://hooks.slack.com/services/..." }, { key: "channel", label: "Channel (optionnel)", placeholder: "#general" }], docsUrl: "https://api.slack.com/messaging/webhooks" },
  { provider: "teams",       name: "Teams",           logoDomain: "microsoft.com",             color: "bg-indigo-600", category: "Communication",           description: "Notifications dans Teams", fields: [{ key: "webhook_url", label: "Incoming Webhook URL", placeholder: "https://outlook.office.com/webhook/..." }], docsUrl: "https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook" },
  { provider: "gmail",       name: "Gmail",           logoDomain: "gmail.com",                 color: "bg-red-500",    category: "Communication",           description: "Envoyer des résumés par email", fields: [{ key: "client_id", label: "OAuth Client ID", placeholder: "...apps.googleusercontent.com" }, { key: "client_secret", label: "Client Secret", placeholder: "...", type: "password" }, { key: "refresh_token", label: "Refresh Token", placeholder: "1//...", type: "password" }, { key: "from_email", label: "Email expéditeur", placeholder: "vous@domaine.com" }], docsUrl: "https://developers.google.com/gmail/api/quickstart" },
  { provider: "outlook",     name: "Outlook",         logoDomain: "outlook.com",               color: "bg-blue-600",   category: "Communication",           description: "Email et calendrier Microsoft", fields: [{ key: "client_id", label: "Azure Client ID", placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" }, { key: "client_secret", label: "Client Secret", placeholder: "...", type: "password" }, { key: "tenant_id", label: "Tenant ID", placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" }], docsUrl: "https://learn.microsoft.com/en-us/graph/auth-register-app-v2" },
  { provider: "zoom",        name: "Zoom",            logoDomain: "zoom.us",                   color: "bg-blue-500",   category: "Communication",           description: "Réunions, transcriptions", fields: [{ key: "account_id", label: "Account ID", placeholder: "..." }, { key: "client_id", label: "Client ID", placeholder: "..." }, { key: "client_secret", label: "Client Secret", placeholder: "...", type: "password" }], docsUrl: "https://marketplace.zoom.us/docs/guides/auth/oauth" },
  { provider: "twilio",      name: "Twilio",          logoDomain: "twilio.com",                color: "bg-red-600",    category: "Communication",           description: "SMS, appels, notifications", fields: [{ key: "account_sid", label: "Account SID", placeholder: "ACxxx..." }, { key: "auth_token", label: "Auth Token", placeholder: "...", type: "password" }, { key: "phone_from", label: "Numéro Twilio", placeholder: "+15145550000" }], docsUrl: "https://www.twilio.com/docs/usage/api" },

  // ── Calendrier ──
  { provider: "google_calendar", name: "Google Calendar", logoDomain: "calendar.google.com",  color: "bg-blue-500",   category: "Calendrier",              description: "Sync agenda, réunions, rappels", fields: [{ key: "client_id", label: "OAuth Client ID", placeholder: "...apps.googleusercontent.com" }, { key: "client_secret", label: "Client Secret", placeholder: "...", type: "password" }, { key: "refresh_token", label: "Refresh Token", placeholder: "1//...", type: "password" }, { key: "calendar_id", label: "ID Calendrier", placeholder: "primary" }], docsUrl: "https://developers.google.com/calendar/api/quickstart" },

  // ── Projets & Productivité ──
  { provider: "notion",      name: "Notion",          logoDomain: "notion.so",                 color: "bg-gray-900",   category: "Projets & Productivité",  description: "Base de connaissances, bases de données", fields: [{ key: "token", label: "Integration Token", placeholder: "secret_...", type: "password" }, { key: "database_id", label: "Database ID (optionnel)", placeholder: "xxx..." }], docsUrl: "https://developers.notion.com/docs/authorization" },
  { provider: "jira",        name: "Jira",            logoDomain: "atlassian.com",             color: "bg-blue-600",   category: "Projets & Productivité",  description: "Tickets, sprints, roadmap", fields: [{ key: "domain", label: "Domaine Jira", placeholder: "votre-co.atlassian.net" }, { key: "email", label: "Email Atlassian", placeholder: "vous@example.com" }, { key: "api_token", label: "API Token", placeholder: "...", type: "password" }], docsUrl: "https://id.atlassian.com/manage-profile/security/api-tokens" },
  { provider: "asana",       name: "Asana",           logoDomain: "asana.com",                 color: "bg-pink-500",   category: "Projets & Productivité",  description: "Tâches, projets, rapports", fields: [{ key: "personal_access_token", label: "Personal Access Token", placeholder: "1/...", type: "password" }], docsUrl: "https://developers.asana.com/docs/personal-access-token" },

  // ── Données & Analytics ──
  { provider: "google_sheets", name: "Google Sheets", logoDomain: "sheets.google.com",        color: "bg-green-600",  category: "Données & Analytics",     description: "Export, tableaux de bord, rapports", fields: [{ key: "service_account_json", label: "Service Account JSON", placeholder: '{"type":"service_account",...}', type: "password" }, { key: "spreadsheet_id", label: "Spreadsheet ID (optionnel)", placeholder: "1BxiMV..." }], docsUrl: "https://developers.google.com/sheets/api/quickstart" },
  { provider: "airtable",    name: "Airtable",        logoDomain: "airtable.com",              color: "bg-yellow-500", category: "Données & Analytics",     description: "Base de données flexible, formulaires", fields: [{ key: "personal_access_token", label: "Personal Access Token", placeholder: "pat...", type: "password" }, { key: "base_id", label: "Base ID (optionnel)", placeholder: "appXXXXXXXXXXXXXX" }], docsUrl: "https://airtable.com/developers/web/api/introduction" },

  // ── Développement ──
  { provider: "github",      name: "GitHub",          logoDomain: "github.com",                color: "bg-gray-900",   category: "Développement",           description: "Repos, code, issues, CI/CD", fields: [{ key: "token", label: "Personal Access Token", placeholder: "ghp_...", type: "password" }, { key: "org", label: "Organisation (optionnel)", placeholder: "mon-org" }], docsUrl: "https://github.com/settings/tokens" },
  { provider: "gitlab",      name: "GitLab",          logoDomain: "gitlab.com",                color: "bg-orange-600", category: "Développement",           description: "Repos, CI/CD, merge requests", fields: [{ key: "token", label: "Personal Access Token", placeholder: "glpat-...", type: "password" }, { key: "base_url", label: "URL (si self-hosted)", placeholder: "https://gitlab.votre-co.com" }], docsUrl: "https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html" },

  // ── Juridique ──
  { provider: "docusign",    name: "DocuSign",        logoDomain: "docusign.com",              color: "bg-yellow-500", category: "Juridique",               description: "Signature électronique, contrats", fields: [{ key: "integration_key", label: "Integration Key", placeholder: "xxxx-xxxx-xxxx-xxxx" }, { key: "user_id", label: "API User ID", placeholder: "xxxx-xxxx-xxxx-xxxx" }, { key: "account_id", label: "Account ID", placeholder: "xxxx-xxxx-xxxx-xxxx" }, { key: "private_key", label: "RSA Private Key", placeholder: "-----BEGIN RSA PRIVATE KEY-----", type: "password" }], docsUrl: "https://developers.docusign.com/docs/esign-rest-api/authorization/" },

  // ── Automatisation ──
  { provider: "zapier",      name: "Zapier",          logoDomain: "zapier.com",                color: "bg-orange-500", category: "Automatisation",          description: "Automatisations vers 5000+ apps", fields: [{ key: "webhook_url", label: "Zapier Webhook URL", placeholder: "https://hooks.zapier.com/hooks/catch/..." }], docsUrl: "https://zapier.com/apps/webhook/integrations" },
  { provider: "make",        name: "Make",            logoDomain: "make.com",                  color: "bg-violet-600", category: "Automatisation",          description: "Automatisations visuelles sans code", fields: [{ key: "webhook_url", label: "Make Webhook URL", placeholder: "https://hook.make.com/..." }], docsUrl: "https://www.make.com/en/help/tools/webhooks" },
];

const CATEGORIES = Array.from(new Set(INTEGRATIONS.map(i => i.category)));

// ── Composant principal ───────────────────────────────────────────────────────

interface IntegrationsPanelProps { onClose: () => void; }

export function IntegrationsPanel({ onClose }: IntegrationsPanelProps) {
  const [connected, setConnected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, Record<string, string>>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saveResult, setSaveResult] = useState<Record<string, "ok" | "error">>({});
  const [testing, setTesting] = useState<string | null>(null);
  const [testMsg, setTestMsg] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.getUserIntegrations().then(res => {
      setConnected(new Set((res.integrations || []).map((i: any) => i.provider as string)));
    }).catch(() => {});
  }, []);

  const handleSave = async (provider: string) => {
    setSaving(provider);
    setSaveResult(prev => ({ ...prev, [provider]: undefined as any }));
    try {
      const res = await api.saveIntegration(provider, fields[provider] || {});
      if (res.ok) {
        setConnected(prev => new Set([...prev, provider]));
        setSaveResult(prev => ({ ...prev, [provider]: "ok" }));
        setTimeout(() => setExpanded(null), 900);
      } else {
        setSaveResult(prev => ({ ...prev, [provider]: "error" }));
      }
    } catch {
      setSaveResult(prev => ({ ...prev, [provider]: "error" }));
    } finally { setSaving(null); }
  };

  const handleTest = async (provider: string) => {
    setTesting(provider);
    try {
      const res = await api.testUserIntegration(provider);
      setTestMsg(prev => ({ ...prev, [provider]: res.ok ? "Connexion OK ✓" : (res.error || "Échec") }));
    } catch {
      setTestMsg(prev => ({ ...prev, [provider]: "Erreur réseau" }));
    } finally { setTesting(null); }
  };

  const q = search.trim().toLowerCase();
  const filtered = q
    ? INTEGRATIONS.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        (i.badge || "").toLowerCase().includes(q)
      )
    : INTEGRATIONS;

  const groups = CATEGORIES
    .map(cat => ({ cat, items: filtered.filter(i => i.category === cat) }))
    .filter(g => g.items.length > 0);

  return (
    <div className="shrink-0 bg-white border-t border-gray-200 flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-2 pb-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-800">Connecteurs de données</span>
          {connected.size > 0 && (
            <span className="text-[8px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">
              {connected.size} connecté{connected.size > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded cursor-pointer">
          <X className="h-3.5 w-3.5 text-gray-400" />
        </button>
      </div>
      <p className="px-3 text-[9px] text-gray-400 pb-1.5">
        Chaque bot consomme les données de son département. Connectez vos logiciels une fois, pour toujours.
      </p>

      {/* Recherche */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
          <input
            type="text"
            placeholder="Acomba, Slack, QuickBooks, Shopify..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-[10px] pl-6 pr-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-300 bg-gray-50"
          />
        </div>
      </div>

      {/* Contenu scrollable */}
      <div className="px-3 pb-3 max-h-96 overflow-y-auto space-y-4">
        {groups.map(({ cat, items }) => (
          <div key={cat}>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">{cat}</p>

            {/* Grille 3 colonnes */}
            <div className="grid grid-cols-3 gap-1.5">
              {items.map(def => {
                const isConnected = connected.has(def.provider);
                return (
                  <button
                    key={def.provider}
                    onClick={() => setExpanded(expanded === def.provider ? null : def.provider)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-colors cursor-pointer relative text-center",
                      expanded === def.provider
                        ? "border-blue-300 bg-blue-50"
                        : isConnected
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-gray-200 bg-white hover:bg-gray-50"
                    )}
                  >
                    {/* Point connecté */}
                    {isConnected && (
                      <div className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500" />
                    )}
                    <BrandLogo domain={def.logoDomain} name={def.name} color={def.color} />
                    <span className="text-[9px] font-semibold text-gray-700 leading-tight line-clamp-2">{def.name}</span>
                    {def.badge && (
                      <span className="text-[7px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-1 py-0.5 rounded leading-none">
                        {def.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Formulaire pleine largeur sous la grille */}
            {items.some(i => i.provider === expanded) && (() => {
              const def = items.find(i => i.provider === expanded)!;
              return (
                <div className="mt-2 border border-blue-200 rounded-xl bg-white p-3 space-y-2 shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <BrandLogo domain={def.logoDomain} name={def.name} color={def.color} />
                    <div>
                      <p className="text-[10px] font-bold text-gray-800">{def.name}</p>
                      <p className="text-[9px] text-gray-400">{def.description}</p>
                    </div>
                  </div>

                  {def.docsUrl && (
                    <a href={def.docsUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 text-[9px] text-blue-600 hover:underline">
                      <ExternalLink className="h-2.5 w-2.5" /> Comment obtenir mes clés ?
                    </a>
                  )}

                  {def.fields.map(f => (
                    <div key={f.key}>
                      <label className="text-[9px] font-medium text-gray-600 block mb-0.5">{f.label}</label>
                      <input
                        type={f.type || "text"}
                        placeholder={f.placeholder}
                        value={(fields[def.provider] || {})[f.key] || ""}
                        onChange={e => setFields(prev => ({ ...prev, [def.provider]: { ...(prev[def.provider] || {}), [f.key]: e.target.value } }))}
                        className="w-full text-[9px] px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-300 placeholder:text-gray-400 bg-gray-50"
                      />
                      {f.hint && <p className="text-[8px] text-gray-400 mt-0.5">{f.hint}</p>}
                    </div>
                  ))}

                  {saveResult[def.provider] === "error" && <p className="text-[9px] text-red-500">Erreur — vérifiez vos informations</p>}
                  {testMsg[def.provider] && (
                    <p className={cn("text-[9px] font-medium", testMsg[def.provider].includes("OK") ? "text-emerald-600" : "text-red-500")}>
                      {testMsg[def.provider]}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(def.provider)}
                      disabled={saving === def.provider}
                      className="flex-1 flex items-center justify-center gap-1 text-[9px] font-bold px-2 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer transition-colors"
                    >
                      {saving === def.provider
                        ? <><Loader2 className="h-2.5 w-2.5 animate-spin" /> Sauvegarde...</>
                        : saveResult[def.provider] === "ok"
                          ? <><Check className="h-2.5 w-2.5" /> Sauvegardé !</>
                          : "Sauvegarder"}
                    </button>
                    {connected.has(def.provider) && (
                      <button
                        onClick={() => handleTest(def.provider)}
                        disabled={testing === def.provider}
                        className="text-[9px] px-2 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors disabled:opacity-50"
                      >
                        {testing === def.provider ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : "Tester"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        ))}

        {/* API personnalisée */}
        {(!q || "personnalisée custom api".includes(q)) && (
          <div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Autre</p>
            <button
              onClick={() => setExpanded(expanded === "custom" ? null : "custom")}
              className={cn(
                "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl border text-left transition-colors cursor-pointer",
                expanded === "custom" ? "border-blue-200 bg-blue-50" : "border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
              )}
            >
              <div className="h-10 w-10 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center shrink-0">
                <Plus className="h-4 w-4 text-gray-400" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-700">Connexion personnalisée</p>
                <p className="text-[9px] text-gray-400">Connectez n'importe quelle API REST</p>
              </div>
            </button>
            {expanded === "custom" && (
              <div className="mt-2 border border-blue-200 rounded-xl bg-white p-3 space-y-2 shadow-sm">
                {[
                  { key: "name", label: "Nom du service", placeholder: "Mon ERP / Mon logiciel" },
                  { key: "base_url", label: "URL de base de l'API", placeholder: "https://api.monservice.com/v1" },
                  { key: "api_key", label: "Clé API ou Token", placeholder: "...", type: "password" },
                  { key: "header_name", label: "Header d'authentification", placeholder: "Authorization" },
                  { key: "header_prefix", label: "Préfixe (ex: Bearer)", placeholder: "Bearer" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-[9px] font-medium text-gray-600 block mb-0.5">{f.label}</label>
                    <input
                      type={(f as any).type || "text"}
                      placeholder={f.placeholder}
                      value={(fields["custom"] || {})[f.key] || ""}
                      onChange={e => setFields(prev => ({ ...prev, custom: { ...(prev["custom"] || {}), [f.key]: e.target.value } }))}
                      className="w-full text-[9px] px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-300 placeholder:text-gray-400 bg-gray-50"
                    />
                  </div>
                ))}
                {saveResult["custom"] === "error" && <p className="text-[9px] text-red-500">Erreur de sauvegarde</p>}
                <button
                  onClick={() => handleSave("custom")}
                  disabled={saving === "custom"}
                  className="w-full flex items-center justify-center gap-1 text-[9px] font-bold px-2 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer transition-colors"
                >
                  {saving === "custom" ? <><Loader2 className="h-2.5 w-2.5 animate-spin" /> Sauvegarde...</>
                    : saveResult["custom"] === "ok" ? <><Check className="h-2.5 w-2.5" /> Sauvegardé !</>
                    : "Sauvegarder"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
