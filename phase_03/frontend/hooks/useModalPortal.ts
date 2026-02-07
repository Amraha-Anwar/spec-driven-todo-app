import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export function useModalPortal(component: React.ReactNode, container?: HTMLElement) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const target = container || document.body;
  return createPortal(component, target);
}