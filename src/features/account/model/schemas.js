import { z } from 'zod';

const required = (label, max = 50) => z.string().trim().min(1, `Enter ${label}`).max(max, `Keep ${label} under ${max} characters`);

export const addressSchema = z.object({
  label: z.enum(['HOME', 'WORK', 'OTHER']),
  recipientName: required('the recipient name'),
  phoneNo: z.string().min(1, 'Enter a phone number')
    .transform((s) => s.replace(/[\s()-]/g, ''))
    .pipe(z.string().regex(/^\+?[1-9]\d{7,14}$/, 'Use international format, for example +919876543210')),
  addressLine1: required('the address', 255),
  addressLine2: z.string().trim().max(250, 'Keep this under 250 characters'),
  city: required('the city'),
  state: required('the state'),
  country: required('the country'),
  pincode: z.string().trim().regex(/^[1-9][0-9]{5}$/, 'Enter a valid 6-digit pincode'),
  isDefault: z.boolean(),
});

export const profileSchema = z.object({
  fullName: required('your name', 150),
  dob: z.string().min(1, 'Enter your date of birth')
    .refine((v) => !Number.isNaN(Date.parse(v)) && new Date(v) < new Date(), 'Date of birth must be in the past'),
});
