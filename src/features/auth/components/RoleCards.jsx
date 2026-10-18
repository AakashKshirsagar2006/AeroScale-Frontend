import { CircleCheck, ShoppingBag, Store } from 'lucide-react';

const OPTIONS = [
  { value: 'BUYER', title: 'Buyer', text: 'Shop live flash deals and check out fast.', Icon: ShoppingBag },
  { value: 'SELLER', title: 'Seller', text: 'List products and run your own flash sales.', Icon: Store },
];

/** Native radio inputs under the hood, so keyboard and screen readers work for free. */
export function RoleCards({ register }) {
  return (
    <div role="radiogroup" aria-label="Account type" className="grid gap-3 sm:grid-cols-2">
      {OPTIONS.map(({ value, title, text, Icon }) => (
        <label key={value} className="relative block cursor-pointer">
          <input type="radio" value={value} className="peer sr-only" {...register('role')} />
          <div className="h-full rounded-2xl border-2 border-slate-200 bg-white p-4 transition hover:border-slate-300 peer-checked:border-brand peer-checked:bg-brand/5 peer-focus-visible:ring-4 peer-focus-visible:ring-accent/30">
            <span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand">
              <Icon className="size-5" aria-hidden />
            </span>
            <p className="mt-3 font-semibold text-ink">{title}</p>
            <p className="mt-1 text-sm leading-snug text-slate-600">{text}</p>
          </div>
          <CircleCheck aria-hidden className="absolute right-3 top-3 size-5 text-brand opacity-0 transition peer-checked:opacity-100" />
        </label>
      ))}
    </div>
  );
}
