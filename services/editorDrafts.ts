import { getCurrentUser } from './auth';

type DraftScope = 'lesson' | 'challenge';

const DRAFT_PREFIX = 'ftc_editor_draft_v1';

const getUserKey = () => getCurrentUser()?.id ?? 'anon';
const getDraftKey = (scope: DraftScope, id: string) => `${DRAFT_PREFIX}:${getUserKey()}:${scope}:${id}`;

export const loadEditorDraft = (scope: DraftScope, id: string): string | null => {
  try {
    return localStorage.getItem(getDraftKey(scope, id));
  } catch {
    return null;
  }
};

export const saveEditorDraft = (scope: DraftScope, id: string, code: string) => {
  try {
    localStorage.setItem(getDraftKey(scope, id), code);
  } catch {
    // ignore storage failures
  }
};

export const clearEditorDraft = (scope: DraftScope, id: string) => {
  try {
    localStorage.removeItem(getDraftKey(scope, id));
  } catch {
    // ignore storage failures
  }
};
