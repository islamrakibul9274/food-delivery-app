import { useState } from "react";
import { Link, useRouteError } from "react-router-dom";
import {
  ArrowUpRight,
  Plus,
  Mail,
  MapPin,
  Clock,
  Phone,
  Utensils,
  ShoppingBag,
  Bike,
} from "lucide-react";
import { useApp } from "../lib/context";
import { api, money } from "../lib/api";
import { PageIntro, Field, ButtonLink } from "../components/ui";
export default function Info({ page = "about" }) {
  const { settings } = useApp();
  const [error, setError] = useState(""),
    [sent, setSent] = useState(false),
    [busy, setBusy] = useState(false);
  const contact = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/messages", {
        method: "POST",
        body: Object.fromEntries(new FormData(e.currentTarget)),
      });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const faq = [
    [
      "How do I order?",
      "Choose your dishes from the menu, add them to your bag, and sign in to check out. Select delivery or pickup and confirm your contact details.",
    ],
    [
      "Where do you deliver?",
      settings?.deliveryAreas?.join(", ") ||
        "Available delivery areas are listed at checkout.",
    ],
    [
      "How much is delivery?",
      `The current delivery fee is ${money(settings?.deliveryFeeCents, settings?.currency)}. Pickup has no delivery fee. Your full total is shown before you order.`,
    ],
    [
      "Can I cancel an order?",
      "You can cancel from your order details while the order is awaiting confirmation. Once the kitchen confirms it, contact the restaurant to ask about any changes.",
    ],
    [
      "Can I pay online?",
      "For now, payment is in cash on delivery or at pickup. No card details are collected.",
    ],
    [
      "How do I know when it’s ready?",
      "Your order page shows updates from the kitchen. It refreshes every 15 seconds while the page is open.",
    ],
    [
      "Do you cater for food allergies?",
      "Allergen notes appear on dish pages where available. Contact the restaurant before ordering if you have an allergy; kitchen notes cannot guarantee allergen-free preparation.",
    ],
    [
      "Do you have an app?",
      "You can add this website to your home screen on supported browsers. There is no separate App Store or Google Play download.",
    ],
  ];
  if (page === "contact")
    return (
      <div className="container page-space">
        <PageIntro
          eyebrow="LET’S TALK"
          title={
            <>
              A question?
              <br />
              <em>We’re listening.</em>
            </>
          }
        >
          Order questions, menu questions, or just something we should know.
        </PageIntro>
        <div className="contact-layout">
          <div className="contact-details">
            {[
              [Mail, "Email", settings?.email],
              [Phone, "Phone", settings?.phone],
              [MapPin, "Pickup", settings?.address],
              [Clock, "Hours", settings?.hours],
            ]
              .filter((x) => x[2])
              .map(([Icon, title, value]) => (
                <div key={title}>
                  <Icon size={21} />
                  <div>
                    <span>{title}</span>
                    <strong>{value}</strong>
                  </div>
                </div>
              ))}
            <div className="contact-note">
              <h2>Already ordered?</h2>
              <p>
                You can check the latest status or cancel a pending order from
                your account.
              </p>
              <ButtonLink secondary to="/account/orders">
                Find your order
              </ButtonLink>
            </div>
            <p className="hint">
              {settings?.email || settings?.phone
                ? "You can also send a message using the form."
                : "Use this form to send a message directly to the restaurant’s support inbox."}
            </p>
          </div>
          {sent ? (
            <div className="contact-success">
              <p className="eyebrow">MESSAGE RECEIVED</p>
              <h2>
                Thanks for
                <br />
                <em>getting in touch.</em>
              </h2>
              <p>Your message is saved in the restaurant’s support inbox.</p>
              <button
                className="button secondary"
                onClick={() => setSent(false)}
              >
                Send another message
              </button>
            </div>
          ) : (
            <form className="form-stack contact-form" onSubmit={contact}>
              {error && (
                <p role="alert" className="notice error">
                  {error}
                </p>
              )}
              <Field
                label="Your name"
                name="name"
                required
                minLength="2"
                maxLength="80"
                autoComplete="name"
              />
              <Field
                label="Email address"
                name="email"
                type="email"
                required
                autoComplete="email"
              />
              <Field label="What’s on your mind?">
                <textarea
                  name="message"
                  required
                  minLength="10"
                  maxLength="2000"
                  rows="6"
                />
              </Field>
              <button className="button" disabled={busy}>
                {busy ? "Sending…" : "Send message"}
                <ArrowUpRight size={17} />
              </button>
              <p className="hint">
                Your message and email will be used to respond to your enquiry.{" "}
                <Link to="/privacy">Privacy policy</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    );
  if (page === "faq")
    return (
      <div className="container page-space reading-width">
        <PageIntro
          eyebrow="GOOD QUESTIONS"
          title={
            <>
              A little more
              <br />
              <em>on your plate.</em>
            </>
          }
        >
          The details behind your next order.
        </PageIntro>
        <div className="faq-list">
          {faq.map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <Plus size={18} />
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
        <p className="lede">
          Still wondering?{" "}
          <Link className="text-link" to="/contact">
            Ask us <ArrowUpRight size={16} />
          </Link>
        </p>
      </div>
    );
  if (page === "how-it-works")
    return (
      <div className="container page-space">
        <PageIntro
          eyebrow="NOTHING COMPLICATED"
          title={
            <>
              You choose.
              <br />
              <em>We cook.</em>
            </>
          }
        >
          A good meal should be the easy part of your day.
        </PageIntro>
        <div className="process-grid">
          {[
            [
              Utensils,
              "01",
              "Follow your appetite.",
              "Browse the menu, read the dish details, and choose a portion that suits you. Check allergen notes before ordering.",
            ],
            [
              ShoppingBag,
              "02",
              "Make a little plan.",
              "Check your bag, choose delivery or pickup, and add your contact details. You’ll see the full total before placing your order.",
            ],
            [
              Bike,
              "03",
              "Look forward to it.",
              "Your order page shows when the kitchen confirms and prepares your food. Pay in cash when it arrives or when you pick it up.",
            ],
          ].map(([Icon, n, title, body]) => (
            <article key={n}>
              <div>
                <Icon size={30} />
                <span>{n}</span>
              </div>
              <h2>{title}</h2>
              <p>{body}</p>
            </article>
          ))}
        </div>
        <div className="info-callout">
          <h2>Ready when you are.</h2>
          <ButtonLink>Take a look at the menu</ButtonLink>
        </div>
      </div>
    );
  if (page === "about")
    return (
      <div className="container page-space">
        <PageIntro
          eyebrow="OUR WAY OF LOOKING AT FOOD"
          title={
            <>
              Nothing fancy.
              <br />
              <em>Just your favorites.</em>
            </>
          }
        >
          The food you think about before you’ve decided what to eat.
        </PageIntro>
        <div className="story-layout">
          <img
            src="/food/pasta.jpg"
            alt="A bowl of pasta with fresh basil and tomatoes"
            width="1000"
            height="850"
          />
          <div>
            <p className="eyebrow">COMFORT IS A GOOD PLACE TO START</p>
            <h2>
              There’s a reason
              <br />
              you have a usual.
            </h2>
            <p>
              A favorite meal makes an ordinary day a little better. That’s the
              idea behind FOOD: a straightforward menu of burgers, pizza, pasta,
              and something sweet.
            </p>
            <p>
              Browse at your own pace. Keep a dish for next time. Pick it up or
              have it delivered. All the important details, from ingredients to
              order updates, belong in plain sight.
            </p>
            <ButtonLink>Find your usual</ButtonLink>
          </div>
        </div>
      </div>
    );
  const policies = {
    "delivery-policy": {
      title: "Delivery & pickup.",
      intro: "What to expect when you place an order.",
      sections: [
        [
          "Your delivery area",
          `Available areas: ${settings?.deliveryAreas?.join(", ") || "check at checkout"}. Choose your area at checkout; orders outside the configured service area cannot be placed.`,
        ],
        [
          "Fees and minimums",
          `Delivery is ${money(settings?.deliveryFeeCents, settings?.currency)}. The order minimum is ${money(settings?.minimumCents, settings?.currency)}. The full total is shown before confirmation. Pickup carries no delivery fee.`,
        ],
        [
          "Pickup and preparation",
          `Pickup location: ${settings?.address || "not yet configured; please confirm with the restaurant before ordering pickup"}. Opening hours: ${settings?.hours || "contact the restaurant for current opening hours"}. Order status shows preparation progress, not a guaranteed arrival time.`,
        ],
        [
          "Getting the details right",
          "Provide an accurate address and a phone number where you can be reached. Contact the restaurant promptly if something needs to change.",
        ],
      ],
    },
    "refund-policy": {
      title: "Changes & cancellations.",
      intro: "Plans change. Here’s how to handle your order.",
      sections: [
        [
          "Before confirmation",
          "Cancel an order from Your orders while its status is pending. The order page will confirm the cancellation.",
        ],
        [
          "After confirmation",
          "Once the kitchen accepts an order, cancellation is no longer available online. Contact the restaurant to discuss your situation before assuming an order has been cancelled.",
        ],
        [
          "Problems with your order",
          "Use the contact page and include your order number, the issue, and a way to reach you. The restaurant will review the issue.",
        ],
        [
          "Payments",
          "This version accepts cash only. No online payment is taken or automatically refunded. The restaurant must confirm its cash refund arrangements before public launch.",
        ],
      ],
    },
    privacy: {
      title: "Your privacy.",
      intro: "An explanation of the information this application uses.",
      sections: [
        [
          "Account information",
          "We store your name, email, a one-way password hash, saved addresses, and favorites. A session cookie keeps you signed in. Your password is not stored in readable form.",
        ],
        [
          "Orders and support",
          "Orders include contact and delivery details, purchased items, totals, and status updates. Contact messages include the name, email and message you submit. Authorized restaurant administrators can access the details needed to manage service.",
        ],
        [
          "Browser storage",
          "Your shopping bag is saved in this browser. A session cookie is HttpOnly and is not accessible to application JavaScript. Signing out removes the current session.",
        ],
        [
          "Service providers and requests",
          "Application data is hosted using MongoDB, Render, and Vercel. Contact the restaurant for access, correction or deletion requests. The owner must confirm retention periods, business contact details, and jurisdiction before public launch.",
        ],
      ],
    },
    terms: {
      title: "A few ground rules.",
      intro: "Ordering clearly, with the important details upfront.",
      sections: [
        [
          "Your account",
          "Use accurate contact information and keep your password private. Orders and account details are available through your signed-in account.",
        ],
        [
          "Menu and prices",
          "Prices, availability, delivery areas and fees are confirmed by the server when you order. If these change before submission, you will be asked to review the total. An order remains pending until the restaurant confirms it.",
        ],
        [
          "Allergens",
          "Read dish information and contact the restaurant about food allergies before ordering. Allergen notes and kitchen instructions do not guarantee an allergen-free environment.",
        ],
        [
          "Payment and fulfilment",
          "Cash is due on delivery or pickup. Check the delivery and cancellation pages before placing an order. Displayed order progress does not guarantee a delivery time.",
        ],
        [
          "Business details",
          "These terms describe the preview application. The owner must approve the operating entity, address, applicable jurisdiction, and final business policies before public release.",
        ],
      ],
    },
  };
  const policy = policies[page];
  if (policy)
    return (
      <div className="container page-space reading-width">
        <PageIntro eyebrow="THE DETAILS" title={policy.title}>
          {policy.intro}
        </PageIntro>
        {settings?.preview && (
          <p className="notice">
            Preview policy — business details require owner review before public
            launch.
          </p>
        )}
        <div className="prose">
          {policy.sections.map(([title, body]) => (
            <section key={title}>
              <h2>{title}</h2>
              <p>{body}</p>
            </section>
          ))}
        </div>
        <Link className="text-link" to="/contact">
          Questions? Get in touch
          <ArrowUpRight size={17} />
        </Link>
      </div>
    );
  return <NotFound />;
}
export function NotFound() {
  return (
    <div className="container page-space not-found">
      <p className="eyebrow">404 / A WRONG TURN</p>
      <h1>
        This isn’t
        <br />
        <em>on the menu.</em>
      </h1>
      <p>That page may have moved, or the address might be a little off.</p>
      <ButtonLink>Back to the good stuff</ButtonLink>
    </div>
  );
}
export function RouteError() {
  const error = useRouteError();
  return (
    <div className="container page-space not-found">
      <p className="eyebrow">A SMALL INTERRUPTION</p>
      <h1>
        Let’s try
        <br />
        <em>that again.</em>
      </h1>
      <p>
        {error?.status === 404
          ? "We couldn’t find that page."
          : "This page didn’t load as expected."}
      </p>
      <a className="button" href="/">
        Go home
        <ArrowUpRight size={18} />
      </a>
    </div>
  );
}
