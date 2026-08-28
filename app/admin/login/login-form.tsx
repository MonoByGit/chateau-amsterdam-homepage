"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { requestLoginCode, submitLoginCode, type RequestCodeState, type VerifyCodeState } from "./actions";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

export function LoginForm() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [expiresAtDate, setExpiresAtDate] = useState<Date | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(15 * 60);
  const [remainingAttempts, setRemainingAttempts] = useState<number>(3);
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [shake, setShake] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    urlError === "expired_magic_link"
      ? "De inloglink is verlopen of al gebruikt. Vraag hieronder een nieuwe inlogcode aan."
      : urlError === "missing_token"
        ? "Ongeldige inloglink."
        : null
  );
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  const [isPending, startTransition] = useTransition();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus management when entering "code" step
  useEffect(() => {
    if (step === "code") {
      inputRefs.current[0]?.focus();
      inputRefs.current[0]?.select();
    }
  }, [step]);

  // 15-minute countdown timer
  useEffect(() => {
    if (step !== "code" || !expiresAtDate) return;

    const interval = setInterval(() => {
      const diff = Math.max(0, Math.floor((expiresAtDate.getTime() - Date.now()) / 1000));
      setRemainingSeconds(diff);
      if (diff === 0) {
        setErrorMessage("Deze code is verlopen (15 minuten verstreken). Vraag een nieuwe code aan.");
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [step, expiresAtDate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Trigger temporary shake effect on error
  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  // Step 1: Request Code
  const handleRequestCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const submittedEmail = String(formData.get("email") ?? "").trim().toLowerCase();

    startTransition(async () => {
      const res: RequestCodeState = await requestLoginCode(null, formData);
      if (res.success && res.email && res.expiresAt) {
        setEmail(res.email);
        setExpiresAtDate(new Date(res.expiresAt));
        setRemainingSeconds(15 * 60);
        setRemainingAttempts(3);
        setDigits(Array(CODE_LENGTH).fill(""));
        setResendCooldown(RESEND_COOLDOWN_SECONDS);
        setStep("code");
      } else {
        setErrorMessage(res.error || "Er is een fout opgetreden.");
      }
    });
  };

  // Execute Code Verification
  const executeVerify = (codeToVerify: string) => {
    if (codeToVerify.length !== CODE_LENGTH) return;
    setErrorMessage(null);

    const formData = new FormData();
    formData.set("email", email);
    formData.set("code", codeToVerify);

    startTransition(async () => {
      const res: VerifyCodeState = await submitLoginCode(null, formData);
      if (!res.success) {
        setErrorMessage(res.error || "Onjuiste code.");
        if (typeof res.remainingAttempts === "number") {
          setRemainingAttempts(res.remainingAttempts);
        }
        triggerShake();

        if (res.resetRequired) {
          // Max attempts or expired -> clear inputs
          setDigits(Array(CODE_LENGTH).fill(""));
        } else {
          // Focus first digit again for quick retry
          inputRefs.current[0]?.focus();
          inputRefs.current[0]?.select();
        }
      }
    });
  };

  // Step 2: Form Submit
  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = digits.join("");
    executeVerify(fullCode);
  };

  // Handle single digit changes
  const handleDigitChange = (index: number, value: string) => {
    // If the input has more than 1 char (e.g. fast typing or mobile paste)
    const sanitized = value.replace(/\D/g, "");

    if (sanitized.length === 0) {
      const newDigits = [...digits];
      newDigits[index] = "";
      setDigits(newDigits);
      return;
    }

    if (sanitized.length > 1) {
      // User typed or pasted multiple characters inside single box
      handlePasteString(sanitized, index);
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = sanitized;
    setDigits(newDigits);

    // Auto-advance to next input
    if (index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      inputRefs.current[index + 1]?.select();
    }

    // If last digit is filled, auto-submit
    const completeCode = newDigits.join("");
    if (completeCode.length === CODE_LENGTH) {
      executeVerify(completeCode);
    }
  };

  // Handle backspace and navigation keys
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        // Move to previous box if current is already empty
        e.preventDefault();
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle instant clipboard paste (Cmd+V / Paste anywhere)
  const handlePasteString = (pastedText: string, startIndex: number = 0) => {
    const cleanNumbers = pastedText.replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!cleanNumbers) return;

    const newDigits = [...digits];
    for (let i = 0; i < cleanNumbers.length; i++) {
      if (startIndex + i < CODE_LENGTH) {
        newDigits[startIndex + i] = cleanNumbers[i];
      }
    }

    // If paste didn't start at 0 but has full 6 digits, fill from 0
    if (cleanNumbers.length === CODE_LENGTH) {
      for (let i = 0; i < CODE_LENGTH; i++) {
        newDigits[i] = cleanNumbers[i];
      }
    }

    setDigits(newDigits);

    const targetFocus = Math.min(CODE_LENGTH - 1, startIndex + cleanNumbers.length);
    inputRefs.current[targetFocus]?.focus();

    // Auto-submit if all 6 digits are filled
    if (newDigits.every((d) => d !== "")) {
      executeVerify(newDigits.join(""));
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    handlePasteString(pasted, 0);
  };

  // Resend code action
  const handleResend = () => {
    if (resendCooldown > 0 || isPending) return;
    setErrorMessage(null);

    const formData = new FormData();
    formData.set("email", email);

    startTransition(async () => {
      const res: RequestCodeState = await requestLoginCode(null, formData);
      if (res.success && res.expiresAt) {
        setExpiresAtDate(new Date(res.expiresAt));
        setRemainingSeconds(15 * 60);
        setRemainingAttempts(3);
        setDigits(Array(CODE_LENGTH).fill(""));
        setResendCooldown(RESEND_COOLDOWN_SECONDS);
        inputRefs.current[0]?.focus();
      } else {
        setErrorMessage(res.error || "Kon geen nieuwe code versturen.");
      }
    });
  };

  // Format time remaining MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div>
      {step === "email" ? (
        /* STEP 1: ENTER EMAIL */
        <form onSubmit={handleRequestCode} className="a-field" style={{ gap: "1.25rem" }}>
          <div style={{ fontSize: "0.875rem", color: "var(--a-text-2)", lineHeight: 1.6, textAlign: "center" }}>
            <div>Vul je werk e-mailadres in</div>
            <div>Je ontvangt direct een eenmalige inlogcode</div>
          </div>

          <label className="a-field">
            <span className="a-label">E-mailadres</span>
            <input
              type="email"
              name="email"
              required
              autoFocus
              defaultValue={email}
              autoComplete="email"
              placeholder="naam@chateauamsterdam.nl"
              className="a-input"
            />
          </label>

          {errorMessage ? <p className="a-alert a-alert--danger">{errorMessage}</p> : null}

          <button
            type="submit"
            disabled={isPending}
            className="a-btn a-btn--primary"
            style={{ width: "100%", padding: "0.75rem" }}
          >
            {isPending ? "Code versturen…" : "Inlogcode aanvragen →"}
          </button>
        </form>
      ) : (
        /* STEP 2: ENTER 6-DIGIT CODE */
        <form onSubmit={handleVerifySubmit} className="a-field" style={{ gap: "0.5rem" }}>
          <div className="a-login-info-box">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
              <span style={{ fontWeight: 600, color: "var(--a-text)" }}>Code verstuurd</span>
              <span className={`a-attempts-counter ${
                remainingAttempts === 3
                  ? "a-attempts-counter--ok"
                  : remainingAttempts === 2
                    ? "a-attempts-counter--warning"
                    : "a-attempts-counter--danger"
              }`}>
                {remainingAttempts} {remainingAttempts === 1 ? "poging" : "pogingen"}
              </span>
            </div>
            <div>
              Naar <strong style={{ color: "var(--a-text)" }}>{email}</strong>
            </div>

            <div className="a-login-meta-row">
              <span className="a-timer-text">
                ⏱️ Geldig: <strong>{formatTime(remainingSeconds)}</strong>
              </span>
              <span style={{ color: "var(--a-text-3)" }}>15 min geldig</span>
            </div>
          </div>

          <div style={{ textAlign: "center", margin: "0.5rem 0" }}>
            <span className="a-label" style={{ fontSize: "0.8125rem" }}>
              Vul de 6-cijferige inlogcode in of plak direct (⌘V)
            </span>
          </div>

          {/* 6 Segmented OTP Boxes with auto-paste & auto-advance */}
          <div className={`a-otp-grid ${shake ? "a-shake" : ""}`} onPaste={handlePaste}>
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                disabled={isPending || remainingSeconds === 0}
                className={`a-otp-input ${digit ? "is-filled" : ""} ${errorMessage ? "is-error" : ""}`}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                aria-label={`Cijfer ${idx + 1}`}
              />
            ))}
          </div>

          {errorMessage ? (
            <p className="a-alert a-alert--danger" style={{ marginTop: "0.5rem" }}>
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isPending || digits.some((d) => !d) || remainingSeconds === 0}
            className="a-btn a-btn--primary"
            style={{ width: "100%", padding: "0.75rem", marginTop: "0.75rem" }}
          >
            {isPending ? "Controleren…" : "Inloggen"}
          </button>

          <div className="a-login-links">
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setErrorMessage(null);
              }}
              className="a-link-btn"
            >
              ← Ander e-mailadres
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || isPending}
              className="a-link-btn"
            >
              {resendCooldown > 0 ? `Nieuwe code (${resendCooldown}s)` : "Nieuwe code sturen"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
