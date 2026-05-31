import { useEffect, useState } from "react";
import { sessionService } from "@/services/sessionService";

export function useSession(id: string | null) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoading(true);

      const { data, error } = await sessionService.getById(id);

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      setData(data);
      setLoading(false);
    })();
  }, [id]);

  return { data, loading };
}