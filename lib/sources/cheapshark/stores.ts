import cachedStores from "./stores.json";

export function getCachedStoreNames(): Map<string, string> {
  return new Map(
    cachedStores.map((store) => [store.storeID, store.storeName]),
  );
}
