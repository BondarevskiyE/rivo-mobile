import {useCallback, useEffect, useRef} from 'react';

export function useIsMounted(): boolean {
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  const mounted = useCallback(() => {
    return isMounted.current;
  }, []);

  return mounted();
}
