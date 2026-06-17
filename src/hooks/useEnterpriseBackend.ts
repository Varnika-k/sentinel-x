import { useEffect, useState } from 'react';

export function useEnterpriseBackend() {
  const [fabricStats, setFabricStats] = useState<any>(null);
  const [executiveSummary, setExecutiveSummary] = useState<any>(null);
  const [cognition, setCognition] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [
          fabricRes,
          executiveRes,
          cognitionRes,
          usersRes
        ] = await Promise.all([
          fetch('/api/v3/fabric/stats'),
          fetch('/api/v2/enterprise-os/executive-summaries'),
          fetch('/api/v2/cognition/status'),
          fetch('/api/v1/identity/users')
        ]);

        const fabric = await fabricRes.json();
        const executive = await executiveRes.json();
        const cognition = await cognitionRes.json();
        const identities = await usersRes.json();

        setFabricStats(fabric.stats);
        setExecutiveSummary(executive);
        setCognition(cognition);
        setUsers(identities.users || []);
      } catch (err) {
        console.error(err);
      }
    }

    load();
  }, []);

  return {
    fabricStats,
    executiveSummary,
    cognition,
    users
  };
}
