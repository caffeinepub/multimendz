import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Booking, Service } from "../backend.d";
import { useActor } from "./useActor";

export function useServices() {
  const { actor, isFetching } = useActor();
  return useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllServices();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserBookings() {
  const { actor, isFetching } = useActor();
  return useQuery<Booking[]>({
    queryKey: ["user-bookings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserBookings();
    },
    enabled: !!actor && !isFetching,
  });
}
