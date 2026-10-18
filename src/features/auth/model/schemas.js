import { z } from 'zod';

/** Mirrors the backend's rules exactly (8-19 chars, one of each class, specials from @#$%^&+=!). */
export const PASSWORD_RULES = [
  { id: 'len', label: '8 to 19 characters', test: (p) => p.length >= 8 && p.length <= 19 },
  { id: 'lower', label: 'A lowercase letter', test: (p) => /[a-z]/.test(p) },
  { id: 'upper', label: 'An uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { id: 'digit', label: 'A number', test: (p) => /\d/.test(p) },
  { id: 'special', label: 'One of @ # $ % ^ & + = !', test: (p) => /[@#$%^&+=!]/.test(p) },
];
const passwordOk = (v) => PASSWORD_RULES.every((r) => r.test(v));

const email = (max) =>
  z.string().trim().min(1, 'Enter your email').max(max, `Email can be at most ${max} characters`).email('Enter a valid email address');

const strongPassword = (message) => z.string().min(1, 'Enter your password').refine(passwordOk, message);

export const loginSchema = z.object({
  email: email(50),
  // The backend validates the password format on login too, so we catch it here with a readable message.
  password: strongPassword('Passwords have 8 to 19 characters with upper and lower case, a number and a special character'),
});

export const registerSchema = z
  .object({
    role: z.enum(['BUYER', 'SELLER']),
    fullName: z.string().trim().min(1, 'This field is required').max(250, 'Keep it under 250 characters'),
    email: email(254),
    phoneNo: z
      .string()
      .min(1, 'Enter your phone number')
      .transform((s) => s.replace(/[\s()-]/g, ''))
      .pipe(z.string().regex(/^\+?[1-9]\d{7,14}$/, 'Use international format, for example +919876543210')),
    dob: z
      .string()
      .min(1, 'Enter your date of birth')
      .refine((v) => !Number.isNaN(Date.parse(v)) && new Date(v) < new Date(), 'Date of birth must be in the past'),
    password: strongPassword('Password does not meet all the rules below'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
    bussinessAdress: z.string().trim().max(500, 'Keep the address under 500 characters'),
    wareHousePinCode: z.string().trim(),
  })
  .superRefine((v, ctx) => {
    if (v.password !== v.confirmPassword) {
      ctx.addIssue({ code: 'custom', path: ['confirmPassword'], message: 'Passwords do not match' });
    }
    if (v.role === 'SELLER') {
      if (!v.bussinessAdress) ctx.addIssue({ code: 'custom', path: ['bussinessAdress'], message: 'Enter your business address' });
      if (!/^\d{6}$/.test(v.wareHousePinCode)) ctx.addIssue({ code: 'custom', path: ['wareHousePinCode'], message: 'Enter a 6-digit pincode' });
    }
  });
