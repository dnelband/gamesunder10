import { z } from "zod";

const psnMediaSchema = z.object({
  role: z.string(),
  type: z.string(),
  url: z.string(),
});

const psnPriceSchema = z.object({
  basePrice: z.string(),
  discountText: z.string().nullable(),
  discountedPrice: z.string(),
  isFree: z.boolean(),
});

export const psnProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  platforms: z.array(z.string()),
  storeDisplayClassification: z.string(),
  npTitleId: z.string().nullable().optional(),
  media: z.array(psnMediaSchema).default([]),
  price: psnPriceSchema,
});

export const psnCategoryGridResponseSchema = z.object({
  data: z.object({
    categoryGridRetrieve: z.object({
      products: z.array(psnProductSchema),
    }),
  }),
});

export type PsnProduct = z.infer<typeof psnProductSchema>;
