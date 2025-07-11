import { useEffect, useState } from "react";
import Papa from "papaparse";

export function useGoogleSheet(csvUrl: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(csvUrl)
      .then(res => res.text())
      .then(csv => {
        const parsed = Papa.parse(csv, { header: true });
        setData(parsed.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [csvUrl]);

  return { data, loading, error };
} 