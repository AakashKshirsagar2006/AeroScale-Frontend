import { features } from '@/shared/config/features';
import { cn } from '@/shared/lib/cn';
import { SoonBadge } from '@/shared/ui/SoonBadge';
import { GithubIcon, GoogleIcon } from './SocialIcons';

const PROVIDERS = [
  { id: 'google', label: 'Google', Icon: GoogleIcon, enabled: features.googleLogin },
  { id: 'github', label: 'GitHub', Icon: GithubIcon, enabled: features.githubLogin },
];

/** `onSelect(providerId)` is how a future OAuth flow plugs in. Disabled until the backend supports it. */
export function SocialButtons({ onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {PROVIDERS.map(({ id, label, Icon, enabled }) => (
        <button
          key={id}
          type="button"
          disabled={!enabled}
          onClick={() => onSelect?.(id)}
          title={enabled ? undefined : `${label} sign-in is coming soon`}
          className={cn(
            'inline-flex h-12 items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-ink outline-none transition focus-visible:ring-4 focus-visible:ring-accent/30',
            enabled ? 'hover:bg-slate-50' : 'cursor-not-allowed opacity-60',
          )}
        >
          <Icon className="size-5" />
          {label}
          {!enabled && <SoonBadge />}
        </button>
      ))}
    </div>
  );
}
