import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const bookingSchema = z.object({
  serviceId: z.string().min(1, "Please select a service"),
  stylistId: z.string().optional(),
  date: z.string().min(1, "Please select a date"),
  startTime: z.string().min(1, "Please select a time"),
  notes: z.string().optional(),
  paymentMethod: z.enum(["deposit", "full", "later"]),
});

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  categoryId: z.string().min(1, "Category is required"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  hairTexture: z.string().optional(),
  hairLength: z.string().optional(),
  hairColor: z.string().optional(),
});

export const consultationSchema = z.object({
  hairConcerns: z.string().min(10, "Please describe your hair concerns in detail"),
  desiredHairstyle: z.string().optional(),
  hairType: z.enum(["STRAIGHT", "WAVY", "CURLY", "COILY", "KINKY", "KINKY_COILY", "OTHER"]).optional(),
  additionalNotes: z.string().optional(),
});

export const reviewSchema = z.object({
  rating: z.number().min(1, "Rating is required").max(5, "Rating must be at most 5"),
  title: z.string().optional(),
  comment: z.string().min(10, "Review must be at least 10 characters"),
});

export const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
});

export const serviceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  duration: z.number().positive("Duration must be positive"),
  price: z.number().positive("Price must be positive"),
  depositAmount: z.number().optional(),
  categoryId: z.string().min(1, "Category is required"),
  isActive: z.boolean().default(true),
  isPopular: z.boolean().default(false),
});

export const stylistSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  bio: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  experience: z.number().int().min(0).optional(),
});

export const giftCardSchema = z.object({
  amount: z.number().min(1000, "Minimum gift card amount is ₦1,000"),
  recipientName: z.string().min(1, "Recipient name is required"),
  recipientEmail: z.string().email("Valid email required"),
  message: z.string().optional(),
});

export const membershipSchema = z.object({
  tier: z.enum(["BRONZE", "SILVER", "GOLD", "PLATINUM"]),
});
