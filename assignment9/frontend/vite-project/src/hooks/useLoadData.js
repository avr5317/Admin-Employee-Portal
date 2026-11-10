import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

// Runs an existing Redux thunk on mount (when enabled) and reports a simple status:
// 'idle' | 'loading' | 'ready' | 'error'. Call reload() to run it again.
// This only dispatches the thunk; it does not change any Redux logic.
export default function useLoadData(thunk, enabled = true) {
  const dispatch = useDispatch();
  const [status, setStatus] = useState(enabled ? 'loading' : 'idle');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return undefined;
    let active = true;
    setStatus('loading');
    dispatch(thunk()).then((action) => {
      if (active) setStatus(thunk.rejected.match(action) ? 'error' : 'ready');
    });
    return () => {
      active = false;
    };
  }, [dispatch, thunk, enabled, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  return { status: enabled ? status : 'idle', reload };
}
