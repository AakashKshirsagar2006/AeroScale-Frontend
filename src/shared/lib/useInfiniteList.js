import { useCallback, useEffect, useRef, useState } from 'react';

const dedupe = (items) => Array.from(new Map(items.map((i) => [i.id, i])).values());

/**
 * Page-by-page loading driven by scrolling.
 *   fetchPage(pageIndex) -> Promise<{ items, hasMore }>
 * Starts again from page 0 whenever `deps` change. Put `sentinelRef` on an element at the end of the list:
 * the next page is fetched when it nears the viewport (rootMargin), never all pages at once.
 */
export function useInfiniteList(fetchPage, deps = [], { rootMargin = '600px' } = {}) {
  const [state, setState] = useState({ items: [], status: 'loading', loadingMore: false, hasMore: true, error: null });
  const stateRef = useRef(state);
  stateRef.current = state;
  const page = useRef(0);
  const run = useRef(0); // bumps on reset so answers to old queries are dropped
  const busy = useRef(false);
  const fetchRef = useRef(fetchPage);
  fetchRef.current = fetchPage;

  const load = useCallback(async (reset) => {
    if (busy.current && !reset) return;
    const id = reset ? ++run.current : run.current;
    busy.current = true;
    if (reset) {
      page.current = 0;
      setState({ items: [], status: 'loading', loadingMore: false, hasMore: true, error: null });
    } else {
      setState((s) => ({ ...s, loadingMore: true, error: null }));
    }
    try {
      const { items, hasMore } = await fetchRef.current(page.current);
      if (id !== run.current) return;
      page.current += 1;
      setState((s) => ({ items: dedupe(reset ? items : [...s.items, ...items]), status: 'ready', loadingMore: false, hasMore, error: null }));
    } catch (error) {
      if (id !== run.current) return;
      setState((s) => ({ ...s, status: s.items.length ? 'ready' : 'error', loadingMore: false, error }));
    } finally {
      if (id === run.current) busy.current = false;
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(true); }, deps);

  const loadMore = useRef(() => {});
  loadMore.current = () => {
    const s = stateRef.current;
    if (s.status === 'ready' && s.hasMore && !s.error && !busy.current) load(false);
  };

  const observer = useRef(null);
  const node = useRef(null);
  const sentinelRef = useCallback((el) => {
    observer.current?.disconnect();
    node.current = el;
    if (!el) return;
    observer.current = new IntersectionObserver(([entry]) => entry.isIntersecting && loadMore.current(), { rootMargin });
    observer.current.observe(el);
  }, [rootMargin]);

  // A short page can leave the sentinel in view, where no new "intersect" event fires. Re-arm after each load.
  useEffect(() => {
    if (!observer.current || !node.current) return;
    observer.current.unobserve(node.current);
    observer.current.observe(node.current);
  }, [state.items.length, state.hasMore]);

  return { ...state, sentinelRef, reload: () => load(true), retry: () => load(false) };
}
