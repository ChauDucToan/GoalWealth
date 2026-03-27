import { useMemo } from 'react';
import { useRouter as useExpoRouter } from 'expo-router';

export * from 'expo-router';

const NAVIGATION_COOLDOWN_MS = 650;
let navigationLockUntil = 0;

function runWithNavigationLock(action: () => void) {
  const now = Date.now();
  if (now < navigationLockUntil) {
    return;
  }

  navigationLockUntil = now + NAVIGATION_COOLDOWN_MS;

  try {
    action();
  } catch (error) {
    navigationLockUntil = 0;
    throw error;
  }
}

export function useRouter() {
  const router = useExpoRouter();

  return useMemo(
    () => ({
      ...router,
      push: (...args: Parameters<typeof router.push>) => runWithNavigationLock(() => router.push(...args)),
      replace: (...args: Parameters<typeof router.replace>) => runWithNavigationLock(() => router.replace(...args)),
      back: (...args: Parameters<typeof router.back>) => runWithNavigationLock(() => router.back(...args)),
      navigate: (...args: Parameters<typeof router.navigate>) => runWithNavigationLock(() => router.navigate(...args)),
      dismiss: (...args: Parameters<typeof router.dismiss>) => runWithNavigationLock(() => router.dismiss(...args)),
      dismissAll: (...args: Parameters<typeof router.dismissAll>) =>
        runWithNavigationLock(() => router.dismissAll(...args)),
      dismissTo: (...args: Parameters<typeof router.dismissTo>) =>
        runWithNavigationLock(() => router.dismissTo(...args)),
    }),
    [router]
  );
}
