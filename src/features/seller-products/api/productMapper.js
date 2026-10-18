/** The only file that knows the seller product DTO field names. */
const num = (v) => (v == null ? null : Number(v));

export const toSellerProduct = (r) => ({
  id: r.id,
  name: r.name,
  description: r.description ?? '',
  price: Number(r.price),
  imageUrl: r.imageUrl ?? null,
  status: r.status, // DRAFT | ACTIVE | ARCHIVED
  createdAt: r.createdAt ? Date.parse(r.createdAt) : null,
  updatedAt: r.updatedAt ? Date.parse(r.updatedAt) : null,
  totalStock: num(r.totalStock),         // null = backend did not send it
  availableStock: num(r.availableStock ?? r.totalStock),
});

/**
 * Spring reads `@RequestPart("product")` as JSON, so it must travel as a Blob with its own content type.
 * `image` is optional: leave it out and the old photo stays.
 */
export function toProductFormData(form, image) {
  const body = { name: form.name.trim(), description: form.description.trim(), price: Number(form.price), status: form.status };
  const data = new FormData();
  data.append('product', new Blob([JSON.stringify(body)], { type: 'application/json' }));
  if (image) data.append('image', image);
  return data;
}
