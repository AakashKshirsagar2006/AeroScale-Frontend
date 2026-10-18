import { z } from 'zod';

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // same limit as ProductController

export const STATUSES = [
  { value: 'DRAFT', label: 'Draft', text: 'Only you can see it.' },
  { value: 'ACTIVE', label: 'Active', text: 'Buyers can find and buy it.' },
  { value: 'ARCHIVED', label: 'Archived', text: 'Hidden from buyers.' },
];

const base = {
  name: z.string().trim().min(1, 'Give your product a name').max(100, 'Keep the name under 100 characters'),
  description: z.string().max(5000, 'Keep the description under 5000 characters'),
  price: z.coerce.number({ invalid_type_error: 'Enter a valid price' }).min(0.01, 'Price must be greater than 0').max(100000000, 'That price looks too high'),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']),
};

export const createProductSchema = z.object({
  ...base,
  initialStock: z.coerce.number({ invalid_type_error: 'Enter a number' }).int('Whole units only').min(0, 'Cannot be negative').max(1000000, 'That is a lot of stock'),
});
export const editProductSchema = z.object(base);

export const restockSchema = z.object({
  quantity: z.coerce.number({ invalid_type_error: 'Enter a number' }).int('Whole units only').min(1, 'Add at least 1 unit').max(1000000, 'Too many at once'),
});

/** Returns an error message for a bad photo, or null. */
export function imageProblem(file) {
  if (!file.type.startsWith('image/')) return 'Choose an image file (JPG, PNG or WebP).';
  if (file.size > MAX_IMAGE_BYTES) return 'The image must be 5 MB or smaller.';
  return null;
}
