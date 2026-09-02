import type { JSX } from 'react';
import { GraduationCap, Sparkles, Star, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PRODUCT_NAME } from '../../constants';
import type { OnboardingLeftPanelProps } from '../../@types';

const FEATURE_BULLETS = [
  'Self-paced, project-based courses',
  '1:1 mentor support from industry experts',
  'Verified certificates you can share',
];

export function OnboardingLeftPanel({ className }: OnboardingLeftPanelProps): JSX.Element {
  return (
    <div
      className={cn(
        'relative hidden lg:flex flex-col justify-between overflow-hidden px-12 py-12 text-white',
        'bg-gradient-to-br from-[#3730A3] via-[#4F46E5] to-[#6366F1]',
        className,
      )}
    >
      {/* Ambient decoration */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#818CF8]/40 blur-3xl" />

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-semibold tracking-tight">{PRODUCT_NAME}</span>
      </div>

      {/* Headline + floating stat cards */}
      <div className="relative z-10 flex-1 flex flex-col justify-center gap-10 py-16">
        <div className="max-w-sm space-y-4">
          <h1 className="text-[2.15rem] font-semibold leading-[1.15] tracking-tight">
            Learn the skills that move your career forward.
          </h1>
          <p className="text-[15px] leading-relaxed text-white/75">
            Join a community of learners building real, job-ready skills with courses designed by
            practitioners — not just theory.
          </p>
        </div>

        <ul className="space-y-3">
          {FEATURE_BULLETS.map((bullet) => (
            <li key={bullet} className="flex items-center gap-3 text-[13.5px] text-white/85">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                <Sparkles className="h-3 w-3" />
              </span>
              {bullet}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
            <Users className="h-4 w-4 text-white/80" />
            <div className="leading-tight">
              <p className="text-sm font-semibold">12,400+</p>
              <p className="text-[11px] text-white/65">Active learners</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
            <Star className="h-4 w-4 text-amber-300" />
            <div className="leading-tight">
              <p className="text-sm font-semibold">4.9/5</p>
              <p className="text-[11px] text-white/65">Average rating</p>
            </div>
          </div>
        </div>
      </div>

      <p className="relative z-10 text-[12px] text-white/50">
        Trusted by learners at 400+ companies worldwide.
      </p>
    </div>
  );
}
