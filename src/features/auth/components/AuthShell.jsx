import { Logo } from '@/shared/ui/Logo';
import { HeroPanel } from './HeroPanel';

/**
 * White form on the left, dark hero on the right (board #5). Full bleed, no frame.
 * The hero stays pinned while the form scrolls. On small screens it becomes a light brand header.
 */
export function AuthShell({ children }) {
  return (
    <div className="grid min-h-dvh bg-white lg:grid-cols-2">
      <header className="relative overflow-x-clip px-6 pt-6 lg:hidden">
        <div aria-hidden className="pointer-events-none absolute -right-12 -top-20 size-56 rounded-full bg-brand/15 blur-[70px]" />
        <Logo className="relative" />
        <p className="relative mt-2 text-sm text-slate-600">Flash Deals. Real Scale.</p>
      </header>

      <main className="flex items-center justify-center bg-white px-6 py-10 sm:px-12 lg:px-16">{children}</main>

      <HeroPanel className="hidden lg:sticky lg:top-0 lg:order-2 lg:flex lg:h-dvh lg:self-start" />
    </div>
  );
}
