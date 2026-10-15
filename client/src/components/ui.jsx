import { Link } from "react-router-dom";
import { ArrowUpRight, Plus, Heart, ArrowRight } from "lucide-react";
import { useApp } from "../lib/context";
import { api, money } from "../lib/api";
export function Brand({ light = false }) {
  return (
    <Link
      to="/"
      className={`brand ${light ? "light" : ""}`}
      aria-label="FOOD home"
    >
      f<span>oo</span>d<span className="brand-dot">.</span>
    </Link>
  );
}
export function ButtonLink({
  children,
  to = "/menu",
  secondary = false,
  ...props
}) {
  return (
    <Link
      to={to}
      className={`button ${secondary ? "secondary" : ""}`}
      {...props}
    >
      {children}
      <ArrowUpRight size={17} />
    </Link>
  );
}
export function PageIntro({ eyebrow, title, children }) {
  return (
    <div className="page-intro">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {children && <p className="lede">{children}</p>}
    </div>
  );
}
export function Loading() {
  return (
    <div className="loading-state" role="status">
      <span className="spinner" />
      Getting things ready…
    </div>
  );
}
export function ErrorState({ message, retry }) {
  return (
    <div className="empty-state" role="alert">
      <h2>Something got in the way.</h2>
      <p>{message}</p>
      {retry && (
        <button className="button secondary" onClick={retry}>
          Try again
        </button>
      )}
    </div>
  );
}
export function Empty({
  title,
  children,
  to = "/menu",
  action = "Explore the menu",
}) {
  return (
    <div className="empty-state">
      <h2>{title}</h2>
      <p>{children}</p>
      {to && (
        <ButtonLink to={to} secondary>
          {action}
        </ButtonLink>
      )}
    </div>
  );
}
export function Field({ label, error, children, ...props }) {
  return (
    <label className={`field ${props.className || ""}`}>
      <span>{label}</span>
      {children || <input {...props} className={undefined} />}
      {error && <small className="error-text">{error}</small>}
    </label>
  );
}
export function ProductCard({ product, index = 0 }) {
  const { addToCart, user, setUser, settings, notify } = useApp();
  const favorite = user?.favorites?.includes(product._id);
  const toggle = async () => {
    try {
      setUser(
        await api(`/account/favorites/${product._id}`, { method: "PUT" }),
      );
    } catch (e) {
      notify(e.message, "error");
    }
  };
  return (
    <article
      className={`food-card ${product.available === false ? "unavailable" : ""}`}
    >
      <Link className="food-image" to={`/menu/${product.slug || product._id}`}>
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width="640"
          height="480"
          onError={(e) => {
            e.currentTarget.src = "/food/burger.jpg";
            e.currentTarget.onerror = null;
          }}
        />
        <span className="dish-index">{String(index + 1).padStart(2, "0")}</span>
      </Link>
      {user && (
        <button
          className={`favorite ${favorite ? "active" : ""}`}
          aria-label={`${favorite ? "Remove" : "Save"} ${product.name} ${favorite ? "from" : "to"} favorites`}
          onClick={toggle}
        >
          <Heart size={17} fill={favorite ? "currentColor" : "none"} />
        </button>
      )}
      <div className="food-info">
        <div className="food-meta">
          <span>{product.category}</span>
          <span>{product.weight}</span>
        </div>
        <Link to={`/menu/${product.slug || product._id}`}>
          <h3>{product.name}</h3>
        </Link>
        <p>{product.description || "A little comfort, made to order."}</p>
        <div className="food-bottom">
          <strong>
            {money(Math.round(product.price * 100), settings?.currency)}
          </strong>
          <button
            className="add-button"
            disabled={product.available === false}
            onClick={() => addToCart(product)}
            aria-label={`Add ${product.name} to bag`}
          >
            {product.available === false ? (
              "Unavailable"
            ) : (
              <>
                Add <Plus size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
export function TextLink({ to, children }) {
  return (
    <Link className="text-link" to={to}>
      {children}
      <ArrowRight size={17} />
    </Link>
  );
}
