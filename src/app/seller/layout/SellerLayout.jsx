import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { sellerProfileActions } from '@/features/seller';
import { Toaster } from '@/shared/ui/Toaster';
import { SellerBottomNav } from './SellerBottomNav';
import { SellerNavbar } from './SellerNavbar';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

/** Shell for every seller page. Warms the profile so the menu and dashboard numbers are ready. */
export function SellerLayout() {
  const { user } = useAuth();
  useEffect(() => {
    sellerProfileActions.load();
    return () => sellerProfileActions.reset();
  }, [user.id]);

  return (
    <div className="min-h-dvh bg-slate-50">
      <a href="#content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold">Skip to content</a>
      <ScrollToTop />
      <SellerNavbar />
      <main id="content" className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 md:pb-14">
        <Outlet />
      </main>
      <SellerBottomNav />
      <Toaster />
    </div>
  );
}
