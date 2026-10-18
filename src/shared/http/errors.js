// No imports on purpose: this file is pure logic and easy to test.

const FIELD_ALIASES = { DOB: 'dob' }; // backend field name -> form field name

/** The one JSON error the backend sends: an expired (not invalid) access token. */
export const isTokenExpired = (error) =>
  error?.response?.status === 401 && error.response.data?.error === 'TOKEN_EXPIRED';

/** True when the server (or us, with no token) says the session is over, as opposed to a flaky network. */
export function isSessionRejected(error) {
  return error?.code === 'NO_REFRESH_TOKEN' || Boolean(error?.response);
}

/** Spring's validation failure arrives as one long Java string. Pull the field -> message pairs out of it. */
function parseValidationText(text) {
  const fieldErrors = {};
  for (const chunk of text.split('Field error in object').slice(1)) {
    const field = chunk.match(/on field '([^']+)'/)?.[1];
    const messages = [...chunk.matchAll(/default message \[([^\]]*)\]/g)];
    const message = messages.at(-1)?.[1];
    if (field && message) fieldErrors[FIELD_ALIASES[field] ?? field] = message;
  }
  return fieldErrors;
}

/**
 * Turns anything axios throws into { status, message, code, fieldErrors }.
 * The backend replies with plain text for most errors and JSON for TOKEN_EXPIRED.
 */
export function parseApiError(error) {
  const res = error?.response;
  if (!res) {
    if (error && !error.isAxiosError && error.message) return { status: 0, message: error.message, code: error.code, fieldErrors: {} };
    return { status: 0, message: "Can't reach the server. Check your connection and try again.", fieldErrors: {} };
  }
  const { status, data } = res;

  if (status === 400 && data?.errors && typeof data.errors === 'object') {
    // ProblemDetail with an `errors` map (field -> message), sent by the product module
    const first = Object.values(data.errors)[0];
    return { status, message: first ?? data.detail ?? 'Check the highlighted fields and try again.', fieldErrors: data.errors };
  }
  if (status === 400 && typeof data === 'string') {
    const fieldErrors = parseValidationText(data);
    const first = Object.values(fieldErrors)[0];
    return { status, message: first ?? 'Check the highlighted fields and try again.', fieldErrors };
  }
  if (status === 401 || status === 403) {
    const text = typeof data === 'string' ? data : data?.detail ?? data?.message;
    return { status, message: text?.trim() || 'You are not signed in. Please log in and try again.', code: data?.error, fieldErrors: {} };
  }
  const text = typeof data === 'string' ? data : data?.detail ?? data?.message;
  if (status >= 500 || !text) {
    return { status, message: 'Something went wrong on our side. Try again in a moment.', fieldErrors: {} };
  }
  return { status, message: text.trim(), fieldErrors: {} };
}
