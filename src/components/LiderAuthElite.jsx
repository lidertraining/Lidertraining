import { useState, useEffect, useRef, useCallback } from "react";
import {
  signInWithPassword,
  signUpWithPassword,
  sendWhatsAppOTP,
  verifyWhatsAppOTP,
  signInWithOAuth,
  sendPasswordReset,
  accountExists,
  isEmail,
} from "../lib/auth-helpers";
import {
  isBiometricAvailable,
  authenticateWithPasskey,
  registerPasskey,
  getBiometricHint,
  shouldPromptEnableBiometric,
  supportsConditionalUI,
} from "../lib/biometric";
import {
  captureReferralFromURL,
  getStoredSponsor,
  getCachedSponsorInfo,
  getSponsorInfo,
  clearStoredSponsor,
} from "../lib/deeplink";

// ══════════════════════════════════════════════════════════
// LIDER TRAINING — AUTH ELITE v2 (production integrated)
// Design System: Amethyst Elite
// ══════════════════════════════════════════════════════════

const C = {
  bg: "#0e0e10", surface: "#131315", card: "#1a1a1e", cardHi: "#242427",
  accent: "#c9a0ff", accentDim: "#9b6fd4", accentGlow: "#c9a0ff33",
  gold: "#f0c75e", goldDim: "#c9a04a",
  teal: "#5ee6d0", green: "#5ef08a", red: "#ff6b8a", orange: "#ffad5e",
  text: "#e5e1e4", textDim: "#9b97a0", textMute: "#6b6670",
  border: "#4d435320", borderHi: "#c9a0ff30",
  wa: "#25d366", wa2: "#128c7e",
};
const f = {
  serif: "'Fraunces', 'Playfair Display', Georgia, serif",
  sans: "'Inter', -apple-system, 'Segoe UI', sans-serif",
};

const onlyDigits = (v) => v.replace(/\D/g, "");
const maskBRPhone = (v) => {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
};

const scorePassword = (p) => {
  let s = 0;
  if (p.length >= 8) s++;
  if (p.length >= 12) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return Math.min(s, 4);
};
const strengthMeta = [
  { label: "muito fraca", color: C.red, width: "20%" },
  { label: "fraca", color: C.orange, width: "40%" },
  { label: "média", color: C.gold, width: "60%" },
  { label: "boa", color: C.teal, width: "80%" },
  { label: "excelente", color: C.green, width: "100%" },
];

// ═══ Ícones SVG inline ═══
const Icon = {
  eye: (o) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{o?<>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
  </>:<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}</svg>,
  check: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  arrow: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  google: <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>,
  wa: <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M17.6 6.3A7.85 7.85 0 0012 4C7.58 4 4 7.58 4 12c0 1.41.37 2.79 1.07 4L4 20l4.14-1.05A7.9 7.9 0 0012 20c4.42 0 8-3.58 8-8 0-2.14-.84-4.15-2.4-5.7zm-5.6 12.3c-1.27 0-2.51-.34-3.6-.98l-.26-.15-2.67.7.72-2.6-.17-.27A6.52 6.52 0 015.5 12c0-3.58 2.92-6.5 6.5-6.5 1.74 0 3.37.68 4.6 1.9a6.48 6.48 0 011.9 4.6c0 3.58-2.92 6.5-6.5 6.5zm3.56-4.87c-.2-.1-1.15-.57-1.33-.63-.18-.07-.31-.1-.44.1-.13.2-.5.63-.62.76-.11.13-.23.15-.42.05-.2-.1-.84-.31-1.6-.99-.59-.52-.99-1.17-1.1-1.37-.12-.2-.01-.3.09-.4.09-.09.2-.23.3-.35.1-.12.13-.2.2-.33.07-.13.03-.25-.02-.35-.05-.1-.44-1.07-.61-1.47-.16-.38-.33-.33-.44-.33-.11 0-.24-.02-.37-.02-.13 0-.34.05-.52.25-.18.2-.68.67-.68 1.63 0 .96.7 1.89.8 2.02.1.13 1.39 2.12 3.36 2.97.47.2.83.32 1.12.41.47.15.9.13 1.24.08.38-.06 1.16-.47 1.33-.93.17-.46.17-.85.12-.93-.05-.09-.18-.14-.38-.23z"/></svg>,
  fingerprint: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12C2 6 6 2 12 2c4 0 8 2 10 6"/><path d="M5 19.5C5.5 18 6 15 6 12c0-2 1-4 2-5"/><path d="M13 13.9a13.5 13.5 0 0 1-2 6.1"/><path d="M8 12a4 4 0 0 1 8 0c0 1.3-.2 2.7-.5 4"/><path d="M21 14c-.3 2-.7 3.8-1.5 5.5"/><path d="M12 8a4 4 0 0 0-3.5 6"/></svg>,
  sparkle: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0l2.4 7.2L21.6 9.6 14.4 12l-2.4 7.2L9.6 12 2.4 9.6l7.2-2.4L12 0zm7.5 13.5l1.2 3.6 3.6 1.2-3.6 1.2-1.2 3.6-1.2-3.6-3.6-1.2 3.6-1.2 1.2-3.6z"/></svg>,
  crown: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 7l5.5 4L12 5l3.5 6L21 7l-2 9H5zm0 2h14v2H5v-2z"/></svg>,
};

