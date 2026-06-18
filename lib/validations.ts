import { z } from "zod";

export const CartItemSchema = z.object({
  scheduleId: z.string().uuid(),
  menuItemId: z.string().uuid(),
  kitchenId: z.string().uuid(),
  dishName: z.string().min(1),
  price: z.number().positive(),
  deliveryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const OrderCheckoutSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerPhone: z.string().regex(
    /^\+?[1-9]\d{1,14}$/,
    "Enter a valid phone number (e.g. +1 555 000 0000)"
  ),
  customerEmail: z
    .string()
    .email("Enter a valid email address")
    .optional()
    .or(z.literal("")),
  deliveryStreet: z.string().min(5, "Enter a full street address"),
  deliveryCity: z.string().min(2, "Enter a city"),
  deliveryZip: z.string().length(5, "ZIP code must be exactly 5 digits"),
  scheduleId: z.string().uuid(),
  quantity: z
    .number({ error: "Enter a quantity between 1 and 15" })
    .int()
    .min(1, "Minimum 1 meal")
    .max(15, "Maximum 15 meals per order"),
  timeSlot: z.enum(["early", "late"]),
  stripePaymentMethodId: z.string().min(1),
});

export type CartItem = z.infer<typeof CartItemSchema>;
export type OrderCheckoutInput = z.infer<typeof OrderCheckoutSchema>;
