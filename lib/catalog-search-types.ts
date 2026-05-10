export type CatalogSearchProductHit = {
  id: string;
  name: string;
  category: string;
  city: string;
  price: number;
  imageUrl: string | null;
};

export type CatalogSearchResponse = {
  query: string;
  products: CatalogSearchProductHit[];
  categories: string[];
  total: number;
};
