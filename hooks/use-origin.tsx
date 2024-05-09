import { useState, useEffect } from "react";

export const useOrigin = () => {
  const [mounted, setMounted] = useState(false);

  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : ""; //check if window is available and get the origin if it exists

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return "";

  return origin;
};
