import { api } from "@/lib/api";
import type { PublicCourse, PublicResource, PublicTenant } from "@/types";

export const TENANT_SLUG = "chemistry-with-tahsan";

export async function getPublicTenant(): Promise<PublicTenant | null> {
  try {
    return await api.get<PublicTenant>(`/public/tenant/${TENANT_SLUG}`, undefined, false);
  } catch {
    return null;
  }
}

export async function getPublicCourses(): Promise<PublicCourse[]> {
  try {
    const res = await api.get<PublicCourse[] | { data: PublicCourse[] }>(
      `/public/tenant/${TENANT_SLUG}/courses`,
      undefined,
      false
    );
    return Array.isArray(res) ? res : res.data;
  } catch {
    return [];
  }
}

export async function getPublicResources(): Promise<PublicResource[]> {
  try {
    const res = await api.get<PublicResource[] | { data: PublicResource[] }>(
      `/public/tenant/${TENANT_SLUG}/resources`,
      undefined,
      false
    );
    return Array.isArray(res) ? res : res.data;
  } catch {
    return [];
  }
}
