import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { removeFromMyList, type SavedMovie } from "@/lib/api";
import { myListKeys } from "@/lib/queryKeys";

export function useRemoveFromMyList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeFromMyList,

    // 1. Runs immediately, before the server answers
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: myListKeys.all });
      const previous = queryClient.getQueryData<SavedMovie[]>(myListKeys.all);
      queryClient.setQueryData<SavedMovie[]>(myListKeys.all, (old) =>
        old?.filter((m) => m.id !== id),
      );
      return { previous }; // saved so we can roll back
    },

    // 2. If the server fails, put the old data back
    onError: (_error, _id, context) => {
      queryClient.setQueryData(myListKeys.all, context?.previous);
      toast.error("Could not remove the movie. It has been restored.");
    },

    onSuccess: () => toast.success("Removed from My List"),

    // 3. Either way, refetch so the cache matches the server
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: myListKeys.all }),
  });
}