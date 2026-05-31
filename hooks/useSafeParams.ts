"use client";

import { useParams } from "next/navigation";

export function useSafeParams() {
  const params = useParams();

  const id = params?.id?.toString;

  return {
    id: Array.isArray(id) ? id[0] : id ?? null,
  };
}