import { SubscriptionSetupContext } from '@/context/subscriptionSetupContext';
import { useContext } from 'react';

export function useSubscriptionSetup() {
  const context = useContext(SubscriptionSetupContext);

  if (!context) {
    throw new Error('useSubscriptionSetup must be used within SubscriptionSetupProvider');
  }

  return context;
}
