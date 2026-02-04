import { useEffect, useRef } from 'react';
import { useToast } from './ToastProvider';

export function useFormToast(
  state: { success?: boolean; error?: string },
  successMessage: string
) {
  const { toast } = useToast();
  const prevStateRef = useRef(state);

  useEffect(() => {
    if (state !== prevStateRef.current) {
      if (state.success) toast(successMessage);
      if (state.error) toast(state.error, 'error');
      prevStateRef.current = state;
    }
  }, [state, toast, successMessage]);
}
