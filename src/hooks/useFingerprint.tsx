"use client";

import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { useEffect, useState } from "react";

export default function useFingerprint() {
  const [loading, setLoading] = useState<boolean>(true);
  const [fingerprint, setFingerprint] = useState<string | null>(null);

  useEffect(() => {
    const getFingerprint = async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      setFingerprint(result.visitorId);
      setLoading(false);
    };
    getFingerprint();
  }, []);
  return { loading, fingerprint };
}
