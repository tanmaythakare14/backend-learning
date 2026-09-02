import type { JSX, ReactNode } from 'react';
import { GraduationCap } from 'lucide-react';
import { PRODUCT_NAME } from '../../constants';
import { OnboardingLeftPanel } from '../onboarding-left-panel/OnboardingLeftPanel';

interface OnboardingScreenLayoutProps {
  children: ReactNode;
}

/** Shared two-panel shell for every onboarding screen (Create Account, Sign In, ...) — keep it the single source of truth so they never drift apart. */
export function OnboardingScreenLayout({ children }: OnboardingScreenLayoutProps): JSX.Element {
  return (
    <div className="flex min-h-screen">
      <OnboardingLeftPanel className="lg:w-[40%]" />

      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto bg-canvas px-6 py-12 lg:w-[60%] lg:px-16">
        {/* Mobile logo — hidden on desktop, left panel covers branding there */}
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            {PRODUCT_NAME}
          </span>
        </div>

        <div className="w-full max-w-[620px]">{children}</div>

        <p className="mt-10 text-[12px] text-muted-foreground">
          © 2026 {PRODUCT_NAME}. All rights reserved.
        </p>
      </div>
    </div>
  );
}
