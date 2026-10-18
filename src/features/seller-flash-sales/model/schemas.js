import { z } from 'zod';
import { formatPrice } from '@/shared/lib/format';

/** Built per render because the checks depend on the product the seller picked. `products` = [{ id, price, availableStock }] */
export const saleSchema = (products) => z.object({
  productId: z.string().min(1, 'Choose a product'),
  salePrice: z.coerce.number({ invalid_type_error: 'Enter the sale price' }).min(0.01, 'Sale price must be at least ₹0.01'),
  totalQuantity: z.coerce.number({ invalid_type_error: 'Enter a number' }).int('Whole units only').min(1, 'Set aside at least 1 unit'),
  maxItemsPerUser: z.coerce.number({ invalid_type_error: 'Enter a number' }).int('Whole units only').min(1, 'At least 1 per customer'),
  startTime: z.string().min(1, 'Pick a start time'),
  endTime: z.string().min(1, 'Pick an end time'),
}).superRefine((v, ctx) => {
  const add = (path, message) => ctx.addIssue({ code: 'custom', path: [path], message });
  const p = products.find((x) => x.id === v.productId);
  if (p && v.salePrice >= p.price) add('salePrice', `Must be below the regular price (${formatPrice(p.price)})`);
  if (p && p.availableStock != null && v.totalQuantity > p.availableStock) add('totalQuantity', `Only ${p.availableStock} units are in stock`);
  if (v.maxItemsPerUser > v.totalQuantity) add('maxItemsPerUser', 'Cannot be more than the sale quantity');
  const start = Date.parse(v.startTime), end = Date.parse(v.endTime);
  if (v.startTime && start <= Date.now()) add('startTime', 'Start time must be in the future');
  if (v.endTime && end <= start) add('endTime', 'The sale must end after it starts');
});
