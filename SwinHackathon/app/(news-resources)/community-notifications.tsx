import { Redirect } from '@/lib/expo-router';
import React from 'react';

export default function CommunityNotificationsRedirect() {
  return <Redirect href="/search-notifications" />;
}
