import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { addressActions, profileActions } from '@/features/account';
import { cartActions } from '@/features/cart';
import { Toaster } from '@/shared/ui/Toaster';
import { BottomNav } from './BottomNav';
import { Navbar } from './Navbar';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

/** Shell for every buyer page. Also warms the cart and profile so the navbar badge and greeting are ready. */
export function BuyerLayout() {
  const { user } = useAuth();

  useEffect(() => {
    cartActions.load(user.id).catch(() => {}); // the cart page shows its own error; don't block browsing
    profileActions.load();
    return () => { cartActions.reset(); profileActions.reset(); addressActions.reset(); };
  }, [user.id]);

  return (
    <div className="min-h-dvh bg-slate-50">
      <a href="#content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold">Skip to content</a>
      <ScrollToTop />
      <Navbar />
      <main id="content" className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 md:pb-14">
        <Outlet />
      </main>
      <BottomNav />
      <Toaster />
    </div>
  );
}
