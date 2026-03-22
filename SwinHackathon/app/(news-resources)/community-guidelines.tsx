import { Redirect } from 'expo-router';
import React from 'react';

export default function CommunityGuidelinesRedirect() {
  return <Redirect href={{ pathname: '/(tabs)/news-resources', params: { stage: 'rules' } }} />;
}
