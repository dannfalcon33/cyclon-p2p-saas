"use server";

import { getAuthenticatedWorkspace } from "@/lib/auth/session";
import {
  getMerchantDashboardMetrics,
  DashboardMetricsOptions,
  MerchantDashboardMetrics,
} from "@/lib/services/metrics-service";

/**
 * Server Action para obtener métricas del dashboard del comerciante autenticado
 */
export async function getDashboardMetricsAction(
  options: DashboardMetricsOptions = {}
): Promise<MerchantDashboardMetrics> {
  const { workspace } = await getAuthenticatedWorkspace();
  return getMerchantDashboardMetrics(workspace.id, options);
}
