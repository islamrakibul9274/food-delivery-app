import { useState } from "react";
import {
  Link,
  useParams,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import {
  Search,
  ArrowLeft,
  Plus,
  Minus,
  ShoppingBag,
  SlidersHorizontal,
} from "lucide-react";
import { useApp } from "../lib/context";
import { categories, money } from "../lib/api";
import {
  PageIntro,
  ProductCard,
  Empty,
  Loading,
  ErrorState,
} from "../components/ui";
export default function Menu() {
  const { products, settings, catalogError, refreshCatalog } = useApp();
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "All",
    q = params.get("q") || "",
    sort = params.get("sort") || "featured",
    vegetarian = params.get("vegetarian") === "true";
  const update = (key, value) =>
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
  let dishes = products.filter(
    (p) =>
      (category === "All" || p.category === category) &&
      `${p.name} ${p.description}`.toLowerCase().includes(q.toLowerCase()) &&
      (!vegetarian || p.vegetarian),
  );
  dishes = [...dishes].sort(
    sort === "price-low"
      ? (a, b) => a.price - b.price
      : sort === "price-high"
        ? (a, b) => b.price - a.price
        : sort === "name"
          ? (a, b) => a.name.localeCompare(b.name)
          : (a, b) => Number(b.featured) - Number(a.featured),
  );
  return (
    <div className="container page-space">
      <PageIntro
        eyebrow="THE MENU"
        title={
          <>
            Something for
            <br />
            <em>every craving.</em>
          </>
        }
      >
        Choose your favorite, or find a new one.
      </PageIntro>
      <div className="menu-toolbar">
        <label className="search-field">
          <Search size={19} />
          <input
            type="search"
            aria-label="Search the menu"
            placeholder="What are you hungry for?"
            value={q}
            onChange={(e) => update("q", e.target.value)}
          />
        </label>
        <label className="sort-field">
          <SlidersHorizontal size={16} />
          <select
            aria-label="Sort dishes"
            value={sort}
            onChange={(e) => update("sort", e.target.value)}
          >
            <option value="featured">Kitchen picks</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="name">Name: A–Z</option>
          </select>
        </label>
      </div>
      <div className="menu-filter-row">
        <div className="category-tabs">
          {categories.map((c) => (
            <button
              key={c}
              className={c === category ? "active" : ""}
              aria-pressed={c === category}
              onClick={() => update("category", c === "All" ? "" : c)}
            >
              {c === "All"
                ? "Everything"
                : c === "Drink"
                  ? "Drinks"
                  : c === "Dessert"
                    ? "Desserts"
                    : c === "Burger"
                      ? "Burgers"
                      : c}
            </button>
          ))}
        </div>
        <label className="check-line">
          <input
            type="checkbox"
            checked={vegetarian}
            onChange={(e) =>
              update("vegetarian", e.target.checked ? "true" : "")
            }
          />
          Vegetarian
        </label>
      </div>
      <div className="results-caption">
        <span>
          {dishes.length} {dishes.length === 1 ? "dish" : "dishes"} to choose
          from
        </span>
        <span>Made to order. Worth sitting down for.</span>
      </div>
      {catalogError ? (
        <ErrorState message={catalogError} retry={refreshCatalog} />
      ) : !settings ? (
        <Loading />
      ) : dishes.length ? (
        <div className="food-grid menu-grid">
          {dishes.map((p, i) => (
            <ProductCard key={p._id} product={p} index={i} />
          ))}
        </div>
      ) : (
        <Empty title="Nothing on this plate yet." to={null}>
          Try another search or category.
        </Empty>
      )}
      <p className="allergy-note">
        Food allergy? Read the dish notes and speak to the restaurant before
        placing an order.{" "}
        <Link to="/contact">
          Get in touch <span aria-hidden="true">↗</span>
        </Link>
      </p>
    </div>
  );
}
export function ProductDetails() {
  const { slug } = useParams();
  const { products, settings, addToCart, catalogError, refreshCatalog } =
    useApp();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const product = products.find((p) => p.slug === slug || p._id === slug);
  if (catalogError)
    return <ErrorState message={catalogError} retry={refreshCatalog} />;
  if (!settings) return <Loading />;
  if (!product) return <Empty title="This dish isn’t on the menu." />;
  const priceCents =
    Math.round(product.price * 100) +
    (product.addOns || [])
      .filter((o) => selectedAddOns.includes(o.key))
      .reduce((sum, o) => sum + o.priceCents, 0);
  return (
    <div className="container page-space">
      <Link to="/menu" className="back-link">
        <ArrowLeft size={17} />
        Back to the menu
      </Link>
      <div className="product-detail">
        <div className="detail-image">
          <img
            src={product.image}
            alt={product.name}
            width="1000"
            height="900"
          />
        </div>
        <div className="detail-copy">
          <p className="eyebrow">
            {product.category}
            {product.vegetarian ? " · VEGETARIAN" : ""}
          </p>
          <h1>{product.name}</h1>
          <span className="detail-price">
            {money(Math.round(product.price * 100), settings.currency)}
          </span>
          <p className="lede">{product.description}</p>
          <div className="product-facts">
            <span>
              Portion<strong>{product.weight || "One serving"}</strong>
            </span>
            <span>
              Allergens
              <strong>
                {product.allergens || "Please check with the restaurant."}
              </strong>
            </span>
          </div>
          {product.addOns?.length > 0 && (
            <fieldset className="add-ons">
              <legend>Make it yours</legend>
              {product.addOns.map((o) => (
                <label key={o.key}>
                  <span>
                    <input
                      type="checkbox"
                      checked={selectedAddOns.includes(o.key)}
                      onChange={(e) =>
                        setSelectedAddOns((current) =>
                          e.target.checked
                            ? [...current, o.key]
                            : current.filter((key) => key !== o.key),
                        )
                      }
                    />
                    {o.name}
                  </span>
                  <strong>+{money(o.priceCents, settings.currency)}</strong>
                </label>
              ))}
            </fieldset>
          )}
          <label className="field">
            <span>
              A note for the kitchen <small>(optional)</small>
            </span>
            <textarea
              maxLength="200"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Anything we should know?"
              rows="3"
            />
          </label>
          <p className="hint">
            Notes aren’t a substitute for checking allergen safety with the
            restaurant.
          </p>
          <div className="detail-order">
            <div className="quantity">
              <button
                aria-label="Decrease quantity"
                disabled={quantity === 1}
                onClick={() => setQuantity((q) => q - 1)}
              >
                <Minus size={16} />
              </button>
              <span>{quantity}</span>
              <button
                aria-label="Increase quantity"
                disabled={quantity === 20}
                onClick={() => setQuantity((q) => q + 1)}
              >
                <Plus size={16} />
              </button>
            </div>
            <button
              className="button"
              disabled={product.available === false}
              onClick={() => {
                addToCart(product, quantity, note, selectedAddOns);
                navigate("/cart");
              }}
            >
              <ShoppingBag size={18} />
              {product.available === false
                ? "Currently unavailable"
                : `Add to bag · ${money(priceCents * quantity, settings.currency)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
