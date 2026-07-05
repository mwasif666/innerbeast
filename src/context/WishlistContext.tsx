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
  addRemoteWishlistItem,
  extractWishlistProducts,
  getRemoteWishlist,
  mergeRemoteWishlist,
  removeRemoteWishlistItem,
} from "@/services/wishlist.service";

interface WishlistItem extends ProductType {}

interface WishlistState {
  wishlistArray: WishlistItem[];
}

type WishlistAction =
  | { type: "ADD_TO_WISHLIST"; payload: ProductType }
  | { type: "REMOVE_FROM_WISHLIST"; payload: string }
  | { type: "LOAD_WISHLIST"; payload: WishlistItem[] };

interface WishlistContextProps {
  wishlistState: WishlistState;
  addToWishlist: (item: ProductType) => void;
  removeFromWishlist: (itemId: string) => void;
  isWishlistSyncing: boolean;
}

const WishlistContext = createContext<WishlistContextProps | undefined>(
  undefined,
);

const WISHLIST_STORAGE_KEY = "wishlist";

const wishlistReducer = (
  state: WishlistState,
  action: WishlistAction,
): WishlistState => {
  switch (action.type) {
    case "ADD_TO_WISHLIST": {
      const exists = state.wishlistArray.some(
        (item) => item.id === action.payload.id,
      );

      if (exists) return state;

      return {
        ...state,
        wishlistArray: [...state.wishlistArray, { ...action.payload }],
      };
    }

    case "REMOVE_FROM_WISHLIST":
      return {
        ...state,
        wishlistArray: state.wishlistArray.filter(
          (item) => item.id !== action.payload,
        ),
      };

    case "LOAD_WISHLIST":
      return {
        ...state,
        wishlistArray: action.payload,
      };

    default:
      return state;
  }
};

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [wishlistState, dispatch] = useReducer(wishlistReducer, {
    wishlistArray: [],
  });
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isWishlistSyncing, setIsWishlistSyncing] = useState(false);

  const currentUserQuery = useCurrentUser();
  const currentUser = currentUserQuery.data?.data;
  const accountKey =
    currentUser?._id || currentUser?.id || currentUser?.email || "";
  const syncedAccount = useRef("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          dispatch({ type: "LOAD_WISHLIST", payload: parsed });
        }
      }
    } catch {
      try {
        localStorage.removeItem(WISHLIST_STORAGE_KEY);
      } catch {}
    } finally {
      setHasHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated || accountKey) return;

    try {
      localStorage.setItem(
        WISHLIST_STORAGE_KEY,
        JSON.stringify(wishlistState.wishlistArray),
      );
    } catch {}
  }, [hasHydrated, wishlistState.wishlistArray, accountKey]);

  useEffect(() => {
    if (!hasHydrated || !accountKey || syncedAccount.current === accountKey) {
      return;
    }

    const syncWishlist = async () => {
      setIsWishlistSyncing(true);

      try {
        const localIds = wishlistState.wishlistArray
          .map((item) => item.id)
          .filter(Boolean);

        const response =
          localIds.length > 0
            ? await mergeRemoteWishlist(localIds)
            : await getRemoteWishlist();

        dispatch({
          type: "LOAD_WISHLIST",
          payload: extractWishlistProducts(response) as WishlistItem[],
        });

        syncedAccount.current = accountKey;

        try {
          localStorage.removeItem(WISHLIST_STORAGE_KEY);
        } catch {}
      } catch {
        syncedAccount.current = accountKey;
      } finally {
        setIsWishlistSyncing(false);
      }
    };

    syncWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountKey, hasHydrated]);

  const loadRemoteWishlist = (
    response: Awaited<ReturnType<typeof getRemoteWishlist>>,
  ) => {
    dispatch({
      type: "LOAD_WISHLIST",
      payload: extractWishlistProducts(response) as WishlistItem[],
    });
  };

  const addToWishlist = (item: ProductType) => {
    dispatch({ type: "ADD_TO_WISHLIST", payload: item });

    if (!accountKey) return;

    addRemoteWishlistItem(item.id)
      .then(loadRemoteWishlist)
      .catch(() => {});
  };

  const removeFromWishlist = (itemId: string) => {
    dispatch({ type: "REMOVE_FROM_WISHLIST", payload: itemId });

    if (!accountKey) return;

    removeRemoteWishlistItem(itemId)
      .then(loadRemoteWishlist)
      .catch(() => {});
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistState,
        addToWishlist,
        removeFromWishlist,
        isWishlistSyncing,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }

  return context;
};
