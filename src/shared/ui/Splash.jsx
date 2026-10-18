import { Zap } from 'lucide-react';

export function Splash() {
  return (
    <div className="grid min-h-dvh place-items-center bg-white" role="status" aria-label="Loading">
      <span className="grid size-14 animate-glow place-items-center rounded-2xl bg-brand/15 text-brand">
        <Zap className="size-7 fill-current" aria-hidden />
      </span>
    </div>
  );
}
