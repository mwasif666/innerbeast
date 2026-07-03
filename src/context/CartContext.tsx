'use client'

// CartContext.tsx
import React, { createContext, useContext, useState, useReducer, useEffect } from 'react';
import { ProductType } from '@/type/ProductType';

interface CartItem extends ProductType {
    quantity: number
    selectedSize: string
    selectedColor: string
}

interface CartState {
    cartArray: CartItem[]
}

type CartAction =
    | { type: 'ADD_TO_CART'; payload: ProductType }
    | { type: 'REMOVE_FROM_CART'; payload: string }
    | {
        type: 'UPDATE_CART'; payload: {
            itemId: string; quantity: number, selectedSize: string, selectedColor: string
        }
    }
    | { type: 'LOAD_CART'; payload: CartItem[] }

interface CartContextProps {
    cartState: CartState;
    addToCart: (item: ProductType) => void;
    removeFromCart: (itemId: string) => void;
    updateCart: (itemId: string, quantity: number, selectedSize: string, selectedColor: string) => void;
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

const CART_STORAGE_KEY = 'innerbeast-cart';

const cartReducer = (state: CartState, action: CartAction): CartState => {
    switch (action.type) {
        case 'ADD_TO_CART':
            const newItem: CartItem = { ...action.payload, quantity: 1, selectedSize: '', selectedColor: '' };
            return {
                ...state,
                cartArray: [...state.cartArray, newItem],
            };
        case 'REMOVE_FROM_CART':
            return {
                ...state,
                cartArray: state.cartArray.filter((item) => item.id !== action.payload),
            };
        case 'UPDATE_CART':
            return {
                ...state,
                cartArray: state.cartArray.map((item) =>
                    item.id === action.payload.itemId
                        ? {
                            ...item,
                            quantity: action.payload.quantity,
                            selectedSize: action.payload.selectedSize,
                            selectedColor: action.payload.selectedColor
                        }
                        : item
                ),
            };
        case 'LOAD_CART':
            return {
                ...state,
                cartArray: action.payload,
            };
        default:
            return state;
    }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cartState, dispatch] = useReducer(cartReducer, { cartArray: [] });
    const [hasHydrated, setHasHydrated] = useState(false);

    // Restore the complete cart (items, quantities and selected variants) once
    // the app is running in the browser.
    useEffect(() => {
        try {
            const storedCart = localStorage.getItem(CART_STORAGE_KEY);
            if (storedCart) {
                const parsedCart: unknown = JSON.parse(storedCart);
                if (Array.isArray(parsedCart)) {
                    dispatch({ type: 'LOAD_CART', payload: parsedCart as CartItem[] });
                }
            }
        } catch {
            // Ignore malformed or unavailable browser storage.
        } finally {
            setHasHydrated(true);
        }
    }, []);

    // Do not write the initial empty state before the saved cart is restored.
    useEffect(() => {
        if (!hasHydrated) return;

        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartState.cartArray));
        } catch {
            // Ignore storage quota and privacy-mode errors.
        }
    }, [cartState.cartArray, hasHydrated]);

    const addToCart = (item: ProductType) => {
        dispatch({ type: 'ADD_TO_CART', payload: item });
    };

    const removeFromCart = (itemId: string) => {
        dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
    };

    const updateCart = (itemId: string, quantity: number, selectedSize: string, selectedColor: string) => {
        dispatch({ type: 'UPDATE_CART', payload: { itemId, quantity, selectedSize, selectedColor } });
    };

    return (
        <CartContext.Provider value={{ cartState, addToCart, removeFromCart, updateCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
