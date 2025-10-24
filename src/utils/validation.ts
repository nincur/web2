import { z } from 'zod';

// Validation schema for ticket submission
export const ticketSchema = z.object({
  idNumber: z
    .string()
    .min(1, 'ID number is required')
    .max(20, 'ID number must not exceed 20 characters'),
  numbers: z
    .string()
    .min(1, 'Numbers are required')
    .transform((val) => {
      // Split by comma and parse
      const nums = val.split(',').map((n) => {
        const trimmed = n.trim();
        return parseInt(trimmed, 10);
      });
      return nums;
    })
    .refine(
      (nums) => nums.length >= 6 && nums.length <= 10,
      'You must select between 6 and 10 numbers'
    )
    .refine(
      (nums) => nums.every((n) => !isNaN(n) && n >= 1 && n <= 45),
      'All numbers must be between 1 and 45'
    )
    .refine(
      (nums) => new Set(nums).size === nums.length,
      'Numbers must be unique (no duplicates)'
    ),
});

// Validation schema for store-results endpoint
export const storeResultsSchema = z.object({
  numbers: z
    .array(z.number())
    .min(1, 'At least one number is required'),
});

export type TicketInput = z.infer<typeof ticketSchema>;
export type StoreResultsInput = z.infer<typeof storeResultsSchema>;
