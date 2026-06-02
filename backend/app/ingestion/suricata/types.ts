export interface SuricataAlert {
  action: string;
  gid: number;
  signature_id: number;
  rev: number;
  signature: string;
  category: string;
  severity: number;
}

export interface SuricataDns {
  type: 'query' | 'answer';
  id: number;
  rrname: string;
  rrtype: string;
  rcode?: string;
}

export interface SuricataHttp {
  hostname: string;
  url: string;
  http_user_agent: string;
  http_method: string;
  status?: number;
}

export interface SuricataTls {
  subject: string;
  issuerdn: string;
  serial: string;
  version: string;
  fingerprint?: string;
}

export interface SuricataAnomaly {
  event: string;
  local: boolean;
}

export interface SuricataPayload {
  timestamp: string;
  flow_id: number;
  event_type: 'alert' | 'dns' | 'http' | 'flow' | 'tls' | 'anomaly' | string;
  src_ip: string;
  src_port: number;
  dest_ip: string;
  dest_port: number;
  proto: string;
  alert?: SuricataAlert;
  dns?: SuricataDns;
  http?: SuricataHttp;
  tls?: SuricataTls;
  anomaly?: SuricataAnomaly;
}
