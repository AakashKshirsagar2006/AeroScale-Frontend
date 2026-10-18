/**
 * The ONLY place that knows the backend's exact field names (including its quirks).
 * If the backend DTOs are renamed or cleaned up, this is the one file to touch.
 */

/** Backend response -> the session shape the rest of the app uses. */
export function toSession(data) {
  return {
    user: {
      id: data.uuid ?? data.UUID ?? data.id,
      email: data.email,
      role: data.role,
    },
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresInSec: Number(data.expiresInSec ?? data.ExpiresInSec ?? 900),
  };
}

/** Form values -> RegisterRequest body. */
export function toRegisterBody(form) {
  const dobIso = `${form.dob}T00:00:00Z`;
  const body = {
    email: form.email.trim(),
    password: form.password,
    phoneNo: form.phoneNo,
    role: form.role,
    fullName: form.fullName.trim(),
    // Backend field is `DOB`; Jackson reads it as `dob`. Both are sent so either spelling works.
    dob: dobIso,
    DOB: dobIso,
  };
  if (form.role === 'SELLER') {
    body.bussinessAdress = form.bussinessAdress.trim(); // sic: spelled this way in the backend DTO
    body.wareHousePinCode = form.wareHousePinCode.trim();
  }
  return body;
}

export const toLoginBody = ({ email, password }) => ({ email: email.trim(), password });
