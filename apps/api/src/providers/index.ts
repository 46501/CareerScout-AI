export interface OpportunityRaw {
  id: string;
  title: string;
  company: string;
  description: string;
  url: string;
  postedDate: string;
  skills: string[];
}

export interface OpportunityNormalized {
  title: string;
  organization: string;
  description: string;
  type: string;
  skills: string[];
  postedAt: Date;
  source: string;
  sourceId: string;
  sourceUrl: string;
  applicationUrl: string;
  isActive: boolean;
  lastVerifiedAt: Date;
}

export interface OpportunityProvider {
  name: string;
  fetch(params: any): Promise<OpportunityRaw[]>;
  normalize(data: OpportunityRaw): OpportunityNormalized;
  healthCheck(): Promise<boolean>;
}
