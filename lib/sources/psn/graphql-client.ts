import {
  getPsnDealsCategoryId,
  getPsnGraphqlHash,
  getPsnLocale,
  PSN_GRAPHQL_URL,
} from "./config";
import {
  psnCategoryGridResponseSchema,
  type PsnProduct,
} from "./schema";

interface CategoryGridVariables {
  id: string;
  pageArgs: { size: number; offset: number };
  sortBy: null;
  filterBy: string[];
  facetOptions: string[];
}

export async function fetchPsnDealsPage(
  offset: number,
  pageSize: number,
): Promise<PsnProduct[]> {
  const variables: CategoryGridVariables = {
    id: getPsnDealsCategoryId(),
    pageArgs: { size: pageSize, offset },
    sortBy: null,
    filterBy: [],
    facetOptions: [],
  };

  const response = await fetch(PSN_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-apollo-operation-name": "categoryGridRetrieve",
      "Accept-Language": getPsnLocale(),
    },
    body: JSON.stringify({
      operationName: "categoryGridRetrieve",
      variables,
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash: getPsnGraphqlHash(),
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`PSN GraphQL fetch failed: ${response.status}`);
  }

  const json: unknown = await response.json();

  if (
    typeof json === "object" &&
    json !== null &&
    "errors" in json &&
    Array.isArray(json.errors) &&
    json.errors.length > 0
  ) {
    const message = json.errors
      .map((error) =>
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
          ? error.message
          : "Unknown GraphQL error",
      )
      .join("; ");
    throw new Error(`PSN GraphQL errors: ${message}`);
  }

  const parsed = psnCategoryGridResponseSchema.parse(json);
  return parsed.data.categoryGridRetrieve.products;
}
