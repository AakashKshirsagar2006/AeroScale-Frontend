import { z } from 'zod';

export const sellerProfileSchema = z.object({
  businessName: z.string().trim().min(1, 'Enter your business name').max(50, 'Keep it under 50 characters'),
  dob: z.string().min(1, 'Enter your date of birth')
    .refine((v) => !Number.isNaN(Date.parse(v)) && new Date(v) < new Date(), 'Date of birth must be in the past'),
  address: z.string().trim().max(150, 'Keep it under 150 characters'),
  pincode: z.string().trim().refine((v) => v === '' || /^[1-9][0-9]{5}$/.test(v), 'Enter a valid 6-digit pincode'),
});
