import { useCallback, useEffect, useRef, useState } from 'react';

/** Runs `fn` on mount and whenever `deps` change. Stale responses are ignored. */
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, status: 'loading', error: null });
  const run = useRef(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const load = useCallback(() => {
    const id = ++run.current;
    setState((s) => ({ ...s, status: 'loading', error: null }));
    fnRef.current().then(
      (data) => id === run.current && setState({ data, status: 'ready', error: null }),
      (error) => id === run.current && setState({ data: null, status: 'error', error }),
    );
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, deps);
  return { ...state, reload: load };
}
