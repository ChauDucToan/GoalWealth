import { isGoalwealthLiveAdapterEnabled } from '@/services/api/config';

export type EndpointBackedFeature =
  | 'transactions'
  | 'smartBudgeting'
  | 'portfolio'
  | 'newsResources'
  | 'community'
  | 'insights'
  | 'achievements'
  | 'alerts'
  | 'assistantWorkspace'
  | 'profileWorkspace';

const liveModeFeatureFlags: Record<EndpointBackedFeature, boolean> = {
  transactions: false,
  smartBudgeting: false,
  portfolio: false,
  newsResources: false,
  community: false,
  insights: false,
  achievements: false,
  alerts: false,
  assistantWorkspace: false,
  profileWorkspace: false,
};

export function isEndpointBackedFeatureEnabled(feature: EndpointBackedFeature) {
  if (!isGoalwealthLiveAdapterEnabled()) {
    return true;
  }

  return liveModeFeatureFlags[feature];
}
