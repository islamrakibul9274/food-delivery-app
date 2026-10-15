import { useState, useEffect, useRef } from "react";
import { AppContext } from "../lib/context";
import { api, cartKey } from "../lib/api";
const readCart = () => {
  try {
    const value = JSON.parse(localStorage.getItem("food-cart") || "[]");
    return Array.isArray(value)
      ? value
          .filter(
            (x) =>
              x._id &&
              Number.isFinite(x.price) &&
              Number.isInteger(x.quantity) &&
              x.quantity > 0,
          )
          .map((x) => ({ ...x, quantity: Math.min(20, x.quantity) }))
      : [];
  } catch {
    return [];
  }
};
export default function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [products, setProducts] = useState([]);
  const [catalogError, setCatalogError] = useState("");
  const [cart, setCart] = useState(readCart);
  const [notice, setNotice] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const dialog = useRef(null);
  const noticeTimer = useRef(null);
  const notify = (message, type = "success") => {
    setNotice({ message, type });
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 5000);
  };
  const refreshCatalog = () =>
    Promise.all([api("/settings"), api("/products")])
      .then(([config, dishes]) => {
        setSettings(config);
        setProducts(dishes);
        setCatalogError("");
      })
      .catch((e) => setCatalogError(e.message));
  useEffect(() => {
    let active = true;
    const expired = () => {
      setUser(null);
    };
    window.addEventListener("food:session-expired", expired);
    api("/auth/me")
      .then((u) => {
        if (active) setUser(u);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setAuthLoading(false);
      });
    Promise.all([api("/settings"), api("/products")])
      .then(([config, dishes]) => {
        if (active) {
          setSettings(config);
          setProducts(dishes);
        }
      })
      .catch((e) => {
        if (active) setCatalogError(e.message);
      });
    localStorage.removeItem("access-token");
    localStorage.removeItem("user-info");
    return () => {
      active = false;
      clearTimeout(noticeTimer.current);
      window.removeEventListener("food:session-expired", expired);
    };
  }, []);
  useEffect(() => {
    localStorage.setItem("food-cart", JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    if (confirmation) dialog.current?.showModal();
  }, [confirmation]);
  const addToCart = (product, quantity = 1, note = "", selectedAddOns = []) => {
    const item = { ...product, selectedAddOns };
    setCart((current) => {
      const found = current.find((x) => cartKey(x) === cartKey(item));
      const qty = Math.min(20, (found?.quantity || 0) + quantity);
      if (qty <= 0) return current.filter((x) => cartKey(x) !== cartKey(item));
      return found
        ? current.map((x) =>
            cartKey(x) === cartKey(item)
              ? { ...item, quantity: qty, note: note || x.note || "" }
              : x,
          )
        : [...current, { ...item, quantity: qty, note }];
    });
    if (quantity > 0) notify(`${product.name} added to your bag.`);
  };
  const logout = async () => {
    await api("/auth/logout", { method: "POST" });
    setUser(null);
    notify("You’re signed out.");
  };
  const confirm = (message) =>
    new Promise((resolve) => setConfirmation({ message, resolve }));
  const closeConfirm = (value) => {
    confirmation?.resolve(value);
    dialog.current?.close();
    setConfirmation(null);
  };
  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        authLoading,
        settings,
        products,
        catalogError,
        refreshCatalog,
        cart,
        setCart,
        addToCart,
        notify,
        logout,
        confirm,
      }}
    >
      {children}
      {notice && (
        <div
          role={notice.type === "error" ? "alert" : "status"}
          className={`toast ${notice.type}`}
        >
          <span>{notice.message}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setNotice(null)}
          >
            ×
          </button>
        </div>
      )}
      <dialog
        ref={dialog}
        className="confirm-dialog"
        onCancel={(e) => {
          e.preventDefault();
          closeConfirm(false);
        }}
        aria-labelledby="confirm-title"
      >
        <h2 id="confirm-title">Please confirm</h2>
        <p>{confirmation?.message}</p>
        <div className="button-row">
          <button
            className="button secondary"
            onClick={() => closeConfirm(false)}
            autoFocus
          >
            Keep it
          </button>
          <button className="button" onClick={() => closeConfirm(true)}>
            Confirm
          </button>
        </div>
      </dialog>
    </AppContext.Provider>
  );
}
