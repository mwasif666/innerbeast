"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { ProductType } from "@/type/ProductType";
import { useCurrentUser } from "@/hooks/useAuth";
import {
  addRemoteCartItem,
  applyRemoteCartCoupon,
  clearRemoteCart,
  getRemoteAppliedCoupon,
  getRemoteCart,
  mapRemoteCartItems,
  removeRemoteCartCoupon,
  removeRemoteCartItem,
  syncRemoteCart,
  updateRemoteCartItem,
  AppliedCoupon,
} from "@/services/cart.service";

interface CartItem extends ProductType {
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

interface CartState {
  cartArray: CartItem[];
}

type CartAction =
  | { type: "ADD_TO_CART"; payload: ProductType }
  | { type: "REMOVE_FROM_CART"; payload: string }
  | {
      type: "UPDATE_CART";
      payload: {
        itemId: string;
        quantity: number;
        selectedSize: string;
        selectedColor: string;
      };
    }
  | { type: "LOAD_CART"; payload: CartItem[] }
  | { type: "CLEAR_CART" };

interface CartContextProps {
  cartState: CartState;
  addToCart: (item: ProductType) => void;
  removeFromCart: (itemId: string) => void;
  updateCart: (
    itemId: string,
    quantity: number,
    selectedSize: string,
    selectedColor: string,
  ) => void;
  clearCart: () => void;
  appliedCoupon: AppliedCoupon | null;
  setAppliedCoupon: (coupon: AppliedCoupon | null) => void;
  applyCouponToCart: (code: string) => Promise<AppliedCoupon | null>;
  removeCouponFromCart: () => Promise<void>;
  isCartSyncing: boolean;
}

const CART_STORAGE_KEY = "innerbeast-cart";
const LEGACY_CART_STORAGE_KEY = "inner_beast_cart";

const CartContext = createContext<CartContextProps | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_TO_CART": {
      const existingItem = state.cartArray.find(
        (item) => item.id === action.payload.id,
      );

      if (existingItem) {
        return {
          ...state,
          cartArray: state.cartArray.map((item) =>
            item.id === action.payload.id
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                }
              : item,
          ),
        };
      }

      const newItem: CartItem = {
        ...action.payload,
        quantity: action.payload.quantityPurchase || 1,
        selectedSize: "",
        selectedColor: "",
      };

      return {
        ...state,
        cartArray: [...state.cartArray, newItem],
      };
    }

    case "REMOVE_FROM_CART":
      return {
        ...state,
        cartArray: state.cartArray.filter((item) => item.id !== action.payload),
      };

    case "UPDATE_CART":
      return {
        ...state,
        cartArray: state.cartArray.map((item) =>
          item.id === action.payload.itemId
            ? {
                ...item,
                quantity: action.payload.quantity,
                selectedSize: action.payload.selectedSize,
                selectedColor: action.payload.selectedColor,
              }
            : item,
        ),
      };

    case "LOAD_CART":
      return {
        ...state,
        cartArray: action.payload,
      };

    case "CLEAR_CART":
      return {
        ...state,
        cartArray: [],
      };

    default:
      return state;
  }
};

const getProductId = (item: ProductType) => item.id;

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cartState, dispatch] = useReducer(cartReducer, { cartArray: [] });
  const [isLoaded, setIsLoaded] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(
    null,
  );
  const [isCartSyncing, setIsCartSyncing] = useState(false);

  const currentUserQuery = useCurrentUser();
  const currentUser = currentUserQuery.data?.data;
  const accountKey =
    currentUser?._id || currentUser?.id || currentUser?.email || "";
  const syncedAccount = useRef("");

  useEffect(() => {
    try {
      const savedCart =
        window.localStorage.getItem(CART_STORAGE_KEY) ||
        window.localStorage.getItem(LEGACY_CART_STORAGE_KEY);

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          dispatch({ type: "LOAD_CART", payload: parsedCart });
          window.localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify(parsedCart),
          );
          window.localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
        }
      }
    } catch {
      try {
        window.localStorage.removeItem(CART_STORAGE_KEY);
        window.localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
      } catch {}
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || accountKey) return;

    try {
      window.localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cartState.cartArray),
      );
    } catch {}
  }, [cartState.cartArray, isLoaded, accountKey]);

  useEffect(() => {
    if (!isLoaded || !accountKey || syncedAccount.current === accountKey)
      return;

    const syncAccountCart = async () => {
      setIsCartSyncing(true);

      try {
        const hasLocalCart = cartState.cartArray.length > 0;

        const response = hasLocalCart
          ? await syncRemoteCart({
              items: cartState.cartArray.map((item) => ({
                productId: getProductId(item),
                quantity: item.quantity,
                selectedSize: item.selectedSize,
                selectedColor: item.selectedColor,
              })),
            })
          : await getRemoteCart();

        dispatch({
          type: "LOAD_CART",
          payload: mapRemoteCartItems(response) as CartItem[],
        });

        setAppliedCoupon(getRemoteAppliedCoupon(response));
        syncedAccount.current = accountKey;

        try {
          window.localStorage.removeItem(CART_STORAGE_KEY);
          window.localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
        } catch {}
      } catch {
        syncedAccount.current = accountKey;
      } finally {
        setIsCartSyncing(false);
      }
    };

    syncAccountCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountKey, isLoaded]);

  const loadRemoteResponse = (
    response: Awaited<ReturnType<typeof getRemoteCart>>,
  ) => {
    dispatch({
      type: "LOAD_CART",
      payload: mapRemoteCartItems(response) as CartItem[],
    });
    setAppliedCoupon(getRemoteAppliedCoupon(response));
  };

  const addToCart = (item: ProductType) => {
    dispatch({ type: "ADD_TO_CART", payload: item });

    if (!accountKey) return;

    addRemoteCartItem({
      productId: getProductId(item),
      quantity: item.quantityPurchase || 1,
      selectedSize: "",
      selectedColor: "",
    })
      .then(loadRemoteResponse)
      .catch(() => {});
  };

  const removeFromCart = (itemId: string) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: itemId });

    if (!accountKey) return;

    removeRemoteCartItem(itemId)
      .then(loadRemoteResponse)
      .catch(() => {});
  };

  const updateCart = (
    itemId: string,
    quantity: number,
    selectedSize: string,
    selectedColor: string,
  ) => {
    dispatch({
      type: "UPDATE_CART",
      payload: { itemId, quantity, selectedSize, selectedColor },
    });

    if (!accountKey) return;

    updateRemoteCartItem(itemId, {
      quantity,
      selectedSize,
      selectedColor,
    })
      .then(loadRemoteResponse)
      .catch(() => {});
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
    setAppliedCoupon(null);

    try {
      window.localStorage.removeItem(CART_STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
    } catch {}

    if (!accountKey) return;

    clearRemoteCart()
      .then(loadRemoteResponse)
      .catch(() => {});
  };

  const applyCouponToCart = async (code: string) => {
    if (!accountKey) {
      throw new Error("Please log in to use a coupon.");
    }

    const response = await applyRemoteCartCoupon(code);
    loadRemoteResponse(response);

    return getRemoteAppliedCoupon(response);
  };

  const removeCouponFromCart = async () => {
    setAppliedCoupon(null);

    if (!accountKey) return;

    const response = await removeRemoteCartCoupon();
    loadRemoteResponse(response);
  };

  return (
    <CartContext.Provider
      value={{
        cartState,
        addToCart,
        removeFromCart,
        updateCart,
        clearCart,
        appliedCoupon,
        setAppliedCoupon,
        applyCouponToCart,
        removeCouponFromCart,
        isCartSyncing,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
};
