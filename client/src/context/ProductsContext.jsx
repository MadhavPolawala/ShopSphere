import React, { createContext, useState, useCallback, useRef } from 'react';
import API from '../api/axios';

export const ProductsContext = createContext();

export const ProductsProvider = ({ children }) => {
    // Cache: { [pageNumber]: { products, pages, total } }
    const pageCache = useRef({});
    const homeCache = useRef(null);

    // Current browsing state — persists across navigation
    const [currentPage, setCurrentPage] = useState(1);
    const [cachedProducts, setCachedProducts] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [productsLoading, setProductsLoading] = useState(false);

    // Featured products for Home page
    const [homeProducts, setHomeProducts] = useState([]);
    const [homeLoading, setHomeLoading] = useState(false);

    // Scroll positions keyed by pathname
    const scrollPositions = useRef({});

    const saveScrollPosition = useCallback((path, y) => {
        scrollPositions.current[path] = y;
    }, []);

    const restoreScrollPosition = useCallback((path) => {
        return scrollPositions.current[path] || 0;
    }, []);

    const fetchPage = useCallback(async (page) => {
        // Return cached data immediately if available
        if (pageCache.current[page]) {
            const cached = pageCache.current[page];
            setCachedProducts(cached.products);
            setTotalPages(cached.pages);
            setTotalCount(cached.total);
            setCurrentPage(page);
            return;
        }

        setProductsLoading(true);
        try {
            const { data } = await API.get(`/products?pageNumber=${page}`);
            const result = {
                products: data.products || [],
                pages: data.pages || 1,
                total: data.total ?? (data.products?.length || 0),
            };
            pageCache.current[page] = result;
            setCachedProducts(result.products);
            setTotalPages(result.pages);
            setTotalCount(result.total);
            setCurrentPage(page);
        } catch (error) {
            console.error('Products fetch error', error);
        } finally {
            setProductsLoading(false);
        }
    }, []);

    const fetchHomeProducts = useCallback(async () => {
        if (homeCache.current) {
            setHomeProducts(homeCache.current);
            return;
        }
        setHomeLoading(true);
        try {
            const { data } = await API.get('/products?pageNumber=1&pageSize=20');
            const list = (data.products || data || []).slice(0, 20);
            homeCache.current = list;
            setHomeProducts(list);
        } catch {
            setHomeProducts([]);
        } finally {
            setHomeLoading(false);
        }
    }, []);

    // Invalidate cache after admin edits etc.
    const invalidateProductsCache = useCallback(() => {
        pageCache.current = {};
        homeCache.current = null;
    }, []);

    return (
        <ProductsContext.Provider
            value={{
                // Products page state
                currentPage,
                cachedProducts,
                totalPages,
                totalCount,
                productsLoading,
                fetchPage,
                // Home page state
                homeProducts,
                homeLoading,
                fetchHomeProducts,
                // Scroll position helpers
                saveScrollPosition,
                restoreScrollPosition,
                // Cache management
                invalidateProductsCache,
            }}
        >
            {children}
        </ProductsContext.Provider>
    );
};
