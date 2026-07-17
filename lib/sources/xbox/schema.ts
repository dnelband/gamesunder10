import { z } from "zod";

const emeraldPriceEntrySchema = z.object({
  listPrice: z.number(),
  msrp: z.number(),
  discountPercentage: z.number().optional(),
  currency: z.string(),
});

const emeraldSpecificPricesSchema = z.object({
  purchaseable: z.array(emeraldPriceEntrySchema).optional(),
});

const emeraldImagesSchema = z.object({
  poster: z
    .object({
      url: z.string(),
    })
    .optional(),
});

export const emeraldProductSummarySchema = z.object({
  productId: z.string(),
  title: z.string(),
  productKind: z.string(),
  availableOn: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  description: z.string().nullable().optional(),
  shortDescription: z.string().nullable().optional(),
  averageRating: z.number().nullable().optional(),
  releaseDate: z.string().nullable().optional(),
  images: emeraldImagesSchema.nullable().optional(),
  specificPrices: emeraldSpecificPricesSchema.nullable().optional(),
});

const emeraldChannelSchema = z.object({
  channelKey: z.string().optional(),
  totalItems: z.number().optional(),
  products: z.array(z.object({ productId: z.string() })).optional(),
});

export const emeraldBrowseResponseSchema = z.object({
  channels: z.record(z.string(), emeraldChannelSchema).optional(),
  productSummaries: z.array(emeraldProductSummarySchema).optional(),
});

export type EmeraldProductSummary = z.infer<typeof emeraldProductSummarySchema>;
