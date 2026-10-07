import { lazy, Suspense, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const LunarScene = lazy(() =>
  import("@/components/LunarScene").then((module) => ({
    default: module.LunarScene,
  }))
);

type Mode = "signin" | "signup" | "forgot";

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [spin, setSpin] = useState<
    "spin-right-to-left" | "spin-left-to-right" | ""
  >("");

  function changeMode(next: Mode) {
    setMode(next);
    setError("");
    setMessage("");
    setPassword("");
    setConfirmPassword("");
  }

  function triggerSpin(
    direction: "spin-right-to-left" | "spin-left-to-right"
  ) {
    setSpin("");
    requestAnimationFrame(() => setSpin(direction));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (mode === "signup" && confirmPassword !== password) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    triggerSpin(
      mode === "signup" ? "spin-right-to-left" : "spin-left-to-right"
    );
    setBusy(true);

    // ─── Frontend placeholder ───────────────────────────────────────────
    // Real authentication will be wired up by the backend team.
    // For now we simulate a short delay then navigate to the app.
    await new Promise((res) => setTimeout(res, 800));

    if (mode === "forgot") {
      setMessage(
        "If an account exists for this email, you'll receive a reset link shortly."
      );
      setBusy(false);
    } else if (mode === "signup") {
      setMessage(
        "Account created! Check your email to confirm, then sign in."
      );
      changeMode("signin");
      setBusy(false);
    } else {
      // Sign-in: navigate to the NASA app
      if (!keepSignedIn) {
        // Backend will handle session persistence later
      }
      navigate("/");
    }
  }

  return (
    <main className="login-world">
      {/* Space background */}
      <img
        className="space-field"
        src="/images/space-field.jpg"
        alt=""
        width={1600}
        height={900}
      />
      {/* Sun glow effect */}
      <div className="sun-glow" aria-hidden="true" />
      {/* 3D Moon */}
      <Suspense fallback={null}>
        <LunarScene />
      </Suspense>
      {/* Login card layer */}
      <div className="login-layer">
        <section
          className={`login-card${spin ? ` ${spin}` : ""}`}
          aria-label="Account access"
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget) setSpin("");
          }}
        >
          <div className="card-content">
            <div className="heading-rule" />
            <h1>
              {mode === "signin" ? (
                <>
                  Welcome<span>.</span>
                </>
              ) : mode === "signup" ? (
                <>
                  Join the
                  <br />
                  mission<span>.</span>
                </>
              ) : (
                <>
                  Reset your
                  <br />
                  password<span>.</span>
                </>
              )}
            </h1>
            <p className="intro">
              {mode === "signin"
                ? "Sign in to continue to your account."
                : mode === "signup"
                ? "Create your account to get started."
                : "We'll send you a link to reset your password."}
            </p>

            <form onSubmit={submit}>
              <label className="field-label" htmlFor="email">
                Email
              </label>
              <div className="input-shell">
                <Mail size={18} strokeWidth={1.7} aria-hidden="true" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {mode !== "forgot" && (
                <>
                  <label
                    className="field-label password-label"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <div className="input-shell">
                    <LockKeyhole
                      size={18}
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={
                        mode === "signup" ? "new-password" : "current-password"
                      }
                      minLength={6}
                      placeholder="Enter your password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                      variant="field"
                      size="sm"
                      type="button"
                      className="show-button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                      <span>{showPassword ? "Hide" : "Show"}</span>
                    </Button>
                  </div>
                </>
              )}

              {mode === "signup" && (
                <>
                  <label
                    className="field-label password-label"
                    htmlFor="confirm-password"
                  >
                    Confirm password
                  </label>
                  <div className="input-shell">
                    <LockKeyhole
                      size={18}
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                    <input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      minLength={6}
                      placeholder="Re-enter your password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </>
              )}

              {mode === "signin" && (
                <div className="form-options">
                  <label className="remember">
                    <input
                      type="checkbox"
                      checked={keepSignedIn}
                      onChange={(e) => setKeepSignedIn(e.target.checked)}
                    />
                    <span>Keep me signed in</span>
                  </label>
                  <Button
                    variant="text"
                    size="sm"
                    type="button"
                    onClick={() => changeMode("forgot")}
                  >
                    Forgot password?
                  </Button>
                </div>
              )}

              {error && (
                <p className="form-feedback error" role="alert">
                  {error}
                </p>
              )}
              {message && (
                <p className="form-feedback" role="status">
                  {message}
                </p>
              )}

              <Button
                variant="cosmic"
                type="submit"
                className="submit-button"
                disabled={busy}
              >
                {busy
                  ? "Please wait…"
                  : mode === "signin"
                  ? "Sign in"
                  : mode === "signup"
                  ? "Create account"
                  : "Send reset link"}
              </Button>
            </form>

            <p className="switch-mode">
              {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
              <Button
                variant="text"
                size="sm"
                onClick={() => {
                  triggerSpin(
                    mode === "signin"
                      ? "spin-right-to-left"
                      : "spin-left-to-right"
                  );
                  changeMode(mode === "signin" ? "signup" : "signin");
                }}
              >
                {mode === "signin" ? "Create an account" : "Sign in"}
              </Button>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