// ═══════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════
export default function LiderAuthElite({ onSuccess } = {}) {
  // Mode & step
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState("form"); // form · otp · forgot · enable-bio · success
  
  // Fields
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [sponsor, setSponsor] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  // Runtime state
  const [loading, setLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState(null); // 'google' | 'apple' | 'bio' | null
  const [error, setError] = useState(null);
  const [accountSuggest, setAccountSuggest] = useState(null); // string | null
  const [otpPhone, setOtpPhone] = useState("");
  
  // Biometric
  const [bioAvailable, setBioAvailable] = useState(false);
  const [bioHint, setBioHint] = useState(null);
  
  // Deep link / sponsor
  const [sponsorInfo, setSponsorInfo] = useState(null);

  // ─── Mount: capture referral + check biometric + load sponsor ───
  useEffect(() => {
    let mounted = true;
    (async () => {
      // 1) Capture referral from URL
      const ref = await captureReferralFromURL();
      if (mounted && ref) {
        setSponsor(ref);
        // Try cached first (instant UI), then refresh from DB
        const cached = getCachedSponsorInfo();
        if (cached) setSponsorInfo(cached);
        const fresh = await getSponsorInfo(ref);
        if (mounted && fresh) setSponsorInfo(fresh);
      }
      
      // 2) Biometric detection
      const available = await isBiometricAvailable();
      if (mounted) setBioAvailable(available);
      
      const hint = getBiometricHint();
      if (mounted && hint && available) {
        setBioHint(hint);
        // Try conditional UI (autofill-style) in background — iOS 17+ / Chrome 108+
        if (await supportsConditionalUI()) {
          try {
            await authenticateWithPasskey({ conditional: true });
            onSuccess?.();
          } catch {
            // silently fail — user will click the button if they want
          }
        }
      }
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Smart detection: check if account exists in signup mode ───
  const checkTimer = useRef();
  useEffect(() => {
    if (mode !== "signup") { setAccountSuggest(null); return; }
    clearTimeout(checkTimer.current);
    const val = isEmail(email) ? email : (onlyDigits(whatsapp).length >= 10 ? whatsapp : null);
    if (!val) { setAccountSuggest(null); return; }
    
    checkTimer.current = setTimeout(async () => {
      const exists = await accountExists(val);
      setAccountSuggest(exists ? val : null);
    }, 500);
    return () => clearTimeout(checkTimer.current);
  }, [email, whatsapp, mode]);

  // ─── Derived ───
  const pwdScore = scorePassword(password);
  const pwdMeta = strengthMeta[pwdScore];
  const pwdChecks = [
    { ok: password.length >= 8, label: "8+ caracteres" },
    { ok: /[A-Z]/.test(password), label: "1 maiúscula" },
    { ok: /[0-9]/.test(password), label: "1 número" },
  ];
  
  const canSubmit = () => {
    if (loading) return false;
    if (mode === "login") return identifier.length > 4 && password.length >= 6;
    return name.length > 2 && whatsapp.length >= 14 && isEmail(email) && pwdScore >= 2 && acceptTerms;
  };

  // ─── Actions ───
  const handleSwitch = (newMode, prefill) => {
    setMode(newMode);
    setError(null);
    setAccountSuggest(null);
    if (prefill) setIdentifier(prefill);
  };

  const handleBiometric = async () => {
    setError(null);
    setLoadingProvider("bio");
    try {
      await authenticateWithPasskey();
      setStep("success");
      onSuccess?.();
    } catch (err) {
      setError(err.message || "Falha na biometria");
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleSocial = async (provider) => {
    setError(null);
    if (provider === "whatsapp") {
      if (mode === "signup" && (!whatsapp || whatsapp.length < 14)) {
        setError("Digite seu WhatsApp primeiro para receber o código.");
        return;
      }
      const phone = whatsapp || identifier;
      if (!phone || onlyDigits(phone).length < 10) {
        setError("Digite seu WhatsApp para receber o código.");
        return;
      }
      setLoadingProvider("whatsapp");
      const { error: err } = await sendWhatsAppOTP({
        whatsapp: phone,
        createUser: mode === "signup",
      });
      setLoadingProvider(null);
      if (err) return setError(err.message);
      setOtpPhone(phone);
      setStep("otp");
      return;
    }
    
    setLoadingProvider(provider);
    const { error: err } = await signInWithOAuth(provider);
    if (err) { setError(err.message); setLoadingProvider(null); }
    // Otherwise user is redirected to OAuth consent screen
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    
    if (mode === "login") {
      const { data, error: err } = await signInWithPassword({ identifier, password });
      setLoading(false);
      if (err) return setError(err.message);
      if (data?.session) await maybePromptBiometric();
    } else {
      const { data, error: err } = await signUpWithPassword({
        name, email, whatsapp, password, sponsorId: sponsor || null,
      });
      setLoading(false);
      if (err) return setError(err.message);
      if (data?.user) {
        clearStoredSponsor();
        if (data.session) {
          await maybePromptBiometric();
        } else {
          // Email confirmation required
          setStep("success");
        }
      }
    }
  };

  const maybePromptBiometric = async () => {
    const should = await shouldPromptEnableBiometric();
    if (should) setStep("enable-bio");
    else { setStep("success"); onSuccess?.(); }
  };

  // ─── Sub-screens ───
  if (step === "success") return <SuccessScreen mode={mode} onContinue={() => onSuccess?.()} />;
  if (step === "enable-bio") return <EnableBiometricScreen onDone={() => { setStep("success"); onSuccess?.(); }} />;
  if (step === "otp") return (
    <OTPScreen
      whatsapp={otpPhone}
      signupMeta={mode === "signup" ? { name, sponsorId: sponsor } : null}
      onBack={() => setStep("form")}
      onSuccess={async () => {
        clearStoredSponsor();
        await maybePromptBiometric();
      }}
    />
  );
  if (step === "forgot") return <ForgotScreen initial={identifier} onBack={() => setStep("form")} />;
  
  // ─── Main form ───
  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: f.sans, display: "flex", flexDirection: "column",
      position: "relative", overflow: "hidden",
    }}>
      {/* Ambient glow */}
      <div style={{
        position: "absolute", top: "-20%", left: "-10%",
        width: 420, height: 420, borderRadius: "50%",
        background: `radial-gradient(circle, ${C.accent}22 0%, transparent 70%)`,
        filter: "blur(60px)", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-20%", right: "-15%",
        width: 380, height: 380, borderRadius: "50%",
        background: `radial-gradient(circle, ${C.gold}15 0%, transparent 70%)`,
        filter: "blur(60px)", pointerEvents: "none",
      }} />

      {/* Sponsor banner (if came from referral link) */}
      {sponsorInfo && (
        <div style={{
          position: "relative", zIndex: 3,
          margin: "12px 16px 0",
          padding: "10px 14px",
          background: `linear-gradient(135deg, ${C.accent}15, ${C.gold}10)`,
          border: `1px solid ${C.accent}30`,
          borderRadius: 12,
          display: "flex", alignItems: "center", gap: 12,
          animation: "fadeInDown .5s ease-out",
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: sponsorInfo.avatar_url
              ? `url(${sponsorInfo.avatar_url}) center/cover`
              : `linear-gradient(135deg, ${C.accent}, ${C.accentDim})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, color: C.bg, fontSize: 14, flexShrink: 0,
          }}>
            {!sponsorInfo.avatar_url && (sponsorInfo.full_name?.[0] || "?")}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: C.textMute }}>
              Convite de
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {sponsorInfo.full_name}
            </div>
          </div>
          {sponsorInfo.graduation && (
            <div style={{
              fontSize: 10, padding: "4px 8px", borderRadius: 4,
              background: `${C.gold}15`, color: C.gold,
              display: "inline-flex", alignItems: "center", gap: 4,
              fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em",
            }}>{Icon.crown} {sponsorInfo.graduation}</div>
          )}
        </div>
      )}

      {/* Header */}
      <div style={{ padding: "32px 24px 16px", textAlign: "center", position: "relative", zIndex: 2 }}>
        <div style={{
          width: 56, height: 56, margin: "0 auto 16px",
          borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center",
          background: `linear-gradient(135deg, ${C.accent}, ${C.accentDim})`,
          boxShadow: `0 8px 32px ${C.accentGlow}, inset 0 1px 0 rgba(255,255,255,0.2)`,
          position: "relative",
        }}>
          <span style={{ fontFamily: f.serif, fontSize: 28, fontStyle: "italic", fontWeight: 700, color: C.bg }}>L</span>
          <div style={{
            position: "absolute", top: -4, right: -4,
            width: 14, height: 14, borderRadius: "50%",
            background: C.gold, color: C.bg,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{Icon.sparkle}</div>
        </div>

        <div style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: C.textMute, marginBottom: 4 }}>
          Líder Training
        </div>
        <h1 style={{
          fontFamily: f.serif, fontSize: 26, fontStyle: "italic", fontWeight: 400,
          color: C.text, margin: "0 0 6px",
        }}>
          {mode === "login"
            ? <>Bem-vindo <span style={{ color: C.accent }}>de volta</span></>
            : <>Comece sua <span style={{ color: C.accent }}>jornada</span></>}
        </h1>
        <p style={{ fontSize: 13, color: C.textDim, margin: 0 }}>
          {mode === "login" ? "Sua evolução continua. Vamos lá." : "A elite se forma agora. Não depois."}
        </p>
      </div>

      {/* Biometric quick-access (if user has passkey on this device) */}
      {mode === "login" && bioAvailable && bioHint && (
        <div style={{ padding: "0 24px 16px", position: "relative", zIndex: 2 }}>
          <button
            onClick={handleBiometric}
            disabled={loadingProvider === "bio"}
            style={{
              width: "100%",
              padding: "14px 16px",
              background: `linear-gradient(135deg, ${C.accent}18, ${C.accent}08)`,
              border: `1px solid ${C.accent}40`,
              borderRadius: 14,
              color: C.text,
              fontSize: 14, fontWeight: 600, fontFamily: f.sans,
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
              transition: "all .2s",
              animation: "pulseGlow 2s ease-in-out infinite",
            }}
          >
            <span style={{ color: C.accent }}>{Icon.fingerprint}</span>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                {loadingProvider === "bio" ? "Verificando..." : `Entrar como ${bioHint.name || bioHint.email}`}
              </div>
              <div style={{ fontSize: 10, color: C.textDim }}>
                Use sua biometria neste {bioHint.deviceName}
              </div>
            </div>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0 4px" }}>
            <div style={{ flex: 1, height: 1, background: C.border }} />
            <span style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: C.textMute }}>
              ou
            </span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ padding: "0 24px", marginBottom: 20, position: "relative", zIndex: 2 }}>
        <div style={{
          position: "relative",
          background: C.card, borderRadius: 14, padding: 4, display: "flex",
          border: `1px solid ${C.border}`,
        }}>
          <div style={{
            position: "absolute", top: 4, bottom: 4,
            left: mode === "login" ? 4 : "50%",
            width: "calc(50% - 4px)",
            background: `linear-gradient(135deg, ${C.accent}, ${C.accentDim})`,
            borderRadius: 10,
            transition: "left .35s cubic-bezier(.34,1.56,.64,1)",
            boxShadow: `0 4px 16px ${C.accentGlow}`,
          }} />
          {["login", "signup"].map(m => (
            <button key={m} onClick={() => handleSwitch(m)}
              style={{
                flex: 1, position: "relative",
                padding: "12px 16px",
                background: "transparent", border: "none", borderRadius: 10,
                color: mode === m ? C.bg : C.textDim,
                fontSize: 13, fontWeight: 600, fontFamily: f.sans, cursor: "pointer",
                transition: "color .2s", letterSpacing: ".02em",
              }}>
              {m === "login" ? "Entrar" : "Criar conta"}
            </button>
          ))}
        </div>
      </div>

      {/* Social logins */}
      <div style={{ padding: "0 24px 12px", position: "relative", zIndex: 2 }}>
        <div style={{ marginBottom: 8 }}>
          <SocialBtn
            onClick={() => handleSocial("whatsapp")}
            loading={loadingProvider === "whatsapp"}
            bg={C.wa} label="WhatsApp" icon={Icon.wa} primary
          />
        </div>
        <div>
          <SocialBtn
            onClick={() => handleSocial("google")}
            loading={loadingProvider === "google"}
            bg="#fff" color="#1a1a1a" label="Google" icon={Icon.google}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0 4px" }}>
          <div style={{ flex: 1, height: 1, background: C.border }} />
          <span style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: C.textMute }}>
            ou com email
          </span>
          <div style={{ flex: 1, height: 1, background: C.border }} />
        </div>
      </div>

      {/* Forms */}
      <div style={{ padding: "0 24px 32px", position: "relative", zIndex: 2 }}>
        {mode === "login" ? (
          <LoginForm
            identifier={identifier} setIdentifier={setIdentifier}
            password={password} setPassword={setPassword}
            showPwd={showPwd} setShowPwd={setShowPwd}
            remember={remember} setRemember={setRemember}
            onForgot={() => setStep("forgot")}
            error={error}
          />
        ) : (
          <SignupForm
            name={name} setName={setName}
            whatsapp={whatsapp} setWhatsapp={setWhatsapp}
            email={email} setEmail={setEmail}
            password={password} setPassword={setPassword}
            showPwd={showPwd} setShowPwd={setShowPwd}
            sponsor={sponsor} setSponsor={setSponsor}
            sponsorLocked={!!sponsorInfo}
            acceptTerms={acceptTerms} setAcceptTerms={setAcceptTerms}
            pwdScore={pwdScore} pwdMeta={pwdMeta} pwdChecks={pwdChecks}
            accountSuggest={accountSuggest}
            onSwitchToLogin={() => handleSwitch("login", accountSuggest || email || whatsapp)}
            error={error}
          />
        )}

        <button
          onClick={handleSubmit}
          disabled={!canSubmit()}
          style={{
            width: "100%", marginTop: 20,
            padding: "16px 20px", borderRadius: 14, border: "none",
            background: canSubmit() ? `linear-gradient(135deg, ${C.accent}, ${C.accentDim})` : C.cardHi,
            color: canSubmit() ? C.bg : C.textMute,
            fontSize: 15, fontWeight: 700, fontFamily: f.sans,
            cursor: canSubmit() ? "pointer" : "not-allowed",
            letterSpacing: ".01em",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: canSubmit() ? `0 8px 24px ${C.accentGlow}` : "none",
            transition: "all .2s",
          }}
        >
          {loading ? (
            <Spinner color={C.bg} />
          ) : (
            <>
              {mode === "login" ? "Entrar" : "Criar minha conta"}
              {Icon.arrow}
            </>
          )}
        </button>

        <div style={{
          marginTop: 16, textAlign: "center",
          fontSize: 11, color: C.textMute,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          🔒 Seus dados são criptografados e protegidos
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: "auto", padding: "20px 24px 32px", textAlign: "center", position: "relative", zIndex: 2 }}>
        <div style={{ fontSize: 11, color: C.textMute, lineHeight: 1.6 }}>
          Ao continuar você aceita nossos{" "}
          <a style={{ color: C.accent, textDecoration: "none", cursor: "pointer" }}>Termos</a>{" · "}
          <a style={{ color: C.accent, textDecoration: "none", cursor: "pointer" }}>Privacidade</a>
        </div>
        <div style={{ fontSize: 10, color: C.textMute, marginTop: 8 }}>
          Precisa de ajuda? <a style={{ color: C.textDim, cursor: "pointer" }}>Fale no WhatsApp</a>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shake { 0%,100% { transform: translateX(0); } 20%,60% { transform: translateX(-4px); } 40%,80% { transform: translateX(4px); } }
        @keyframes pulseGlow {
          0%,100% { box-shadow: 0 0 0 0 ${C.accent}00; }
          50% { box-shadow: 0 0 0 6px ${C.accent}15; }
        }
        input:focus { outline: none; }
        input::placeholder { color: ${C.textMute}; }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// LOGIN FORM
// ═══════════════════════════════════════════════════════════
function LoginForm({ identifier, setIdentifier, password, setPassword, showPwd, setShowPwd, remember, setRemember, onForgot, error }) {
  return (
    <div style={{ animation: "fadeInUp .4s ease-out" }}>
      <Label>Email ou WhatsApp</Label>
      <Input
        type={isEmail(identifier) ? "email" : "tel"}
        autoComplete="username webauthn"
        inputMode={/^\d/.test(identifier) ? "tel" : "text"}
        value={identifier}
        onChange={e => setIdentifier(e.target.value)}
        placeholder="voce@email.com ou (11) 99999-9999"
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 16 }}>
        <Label style={{ marginBottom: 0 }}>Senha</Label>
        <button onClick={onForgot} style={{
          background: "none", border: "none", color: C.accent,
          fontSize: 11, cursor: "pointer", fontFamily: f.sans, fontWeight: 500,
        }}>
          Esqueci minha senha
        </button>
      </div>
      <PasswordInput
        value={password} onChange={setPassword}
        show={showPwd} onToggleShow={() => setShowPwd(!showPwd)}
        placeholder="sua senha"
        autoComplete="current-password webauthn"
      />

      {error && <ErrorBanner>{error}</ErrorBanner>}

      <label style={{
        display: "flex", alignItems: "center", gap: 10, marginTop: 16,
        cursor: "pointer", userSelect: "none",
      }}>
        <Checkbox checked={remember} onChange={setRemember} />
        <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ display: "none" }} />
        <span style={{ fontSize: 12, color: C.textDim }}>Manter conectado neste dispositivo</span>
      </label>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SIGNUP FORM
// ═══════════════════════════════════════════════════════════
function SignupForm({ name, setName, whatsapp, setWhatsapp, email, setEmail, password, setPassword, showPwd, setShowPwd, sponsor, setSponsor, sponsorLocked, acceptTerms, setAcceptTerms, pwdScore, pwdMeta, pwdChecks, accountSuggest, onSwitchToLogin, error }) {
  return (
    <div style={{ animation: "fadeInUp .4s ease-out" }}>
      {accountSuggest && (
        <div style={{
          marginBottom: 16, padding: "14px 16px",
          background: `linear-gradient(135deg, ${C.accent}12, ${C.gold}08)`,
          borderRadius: 12,
          border: `1px solid ${C.accent}30`,
          animation: "fadeInUp .3s",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <div style={{ fontSize: 20, lineHeight: 1 }}>👋</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>
                Essa conta já existe
              </div>
              <div style={{ fontSize: 11, color: C.textDim, lineHeight: 1.5, marginBottom: 10 }}>
                Parece que você já se cadastrou antes. Quer entrar ao invés de criar outra?
              </div>
              <button onClick={onSwitchToLogin} style={{
                padding: "8px 14px", borderRadius: 8,
                background: C.accent, color: C.bg,
                border: "none", fontSize: 12, fontWeight: 600,
                cursor: "pointer", fontFamily: f.sans,
                display: "inline-flex", alignItems: "center", gap: 6,
              }}>
                Sim, fazer login {Icon.arrow}
              </button>
            </div>
          </div>
        </div>
      )}

      <Label>Nome completo</Label>
      <Input value={name} onChange={e => setName(e.target.value)} placeholder="Como você quer ser chamado" autoComplete="name" />

      <div style={{ marginTop: 14 }}>
        <Label>WhatsApp</Label>
        <Input
          type="tel" inputMode="tel"
          value={whatsapp}
          onChange={e => setWhatsapp(maskBRPhone(e.target.value))}
          placeholder="(11) 99999-9999"
          autoComplete="tel"
        />
      </div>

      <div style={{ marginTop: 14 }}>
        <Label>Email</Label>
        <Input
          type="email" inputMode="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="voce@email.com"
          autoComplete="email"
        />
      </div>

      <div style={{ marginTop: 14 }}>
        <Label>Senha</Label>
        <PasswordInput
          value={password} onChange={setPassword}
          show={showPwd} onToggleShow={() => setShowPwd(!showPwd)}
          placeholder="crie uma senha forte"
          autoComplete="new-password"
        />
        {password && (
          <div style={{ marginTop: 8, animation: "fadeInUp .2s" }}>
            <div style={{ height: 4, borderRadius: 2, background: C.card, overflow: "hidden", marginBottom: 8 }}>
              <div style={{ height: "100%", width: pwdMeta.width, background: pwdMeta.color, transition: "all .3s" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 10, color: C.textMute }}>Força:</span>
              <span style={{ fontSize: 10, color: pwdMeta.color, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>
                {pwdMeta.label}
              </span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {pwdChecks.map((c, i) => (
                <div key={i} style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: 10, color: c.ok ? C.green : C.textMute, transition: "color .2s",
                }}>
                  <span style={{
                    width: 12, height: 12, borderRadius: "50%",
                    background: c.ok ? C.green : "transparent",
                    border: c.ok ? "none" : `1px solid ${C.textMute}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: C.bg, transition: "all .2s",
                  }}>{c.ok && Icon.check}</span>
                  {c.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 14 }}>
        <Label>
          ID do patrocinador {!sponsorLocked && <span style={{ color: C.textMute, textTransform: "none", letterSpacing: 0, fontSize: 10 }}>(opcional)</span>}
        </Label>
        <Input
          value={sponsor}
          onChange={e => setSponsor(e.target.value)}
          placeholder="Ex: 12345 — quem te convidou"
          disabled={sponsorLocked}
          style={sponsorLocked ? { opacity: 0.7, cursor: "not-allowed" } : {}}
        />
        {sponsor && (
          <div style={{ fontSize: 10, color: C.teal, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
            {Icon.check} {sponsorLocked ? "Patrocinador verificado via link de convite" : "Você será vinculado à rede desse patrocinador"}
          </div>
        )}
      </div>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      <label style={{
        display: "flex", alignItems: "flex-start", gap: 10, marginTop: 16,
        cursor: "pointer", userSelect: "none",
      }}>
        <Checkbox checked={acceptTerms} onChange={setAcceptTerms} top />
        <input type="checkbox" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)} style={{ display: "none" }} />
        <span style={{ fontSize: 11, color: C.textDim, lineHeight: 1.5 }}>
          Aceito os <a style={{ color: C.accent }}>Termos de Uso</a> e a <a style={{ color: C.accent }}>Política de Privacidade</a> da Líder Training
        </span>
      </label>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// OTP Screen (WhatsApp)
// ═══════════════════════════════════════════════════════════
function OTPScreen({ whatsapp, signupMeta, onBack, onSuccess }) {
  const inputRefs = useRef([]);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(45);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const verify = useCallback(async (fullCode) => {
    setVerifying(true);
    setError(null);
    const { error: err } = await verifyWhatsAppOTP({
      whatsapp,
      code: fullCode,
      meta: signupMeta || {},
    });
    setVerifying(false);
    if (err) {
      setError(err.message);
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      return;
    }
    onSuccess();
  }, [whatsapp, signupMeta, onSuccess]);

  useEffect(() => {
    if (code.every(c => c !== "") && !verifying) {
      verify(code.join(""));
    }
  }, [code, verifying, verify]);

  const handleChange = (i, v) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const newCode = [...code];
    newCode[i] = d;
    setCode(newCode);
    if (d && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKey = (i, e) => {
    if (e.key === "Backspace" && !code[i] && i > 0) inputRefs.current[i - 1]?.focus();
    if (e.key === "Paste" || (e.ctrlKey && e.key === "v")) {
      // Handled by onPaste below
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData?.getData("text") || "").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(""));
    }
  };

  const resend = async () => {
    setResending(true);
    setError(null);
    const { error: err } = await sendWhatsAppOTP({ whatsapp });
    setResending(false);
    if (err) return setError(err.message);
    setCountdown(45);
    setCode(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: f.sans, padding: "48px 24px" }}>
      <button onClick={onBack} style={{
        background: "none", border: "none", color: C.textDim,
        fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 32,
      }}>← Voltar</button>

      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{
          width: 64, height: 64, margin: "0 auto 20px",
          borderRadius: 20, background: `linear-gradient(135deg, ${C.wa}, ${C.wa2})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 8px 32px ${C.wa}44`,
        }}>{Icon.wa}</div>

        <h1 style={{ fontFamily: f.serif, fontSize: 26, fontStyle: "italic", fontWeight: 400, margin: "0 0 8px" }}>
          Digite o código
        </h1>
        <p style={{ fontSize: 13, color: C.textDim, margin: 0, lineHeight: 1.6 }}>
          Enviamos um código de 6 dígitos para<br />
          <strong style={{ color: C.text }}>{whatsapp}</strong>
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 }} onPaste={handlePaste}>
        {code.map((d, i) => (
          <input
            key={i}
            ref={el => inputRefs.current[i] = el}
            type="tel" inputMode="numeric" maxLength={1}
            value={d}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKey(i, e)}
            autoComplete="one-time-code"
            autoFocus={i === 0}
            style={{
              width: 46, height: 56,
              textAlign: "center", fontSize: 22, fontWeight: 700, fontFamily: f.serif,
              background: d ? `${C.accent}15` : C.card,
              border: `2px solid ${d ? C.accent : C.border}`,
              borderRadius: 12, color: C.text, transition: "all .2s",
            }}
          />
        ))}
      </div>

      {verifying && (
        <div style={{ textAlign: "center", fontSize: 12, color: C.teal, marginBottom: 16 }}>
          ✓ Verificando...
        </div>
      )}
      {error && <ErrorBanner>{error}</ErrorBanner>}

      <div style={{ textAlign: "center", fontSize: 12, color: C.textDim, marginTop: 16 }}>
        {countdown > 0 ? (
          <>Reenviar em <strong style={{ color: C.text }}>{countdown}s</strong></>
        ) : (
          <button onClick={resend} disabled={resending} style={{
            background: "none", border: "none", color: C.accent,
            fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: f.sans,
          }}>{resending ? "Reenviando..." : "Reenviar código"}</button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Forgot Password Screen
// ═══════════════════════════════════════════════════════════
function ForgotScreen({ initial, onBack }) {
  const [val, setVal] = useState(initial || "");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const send = async () => {
    setLoading(true);
    setError(null);
    const { error: err } = await sendPasswordReset(val);
    setLoading(false);
    if (err) return setError(err.message);
    setSent(true);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: f.sans, padding: "48px 24px" }}>
      <button onClick={onBack} style={{
        background: "none", border: "none", color: C.textDim,
        fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 32,
      }}>← Voltar</button>

      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔑</div>
        <h1 style={{ fontFamily: f.serif, fontSize: 26, fontStyle: "italic", fontWeight: 400, margin: "0 0 8px" }}>
          Recuperar senha
        </h1>
        <p style={{ fontSize: 13, color: C.textDim, lineHeight: 1.6, margin: 0 }}>
          {sent
            ? "Pronto! Se essa conta existe, você vai receber um link de redefinição."
            : "Digite seu email ou WhatsApp e enviaremos um link pra criar uma nova senha."}
        </p>
      </div>

      {!sent ? (
        <>
          <Label>Email ou WhatsApp</Label>
          <Input value={val} onChange={e => setVal(e.target.value)} placeholder="voce@email.com" />
          {error && <ErrorBanner>{error}</ErrorBanner>}
          <button onClick={send} disabled={val.length < 5 || loading} style={{
            width: "100%", marginTop: 20, padding: "16px",
            borderRadius: 14, border: "none",
            background: val.length >= 5 && !loading ? `linear-gradient(135deg, ${C.accent}, ${C.accentDim})` : C.cardHi,
            color: val.length >= 5 && !loading ? C.bg : C.textMute,
            fontSize: 15, fontWeight: 700, cursor: val.length >= 5 && !loading ? "pointer" : "not-allowed",
            fontFamily: f.sans,
          }}>
            {loading ? <Spinner color={C.bg} /> : "Enviar link de recuperação"}
          </button>
        </>
      ) : (
        <div style={{
          padding: 20, borderRadius: 14,
          background: `${C.green}12`, border: `1px solid ${C.green}30`,
          textAlign: "center",
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📬</div>
          <div style={{ fontSize: 13, color: C.text, fontWeight: 600, marginBottom: 4 }}>Confira suas mensagens</div>
          <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.5 }}>
            O link chega em até 2 minutos. Verifique também a caixa de spam.
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Enable Biometric Screen (after first successful login)
// ═══════════════════════════════════════════════════════════
function EnableBiometricScreen({ onDone }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deviceName, setDeviceName] = useState("");

  const enable = async () => {
    setLoading(true);
    setError(null);
    try {
      const { deviceName } = await registerPasskey();
      setDeviceName(deviceName);
      setTimeout(onDone, 1500);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text, fontFamily: f.sans,
      padding: "48px 24px", display: "flex", flexDirection: "column",
    }}>
      <div style={{ textAlign: "center", margin: "auto 0" }}>
        <div style={{
          width: 88, height: 88, margin: "0 auto 24px",
          borderRadius: 28, background: `linear-gradient(135deg, ${C.accent}, ${C.accentDim})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 12px 40px ${C.accentGlow}`,
          color: C.bg,
        }}>{Icon.fingerprint}</div>

        {deviceName ? (
          <>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✓</div>
            <h1 style={{ fontFamily: f.serif, fontSize: 24, fontStyle: "italic", fontWeight: 400, margin: "0 0 8px" }}>
              Biometria ativada!
            </h1>
            <p style={{ fontSize: 13, color: C.textDim, lineHeight: 1.6 }}>
              Da próxima vez que abrir o app, basta usar o seu {deviceName} para entrar.
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: C.gold, marginBottom: 8 }}>
              Extra Elite
            </div>
            <h1 style={{ fontFamily: f.serif, fontSize: 24, fontStyle: "italic", fontWeight: 400, margin: "0 0 12px" }}>
              Entre com <span style={{ color: C.accent }}>biometria</span>
            </h1>
            <p style={{ fontSize: 13, color: C.textDim, lineHeight: 1.6, maxWidth: 320, margin: "0 auto 32px" }}>
              Ative Face ID ou Touch ID para entrar sem digitar senha. Mais rápido, mais seguro.
            </p>

            {error && <ErrorBanner>{error}</ErrorBanner>}

            <button onClick={enable} disabled={loading} style={{
              padding: "14px 32px", borderRadius: 14, border: "none",
              background: `linear-gradient(135deg, ${C.accent}, ${C.accentDim})`,
              color: C.bg, fontSize: 14, fontWeight: 700, cursor: "pointer",
              fontFamily: f.sans, boxShadow: `0 8px 24px ${C.accentGlow}`,
              display: "inline-flex", alignItems: "center", gap: 8,
            }}>
              {loading ? <Spinner color={C.bg} /> : <>Ativar agora {Icon.arrow}</>}
            </button>

            <div>
              <button onClick={onDone} style={{
                background: "none", border: "none", color: C.textMute,
                fontSize: 12, cursor: "pointer", marginTop: 20, fontFamily: f.sans,
              }}>
                Talvez depois
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Success Screen
// ═══════════════════════════════════════════════════════════
function SuccessScreen({ mode, onContinue }) {
  useEffect(() => {
    const t = setTimeout(onContinue, 2500);
    return () => clearTimeout(t);
  }, [onContinue]);

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: C.text, fontFamily: f.sans,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "48px 24px", textAlign: "center", position: "relative", overflow: "hidden",
    }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          top: `${20 + (i * 7) % 60}%`, left: `${(i * 23) % 100}%`,
          width: 6, height: 6,
          background: [C.accent, C.gold, C.teal, C.green][i % 4],
          borderRadius: "50%", opacity: 0.6,
          animation: `float ${3 + i * 0.2}s ease-in-out infinite`,
          animationDelay: `${i * 0.1}s`,
        }} />
      ))}

      <div style={{
        width: 80, height: 80, borderRadius: "50%",
        background: `linear-gradient(135deg, ${C.accent}, ${C.gold})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 12px 40px ${C.accentGlow}`,
        marginBottom: 24, fontSize: 40,
        animation: "popIn .6s cubic-bezier(.34,1.56,.64,1)",
      }}>✓</div>

      <div style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: C.gold, marginBottom: 8 }}>
        Pronto
      </div>
      <h1 style={{ fontFamily: f.serif, fontSize: 28, fontStyle: "italic", fontWeight: 400, margin: "0 0 12px" }}>
        {mode === "login" ? <>Bem-vindo de <span style={{ color: C.accent }}>volta</span></> : <>Bem-vindo à <span style={{ color: C.accent }}>elite</span></>}
      </h1>
      <p style={{ fontSize: 14, color: C.textDim, lineHeight: 1.6, maxWidth: 320, margin: "0 0 32px" }}>
        {mode === "login"
          ? "Sua jornada continua. Vamos ver o que aconteceu enquanto você estava fora."
          : "Sua conta foi criada. Agora vem a parte boa: sua Ficha de Início Rápido."}
      </p>

      <style>{`
        @keyframes popIn { 0% { opacity: 0; transform: scale(.5); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// UI PRIMITIVES
// ═══════════════════════════════════════════════════════════
function Label({ children, style }) {
  return (
    <div style={{
      fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase",
      color: C.textMute, marginBottom: 8, fontWeight: 500, ...style,
    }}>{children}</div>
  );
}

function Input({ style, ...props }) {
  return (
    <input
      {...props}
      style={{
        width: "100%", boxSizing: "border-box",
        padding: "14px 16px",
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        color: C.text, fontSize: 14, fontFamily: f.sans,
        transition: "all .2s",
        ...style,
      }}
      onFocus={e => { e.target.style.borderColor = C.accent; e.target.style.background = C.cardHi; }}
      onBlur={e => { e.target.style.borderColor = C.border; e.target.style.background = C.card; }}
    />
  );
}

function PasswordInput({ value, onChange, show, onToggleShow, ...props }) {
  return (
    <div style={{ position: "relative" }}>
      <Input
        type={show ? "text" : "password"}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ paddingRight: 48 }}
        {...props}
      />
      <button onClick={onToggleShow} type="button" style={{
        position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
        background: "none", border: "none", color: C.textDim,
        padding: 8, cursor: "pointer", display: "flex",
      }}>{Icon.eye(show)}</button>
    </div>
  );
}

function SocialBtn({ onClick, bg, color = "#1a1a1a", label, icon, primary, loading }) {
  return (
    <button onClick={onClick} disabled={loading} style={{
      flex: 1, width: "100%", padding: "14px 12px",
      background: bg, color, border: "none", borderRadius: 12,
      fontSize: 13, fontWeight: 600, fontFamily: f.sans,
      cursor: loading ? "wait" : "pointer",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      boxShadow: primary ? `0 4px 16px ${bg}44` : "0 1px 3px rgba(0,0,0,0.15)",
      opacity: loading ? 0.7 : 1, transition: "opacity .15s, transform .15s",
    }}
    onMouseDown={e => !loading && (e.currentTarget.style.transform = "scale(0.97)")}
    onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
      {loading ? <Spinner color={color} small /> : icon}
      <span>{primary ? `Continuar com ${label}` : label}</span>
    </button>
  );
}

function Checkbox({ checked, top }) {
  return (
    <div style={{
      width: 18, height: 18, minWidth: 18, borderRadius: 5,
      marginTop: top ? 1 : 0,
      background: checked ? C.accent : "transparent",
      border: `1.5px solid ${checked ? C.accent : C.textMute}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      transition: "all .2s", color: C.bg,
    }}>{checked && Icon.check}</div>
  );
}

function ErrorBanner({ children }) {
  return (
    <div style={{
      marginTop: 14, padding: "12px 14px",
      background: `${C.red}12`, borderRadius: 10,
      border: `1px solid ${C.red}30`,
      fontSize: 12, color: C.red, lineHeight: 1.5,
      display: "flex", alignItems: "flex-start", gap: 8,
      animation: "shake .4s",
    }}>
      <span style={{ fontSize: 14 }}>⚠️</span>
      <span>{children}</span>
    </div>
  );
}

function Spinner({ color = C.bg, small }) {
  const size = small ? 12 : 14;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span style={{
        width: size, height: size, borderRadius: "50%",
        border: `2px solid ${color}40`, borderTopColor: color,
        animation: "spin 0.8s linear infinite",
      }} />
    </span>
  );
}
