/**
 * The ONLY place that knows the seller profile's backend field names (including the typos:
 * `bussinessName`, `bussinessAddress`, `wareHousePinCode`). Rename in the backend? Edit this file only.
 */
export const toSellerProfile = (r) => ({
  id: r.id,
  email: r.email ?? '',
  businessName: r.bussinessName ?? r.businessName ?? '',
  address: r.bussinessAddress ?? r.businessAddress ?? '',
  pincode: r.wareHousePinCode ?? r.wareHousePincode ?? '',
  dob: r.dob ?? r.DOB ?? r.dateOfBirth ?? null,
  verification: r.verificationStatus ?? r.sellerVerificationStatus ?? 'PENDING', // PENDING | VERIFIED | REJECTED | SUSPENDED
  rating: Number(r.rating ?? 0),
  totalOrders: Number(r.totalOrdersFullFilled ?? 0),
  totalRevenue: Number(r.totalRevenue ?? 0),
  flashSaleSlots: r.maxConcurrentFlashSaleSlots ?? 5,
  joinedAt: r.createdAt ? Date.parse(r.createdAt) : null,
});

/** Form -> UpdateProfileRequest. `DOB` is sent in both spellings, like the buyer module does. */
export function toProfileBody(f) {
  const iso = `${f.dob}T00:00:00Z`;
  return {
    bussinessName: f.businessName.trim(),
    dob: iso,
    DOB: iso,
    bussinessAddress: f.address.trim(),
    wareHousePincode: f.pincode.trim(), // sic: lower-case "c" in this request DTO
  };
}
