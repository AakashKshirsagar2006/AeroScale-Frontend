import { useCallback, useState } from 'react';

/**
 * Lets a list show the result of an edit without refetching (and losing the scroll position).
 *   const { patch, apply, reset } = usePatches();
 *   patch(id, { status: 'SHIPPED' });   items = apply(list.items);
 * Call reset() when the list restarts (filters changed).
 */
export function usePatches() {
  const [patches, setPatches] = useState({});
  const patch = useCallback((id, change) => setPatches((s) => ({ ...s, [id]: { ...s[id], ...change } })), []);
  const reset = useCallback(() => setPatches({}), []);
  const apply = useCallback((items) => items.map((i) => (patches[i.id] ? { ...i, ...patches[i.id] } : i)), [patches]);
  return { patch, apply, reset };
}
