/** Backend field-name quirks live here: PhoneNo -> phoneNo, isDefault -> `default`, Dob -> dob. */
export const toAddress = (r) => ({
  id: r.id,
  label: r.label,
  recipientName: r.recipientName,
  phoneNo: r.recipientPhoneNo,
  addressLine1: r.addressLine1,
  addressLine2: r.addressLine2 ?? '',
  city: r.city,
  state: r.state,
  country: r.country,
  pincode: r.pincode,
  isDefault: Boolean(r.default ?? r.isDefault), // Lombok turns `boolean isDefault` into the JSON key `default`
});

export const toAddressBody = (f) => ({
  label: f.label,
  recipientName: f.recipientName,
  phoneNo: f.phoneNo,
  PhoneNo: f.phoneNo,
  addressLine1: f.addressLine1,
  addressLine2: f.addressLine2,
  city: f.city,
  state: f.state,
  country: f.country,
  pincode: f.pincode,
  default: f.isDefault,
  isDefault: f.isDefault,
});

export const toProfile = (r) => ({
  id: r.id,
  fullName: r.fullName,
  email: r.email,
  dob: r.dob ?? null,
  walletBalance: Number(r.walletBalance ?? 0),
  loyaltyPoint: r.loyaltyPoint ?? 0,
});

export const toProfileBody = ({ fullName, dob }) => {
  const iso = `${dob}T00:00:00Z`;
  return { fullName, dob: iso, Dob: iso };
};
