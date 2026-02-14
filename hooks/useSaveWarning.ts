import { useState, useCallback, startTransition } from 'react';

interface SaveWarningState {
  open: boolean;
  formData: FormData | null;
  missingFields: string[];
}

const CLOSED: SaveWarningState = { open: false, formData: null, missingFields: [] };

/**
 * Manages pre-save warning dialog state for admin forms.
 * Checks for missing optional fields and shows a confirmation dialog
 * before submitting if any are empty.
 */
export function useSaveWarning(formAction: (formData: FormData) => void) {
  const [state, setState] = useState<SaveWarningState>(CLOSED);

  const requestSave = useCallback((fd: FormData, missing: string[]) => {
    if (missing.length > 0) {
      setState({ open: true, formData: fd, missingFields: missing });
    } else {
      startTransition(() => formAction(fd));
    }
  }, [formAction]);

  const confirm = useCallback(() => {
    if (state.formData) {
      startTransition(() => formAction(state.formData!));
    }
    setState(CLOSED);
  }, [state.formData, formAction]);

  const cancel = useCallback(() => {
    setState(CLOSED);
  }, []);

  return {
    showWarning: state.open,
    missingFields: state.missingFields,
    requestSave,
    confirm,
    cancel,
  };
}
