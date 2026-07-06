import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getAdminSettings,
  getPublicSettings,
  StoreSettingsPayload,
  updateStoreSettings,
} from "@/services/settings.service";

export const settingsKeys = {
  all: ["settings"] as const,
  public: () => [...settingsKeys.all, "public"] as const,
  admin: () => [...settingsKeys.all, "admin"] as const,
};

export const usePublicSettings = () => {
  return useQuery({
    queryKey: settingsKeys.public(),
    queryFn: getPublicSettings,
    staleTime: 1000 * 60 * 5,
  });
};

export const useAdminSettings = () => {
  return useQuery({
    queryKey: settingsKeys.admin(),
    queryFn: getAdminSettings,
  });
};

export const useUpdateStoreSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StoreSettingsPayload) => updateStoreSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.all,
      });
    },
  });
};
