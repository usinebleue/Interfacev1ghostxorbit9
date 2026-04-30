/**
 * types.ts — Types partagés pour la couche de données V3
 *
 * SourceStatus: simu | mixte | live
 * DataSourceResult<T>: wrapper retourné par useDataSource()
 * DomainEntry: metadata d'un domaine dans le registre
 */

export type SourceStatus = "simu" | "mixte" | "live";

export interface DataSourceResult<T> {
  data: T;
  source: SourceStatus;
  isLive: boolean;
  loading: boolean;
  error: string | null;
}

export interface DomainEntry {
  key: string;
  label: string;
  endpoint: string | null;
  status: SourceStatus;
  v2Hook?: string;
}
