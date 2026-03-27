import { SmartBudgetingHomeScreen } from '@/components/smart-budgeting/SmartBudgetingHomeScreen';
import { UnavailableWorkspace } from '@/components/shared/UnavailableWorkspace';
import { isEndpointBackedFeatureEnabled } from '@/lib/endpoint-backed-features';
import React from 'react';

export default function SmartBudgetingTabScreen() {
  if (!isEndpointBackedFeatureEnabled('smartBudgeting')) {
    return (
      <UnavailableWorkspace
        title="Smart budgeting is off in live mode"
        body="The current budgeting workspace still depends on local budget setup, category and insight data. It stays hidden until GoalWealth exposes budget endpoints end to end."
      />
    );
  }

  return <SmartBudgetingHomeScreen />;
}
