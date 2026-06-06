import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  categoryService,
  adService,
  providerService,
} from "@/services/listingService";
import type { Category, Ad, UnifiedListing } from "@/types";

interface DataContextType {
  categories: Category[];
  ads: Ad[];
  providers: UnifiedListing[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [providers, setProviders] = useState<UnifiedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [catsRes, adsRes, provRes] = await Promise.all([
        categoryService.getAll(),
        adService.getAll(),
        providerService.getListings({ limit: 20 }),
      ]);

      if (catsRes.success) setCategories(catsRes.data || []);
      if (adsRes.success) setAds(adsRes.data || []);
      if (provRes.success) setProviders(provRes.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <DataContext.Provider
      value={{ categories, ads, providers, loading, error, refetch: fetchData }}
    >
      {children}
    </DataContext.Provider>
  );
}

export const useGlobalData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useGlobalData must be used within DataProvider");
  return ctx;
};
