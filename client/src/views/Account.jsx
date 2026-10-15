import { useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import {
  ArrowUpRight,
  Plus,
  Trash2,
  Check,
  ArrowLeft,
  Package,
  MapPin,
} from "lucide-react";
import { useApp } from "../lib/context";
import { api, money, date, label, orderTotal, statusOptions } from "../lib/api";
import { useResource } from "../lib/useResource";
import {
  PageIntro,
  Field,
  Empty,
  Loading,
  ErrorState,
  ProductCard,
} from "../components/ui";
export default function Account() {
  const { user, logout, notify } = useApp();
  const navigate = useNavigate();
  const out = async () => {
    try {
      await logout();
      navigate("/");
    } catch (e) {
      notify(e.message, "error");
    }
  };
  return (
    <div className="container page-space">
      <PageIntro
        eyebrow="YOUR CORNER"
        title={
          <>
            Hello, <em>{user.name.split(" ")[0]}.</em>
          </>
        }
      >
        A familiar place for your favorite things.
      </PageIntro>
      <div className="account-layout">
        <aside className="account-nav">
          {[
            ["/account", "Your profile"],
            ["/account/orders", "Your orders"],
            ["/account/addresses", "Saved addresses"],
            ["/account/favorites", "Saved favorites"],
          ].map(([to, name]) => (
            <NavLink end={to === "/account"} key={to} to={to}>
              {name}
              <ArrowUpRight size={16} />
            </NavLink>
          ))}
          {user.role === "admin" && (
            <Link to="/admin">
              Admin dashboard
              <ArrowUpRight size={16} />
            </Link>
          )}
          <button onClick={out}>Sign out</button>
        </aside>
        <div className="account-body">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
export function Profile() {
  const { user, setUser, notify } = useApp();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const save = async (e, pass = false) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    try {
      const r = await api(pass ? "/account/password" : "/account", {
        method: pass ? "POST" : "PATCH",
        body: data,
      });
      if (!pass) setUser(r);
      else form.reset();
      notify(pass ? "Password updated." : "Your profile is up to date.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <h2>Your profile</h2>
      <p className="muted">The person behind the good taste.</p>
      {error && (
        <p className="notice error" role="alert">
          {error}
        </p>
      )}
      <form className="form-stack narrow-form" onSubmit={save}>
        <Field
          label="Name"
          name="name"
          defaultValue={user.name}
          required
          minLength="2"
          maxLength="80"
        />
        <Field label="Email" type="email" value={user.email} readOnly />
        <button className="button" disabled={busy}>
          Save changes
          <Check size={17} />
        </button>
      </form>
      <hr className="section-divider" />
      <h2>Change your password</h2>
      <form className="form-stack narrow-form" onSubmit={(e) => save(e, true)}>
        <Field
          label="Current password"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
        <Field
          label="New password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength="8"
          maxLength="72"
        />
        <button className="button secondary" disabled={busy}>
          Update password
        </button>
      </form>
    </>
  );
}
export function Addresses() {
  const { user, setUser, notify } = useApp();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const change = async (addresses) => {
    setBusy(true);
    setError("");
    try {
      setUser(
        await api("/account/addresses", { method: "PUT", body: { addresses } }),
      );
      notify("Addresses updated.");
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setBusy(false);
    }
  };
  const add = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (
      await change([
        ...(user.addresses || []),
        Object.fromEntries(new FormData(form)),
      ])
    )
      form.reset();
  };
  return (
    <>
      <h2>Saved addresses</h2>
      <p className="muted">Home, work, or wherever dinner finds you.</p>
      {error && (
        <p className="notice error" role="alert">
          {error}
        </p>
      )}
      <div className="address-list">
        {user.addresses?.map((a, i) => (
          <div className="address-card" key={a._id || i}>
            <MapPin size={20} />
            <div>
              <strong>{a.label}</strong>
              <p>
                {a.name} · {a.phone}
                <br />
                {a.line}
                <br />
                {a.area}
              </p>
            </div>
            <button
              className="icon-button"
              aria-label={`Remove ${a.label} address`}
              disabled={busy}
              onClick={() => change(user.addresses.filter((_, n) => n !== i))}
            >
              <Trash2 size={17} />
            </button>
          </div>
        ))}
      </div>
      {(user.addresses?.length || 0) < 5 && (
        <form className="form-stack" onSubmit={add}>
          <h3>Add an address</h3>
          <div className="form-grid">
            <Field
              label="Label"
              name="label"
              placeholder="Home, work…"
              required
              maxLength="30"
            />
            <Field
              label="Full name"
              name="name"
              defaultValue={user.name}
              required
              minLength="2"
              maxLength="80"
            />
            <Field
              label="Phone"
              name="phone"
              type="tel"
              required
              minLength="5"
              maxLength="30"
            />
            <Field label="Area" name="area" required maxLength="100" />
          </div>
          <Field
            label="Street address & apartment"
            name="line"
            required
            minLength="5"
            maxLength="250"
          />
          <button className="button" disabled={busy}>
            Save address
            <Plus size={17} />
          </button>
        </form>
      )}
    </>
  );
}
export function Favorites() {
  const { user, products } = useApp();
  const saved = products.filter((p) => user.favorites?.includes(p._id));
  return (
    <>
      <h2>Saved favorites</h2>
      <p className="muted">
        For when “what should we eat?” has an easy answer.
      </p>
      {saved.length ? (
        <div className="food-grid favorites-grid">
          {saved.map((p, i) => (
            <ProductCard key={p._id} product={p} index={i} />
          ))}
        </div>
      ) : (
        <Empty title="Keep the good ones close.">
          Tap the heart on a dish to save it here.
        </Empty>
      )}
    </>
  );
}
export function Orders() {
  const { data, loading, error, reload } = useResource("/orders", 15000);
  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} retry={reload} />;
  return (
    <>
      <h2>Your orders</h2>
      <p className="muted">Old favorites. Good memories. Dinner on its way.</p>
      {data?.length ? (
        <div className="order-list">
          {data.map((o) => (
            <Link
              className="order-card"
              key={o._id}
              to={`/account/orders/${o._id}`}
            >
              <div className="order-card-icon">
                <Package size={22} />
              </div>
              <div>
                <strong>
                  {o.number || `FD-${o._id.slice(-8).toUpperCase()}`}
                </strong>
                <p>
                  {date(o.createdAt)} · {o.items.length}{" "}
                  {o.items.length === 1 ? "dish" : "dishes"}
                </p>
                <span className={`status ${o.status}`}>{label(o.status)}</span>
              </div>
              <div className="order-card-price">
                <strong>{money(orderTotal(o), o.currency)}</strong>
                <ArrowUpRight size={20} />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <Empty title="Your first favorite is waiting.">
          Once you order, you can follow it here.
        </Empty>
      )}
    </>
  );
}
export function OrderDetails() {
  const { id } = useParams();
  const location = useLocation(),
    navigate = useNavigate();
  const {
    data: order,
    loading,
    error,
    reload,
  } = useResource(`/orders/${id}`, 15000);
  const { user, notify, setCart, products, confirm } = useApp();
  const [busy, setBusy] = useState(false);
  const confirmation = location.pathname.endsWith("/confirmation");
  const cancel = async () => {
    if (!(await confirm("Cancel this order before the kitchen confirms it?")))
      return;
    setBusy(true);
    try {
      await api(`/orders/${id}/cancel`, { method: "POST" });
      reload();
      notify("Order cancelled.");
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setBusy(false);
    }
  };
  const update = async (status) => {
    setBusy(true);
    try {
      await api(`/admin/orders/${id}`, { method: "PATCH", body: { status } });
      reload();
      notify("Order updated.");
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setBusy(false);
    }
  };
  const reorder = async () => {
    const items = order.items
      .map((item) => {
        const p = products.find((p) => p._id === item.productId);
        return p && p.available !== false
          ? {
              ...p,
              quantity: Math.min(20, item.quantity),
              note: item.note || "",
              selectedAddOns: (item.addOns || []).map((o) => o.key),
            }
          : null;
      })
      .filter(Boolean);
    if (!items.length)
      return notify(
        "These dishes are no longer available. Explore the current menu.",
        "error",
      );
    if (
      !(await confirm(
        "Replace your bag with the available items from this order? Prices use the current menu.",
      ))
    )
      return;
    setCart(items);
    navigate("/cart");
  };
  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} retry={reload} />;
  if (!order) return null;
  const steps = [
    "pending",
    "confirmed",
    "preparing",
    order.fulfilment === "pickup" ? "ready" : "out-for-delivery",
    "delivered",
  ];
  const position = steps.indexOf(order.status);
  const isOwner =
    order.email === user.email || String(order.userId) === String(user.id);
  return (
    <div className={confirmation ? "container page-space" : ""}>
      <Link
        className="back-link"
        to={
          user.role === "admin" && location.pathname.startsWith("/admin")
            ? "/admin/orders"
            : "/account/orders"
        }
      >
        <ArrowLeft size={16} />
        All orders
      </Link>
      {confirmation ? (
        <PageIntro
          eyebrow={order.demo ? "DEMO ORDER RECEIVED" : "ORDER RECEIVED"}
          title={
            <>
              Good choice.
              <br />
              <em>We’re on it.</em>
            </>
          }
        >
          {order.demo
            ? "Your test order is saved. No food will be prepared or delivered."
            : "Your order is awaiting the kitchen’s confirmation."}
        </PageIntro>
      ) : (
        <h1 className="order-title">
          {order.number || `Order ${order._id.slice(-8).toUpperCase()}`}
        </h1>
      )}
      <div className="order-detail-heading">
        <span>
          {date(order.createdAt)} · {label(order.fulfilment)}
        </span>
        <span className={`status ${order.status}`}>{label(order.status)}</span>
      </div>
      {order.status !== "cancelled" && (
        <ol className="timeline">
          {steps.map((s, i) => (
            <li className={i <= position ? "done" : ""} key={s}>
              <span>{i < position ? <Check size={14} /> : i + 1}</span>
              <strong>
                {s === "pending"
                  ? "Placed"
                  : s === "delivered"
                    ? "Completed"
                    : label(s)}
              </strong>
            </li>
          ))}
        </ol>
      )}
      <div className="order-content-grid">
        <div>
          <h2>Your order</h2>
          {order.items.map((item, i) => (
            <div className="order-line" key={i}>
              <img src={item.image} alt="" width="64" height="64" />
              <div>
                <strong>
                  {item.quantity} × {item.name}
                </strong>
                {item.addOns?.length > 0 && (
                  <p>{item.addOns.map((o) => o.name).join(", ")}</p>
                )}
                {item.note && <p>{item.note}</p>}
              </div>
              <strong>
                {money(
                  (item.priceCents ?? Math.round(item.price * 100)) *
                    item.quantity,
                  order.currency,
                )}
              </strong>
            </div>
          ))}
          <div className="summary-line">
            <span>Delivery</span>
            <span>{money(order.deliveryCents || 0, order.currency)}</span>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <strong>{money(orderTotal(order), order.currency)}</strong>
          </div>
          <p className="hint">
            {order.demo
              ? "Demo order. No payment or fulfilment is required."
              : order.paymentStatus === "paid"
                ? "Payment received."
                : "Payment due in cash " +
                  (order.fulfilment === "pickup"
                    ? "at pickup."
                    : "on delivery.")}
          </p>
        </div>
        <div className="order-contact">
          <h3>
            {order.fulfilment === "pickup"
              ? "Pickup details"
              : "Delivery details"}
          </h3>
          <p>
            {order.contact?.name || user.name}
            <br />
            {order.contact?.phone}
            <br />
            {order.contact?.line}
            <br />
            {order.contact?.area}
          </p>
          {order.contact?.instructions && (
            <p>Note: {order.contact.instructions}</p>
          )}
          <h3>Latest updates</h3>
          {(order.history || [])
            .slice()
            .reverse()
            .map((h, i) => (
              <p key={i}>
                {label(h.status)}
                <br />
                <small>{date(h.at)}</small>
              </p>
            ))}
          {!order.history?.length && <p>{label(order.status)}</p>}
          <p className="hint">Status refreshes every 15 seconds.</p>
        </div>
      </div>
      <div className="button-row order-actions">
        {isOwner && order.status === "pending" && (
          <button className="button secondary" disabled={busy} onClick={cancel}>
            Cancel order
          </button>
        )}
        <button className="button" onClick={reorder}>
          Order again
          <ArrowUpRight size={16} />
        </button>
        {user.role === "admin" &&
          statusOptions(order).map((s) => (
            <button
              key={s}
              className="button secondary"
              disabled={busy}
              onClick={() => update(s)}
            >
              Mark {label(s).toLowerCase()}
            </button>
          ))}
      </div>
    </div>
  );
}
