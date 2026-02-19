import { useEffect, useRef } from 'react';
import { useToast } from './ToastProvider';

export function useFormToast(
  state: { success?: boolean; error?: string; renamedSlug?: string },
  successMessage: string,
  options?: { slugRenameLabel?: string }
) {
  const { toast } = useToast();
  const prevStateRef = useRef(state);

  useEffect(() => {
    if (state !== prevStateRef.current) {
      if (state.success) toast(successMessage);
      if (state.error) toast(state.error, 'error');
      if (state.renamedSlug) {
        const label = options?.slugRenameLabel ?? 'Slug auto-adjusted to';
        toast(`${label} "${state.renamedSlug}"`, 'warning');
      }
      prevStateRef.current = state;
    }
  }, [state, toast, successMessage, options?.slugRenameLabel]);
}
