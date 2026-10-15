import { useState, useEffect } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowUpRight,
  ArrowLeft,
  Plus,
  Pencil,
  Archive,
  LayoutDashboard,
  ClipboardList,
  Utensils,
  Users,
  Settings,
  Inbox,
  Check,
  Search,
} from "lucide-react";
import { useApp } from "../lib/context";
import { api, money, date, label, orderTotal, statusOptions } from "../lib/api";
import { useResource } from "../lib/useResource";
import { Brand, Field, Loading, ErrorState, Empty } from "../components/ui";
export default function Admin() {
  useEffect(() => {
    document.title = "Restaurant desk — FOOD";
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.append(robots);
    }
    robots.content = "noindex,nofollow";
  }, []);
  const { user, settings } = useApp();
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Brand />
        <span className="eyebrow">THE RESTAURANT DESK</span>
        <nav aria-label="Administration">
          {[
            ["/admin", "Overview", LayoutDashboard],
            ["/admin/orders", "Orders", ClipboardList],
            ["/admin/menu", "The menu", Utensils],
            ["/admin/customers", "Customers", Users],
            ["/admin/messages", "Support inbox", Inbox],
            ["/admin/settings", "Settings", Settings],
          ].map(([to, name, Icon]) => (
            <NavLink end={to === "/admin"} to={to} key={to}>
              <Icon size={18} />
              {name}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <span>
            {user.name}
            <small>Administrator</small>
          </span>
          <Link to="/">
            <ArrowLeft size={16} />
            Back to the shop
          </Link>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-top">
          <span>
            {settings?.demoMode
              ? "FOOD / DEMO RESTAURANT — NO REAL PAYMENTS"
              : "FOOD / RESTAURANT DESK"}
          </span>
          <Link to="/">
            View storefront
            <ArrowUpRight size={15} />
          </Link>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
export function Overview() {
  const [days, setDays] = useState("30");
  const { data, loading, error, reload } = useResource(
    `/admin/stats?days=${days}`,
  );
  const { settings } = useApp();
  const audit = useResource("/admin/audit");
  return (
    <>
      <div className="admin-heading">
        <div>
          <p className="eyebrow">A LITTLE PERSPECTIVE</p>
          <h1>The overview.</h1>
          <p>What’s happening in your restaurant.</p>
        </div>
        <select
          aria-label="Reporting period"
          value={days}
          onChange={(e) => setDays(e.target.value)}
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>
      {error ? (
        <ErrorState message={error} retry={reload} />
      ) : loading ? (
        <Loading />
      ) : (
        <>
          <div className="stats-grid">
            {[
              [
                "Paid revenue",
                money(data.revenue, settings?.currency),
                "Received payments, excluding cancelled orders",
              ],
              [
                "Orders",
                data.orders,
                `${data.completed} completed in this period`,
              ],
              [
                "Awaiting completion",
                data.pending,
                "All active orders, regardless of date",
              ],
              [
                "Average paid order",
                money(data.average, settings?.currency),
                `${data.paidOrders} paid orders in this period`,
              ],
            ].map(([name, value, caption]) => (
              <div className="stat-card" key={name}>
                <span>{name}</span>
                <strong>{value}</strong>
                <small>{caption}</small>
              </div>
            ))}
          </div>
          <div className="admin-panel">
            <div className="panel-heading">
              <h2>Recent orders</h2>
              <Link className="text-link" to="/admin/orders">
                All orders
                <ArrowUpRight size={16} />
              </Link>
            </div>
            <OrdersTable items={data.recent} />
          </div>
          <div className="admin-bottom-grid">
            <div className="admin-panel">
              <h2>A place for everything</h2>
              <Link className="admin-shortcut" to="/admin/menu">
                <Utensils size={20} />
                Manage {data.products} menu items
                <ArrowUpRight size={17} />
              </Link>
              <Link className="admin-shortcut" to="/admin/customers">
                <Users size={20} />
                View {data.customers} customers
                <ArrowUpRight size={17} />
              </Link>
              <Link className="admin-shortcut" to="/admin/settings">
                <Settings size={20} />
                Restaurant settings
                <ArrowUpRight size={17} />
              </Link>
            </div>
            <div className="admin-panel">
              <h2>Best sellers</h2>
              {data.bestSellers?.length ? (
                data.bestSellers.map((item) => (
                  <div className="audit-line" key={item.name}>
                    <strong>{item.name}</strong>
                    <span>{item.quantity} portions in paid orders</span>
                  </div>
                ))
              ) : (
                <p className="muted">Paid orders will reveal the favorites.</p>
              )}
              <h2>Activity</h2>
              {audit.data?.length ? (
                audit.data.slice(0, 5).map((a) => (
                  <div className="audit-line" key={a._id}>
                    <strong>{a.action}</strong>
                    <span>
                      {a.resource} · {date(a.createdAt)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="muted">
                  Administrative changes will appear here.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
function OrdersTable({ items = [] }) {
  return items.length ? (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Total</th>
            <th>Payment</th>
            <th>
              <span className="sr-only">Open</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((o) => (
            <tr key={o._id}>
              <td>
                <Link to={`/admin/orders/${o._id}`}>
                  <strong>{o.number || o._id.slice(-8).toUpperCase()}</strong>
                </Link>
                <small>{date(o.createdAt)}</small>
              </td>
              <td>
                {o.contact?.name || o.email}
                <small>{o.fulfilment || "delivery"}</small>
              </td>
              <td>
                <span className={`status ${o.status}`}>{label(o.status)}</span>
              </td>
              <td>{money(orderTotal(o), o.currency)}</td>
              <td>{label(o.paymentStatus || "unpaid")}</td>
              <td>
                <Link
                  className="icon-button"
                  aria-label={`Open order ${o.number || o._id}`}
                  to={`/admin/orders/${o._id}`}
                >
                  <ArrowUpRight size={18} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <Empty title="Nothing in the queue." to={null}>
      New orders will appear here.
    </Empty>
  );
}
export function AdminOrders() {
  const [queryParams] = useSearchParams();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("all"),
    [q, setQ] = useState(queryParams.get("q") || ""),
    [page, setPage] = useState(1);
  const { data, loading, error, reload } = useResource(
    `/admin/orders?status=${status}&q=${encodeURIComponent(q)}&page=${page}&from=${from}&to=${to}`,
    15000,
  );
  const [busy, setBusy] = useState("");
  const { notify } = useApp();
  const change = async (order, body) => {
    setBusy(order._id);
    try {
      await api(`/admin/orders/${order._id}`, { method: "PATCH", body });
      reload();
      notify("Order updated.");
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setBusy("");
    }
  };
  return (
    <>
      <div className="admin-heading">
        <div>
          <p className="eyebrow">THE KITCHEN QUEUE</p>
          <h1>Orders.</h1>
          <p>From the first craving to the last bite.</p>
        </div>
        <button className="button secondary" onClick={reload}>
          Refresh
        </button>
      </div>
      <div className="admin-filter">
        <label className="search-field">
          <Search size={18} />
          <input
            aria-label="Search orders"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Name, email or order number"
          />
        </label>
        <select
          aria-label="Filter orders by status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          {[
            "all",
            "pending",
            "confirmed",
            "preparing",
            "out-for-delivery",
            "ready",
            "delivered",
            "cancelled",
          ].map((s) => (
            <option key={s} value={s}>
              {label(s)}
            </option>
          ))}
        </select>
        <label className="date-filter">
          From
          <input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <label className="date-filter">
          To
          <input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
          />
        </label>
      </div>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} retry={reload} />
      ) : (
        <>
          <div className="admin-panel">
            <OrdersTable items={data.items} />
          </div>
          <div className="quick-order-list">
            {data.items
              .filter(
                (o) =>
                  !["delivered", "cancelled"].includes(o.status) ||
                  o.paymentStatus !== "paid",
              )
              .map((o) => (
                <div key={o._id}>
                  <span>
                    <strong>{o.number || o._id.slice(-8)}</strong>
                    <small>
                      {label(o.status)} · {label(o.paymentStatus || "unpaid")}
                    </small>
                  </span>
                  <div className="button-row">
                    {statusOptions(o).map((s) => (
                      <button
                        className="button small secondary"
                        disabled={busy === o._id}
                        key={s}
                        onClick={() => change(o, { status: s })}
                      >
                        {label(s)}
                      </button>
                    ))}
                    {o.paymentStatus !== "paid" && o.status !== "cancelled" && (
                      <button
                        className="button small"
                        disabled={busy === o._id}
                        onClick={() => change(o, { paymentStatus: "paid" })}
                      >
                        Record cash payment
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
          <div className="pagination">
            <span>
              {data.total} orders · Page {page}
            </span>
            <div>
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <button
                disabled={page * 20 >= data.total}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
export function AdminMenu() {
  const { products, settings, refreshCatalog, notify, confirm } = useApp();
  const [busy, setBusy] = useState("");
  const archive = async (p) => {
    if (
      !(await confirm(
        `Archive ${p.name}? It will leave the menu. Past orders will keep their details.`,
      ))
    )
      return;
    setBusy(p._id);
    try {
      await api(`/products/${p._id}`, { method: "DELETE" });
      await refreshCatalog();
      notify("Dish archived.");
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setBusy("");
    }
  };
  return (
    <>
      <div className="admin-heading">
        <div>
          <p className="eyebrow">WHAT’S COOKING</p>
          <h1>The menu.</h1>
          <p>Keep the favorites. Make room for something new.</p>
        </div>
        <Link className="button" to="/admin/menu/new">
          Add a dish
          <Plus size={17} />
        </Link>
      </div>
      <div className="admin-panel">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Dish</th>
                <th>Category</th>
                <th>Price</th>
                <th>Availability</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="table-dish">
                      <img src={p.image} alt="" width="56" height="56" />
                      <span>
                        <strong>{p.name}</strong>
                        <small>
                          {p.featured ? "Featured · " : ""}
                          {p.weight}
                        </small>
                      </span>
                    </div>
                  </td>
                  <td>{p.category}</td>
                  <td>
                    {money(Math.round(p.price * 100), settings?.currency)}
                  </td>
                  <td>
                    <span
                      className={`status ${p.available === false ? "cancelled" : "delivered"}`}
                    >
                      {p.available === false ? "Unavailable" : "Available"}
                    </span>
                  </td>
                  <td>
                    <div className="button-row">
                      <Link
                        aria-label={`Edit ${p.name}`}
                        className="icon-button"
                        to={`/admin/menu/${p._id}/edit`}
                      >
                        <Pencil size={17} />
                      </Link>
                      <button
                        className="icon-button"
                        disabled={busy === p._id}
                        aria-label={`Archive ${p.name}`}
                        onClick={() => archive(p)}
                      >
                        <Archive size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
export function ProductEditor() {
  const { id } = useParams();
  const { products, refreshCatalog, notify } = useApp();
  const product = products.find((p) => p._id === id);
  const navigate = useNavigate();
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [image, setImage] = useState(product?.image || "/food/burger.jpg"),
    [uploading, setUploading] = useState(false);
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget),
      body = Object.fromEntries(f);
    body.price = Number(body.price);
    body.image = image;
    body.addOns = String(body.addOnLines || "")
      .split("\n")
      .filter((line) => line.trim())
      .map((line, index) => {
        const [name, price] = line.split("|").map((x) => x.trim());
        return {
          key: product?.addOns?.[index]?.key || "extra-" + index,
          name,
          priceCents: Math.round(Number(price) * 100),
        };
      });
    for (const key of ["available", "featured", "vegetarian"])
      body[key] = f.has(key);
    try {
      await api(id ? `/products/${id}` : "/products", {
        method: id ? "PUT" : "POST",
        body,
      });
      await refreshCatalog();
      notify("The menu is updated.");
      navigate("/admin/menu");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024)
      return setError("Choose an image smaller than 5 MB.");
    setUploading(true);
    setError("");
    try {
      const r = await api("/uploads", {
        method: "POST",
        body: file,
        headers: { "Content-Type": file.type },
      });
      setImage(r.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };
  if (id && !product)
    return (
      <Empty
        title="Dish not found."
        to="/admin/menu"
        action="Back to the menu"
      />
    );
  return (
    <>
      <Link className="back-link" to="/admin/menu">
        <ArrowLeft size={16} />
        Menu management
      </Link>
      <div className="admin-heading">
        <h1>{id ? "Edit this dish." : "Something new."}</h1>
      </div>
      <form className="admin-panel form-stack" onSubmit={save}>
        {error && (
          <p className="notice error" role="alert">
            {error}
          </p>
        )}
        <div className="form-grid">
          <Field
            label="Dish name"
            name="name"
            required
            maxLength="100"
            defaultValue={product?.name}
          />
          <Field label="Category">
            <select
              name="category"
              defaultValue={product?.category || "Burger"}
            >
              {["Burger", "Pizza", "Pasta", "Dessert", "Drink"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field
            label="Price"
            name="price"
            type="number"
            min="0.01"
            max="10000"
            step="0.01"
            required
            defaultValue={product?.price}
          />
          <Field
            label="Portion"
            name="weight"
            defaultValue={product?.weight}
            maxLength="60"
            placeholder="One bowl, 12 inch…"
          />
        </div>
        <Field label="Description">
          <textarea
            name="description"
            defaultValue={product?.description}
            maxLength="1000"
            rows="3"
          />
        </Field>
        <Field
          label="Allergens"
          name="allergens"
          defaultValue={product?.allergens}
          maxLength="300"
        />
        <Field label="Optional add-ons (one per line: name | extra price)">
          <textarea
            name="addOnLines"
            rows="3"
            placeholder="Extra cheese | 1.00"
            defaultValue={(product?.addOns || [])
              .map((o) => `${o.name} | ${(o.priceCents / 100).toFixed(2)}`)
              .join("\n")}
          />
        </Field>
        <div className="image-editor">
          <img src={image} alt="Dish preview" width="160" height="120" />
          <div>
            <Field
              label="Image URL"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              required
            />
            <label className="field">
              <span>Or upload JPEG, PNG, WebP (up to 5 MB)</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={upload}
              />
            </label>
            <p className="hint">
              Uploads require the server image-host integration. Bundled images
              and HTTPS URLs work without it.
            </p>
          </div>
        </div>
        <div className="button-row">
          {[
            ["available", "Available to order"],
            ["featured", "Feature on homepage"],
            ["vegetarian", "Vegetarian"],
          ].map(([key, name]) => (
            <label className="check-line" key={key}>
              <input
                name={key}
                type="checkbox"
                defaultChecked={
                  product
                    ? product[key] !== false && Boolean(product[key])
                    : key === "available"
                }
              />
              {name}
            </label>
          ))}
        </div>
        <button className="button" disabled={busy || uploading}>
          {busy ? "Saving…" : uploading ? "Uploading…" : "Save dish"}
          <Check size={17} />
        </button>
      </form>
    </>
  );
}
export function Customers() {
  const { data, loading, error, reload } = useResource("/admin/customers");
  const [q, setQ] = useState("");
  return (
    <>
      <div className="admin-heading">
        <div>
          <p className="eyebrow">THE PEOPLE AT YOUR TABLE</p>
          <h1>Customers.</h1>
          <p>Account information and order counts. Passwords stay private.</p>
        </div>
      </div>
      <label className="search-field">
        <Search size={18} />
        <input
          aria-label="Search customers"
          placeholder="Search by name or email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </label>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} retry={reload} />
      ) : (
        <div className="admin-panel">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Orders</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {data
                  .filter((u) =>
                    `${u.name} ${u.email}`
                      .toLowerCase()
                      .includes(q.toLowerCase()),
                  )
                  .map((u) => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>
                        <Link
                          to={`/admin/orders?q=${encodeURIComponent(u.email)}`}
                        >
                          {u.email} ↗
                        </Link>
                      </td>
                      <td>{label(u.role)}</td>
                      <td>{u.orders}</td>
                      <td>{date(u.createdAt)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
export function RestaurantSettings() {
  const { settings, refreshCatalog, notify } = useApp();
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  if (!settings) return <Loading />;
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget),
      b = Object.fromEntries(f);
    b.orderingEnabled = f.has("orderingEnabled");
    b.pickupEnabled = f.has("pickupEnabled");
    b.demoMode = f.has("demoMode");
    b.deliveryAreas = b.deliveryAreas
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
    b.deliveryFeeCents = Math.round(Number(b.deliveryFee) * 100);
    b.minimumCents = Math.round(Number(b.minimum) * 100);
    try {
      await api("/admin/settings", { method: "PUT", body: b });
      await refreshCatalog();
      notify("Restaurant settings saved.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <div className="admin-heading">
        <div>
          <p className="eyebrow">THE WAY YOU WORK</p>
          <h1>Restaurant settings.</h1>
          <p>Details customers need, and the rules behind each order.</p>
        </div>
      </div>
      <form className="admin-panel form-stack" onSubmit={save}>
        {error && (
          <p className="notice error" role="alert">
            {error}
          </p>
        )}
        <h2>The basics</h2>
        <div className="form-grid">
          {[
            ["name", "Restaurant name"],
            ["tagline", "Tagline"],
            ["email", "Contact email"],
            ["phone", "Contact phone"],
            ["address", "Pickup address"],
            ["hours", "Opening hours (display text)"],
            ["currency", "Currency code"],
            ["timezone", "Timezone"],
          ].map(([key, title]) => (
            <Field
              key={key}
              label={title}
              name={key}
              defaultValue={settings[key]}
              required={["name", "currency", "timezone"].includes(key)}
            />
          ))}
        </div>
        <p className="hint">
          Opening hours are displayed to customers. Use the accepting-orders
          switch below to control the kitchen.
        </p>
        <h2>Delivery & pickup</h2>
        <div className="form-grid">
          <Field
            label="Delivery fee"
            name="deliveryFee"
            type="number"
            min="0"
            max="1000"
            step="0.01"
            required
            defaultValue={settings.deliveryFeeCents / 100}
          />
          <Field
            label="Minimum order"
            name="minimum"
            type="number"
            min="0"
            max="1000"
            step="0.01"
            required
            defaultValue={settings.minimumCents / 100}
          />
        </div>
        <Field label="Delivery areas (one per line)">
          <textarea
            name="deliveryAreas"
            defaultValue={settings.deliveryAreas.join("\n")}
            rows="4"
          />
        </Field>
        <label className="check-line">
          <input
            name="demoMode"
            type="checkbox"
            defaultChecked={settings.demoMode}
          />
          Demo mode — no real deliveries or charges
        </label>
        <div className="button-row">
          <label className="check-line">
            <input
              name="orderingEnabled"
              type="checkbox"
              defaultChecked={settings.orderingEnabled}
            />
            Accepting orders
          </label>
          <label className="check-line">
            <input
              name="pickupEnabled"
              type="checkbox"
              defaultChecked={settings.pickupEnabled}
            />
            Offer pickup
          </label>
        </div>
        <button className="button" disabled={busy}>
          {busy ? "Saving…" : "Save settings"}
          <Check size={17} />
        </button>
      </form>
    </>
  );
}
export function Messages() {
  const { data, loading, error, reload } = useResource("/admin/messages");
  const { notify } = useApp();
  const toggle = async (m) => {
    try {
      await api(`/admin/messages/${m._id}`, {
        method: "PATCH",
        body: { resolved: !m.resolved },
      });
      reload();
    } catch (e) {
      notify(e.message, "error");
    }
  };
  return (
    <>
      <div className="admin-heading">
        <div>
          <p className="eyebrow">A LINE TO YOUR CUSTOMERS</p>
          <h1>Support inbox.</h1>
          <p>Messages sent through the contact page.</p>
        </div>
      </div>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} retry={reload} />
      ) : !data.length ? (
        <Empty title="All quiet here." to={null}>
          Customer messages will arrive here.
        </Empty>
      ) : (
        data.map((m) => (
          <article className="admin-panel message-card" key={m._id}>
            <div>
              <h2>{m.name}</h2>
              <span
                className={`status ${m.resolved ? "delivered" : "pending"}`}
              >
                {m.resolved ? "Resolved" : "Open"}
              </span>
            </div>
            <p className="muted">
              {m.email} · {date(m.createdAt)}
            </p>
            <p className="message-text">{m.message}</p>
            <button
              className="button small secondary"
              onClick={() => toggle(m)}
            >
              {m.resolved ? "Reopen" : "Mark resolved"}
            </button>
          </article>
        ))
      )}
    </>
  );
}
