import { forwardRef, useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Input } from './Input';

export const PasswordInput = forwardRef(function PasswordInput(props, ref) {
  const [visible, setVisible] = useState(false);
  return (
    <Input
      ref={ref}
      icon={Lock}
      type={visible ? 'text' : 'password'}
      placeholder="Enter your password"
      right={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="grid size-9 place-items-center rounded-lg text-slate-500 outline-none hover:text-ink focus-visible:ring-4 focus-visible:ring-accent/30"
        >
          {visible ? <EyeOff className="size-[18px]" aria-hidden /> : <Eye className="size-[18px]" aria-hidden />}
        </button>
      }
      {...props}
    />
  );
});
