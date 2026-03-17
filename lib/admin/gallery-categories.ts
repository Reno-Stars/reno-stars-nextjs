import { getServicesFromDb } from '@/lib/db/queries';

export interface GalleryCategoryOption {
  value: string;
  label: string;
}

/** Fetch gallery category options from the services table. */
export async function getGalleryCategoryOptions(): Promise<GalleryCategoryOption[]> {
  const services = await getServicesFromDb();
  return services.map((s) => ({
    value: s.slug,
    label: s.title.en,
  }));
}
