import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false) // Default to false for SSR

  React.useEffect(() => {
    // Check only on the client-side
    const checkDevice = () => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    };

    // Initial check
    checkDevice();

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    // Listener for future changes
    mql.addEventListener("change", checkDevice);

    // Cleanup listener on component unmount
    return () => mql.removeEventListener("change", checkDevice);
  }, []) // Empty dependency array ensures this runs only once on mount (client-side)

  return isMobile
}
