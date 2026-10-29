"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { StaffEnquiryView } from "@/lib/staff/enquiry-service";
import type { EnquiryStatus } from "@/lib/enquiry/status";
import { STATUS_LABEL } from "@/lib/enquiry/status";

export const ENQUIRIES_KEY = ["staff", "enquiries"] as const;

export interface EnquiriesPayload {
  items: StaffEnquiryView[];
  fetchedAt: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function readBody(response: Response): Promise<Record<string, unknown>> {
  try {
    const body = (await response.json()) as unknown;
    return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

const FALLBACK_ERROR = "We couldn’t reach the server just now. Nothing has been changed. Please try again.";

/** Live enquiry list. Refreshes every 30 seconds and when the staff member returns to the tab. */
export function useEnquiries() {
  return useQuery({
    queryKey: ENQUIRIES_KEY,
    queryFn: async ({ signal }): Promise<EnquiriesPayload> => {
      const response = await fetch("/api/staff/enquiries", {
        cache: "no-store",
        signal,
        headers: { accept: "application/json" },
      });
      const body = await readBody(response);
      if (!response.ok) {
        throw new ApiError(typeof body.error === "string" ? body.error : FALLBACK_ERROR, response.status);
      }
      return body as unknown as EnquiriesPayload;
    },
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    retry: (failureCount, error) => !(error instanceof ApiError && error.status < 500) && failureCount < 2,
  });
}

interface StatusVariables {
  id: string;
  status: EnquiryStatus;
  /** Name shown in the success message (parent name). Not stored anywhere else. */
  label: string;
  /** Bulk actions report one summary toast instead of one per row. */
  silent?: boolean;
}

/**
 * Status change with an optimistic update. The screen changes at once; if the server refuses,
 * the previous list is restored and a toast offers Retry.
 */
export function useStatusMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ id, status }: StatusVariables) => {
      const response = await fetch(`/api/staff/enquiries/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ status }),
      });
      const body = await readBody(response);
      if (!response.ok) throw new ApiError(typeof body.error === "string" ? body.error : FALLBACK_ERROR, response.status);
      return body;
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ENQUIRIES_KEY });
      const previous = queryClient.getQueryData<EnquiriesPayload>(ENQUIRIES_KEY);
      if (previous) {
        const now = new Date().toISOString();
        queryClient.setQueryData<EnquiriesPayload>(ENQUIRIES_KEY, {
          ...previous,
          items: previous.items.map((item) =>
            item.id === variables.id
              ? {
                  ...item,
                  status: variables.status,
                  contactedAt:
                    item.contactedAt ?? (item.status === "new" && variables.status !== "new" ? now : item.contactedAt),
                }
              : item,
          ),
        });
      }
      return { previous };
    },
    onError: (error, variables, context) => {
      if (context?.previous) queryClient.setQueryData(ENQUIRIES_KEY, context.previous);
      if (!variables.silent) {
        toast.error(error instanceof Error ? error.message : FALLBACK_ERROR, {
          description: "The change has been put back to what it was. Nothing was lost.",
          action: { label: "Retry", onClick: () => mutation.mutate(variables) },
        });
      }
    },
    onSuccess: (_data, variables) => {
      if (!variables.silent) {
        toast.success(`${variables.label} marked as ${STATUS_LABEL[variables.status]}`);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ENQUIRIES_KEY });
    },
  });

  return mutation;
}

interface DeleteVariables {
  id: string;
  label: string;
}

/** Admin only. The server refuses for anyone else, whatever the screen shows. */
export function useDeleteMutation() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({ id }: DeleteVariables) => {
      const response = await fetch(`/api/staff/enquiries/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { accept: "application/json" },
      });
      const body = await readBody(response);
      if (!response.ok) throw new ApiError(typeof body.error === "string" ? body.error : FALLBACK_ERROR, response.status);
      return body;
    },
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ENQUIRIES_KEY });
      const previous = queryClient.getQueryData<EnquiriesPayload>(ENQUIRIES_KEY);
      if (previous) {
        queryClient.setQueryData<EnquiriesPayload>(ENQUIRIES_KEY, {
          ...previous,
          items: previous.items.filter((item) => item.id !== id),
        });
      }
      return { previous };
    },
    onError: (error, variables, context) => {
      if (context?.previous) queryClient.setQueryData(ENQUIRIES_KEY, context.previous);
      toast.error(error instanceof Error ? error.message : FALLBACK_ERROR, {
        description: "The enquiry is still in the list.",
        action: { label: "Retry", onClick: () => mutation.mutate(variables) },
      });
    },
    onSuccess: (_data, variables) => {
      toast.success(`${variables.label}’s enquiry has been deleted`);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ENQUIRIES_KEY });
    },
  });
  return mutation;
}
