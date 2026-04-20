import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const ScrollToTop = () => {
    const { pathname } = useLocation();
    const navType = useNavigationType();

    useEffect(() => {
        // Only scroll to top on PUSH (forward) or REPLACE
        // POP (back/forward button) should preserve scroll (handled by context if needed)
        if (navType !== 'POP') {
            window.scrollTo(0, 0);
        }
    }, [pathname, navType]);

    return null;
};

export default ScrollToTop;
