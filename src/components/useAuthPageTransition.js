import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const EXIT_DURATION_MS = 190;

export function useAuthPageTransition() {
  const navigate = useNavigate();
  const [isLeaving, setIsLeaving] = useState(false);
  const navigationTimer = useRef(null);

  useEffect(() => () => window.clearTimeout(navigationTimer.current), []);

  const switchPage = (event, path) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    event.preventDefault();
    if (isLeaving) return;

    setIsLeaving(true);
    navigationTimer.current = window.setTimeout(() => navigate(path), EXIT_DURATION_MS);
  };

  return { isLeaving, switchPage };
}
