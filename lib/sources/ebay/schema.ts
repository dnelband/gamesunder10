import { z } from "zod";

const moneySchema = z.object({
  value: z.string(),
  currency: z.string(),
});

const imageSchema = z
  .object({
    imageUrl: z.string().optional(),
  })
  .optional();

export const ebayItemSummarySchema = z.object({
  itemId: z.string(),
  title: z.string(),
  itemWebUrl: z.string().optional(),
  itemAffiliateWebUrl: z.string().optional(),
  price: moneySchema.optional(),
  condition: z.string().optional(),
  conditionId: z.string().optional(),
  categories: z
    .array(
      z.object({
        categoryId: z.string().optional(),
        categoryName: z.string().optional(),
      }),
    )
    .optional(),
  image: imageSchema,
  thumbnailImages: z.array(z.object({ imageUrl: z.string() })).optional(),
  seller: z
    .object({
      username: z.string().optional(),
    })
    .optional(),
  buyingOptions: z.array(z.string()).optional(),
});

export const ebaySearchResponseSchema = z.object({
  href: z.string().optional(),
  total: z.number().optional(),
  next: z.string().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
  itemSummaries: z.array(ebayItemSummarySchema).optional(),
});

export type EbayItemSummary = z.infer<typeof ebayItemSummarySchema>;
export type EbaySearchResponse = z.infer<typeof ebaySearchResponseSchema>;
