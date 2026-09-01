# Onboarding Screen Patterns

## Two-panel layout (all onboarding screens)

Every onboarding screen uses the same split layout — no exceptions:

```tsx
<div className="min-h-screen flex">
  <OnboardingLeftPanel />
  <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 lg:px-20 overflow-y-auto bg-stone-50">
    {/* Mobile logo — lg:hidden */}
    {/* Content */}
    <p className="mt-10 text-[12px] text-muted-foreground">© 2026 Health Telematix. All rights reserved.</p>
  </div>
</div>
```

- `OnboardingLeftPanel` is at `src/modules/onboarding/components/onboarding-left-panel/OnboardingLeftPanel.tsx`
- It is `hidden lg:flex` — only shows on large screens
- The mobile logo block inside the right panel must be `lg:hidden`
- Footer goes **inside** the right panel (not `absolute`), using `mt-10`

---

## Read-only account details card pattern (`CreateProfile`)

When showing pre-filled, non-editable data from an invitation, use a card with a header badge — never disabled `<Input>` fields:

```tsx
<div className="rounded-xl border border-slate-200 bg-white overflow-hidden mb-6">
  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/60">
    <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">Account Details</p>
    <span className="inline-flex items-center gap-1 text-[11px] ... rounded-full px-2.5 py-0.5">
      <Lock size={9} /> From invitation
    </span>
  </div>
  <div className="grid grid-cols-2 divide-x divide-slate-100">{/* icon + label + value per column */}</div>
</div>
```

---

## Password strength bar pattern (`ResetPassword`)

Shown live as the user types into the new password field (`mode: 'onChange'`):

```tsx
const STRENGTH_RULES = [
  { label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { label: 'One uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { label: 'One number', test: (v) => /[0-9]/.test(v) },
  { label: 'One special character', test: (v) => /[^A-Za-z0-9]/.test(v) },
];
// Score 0–4 → maps to Weak/Fair/Good/Strong
// 4-segment bar + 2×2 checklist grid rendered below the input
```

---

## Success popup pattern (post-action dialogs)

Used for: physician invite sent, password reset successfully.

```tsx
<Dialog open={isSuccess}>
  <DialogContent className="max-w-[420px] p-0 overflow-hidden rounded-2xl" showCloseButton={false}>
    <div className="overflow-hidden rounded-[inherit]">
      {/* Gradient header: from-emerald-50/90 to-white */}
      {/* Large icon circle with animate-ping outer ring */}
      {/* Heading + subtitle */}
      {/* Steps card: border border-slate-100 divide-y, each row has Check icon + label + step pill */}
      {/* Full-width CTA button */}
    </div>
  </DialogContent>
</Dialog>
```

- `showCloseButton={false}` — user must act on the CTA
- Step pill style: `text-[11px] font-semibold text-primary bg-primary/8 border border-primary/15 px-2 py-0.5 rounded-full`
- Animated icon: wrap in `<div className="relative">`, add `<span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />` behind the icon circle

---

## Demo guide banner pattern

Used on "Check your inbox" to allow devs to navigate to the next screen without a real email:

```tsx
<div className="w-full rounded-xl border border-dashed border-amber-300 bg-amber-50 px-4 py-3 mb-4 flex items-start gap-3">
  <FlaskConical size={15} className="text-amber-500 mt-0.5 flex-shrink-0" />
  <div>
    <p className="text-[12px] font-semibold text-amber-700 mb-0.5">Demo only</p>
    <p className="text-[12px] text-amber-600">...</p>
  </div>
</div>
```
