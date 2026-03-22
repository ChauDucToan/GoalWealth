import { Redirect, useLocalSearchParams } from 'expo-router';
import React from 'react';

function getFirstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default function CommunityFeedRedirect() {
  const params = useLocalSearchParams<{ tab?: string | string[] }>();
  const tab = getFirstParam(params.tab);

  return (
    <Redirect
      href={{
        pathname: '/(tabs)/news-resources',
        params: { stage: 'feed', ...(tab ? { tab } : {}) },
      }}
    />
  );
}
