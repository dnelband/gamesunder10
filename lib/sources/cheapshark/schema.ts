import { z } from "zod";

export const cheapsharkDealSchema = z.object({
  dealID: z.string(),
  internalName: z.string(),
  title: z.string(),
  storeID: z.string(),
  salePrice: z.string(),
  normalPrice: z.string(),
  savings: z.string(),
  steamAppID: z.string().nullable(),
  thumb: z.string(),
  releaseDate: z.coerce.number(),
  metacriticScore: z.string(),
  steamRatingPercent: z.string(),
});

export const cheapsharkDealsResponseSchema = z.array(cheapsharkDealSchema);

export const cheapsharkStoreSchema = z.object({
  storeID: z.string(),
  storeName: z.string(),
});

export const cheapsharkStoresResponseSchema = z.array(cheapsharkStoreSchema);

export type CheapsharkDeal = z.infer<typeof cheapsharkDealSchema>;
