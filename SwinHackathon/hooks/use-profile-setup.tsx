import { ProfileSetupContext } from '@/context/profileSetupContext';
import { useContext } from 'react';

export function useProfileSetup() {
  const context = useContext(ProfileSetupContext);

  if (!context) {
    throw new Error('useProfileSetup must be used within ProfileSetupProvider');
  }

  return context;
}
