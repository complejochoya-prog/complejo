import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

function getNumericPrice(item) {
    if (!item) return 0;
    const raw = item.precio ?? item.price ?? item.precioOriginal ?? item.monto ?? 0;
    const val = Number(raw);
    return isNaN(val) ? 0 : val;
}

function getNumericQuantity(item) {
    if (!item) return 0;
    const raw = item.quantity ?? item.cantidad ?? 0;
    const val = Number(raw);
    return isNaN(val) ? 0 : val;
}

export function CartProvider({ children }) {
    const [cart, setCart] = useState(() => {
        try {
            const stored = localStorage.getItem('giovanni_cart');
            if (stored) {
                const parsed = JSON.parse(stored);
                return parsed.map(item => {
                    const price = getNumericPrice(item);
                    const quantity = getNumericQuantity(item);
                    return { ...item, precio: price, price: price, quantity: quantity };
                });
            }
        } catch (e) {
            console.warn('[useCart] Error parsing stored cart:', e);
        }
        return [];
    });

    useEffect(() => {
        try {
            localStorage.setItem('giovanni_cart', JSON.stringify(cart));
        } catch {}
    }, [cart]);

    // Escuchar cambios de localStorage en otras pestañas o componentes
    useEffect(() => {
        const handleStorageChange = () => {
            try {
                const stored = localStorage.getItem('giovanni_cart');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setCart(parsed.map(item => ({
                        ...item,
                        precio: getNumericPrice(item),
                        price: getNumericPrice(item),
                        quantity: getNumericQuantity(item)
                    })));
                } else {
                    setCart([]);
                }
            } catch (e) {
                console.warn('[useCart] Error syncing cart:', e);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('giovanni_cart_sync', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('giovanni_cart_sync', handleStorageChange);
        };
    }, []);

    const addToCart = React.useCallback((product) => {
        if (!product) return;
        const priceVal = getNumericPrice(product);
        setCart(prev => {
            const rawId = product.id;
            const targetId = (rawId && String(rawId) !== 'undefined' && String(rawId) !== 'null' && String(rawId).trim() !== '')
                ? String(rawId)
                : (product.nombre ? `prod-${product.nombre.toLowerCase().replace(/\s+/g, '_')}` : `prod-${Date.now()}`);
            const exists = prev.find(item => String(item.id) === targetId);
            if (exists) {
                return prev.map(item => {
                    if (String(item.id) === targetId) {
                        const currentPrice = getNumericPrice(item) || priceVal;
                        return {
                            ...item,
                            precio: currentPrice,
                            price: currentPrice,
                            quantity: getNumericQuantity(item) + 1
                        };
                    }
                    return item;
                });
            }
            return [...prev, {
                ...product,
                id: product.id ?? targetId,
                precio: priceVal,
                price: priceVal,
                quantity: 1,
                observaciones: ''
            }];
        });
    }, []);

    const removeFromCart = React.useCallback((productId) => {
        const targetId = String(productId);
        setCart(prev => prev.filter(item => String(item.id) !== targetId));
    }, []);

    const updateQuantity = React.useCallback((productId, delta) => {
        const targetId = String(productId);
        setCart(prev => prev.map(item => {
            if (String(item.id) === targetId) {
                const newQty = Math.max(1, getNumericQuantity(item) + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    }, []);

    const updateObservaciones = React.useCallback((productId, obs) => {
        const targetId = String(productId);
        setCart(prev => prev.map(item => 
            String(item.id) === targetId ? { ...item, observaciones: obs } : item
        ));
    }, []);

    const clearCart = React.useCallback(() => {
        setCart([]);
    }, []);

    const cartTotal = cart.reduce((acc, item) => acc + (getNumericPrice(item) * getNumericQuantity(item)), 0);
    const cartCount = cart.reduce((acc, item) => acc + getNumericQuantity(item), 0);

    return (
        <CartContext.Provider value={{ 
            cart, 
            addToCart, 
            removeFromCart, 
            updateQuantity, 
            updateObservaciones, 
            clearCart,
            cartTotal,
            cartCount
        }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
