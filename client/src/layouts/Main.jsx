import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Menu,
  X,
  ShoppingBag,
  ArrowUpRight,
  UserRound,
  LogOut,
} from "lucide-react";
import { useApp } from "../lib/context";
import { Brand } from "../components/ui";
export default function Main() {
  const {
    user,
    settings,
    cart,
    logout,
    notify,
    catalogError,
    refreshCatalog,
    products,
  } = useApp();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const count = cart.reduce((n, x) => n + x.quantity, 0);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.append(robots);
    }
    robots.content =
      /^\/(account|checkout|orders|login|signup|forgot-password|reset-password)/.test(
        location.pathname,
      )
        ? "noindex,nofollow"
        : "index,follow";
    const names = {
      "/": "FOOD — Good food. No occasion needed.",
      "/menu": "The menu",
      "/about": "Our story",
      "/how-it-works": "How ordering works",
      "/contact": "Contact us",
      "/faq": "Your questions",
      "/cart": "Your bag",
      "/checkout": "Checkout",
      "/login": "Sign in",
      "/signup": "Create an account",
      "/forgot-password": "Password recovery",
      "/account": "Your profile",
      "/account/addresses": "Saved addresses",
      "/account/favorites": "Saved favorites",
      "/account/orders": "Your orders",
      "/privacy": "Privacy policy",
      "/terms": "Terms",
      "/delivery-policy": "Delivery & pickup",
      "/refund-policy": "Changes & cancellations",
    };
    const dish = products.find(
      (p) => location.pathname === `/menu/${p.slug || p._id}`,
    );
    const title =
      names[location.pathname] ||
      (dish
        ? dish.name
        : /\/orders\//.test(location.pathname)
          ? "Your order"
          : location.pathname.startsWith("/reset-password")
            ? "Reset password"
            : "Page not found");
    document.title = title.startsWith("FOOD") ? title : `${title} — FOOD`;
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute("content", document.title);
  }, [location.pathname, products]);
  const signOut = async () => {
    try {
      await logout();
      navigate("/");
    } catch (e) {
      notify(e.message, "error");
    }
  };
  const links = [
    ["/menu", "The menu"],
    ["/about", "Our story"],
    ["/how-it-works", "How it works"],
  ];
  return (
    <>
      <a className="skip-link" href="#content">
        Skip to content
      </a>
      {settings?.demoMode ? (
        <div className="preview-bar">
          Demo restaurant · Test orders only. No real deliveries or charges.
        </div>
      ) : (
        settings?.preview && (
          <div className="preview-bar">
            Local preview <span>·</span> Sample menu. Orders stay in the preview
            database.
          </div>
        )
      )}
      <header
        className="site-header"
        onClick={(e) => {
          if (e.target.closest("a")) setOpen(false);
        }}
      >
        <div className="nav-wrap">
          <Brand />
          <nav className="desktop-nav" aria-label="Main navigation">
            {links.map(([to, name]) => (
              <NavLink key={to} to={to}>
                {name}
              </NavLink>
            ))}
          </nav>
          <div className="nav-actions">
            {user ? (
              <>
                <Link
                  className="account-link"
                  to={user.role === "admin" ? "/admin" : "/account"}
                >
                  <UserRound size={18} />
                  <span>
                    {user.role === "admin"
                      ? "Dashboard"
                      : user.name.split(" ")[0]}
                  </span>
                </Link>
                <button
                  className="icon-button logout-button"
                  onClick={signOut}
                  aria-label="Sign out"
                >
                  <LogOut size={17} />
                </button>
              </>
            ) : (
              <Link className="signin-link" to="/login">
                Sign in <ArrowUpRight size={15} />
              </Link>
            )}
            <Link
              className="bag-link"
              to="/cart"
              aria-label={`Shopping bag, ${count} items`}
            >
              <ShoppingBag size={18} />
              <span className="desktop-label">Your bag</span>
              <b>{count}</b>
            </Link>
            <button
              className="icon-button mobile-toggle"
              aria-label={open ? "Close navigation" : "Open navigation"}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {[
              ...links,
              ["/contact", "Contact"],
              ...(user
                ? [
                    ["/account", "My account"],
                    ...(user.role === "admin" ? [["/admin", "Dashboard"]] : []),
                  ]
                : [["/login", "Sign in"]]),
            ].map(([to, name]) => (
              <Link onClick={() => setOpen(false)} to={to} key={to}>
                {name}
                <ArrowUpRight size={16} />
              </Link>
            ))}
          </nav>
        )}
      </header>
      <main id="content" tabIndex="-1">
        {catalogError && !settings && (
          <div className="container">
            <div className="notice error" role="alert">
              We couldn’t connect to the menu.{" "}
              <button className="quiet-link" onClick={refreshCatalog}>
                Try again
              </button>
            </div>
          </div>
        )}
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container footer-top">
          <div className="footer-brand">
            <Brand light />
            <p>
              For the everyday appetite.
              <br />
              And the occasional extra side.
            </p>
          </div>
          <div>
            <span className="footer-label">Come hungry</span>
            <Link to="/menu">The menu</Link>
            <Link to="/about">Our story</Link>
            <Link to="/how-it-works">How it works</Link>
          </div>
          <div>
            <span className="footer-label">A little help</span>
            <Link to="/contact">Contact us</Link>
            <Link to="/faq">Your questions</Link>
            <Link to="/delivery-policy">Delivery & pickup</Link>
          </div>
          <div>
            <span className="footer-label">Your corner</span>
            <Link to="/account/orders">Your orders</Link>
            <Link to="/account/favorites">Saved favorites</Link>
            <Link to="/account">Your account</Link>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>
            © {new Date().getFullYear()} {settings?.name || "FOOD"}. Made for
            good appetites.
          </span>
          <div>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/refund-policy">Cancellations</Link>
          </div>
        </div>
      </footer>
      {count > 0 &&
        location.pathname !== "/cart" &&
        location.pathname !== "/checkout" && (
          <Link to="/cart" className="mobile-bag">
            <ShoppingBag size={18} />
            <span>
              View your bag · {count} {count === 1 ? "item" : "items"}
            </span>
            <ArrowUpRight size={18} />
          </Link>
        )}
    </>
  );
}
