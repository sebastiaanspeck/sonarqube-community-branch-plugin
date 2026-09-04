import { queryOptions, useQueries } from '@tanstack/react-query';
import { createQueryHook, StaleTime } from '~shared/queries/common';
import {
  combineEntitlementChecks,
  EntitlementCheckParams,
  notEntitled,
} from '~shared/queries/entitlement-checks';
import { EntitlementCheckFeatureKey } from '~shared/types/billing';
import { PurchaseableFeature } from '~sq-server-commons/types/editions';

/**
 * This plugin has no billing/licensing backend, so every feature resolves as not entitled.
 * Mirrors SonarSource's own community-edition stub (libs/sq-server-addons/src/feature-license/entitlements.ts),
 * which this addons barrel replaces wholesale via the setup.sh symlink.
 */
export const useEntitlementCheckQuery = createQueryHook((params: EntitlementCheckParams) =>
  queryOptions({
    queryKey: ['entitlement-check', params.featureKey, params.resourceType, params.resourceId],
    queryFn: () => Promise.resolve(notEntitled(params.featureKey)),
    staleTime: StaleTime.LIVE,
  }),
);

/** Fan-out stub mirroring the commercial API shape. */
export function useEntitlementChecksQuery(featureKeys: readonly EntitlementCheckFeatureKey[]) {
  const usableKeys = featureKeys.filter((key) => key.length > 0);

  return useQueries({
    queries: usableKeys.map((featureKey) =>
      queryOptions({
        queryKey: ['entitlement-check', featureKey],
        queryFn: () => Promise.resolve(notEntitled(featureKey)),
        staleTime: StaleTime.LIVE,
      }),
    ),
    combine: combineEntitlementChecks,
  });
}

/**
 * The `purchasable-features` endpoint returns nothing without a licensing backend, so no
 * feature is ever purchasable. Shape mirrors the commercial hook's `useQuery` result.
 */
export const usePurchasableFeature = createQueryHook((featureKey: string) =>
  queryOptions({
    queryKey: ['purchasable-feature', featureKey],
    queryFn: (): Promise<PurchaseableFeature[]> => Promise.resolve([]),
    select: (features): PurchaseableFeature | undefined =>
      features.find((f) => f.featureKey === featureKey),
    staleTime: StaleTime.NEVER,
  }),
);
