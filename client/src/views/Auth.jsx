import { useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { ArrowUpRight, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useApp } from "../lib/context";
import { api } from "../lib/api";
import { Field } from "../components/ui";
export default function Auth({ mode = "login" }) {
  const { user, setUser, notify } = useApp();
  const location = useLocation(),
    navigate = useNavigate(),
    { token } = useParams();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [show, setShow] = useState(false),
    [sent, setSent] = useState(false),
    [localMail, setLocalMail] = useState(false);
  const signup = mode === "signup",
    forgot = mode === "forgot-password",
    reset = mode === "reset-password";
  const destination = location.state?.from?.pathname || "/account";
  if (user && !forgot && !reset) return <Navigate to={destination} replace />;
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(e.currentTarget);
    try {
      if (forgot) {
        const r = await api("/auth/forgot-password", {
          method: "POST",
          body: { email: form.get("email") },
        });
        setSent(true);
        setLocalMail(r.localMail);
      } else if (reset) {
        await api("/auth/reset-password", {
          method: "POST",
          body: { token, password: form.get("password") },
        });
        setUser(null);
        notify("Password updated. Sign in with your new password.");
        navigate("/login");
      } else {
        const result = await api(`/auth/${signup ? "signup" : "login"}`, {
          method: "POST",
          body: {
            name: form.get("name"),
            email: form.get("email"),
            password: form.get("password"),
          },
        });
        setUser(result);
        notify(
          signup
            ? "Your account is ready. Welcome to the table."
            : "Good to see you again.",
        );
        navigate(destination, { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="container auth-page">
      <div className="auth-aside">
        <img
          src="/food/pizza.jpg"
          alt="Freshly baked pizza with basil and melted cheese"
          width="1000"
          height="1200"
        />
        <div>
          <span className="eyebrow">A SEAT AT THE TABLE</span>
          <h2>
            Good to have
            <br />
            <em>you here.</em>
          </h2>
        </div>
      </div>
      <div className="auth-content">
        <Link className="back-link" to="/menu">
          <ArrowLeft size={16} />
          Back to the menu
        </Link>
        <p className="eyebrow">
          {forgot || reset
            ? "A FRESH START"
            : signup
              ? "JOIN THE COMFORT FOOD CLUB"
              : "YOUR USUAL AWAITS"}
        </p>
        <h1>
          {forgot
            ? "Forgot your password?"
            : reset
              ? "Choose a new password."
              : signup
                ? "Come on in."
                : "Welcome back."}
        </h1>
        <p className="muted">
          {forgot
            ? "We’ll help you get back to your favorites."
            : reset
              ? "Use at least 8 characters."
              : signup
                ? "Save your favorites and keep every order in one place."
                : "Sign in for your saved dishes and order updates."}
        </p>
        {sent ? (
          <div className="notice success">
            <strong>Check your inbox.</strong>
            <p>
              If an account exists, a reset link has been sent. It expires in 30
              minutes.
            </p>
            {localMail && (
              <p>
                Local preview: the message is saved in{" "}
                <code>server/.local-mail/</code> instead of sending a real
                email.
              </p>
            )}
            <Link to="/login">Back to sign in</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="form-stack">
            {error && (
              <p className="notice error" role="alert">
                {error}
              </p>
            )}
            {signup && (
              <Field
                label="Your name"
                name="name"
                autoComplete="name"
                required
                minLength="2"
                maxLength="80"
              />
            )}
            {!reset && (
              <Field
                label="Email address"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            )}
            {!forgot && (
              <label className="field">
                <span>Password</span>
                <div className="password-field">
                  <input
                    name="password"
                    type={show ? "text" : "password"}
                    autoComplete={
                      signup || reset ? "new-password" : "current-password"
                    }
                    required
                    minLength={signup || reset ? 8 : undefined}
                    maxLength="72"
                  />
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => setShow(!show)}
                    aria-label={show ? "Hide password" : "Show password"}
                  >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>
            )}
            {signup && (
              <p className="hint">
                By creating an account you agree to our{" "}
                <Link to="/terms">terms</Link> and{" "}
                <Link to="/privacy">privacy policy</Link>.
              </p>
            )}
            {!signup && !forgot && !reset && (
              <Link className="forgot-link" to="/forgot-password">
                Forgot password?
              </Link>
            )}
            <button className="button full" disabled={busy}>
              {busy
                ? "One moment…"
                : forgot
                  ? "Send reset link"
                  : reset
                    ? "Update password"
                    : signup
                      ? "Create account"
                      : "Sign in"}
              <ArrowUpRight size={17} />
            </button>
          </form>
        )}
        {!forgot && !reset && (
          <p className="auth-switch">
            {signup ? "Already have a seat?" : "New around here?"}{" "}
            <Link to={signup ? "/login" : "/signup"} state={location.state}>
              {signup ? "Sign in" : "Create an account"}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
