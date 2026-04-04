import { ReactNode } from 'react'

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  // Bypass the admin layout — onboarding is a full-page wizard
  return <>{children}</>
}
