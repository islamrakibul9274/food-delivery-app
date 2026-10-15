import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  Utensils,
  ShoppingBag,
  Bike,
  Smartphone,
  Plus,
  Check,
} from "lucide-react";
import { useApp } from "../lib/context";
import { money } from "../lib/api";
import {
  ButtonLink,
  ProductCard,
  TextLink,
  Loading,
  ErrorState,
} from "../components/ui";
export default function Home() {
  const { products, settings, catalogError, refreshCatalog } = useApp();
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const heroDish =
    products.find((p) => p.category === "Burger" && p.available !== false) ||
    featured[0] ||
    products[0];
  const [install, setInstall] = useState(null);
  const [instructions, setInstructions] = useState(false);
  const [installed, setInstalled] = useState(false);
  useEffect(() => {
    const capture = (e) => {
      e.preventDefault();
      setInstall(e);
    };
    const done = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", capture);
    window.addEventListener("appinstalled", done);
    return () => {
      window.removeEventListener("beforeinstallprompt", capture);
      window.removeEventListener("appinstalled", done);
    };
  }, []);
  const installApp = async () => {
    if (install) {
      await install.prompt();
      setInstall(null);
    } else setInstructions(!instructions);
  };
  return (
    <>
      <section className="container hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="small-rule" /> FOR THE EVERYDAY APPETITE
          </p>
          <h1>
            Your usual.
            <br /> Or your next
            <br />
            <em>favorite.</em>
          </h1>
          <p className="hero-description">
            A proper burger. A slice worth sharing. The pasta you keep coming
            back for. Find what you’re hungry for.
          </p>
          <div className="button-row">
            <ButtonLink>Find your favorite</ButtonLink>
            <Link className="quiet-link" to="/how-it-works">
              How it works <ArrowRight size={16} />
            </Link>
          </div>
          <div className="hero-notes">
            <span>
              <Utensils size={16} />
              Made to order
            </span>
            <i />
            <span>
              <ShoppingBag size={16} />
              Delivery or pickup
            </span>
          </div>
        </div>
        <div className="hero-photo">
          <img
            src={heroDish?.image || "/food/burger.jpg"}
            alt={heroDish?.name || "Explore our comfort food menu"}
            width="1400"
            height="1000"
            fetchPriority="high"
          />
          <span className="photo-caption">THE COMFORT FOOD CLUB</span>
          <div className="hero-dish">
            <div>
              <span className="eyebrow">MEET YOUR NEXT ORDER</span>
              <Link
                to={
                  heroDish ? `/menu/${heroDish.slug || heroDish._id}` : "/menu"
                }
              >
                {heroDish?.name || "Explore the menu"}{" "}
                <ArrowUpRight size={20} />
              </Link>
            </div>
            <span>
              {heroDish
                ? money(Math.round(heroDish.price * 100), settings?.currency)
                : "On the menu"}
            </span>
          </div>
        </div>
      </section>
      <div className="category-ribbon" aria-label="Menu categories">
        <div className="container">
          <Link to="/menu?category=Burger">
            Burgers <span>✳</span>
          </Link>
          <Link to="/menu?category=Pizza">
            Pizza <span>✳</span>
          </Link>
          <Link to="/menu?category=Pasta">
            Pasta <span>✳</span>
          </Link>
          <Link to="/menu?category=Dessert">
            Something sweet <span>✳</span>
          </Link>
          <Link to="/menu?category=Drink">Something cold</Link>
        </div>
      </div>
      <section className="container section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE SHORTLIST</p>
            <h2>
              Hard to pick.
              <br />
              <em>Easy to love.</em>
            </h2>
          </div>
          <div>
            <p>
              A few good places to start.
              <br />
              There’s more where these came from.
            </p>
            <TextLink to="/menu">See the whole menu</TextLink>
          </div>
        </div>
        {catalogError ? (
          <ErrorState message={catalogError} retry={refreshCatalog} />
        ) : !settings ? (
          <Loading />
        ) : (
          <div className="food-grid">
            {(featured.length ? featured : products.slice(0, 4)).map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
          </div>
        )}
      </section>
      <section className="how-section">
        <div className="container how-layout">
          <div>
            <p className="eyebrow">FROM OUR MENU TO YOUR TABLE</p>
            <h2>
              Good food.
              <br />
              <em>Simple plans.</em>
            </h2>
            <p className="muted">
              Lunch on a busy day. Dinner on the sofa.
              <br />
              We’ll leave the occasion up to you.
            </p>
            <TextLink to="/how-it-works">Here’s how it works</TextLink>
          </div>
          <div className="steps">
            {[
              [
                Utensils,
                "01",
                "Find your craving",
                "Browse the menu and choose the dishes that sound good to you.",
              ],
              [
                ShoppingBag,
                "02",
                "Make it yours",
                "Check your bag, leave a note, and choose delivery or pickup.",
              ],
              [
                Bike,
                "03",
                "We’ll take it from here",
                "Follow your order’s progress from the kitchen to the table.",
              ],
            ].map(([Icon, num, title, body]) => (
              <div className="step" key={num}>
                <div className="step-icon">
                  <Icon size={24} />
                </div>
                <div>
                  <span>{num}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="container section">
        <div className="mobile-promo">
          <div className="phone-scene">
            <span className="phone-side-note">YOUR MENU. TO GO.</span>
            <div
              className="phone-frame"
              aria-label="Preview of the mobile menu"
            >
              <div className="phone-top">
                <span>FOOD / MOBILE</span>
                <Smartphone size={12} />
              </div>
              <div className="phone-content">
                <div className="phone-logo">food.</div>
                <p>What sounds good?</p>
                <h3>
                  A little something
                  <br />
                  for every craving.
                </h3>
                <div className="phone-categories">
                  <b>All</b>
                  <span>Burgers</span>
                  <span>Pizza</span>
                </div>
                {products.slice(0, 2).map((p) => (
                  <div className="phone-item" key={p._id}>
                    <img
                      src={p.image}
                      alt=""
                      width="180"
                      height="120"
                      loading="lazy"
                    />
                    <div>
                      <strong>{p.name}</strong>
                      <span>
                        {money(Math.round(p.price * 100), settings?.currency)}{" "}
                        <Plus size={14} />
                      </span>
                    </div>
                  </div>
                ))}
                <div className="phone-bottom">
                  The menu <span>My bag</span>
                  <span>Account</span>
                </div>
              </div>
            </div>
          </div>
          <div className="promo-copy">
            <p className="eyebrow">A LITTLE CLOSER TO YOUR CRAVINGS</p>
            <h2>
              Your favorites.
              <br />
              <em>At your fingertips.</em>
            </h2>
            <p>
              The whole menu, your saved dishes, and your next order. Add FOOD
              to your home screen and keep the good stuff close.
            </p>
            <button className="button cream" onClick={installApp}>
              {installed ? (
                <>
                  <Check size={17} />
                  Added to your home screen
                </>
              ) : (
                <>
                  Add to home screen <ArrowUpRight size={17} />
                </>
              )}
            </button>
            {instructions && (
              <div className="install-help" role="status">
                <strong>Open FOOD in your phone’s browser.</strong>
                <p>
                  On iPhone: tap Share, then Add to Home Screen. On supported
                  Android browsers: open the menu and choose Install app or Add
                  to Home screen.
                </p>
              </div>
            )}
            <span className="promo-footnote">
              No app store. Just good food, one tap away.
            </span>
          </div>
        </div>
      </section>
      <section className="container faq-teaser">
        <p className="eyebrow">BEFORE YOU ORDER</p>
        <h2>
          A few things
          <br />
          you might be wondering.
        </h2>
        <div>
          {[
            [
              "Can I pick up my order?",
              "Choose pickup at checkout when it’s available. Your order page will let you know when it’s ready.",
            ],
            [
              "How do I follow my order?",
              "Open Your orders in your account to see updates as the kitchen changes your order status.",
            ],
            [
              "What about allergies?",
              "Check each dish’s allergen notes and contact the restaurant before ordering if you have a food allergy.",
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <Plus size={18} />
              </summary>
              <p>{a}</p>
            </details>
          ))}
          <TextLink to="/faq">All your questions, answered</TextLink>
        </div>
      </section>
    </>
  );
}
