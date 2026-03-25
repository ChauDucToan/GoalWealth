import { Redirect } from 'expo-router';
import React from 'react';

export default function CommunityGuidelinesRedirect() {
  return <Redirect href={{ pathname: '/community-home', params: { stage: 'rules' } }} />;
}
