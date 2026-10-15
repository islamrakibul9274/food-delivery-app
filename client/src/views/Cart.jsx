import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  Bike,
  ShoppingBag,
  LockKeyhole,
} from "lucide-react";
import { useApp } from "../lib/context";
import { api, money, cartKey, unitCents } from "../lib/api";
import { Empty, PageIntro, Field, Loading } from "../components/ui";
function Summary({ subtotal, delivery, total, currency, children }) {
  return (
    <aside className="order-summary">
      <p className="eyebrow">THE GOOD STUFF, TOGETHER</p>
      <h2>Order summary</h2>
      <div className="summary-line">
        <span>Subtotal</span>
        <span>{money(subtotal, currency)}</span>
      </div>
      <div className="summary-line">
        <span>Delivery</span>
        <span>{delivery ? money(delivery, currency) : "No fee"}</span>
      </div>
      <div className="summary-total">
        <span>Total</span>
        <strong>{money(total, currency)}</strong>
      </div>
      <p className="hint">No extra fees added at the door.</p>
      {children}
      <div className="summary-note">
        <LockKeyhole size={15} />
        <span>Your order stays connected to your account.</span>
      </div>
    </aside>
  );
}
export default function Cart({ checkout = false }) {
  const {
    cart,
    setCart,
    user,
    products,
    settings,
    notify,
    confirm,
    refreshCatalog,
  } = useApp();
  const navigate = useNavigate();
  const [fulfilment, setFulfilment] = useState("delivery"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [saved, setSaved] = useState("");
  const formRef = useRef(null);
  const requestKey = useRef(crypto.randomUUID());
  if (!settings) return <Loading />;
  const enriched = cart.map((item) => ({
    ...item,
    current: products.find((p) => p._id === item._id),
  }));
  const invalid = enriched.some(
    (x) =>
      !x.current ||
      x.current.available === false ||
      (x.selectedAddOns || []).some(
        (key) => !(x.current.addOns || []).some((o) => o.key === key),
      ),
  );
  const changed = enriched.some(
    (x) => x.current && unitCents(x, x.current) !== unitCents(x),
  );
  const subtotal = enriched.reduce(
      (sum, x) => sum + unitCents(x, x.current || x) * x.quantity,
      0,
    ),
    delivery =
      cart.length && fulfilment === "delivery" ? settings.deliveryFeeCents : 0,
    total = subtotal + delivery;
  if (!cart.length)
    return (
      <div className="container page-space">
        <PageIntro
          eyebrow="YOUR BAG"
          title={
            <>
              Room for
              <br />
              <em>something good.</em>
            </>
          }
        />
        <Empty title="Your bag is taking a breather.">
          Find a dish you like and we’ll keep it here for you.
        </Empty>
      </div>
    );
  const quantity = (id, delta) =>
    setCart((items) =>
      items.flatMap((x) =>
        cartKey(x) === id
          ? x.quantity + delta <= 0
            ? []
            : [{ ...x, quantity: Math.min(20, x.quantity + delta) }]
          : [x],
      ),
    );
  const remove = async (item) => {
    if (await confirm(`Remove ${item.name} from your bag?`))
      setCart((items) => items.filter((x) => cartKey(x) !== cartKey(item)));
  };
  const selectAddress = (value) => {
    setSaved(value);
    const a = user?.addresses?.[Number(value)];
    if (a && formRef.current)
      for (const field of ["name", "phone", "line", "area"])
        formRef.current.elements[field].value = a[field] || "";
  };
  const order = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const fields = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const result = await api("/orders", {
        method: "POST",
        body: {
          items: cart.map((x) => ({
            productId: x._id,
            quantity: x.quantity,
            note: x.note || "",
            addOns: x.selectedAddOns || [],
          })),
          contact: fields,
          fulfilment,
          expectedTotalCents: total,
          requestKey: requestKey.current,
        },
      });
      setCart([]);
      notify("Your order is in. We’ll take it from here.");
      navigate(`/orders/${result._id}/confirmation`);
    } catch (err) {
      setError(err.message);
      await refreshCatalog();
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="container page-space">
      <Link className="back-link" to={checkout ? "/cart" : "/menu"}>
        <ArrowLeft size={16} />
        {checkout ? "Back to your bag" : "Back to the menu"}
      </Link>
      <PageIntro
        eyebrow={checkout ? "ONE LAST THING" : "YOUR BAG"}
        title={
          checkout ? (
            <>
              Where’s the
              <br />
              <em>good food going?</em>
            </>
          ) : (
            <>
              A very good
              <br />
              <em>selection.</em>
            </>
          )
        }
      />
      {invalid && (
        <p className="notice error">
          An item is unavailable. Remove it before checking out.
        </p>
      )}
      {changed && (
        <p className="notice">
          Some prices have changed. The totals below reflect the current menu.
        </p>
      )}
      <div className="checkout-layout">
        <div>
          {checkout ? (
            <form
              id="checkout-form"
              ref={formRef}
              className="checkout-form"
              onSubmit={order}
            >
              <div className="fulfilment-toggle">
                <button
                  type="button"
                  className={fulfilment === "delivery" ? "active" : ""}
                  onClick={() => setFulfilment("delivery")}
                >
                  <Bike size={20} />
                  Delivery
                </button>
                {settings.pickupEnabled && (
                  <button
                    type="button"
                    className={fulfilment === "pickup" ? "active" : ""}
                    onClick={() => setFulfilment("pickup")}
                  >
                    <ShoppingBag size={20} />
                    Pickup
                  </button>
                )}
              </div>
              <h2>Your details</h2>
              {user?.addresses?.length > 0 && fulfilment === "delivery" && (
                <Field label="Use a saved address">
                  <select
                    value={saved}
                    onChange={(e) => selectAddress(e.target.value)}
                  >
                    <option value="">Enter a new address</option>
                    {user.addresses.map((a, i) => (
                      <option value={i} key={a._id || i}>
                        {a.label} — {a.line}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
              <div className="form-grid">
                <Field
                  label="Full name"
                  name="name"
                  required
                  minLength="2"
                  maxLength="80"
                  autoComplete="name"
                  defaultValue={user?.name}
                />
                <Field
                  label="Phone number"
                  name="phone"
                  type="tel"
                  required
                  minLength="5"
                  maxLength="30"
                  autoComplete="tel"
                />
              </div>
              {fulfilment === "delivery" ? (
                <>
                  <Field
                    label="Street address & apartment"
                    name="line"
                    required
                    minLength="5"
                    maxLength="250"
                    autoComplete="street-address"
                  />
                  <Field label="Delivery area">
                    <select name="area" required defaultValue="">
                      <option value="" disabled>
                        Choose an area
                      </option>
                      {settings.deliveryAreas.map((a) => (
                        <option key={a}>{a}</option>
                      ))}
                    </select>
                  </Field>
                </>
              ) : (
                <div className="notice">
                  <strong>Pickup from the restaurant</strong>
                  <p>
                    {settings.address ||
                      "The restaurant has not added a pickup address yet. Contact the team before ordering."}
                  </p>
                </div>
              )}
              <Field label="Delivery or pickup instructions (optional)">
                <textarea
                  name="instructions"
                  rows="3"
                  maxLength="400"
                  placeholder="A landmark, doorbell, or something we should know."
                />
              </Field>
              <h2>Payment</h2>
              <div className="payment-choice">
                <span className="radio-dot" />
                <div>
                  <strong>
                    {settings.demoMode
                      ? "Demo payment — no charge"
                      : `Pay ${fulfilment === "pickup" ? "at pickup" : "on delivery"}`}
                  </strong>
                  <p>
                    {settings.demoMode
                      ? "Test the checkout freely. No payment is taken and no food is delivered."
                      : "Cash payment. No card details needed."}
                  </p>
                </div>
              </div>
              {error && (
                <p className="notice error" role="alert">
                  {error}
                </p>
              )}
              <p className="hint">
                Placing your order confirms you’ve reviewed the{" "}
                <Link to="/delivery-policy">delivery policy</Link> and{" "}
                <Link to="/refund-policy">cancellation policy</Link>.
              </p>
            </form>
          ) : (
            <div className="cart-items">
              {enriched.map((item) => (
                <article className="cart-item" key={cartKey(item)}>
                  <Link to={`/menu/${item.current?.slug || item._id}`}>
                    <img
                      src={item.current?.image || item.image}
                      alt={item.name}
                      width="160"
                      height="140"
                    />
                  </Link>
                  <div className="cart-item-copy">
                    <p className="eyebrow">{item.category}</p>
                    <h2>{item.name}</h2>
                    <p>
                      {money(
                        unitCents(item, item.current || item),
                        settings.currency,
                      )}{" "}
                      each
                    </p>
                    {item.selectedAddOns?.length > 0 && (
                      <small>
                        {item.selectedAddOns
                          .map(
                            (key) =>
                              (item.current?.addOns || item.addOns || []).find(
                                (o) => o.key === key,
                              )?.name || "Unavailable option",
                          )
                          .join(", ")}
                      </small>
                    )}
                    {item.note && <small>Kitchen note: {item.note}</small>}
                    {(!item.current || item.current.available === false) && (
                      <span className="error-text">Currently unavailable</span>
                    )}
                    <div className="quantity">
                      <button
                        aria-label={`Decrease ${item.name}`}
                        onClick={() => quantity(cartKey(item), -1)}
                      >
                        <Minus size={14} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        aria-label={`Increase ${item.name}`}
                        disabled={item.quantity === 20}
                        onClick={() => quantity(cartKey(item), 1)}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="cart-item-end">
                    <strong>
                      {money(
                        unitCents(item, item.current || item) * item.quantity,
                        settings.currency,
                      )}
                    </strong>
                    <button
                      className="icon-button"
                      aria-label={`Remove ${item.name}`}
                      onClick={() => remove(item)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
        <Summary
          subtotal={subtotal}
          delivery={delivery}
          total={total}
          currency={settings.currency}
        >
          {checkout ? (
            <button
              className="button full"
              form="checkout-form"
              disabled={
                busy ||
                invalid ||
                !settings.orderingEnabled ||
                subtotal < settings.minimumCents
              }
            >
              {busy
                ? "Placing your order…"
                : settings.demoMode
                  ? "Place demo order"
                  : "Place order"}
              <ArrowUpRight size={17} />
            </button>
          ) : (
            <Link
              className={`button full ${invalid ? "disabled" : ""}`}
              to={user ? "/checkout" : "/login"}
              state={user ? undefined : { from: { pathname: "/checkout" } }}
            >
              Continue to checkout
              <ArrowUpRight size={17} />
            </Link>
          )}
          {!settings.orderingEnabled && (
            <p className="error-text">
              The kitchen is not accepting orders right now.
            </p>
          )}
          {subtotal < settings.minimumCents && (
            <p className="error-text">
              Minimum order: {money(settings.minimumCents, settings.currency)}
            </p>
          )}
          {checkout && (
            <p className="hint">
              {cart.reduce((n, x) => n + x.quantity, 0)} items ·{" "}
              <Link to="/cart">Review your bag</Link>
            </p>
          )}
        </Summary>
      </div>
    </div>
  );
}
