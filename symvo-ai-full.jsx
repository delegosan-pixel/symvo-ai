import { useState, useRef, useEffect } from "react";

// ── Brand colors from logo ──
const C = {
  navy:    "#0d2461",
  blue:    "#1565c0",
  teal:    "#00acc1",
  orange:  "#f5a623",
  white:   "#ffffff",
  bg:      "#f0f4f8",
  card:    "#ffffff",
  text:    "#1a2a4a",
  muted:   "#7a90b0",
  border:  "#dde6f0",
};

const SYSTEM_KOK = `Είσαι ο "Σύμβουλος ΚΟΚ" του Symvo AI — εξειδικευμένος AI βοηθός που αναλύει τροχαία ατυχήματα βάσει του Ελληνικού ΚΟΚ (Ν.2696/1999).

Όταν ο χρήστης περιγράφει ένα ατύχημα:
1. Ανέλυσε ποιος παρέβη ποιο άρθρο ΚΟΚ
2. Δώσε εκτίμηση ευθύνης (π.χ. 100% οδηγός Α ή 70%-30%)
3. Εξήγησε το σκεπτικό με αναφορά σε άρθρα ΚΟΚ
4. Πρόσθεσε πρακτικές συμβουλές (τι να κάνει τώρα)
5. Πες ότι η τελική κρίση ανήκει στις αρχές

Απάντα ΠΑΝΤΑ στα Ελληνικά. Χρησιμοποίησε emoji. Να είσαι σαφής και ανθρώπινος.`;

const SYSTEM_GUIDE = `Είσαι ο βοηθός ατυχήματος του Symvo AI. Ο χρήστης μόλις είχε ατύχημα και χρειάζεται καθοδήγηση.

Βοήθησέ τον βήμα-βήμα:
1. Πρώτα ρώτα αν είναι καλά / αν υπάρχουν τραυματίες
2. Πες τι να κάνει ΑΜΕΣΑ (ασφάλεια, αστυνομία, φωτογραφίες)
3. Καθοδήγησέ τον για τη δήλωση ατυχήματος
4. Πες τι να ΜΗΝ κάνει (μην παραδέχεται ευθύνη)
5. Υπενθύμισε να ειδοποιήσει την ασφαλιστική εντός 8 ημερών

Να είσαι ΗΡΕΜΟΣ, ΣΥΝΤΟΜΟΣ και ΣΑΦΗΣ. Ο χρήστης μπορεί να είναι σε σοκ.
Απάντα στα Ελληνικά. Χρησιμοποίησε ✅ για βήματα.`;

// ── Symvo Logo SVG ──
function SymvoLogo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer teal arc top-left */}
      <path d="M50 8 A42 42 0 0 0 8 50" stroke="#00bcd4" strokeWidth="14" strokeLinecap="round" fill="none"/>
      {/* Outer blue arc right */}
      <path d="M8 50 A42 42 0 0 0 50 92" stroke="#1565c0" strokeWidth="14" strokeLinecap="round" fill="none"/>
      {/* Outer dark-blue arc top-right */}
      <path d="M50 92 A42 42 0 0 0 92 50" stroke="#0d2461" strokeWidth="14" strokeLinecap="round" fill="none"/>
      {/* Orange bottom arc */}
      <path d="M92 50 A42 42 0 0 0 50 8" stroke="#f5a623" strokeWidth="14" strokeLinecap="round" fill="none"/>
      {/* White center circle */}
      <circle cx="50" cy="50" r="20" fill="white"/>
      {/* Inner teal highlight */}
      <path d="M50 30 A20 20 0 0 0 30 50" stroke="#00bcd4" strokeWidth="5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

// ── Reusable components ──
function TopBar({ title, onBack }) {
  return (
    <div style={{ background: C.navy, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
      {onBack && (
        <button onClick={onBack} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, width: 36, height: 36, color: C.white, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <SymvoLogo size={36} />
        <div>
          <div style={{ color: C.white, fontWeight: 700, fontSize: 16, fontFamily: "'Georgia', serif" }}>{title}</div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, letterSpacing: 1 }}>SYMVO AI</div>
        </div>
      </div>
    </div>
  );
}

function Card({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: C.card,
      borderRadius: 16,
      padding: 18,
      boxShadow: "0 2px 12px rgba(13,36,97,0.08)",
      border: `1px solid ${C.border}`,
      cursor: onClick ? "pointer" : "default",
      transition: "transform 0.15s, box-shadow 0.15s",
      ...style,
    }}
    onMouseEnter={e => onClick && (e.currentTarget.style.transform = "translateY(-2px)")}
    onMouseLeave={e => onClick && (e.currentTarget.style.transform = "none")}
    >{children}</div>
  );
}

// ── SCREENS ──

function HomeScreen({ setScreen }) {
  const features = [
    { icon: "🚨", label: "Είχα Ατύχημα", sub: "Καθοδήγηση βήμα-βήμα", screen: "guide", color: "#ff4444", bg: "#fff0f0" },
    { icon: "⚖️", label: "Σύμβουλος ΚΟΚ", sub: "Ποιος φταίει;", screen: "kok", color: C.navy, bg: "#f0f4ff" },
    { icon: "📄", label: "Το Συμβόλαιό μου", sub: "Τι καλύπτεται", screen: "contract", color: C.teal, bg: "#f0fbff" },
    { icon: "🔧", label: "Βρες Συνεργείο", sub: "Κοντινά συνεργεία", screen: "garage", color: C.orange, bg: "#fffbf0" },
    { icon: "🏥", label: "Νοσοκομεία", sub: "Κοντά μου τώρα", screen: "hospital", color: "#e53935", bg: "#fff5f5" },
    { icon: "📞", label: "Επικοινωνία", sub: "Με τον εκπρόσωπό μου", screen: "contact", color: "#43a047", bg: "#f0fff4" },
  ];

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.blue} 100%)`, padding: "28px 20px 36px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}><SymvoLogo size={36} /></div>
          <div>
            <div style={{ color: C.white, fontWeight: 800, fontSize: 22, fontFamily: "'Georgia', serif" }}>Symvo AI</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>Ο ψηφιακός σου σύμβουλος</div>
          </div>
        </div>
        <Card style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(10px)" }}>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginBottom: 4 }}>Καλώς ήρθες</div>
          <div style={{ color: C.white, fontWeight: 600, fontSize: 15 }}>Γιάννης Παπαδόπουλος</div>
          <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>🚗 Toyota Yaris · ABC-1234</div>
            <div style={{ color: "#f5a623", fontSize: 12 }}>✓ Ενεργό</div>
          </div>
        </Card>
      </div>

      {/* Emergency button */}
      <div style={{ padding: "0 20px", marginTop: -18 }}>
        <button onClick={() => setScreen("guide")} style={{
          width: "100%", background: "linear-gradient(135deg, #e53935, #c62828)",
          border: "none", borderRadius: 16, padding: "18px 20px",
          color: C.white, fontWeight: 700, fontSize: 17, cursor: "pointer",
          boxShadow: "0 8px 24px rgba(229,57,53,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          fontFamily: "'Georgia', serif",
        }}>
          🚨 ΕΊΧΑ ΑΤΎΧΗΜΑ — ΒΟΉΘΕΙΑ ΤΩΡΑ
        </button>
      </div>

      {/* Features grid */}
      <div style={{ padding: "20px 20px 100px" }}>
        <div style={{ fontSize: 13, color: C.muted, fontWeight: 600, letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>Υπηρεσίες</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {features.filter(f => f.screen !== "guide").map(f => (
            <Card key={f.screen} onClick={() => setScreen(f.screen)} style={{ padding: 16, textAlign: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: f.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 10px" }}>{f.icon}</div>
              <div style={{ color: C.text, fontWeight: 700, fontSize: 13 }}>{f.label}</div>
              <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{f.sub}</div>
            </Card>
          ))}
        </div>

        {/* Info banner */}
        <Card style={{ marginTop: 16, background: `linear-gradient(135deg, ${C.navy}10, ${C.teal}10)`, border: `1px solid ${C.teal}30` }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ fontSize: 28 }}>🛡️</div>
            <div>
              <div style={{ color: C.navy, fontWeight: 700, fontSize: 13 }}>Είσαι προστατευμένος 24/7</div>
              <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>Το Symvo AI είναι πάντα διαθέσιμο — χωρίς αναμονή</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ChatScreen({ systemPrompt, title, placeholder, quickPrompts, onBack, welcomeMsg }) {
  const [messages, setMessages] = useState([{ role: "assistant", content: welcomeMsg }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const taRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const fmt = (t) => t.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>").replace(/\n/g, "<br/>");

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    const newMsgs = [...messages, { role: "user", content: msg }];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);
    if (taRef.current) taRef.current.style.height = "auto";
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: newMsgs.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.map(b => b.text || "").join("") || "Σφάλμα. Δοκιμάστε ξανά.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Σφάλμα σύνδεσης. Δοκιμάστε ξανά." }]);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <TopBar title={title} onBack={onBack} />

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 0" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: m.role === "user" ? "row-reverse" : "row", gap: 8, marginBottom: 14, alignItems: "flex-end" }}>
            {m.role === "assistant" && (
              <div style={{ width: 32, height: 32, borderRadius: 10, background: C.white, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><SymvoLogo size={24} /></div>
            )}
            <div style={{
              maxWidth: "80%",
              background: m.role === "user" ? C.navy : C.white,
              color: m.role === "user" ? C.white : C.text,
              borderRadius: m.role === "user" ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
              padding: "12px 15px",
              fontSize: 14,
              lineHeight: 1.6,
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
            }} dangerouslySetInnerHTML={{ __html: fmt(m.content) }} />
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", marginBottom: 14 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: C.white, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}><SymvoLogo size={24} /></div>
            <div style={{ background: C.white, borderRadius: "4px 18px 18px 18px", padding: "14px 18px", boxShadow: "0 2px 8px rgba(0,0,0,0.07)", display: "flex", gap: 5 }}>
              {[0,1,2].map(j => <div key={j} style={{ width: 7, height: 7, borderRadius: "50%", background: C.blue, animation: "pulse 1.2s ease-in-out infinite", animationDelay: `${j*0.2}s` }} />)}
            </div>
          </div>
        )}
        {messages.length === 1 && quickPrompts && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Συνηθισμένα σενάρια</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {quickPrompts.map((p, i) => (
                <button key={i} onClick={() => send(p)} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 20, padding: "7px 14px", color: C.blue, fontSize: 12, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>{p}</button>
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div style={{ padding: "12px 16px 28px", background: C.white, borderTop: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 16, padding: "8px 8px 8px 14px" }}>
          <textarea ref={taRef} value={input} onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px"; }} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder={placeholder} rows={1} style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: C.text, fontSize: 14, lineHeight: 1.5, resize: "none", fontFamily: "inherit", minHeight: 24, maxHeight: 100 }} />
          <button onClick={() => send()} disabled={!input.trim() || loading} style={{ width: 38, height: 38, borderRadius: 12, background: input.trim() && !loading ? C.navy : C.border, border: "none", cursor: input.trim() && !loading ? "pointer" : "default", color: C.white, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>➤</button>
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{transform:scale(0.7);opacity:0.4} 50%{transform:scale(1.1);opacity:1} }`}</style>
    </div>
  );
}

function ContractScreen({ onBack }) {
  const coverages = [
    { icon: "✅", label: "Αστική Ευθύνη", detail: "Καλύπτει ζημιές σε τρίτους", covered: true },
    { icon: "✅", label: "Νομική Προστασία", detail: "Δικηγόρος & δικαστικά έξοδα", covered: true },
    { icon: "✅", label: "Οδική Βοήθεια 24/7", detail: "Ρυμούλκηση & βλάβη", covered: true },
    { icon: "✅", label: "Ατυχήματα Επιβατών", detail: "Ιατρικά έξοδα επιβατών", covered: true },
    { icon: "❌", label: "Ίδιες Ζημιές", detail: "Δεν καλύπτεται από το πλάνο σου", covered: false },
    { icon: "❌", label: "Κλοπή", detail: "Δεν καλύπτεται από το πλάνο σου", covered: false },
    { icon: "❌", label: "Φυσικά Φαινόμενα", detail: "Χαλάζι, πλημμύρα κλπ", covered: false },
  ];

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <TopBar title="Το Συμβόλαιό μου" onBack={onBack} />
      <div style={{ padding: 16 }}>
        <Card style={{ background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`, marginBottom: 16 }}>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>Αρ. Συμβολαίου</div>
          <div style={{ color: C.white, fontWeight: 700, fontSize: 18, margin: "4px 0" }}>GR-2024-8847231</div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
            <div><div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>Λήξη</div><div style={{ color: "#f5a623", fontWeight: 600, fontSize: 13 }}>31/12/2025</div></div>
            <div><div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>Ασφαλιστική</div><div style={{ color: C.white, fontWeight: 600, fontSize: 13 }}>Interamerican</div></div>
            <div><div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>Πλάνο</div><div style={{ color: C.white, fontWeight: 600, fontSize: 13 }}>Βασικό+</div></div>
          </div>
        </Card>

        <div style={{ fontSize: 13, color: C.muted, fontWeight: 600, letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" }}>Καλύψεις</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {coverages.map((c, i) => (
            <Card key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", opacity: c.covered ? 1 : 0.6 }}>
              <div style={{ fontSize: 20 }}>{c.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: C.text, fontWeight: 600, fontSize: 14 }}>{c.label}</div>
                <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{c.detail}</div>
              </div>
              {!c.covered && <button style={{ background: C.orange + "20", color: C.orange, border: `1px solid ${C.orange}40`, borderRadius: 8, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>Προσθήκη</button>}
            </Card>
          ))}
        </div>

        <Card style={{ marginTop: 16, background: C.teal + "15", border: `1px solid ${C.teal}40` }}>
          <div style={{ color: C.navy, fontWeight: 700, marginBottom: 6 }}>💡 Σύσταση Symvo AI</div>
          <div style={{ color: C.text, fontSize: 13, lineHeight: 1.6 }}>Βάσει του ιστορικού σου, προτείνουμε να προσθέσεις <strong>Ίδιες Ζημιές</strong>. Μόλις +8€/μήνα.</div>
        </Card>
      </div>
    </div>
  );
}

function GarageScreen({ onBack }) {
  const garages = [
    { name: "Συνεργείο Κώστα", dist: "0.4 χλμ", rating: "4.9", open: true, tel: "210-1234567", spec: "Bodyshop & Μηχανολογικά" },
    { name: "AutoFix Πειραιάς", dist: "1.2 χλμ", rating: "4.7", open: true, tel: "210-9876543", spec: "Ζημιές & Βαφή" },
    { name: "Intercar Service", dist: "2.1 χλμ", rating: "4.8", open: false, tel: "210-5551234", spec: "Εξουσιοδοτημένο Toyota" },
    { name: "MechPro Garage", dist: "3.0 χλμ", rating: "4.6", open: true, tel: "210-3334444", spec: "Γενικές επισκευές" },
  ];

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <TopBar title="Βρες Συνεργείο" onBack={onBack} />
      <div style={{ padding: 16 }}>
        <Card style={{ background: C.blue + "15", border: `1px solid ${C.blue}30`, marginBottom: 16, display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ fontSize: 20 }}>📍</div>
          <div style={{ fontSize: 13, color: C.navy }}>Εμφάνιση αποτελεσμάτων κοντά στη <strong>θέση σου</strong></div>
        </Card>
        <div style={{ fontSize: 13, color: C.muted, fontWeight: 600, letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" }}>Κοντινά Συνεργεία</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {garages.map((g, i) => (
            <Card key={i} style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ color: C.text, fontWeight: 700, fontSize: 15 }}>{g.name}</div>
                  <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{g.spec}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#fff8e1", border: "1px solid #ffe08a", borderRadius: 8, padding: "4px 8px" }}>
                  <span style={{ fontSize: 12 }}>⭐</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#e65100" }}>{g.rating}</span>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                <div style={{ display: "flex", gap: 12 }}>
                  <span style={{ fontSize: 12, color: C.muted }}>📍 {g.dist}</span>
                  <span style={{ fontSize: 12, color: g.open ? "#2e7d32" : "#c62828", fontWeight: 600 }}>{g.open ? "● Ανοιχτά" : "● Κλειστό"}</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer", color: C.navy, fontFamily: "inherit" }}>🗺️ Οδηγίες</button>
                  <button style={{ background: C.navy, border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer", color: C.white, fontFamily: "inherit" }}>📞 Κλήση</button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function HospitalScreen({ onBack }) {
  const hospitals = [
    { name: "ΓΝ Αττικόν", dist: "1.8 χλμ", open: true, tel: "210-5831000", type: "Δημόσιο" },
    { name: "ΙΑΣΩ General", dist: "2.4 χλμ", open: true, tel: "210-6181000", type: "Ιδιωτικό" },
    { name: "ΓΝ Αιγινήτειο", dist: "3.1 χλμ", open: true, tel: "210-7289000", type: "Δημόσιο" },
  ];

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <TopBar title="Νοσοκομεία Κοντά μου" onBack={onBack} />
      <div style={{ padding: 16 }}>
        <button style={{ width: "100%", background: "linear-gradient(135deg, #e53935, #c62828)", border: "none", borderRadius: 14, padding: 16, color: C.white, fontWeight: 700, fontSize: 16, cursor: "pointer", marginBottom: 16, fontFamily: "inherit" }}>
          🚑 Κλήση ΕΚΑΒ — 166
        </button>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {hospitals.map((h, i) => (
            <Card key={i}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ color: C.text, fontWeight: 700, fontSize: 15 }}>{h.name}</div>
                  <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{h.type} · {h.dist}</div>
                </div>
                <span style={{ color: "#2e7d32", fontSize: 12, fontWeight: 600 }}>● 24ωρο</span>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button style={{ flex: 1, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 0", fontSize: 12, cursor: "pointer", color: C.navy, fontFamily: "inherit" }}>🗺️ Οδηγίες</button>
                <button style={{ flex: 1, background: "#e53935", border: "none", borderRadius: 8, padding: "8px 0", fontSize: 12, cursor: "pointer", color: C.white, fontFamily: "inherit", fontWeight: 600 }}>📞 {h.tel}</button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContactScreen({ onBack }) {
  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <TopBar title="Επικοινωνία" onBack={onBack} />
      <div style={{ padding: 16 }}>
        <Card style={{ textAlign: "center", padding: 28, marginBottom: 14 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: `linear-gradient(135deg, ${C.navy}, ${C.blue})`, margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>👨‍💼</div>
          <div style={{ color: C.text, fontWeight: 700, fontSize: 17 }}>Νίκος Αλεξίου</div>
          <div style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>Ασφαλιστικός Σύμβουλος</div>
          <div style={{ color: C.teal, fontSize: 13, marginTop: 2 }}>Interamerican</div>
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <button style={{ flex: 1, background: C.navy, border: "none", borderRadius: 12, padding: 13, color: C.white, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>📞 Κλήση</button>
            <button style={{ flex: 1, background: "#25d366", border: "none", borderRadius: 12, padding: 13, color: C.white, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>💬 WhatsApp</button>
          </div>
        </Card>
        <Card>
          <div style={{ color: C.navy, fontWeight: 700, marginBottom: 14 }}>Άλλοι τρόποι επικοινωνίας</div>
          {[["📧", "Email", "n.alexiou@interamerican.gr"], ["🌐", "Γραφείο", "Λεωφ. Αθηνών 45, Αθήνα"], ["⏰", "Ώρες", "Δευτ-Παρ 9:00-17:00"]].map(([icon, label, val], i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0", borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <div>
                <div style={{ color: C.muted, fontSize: 11 }}>{label}</div>
                <div style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{val}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ── BOTTOM NAV ──
function BottomNav({ screen, setScreen }) {
  const tabs = [
    { id: "home", icon: "🏠", label: "Αρχική" },
    { id: "kok", icon: "⚖️", label: "ΚΟΚ" },
    { id: "contract", icon: "📄", label: "Συμβόλαιο" },
    { id: "garage", icon: "🔧", label: "Συνεργείο" },
  ];
  const mainScreens = tabs.map(t => t.id);
  if (!mainScreens.includes(screen)) return null;

  return (
    <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: C.white, borderTop: `1px solid ${C.border}`, display: "flex", zIndex: 100, boxShadow: "0 -4px 20px rgba(0,0,0,0.08)" }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setScreen(t.id)} style={{ flex: 1, padding: "10px 0 14px", background: "transparent", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <div style={{ fontSize: 22 }}>{t.icon}</div>
          <div style={{ fontSize: 10, color: screen === t.id ? C.navy : C.muted, fontWeight: screen === t.id ? 700 : 400 }}>{t.label}</div>
          {screen === t.id && <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.navy }} />}
        </button>
      ))}
    </div>
  );
}

// ── APP ──
export default function SymvoApp() {
  const [screen, setScreen] = useState("home");

  const screens = {
    home: <HomeScreen setScreen={setScreen} />,
    kok: <ChatScreen
      systemPrompt={SYSTEM_KOK}
      title="Σύμβουλος ΚΟΚ"
      placeholder="Περιγράψτε το ατύχημα..."
      welcomeMsg={"Γεια σας! Είμαι ο **Σύμβουλος ΚΟΚ** της Symvo AI. ⚖️\n\nΠεριγράψτε μου το περιστατικό και θα αναλύσω ποιος ευθύνεται βάσει του Κώδικα Οδικής Κυκλοφορίας."}
      quickPrompts={["Χτύπησα πισωπλατά", "Σε σταυροδρόμι χωρίς φανάρια", "Βγήκε από παρκινγκ", "Πεζός εκτός διάβασης"]}
      onBack={() => setScreen("home")}
    />,
    guide: <ChatScreen
      systemPrompt={SYSTEM_GUIDE}
      title="🚨 Βοήθεια Ατυχήματος"
      placeholder="Πες μου τι έγινε..."
      welcomeMsg={"🚨 **Ηρέμησε — είμαι εδώ!**\n\nΠρώτα απ'όλα: **Είσαι καλά; Υπάρχουν τραυματίες;**\n\nΠες μου τι συνέβη και θα σε καθοδηγήσω βήμα-βήμα."}
      quickPrompts={["Είμαι καλά, τρακάρισα μόλις", "Υπάρχει τραυματίας", "Δεν ξέρω τι να κάνω τώρα"]}
      onBack={() => setScreen("home")}
    />,
    contract: <ContractScreen onBack={() => setScreen("home")} />,
    garage: <GarageScreen onBack={() => setScreen("home")} />,
    hospital: <HospitalScreen onBack={() => setScreen("home")} />,
    contact: <ContactScreen onBack={() => setScreen("home")} />,
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", position: "relative", minHeight: "100vh", fontFamily: "'Segoe UI', system-ui, sans-serif", background: C.bg }}>
      <div style={{ paddingBottom: ["home","kok","contract","garage"].includes(screen) ? 70 : 0 }}>
        {screens[screen]}
      </div>
      <BottomNav screen={screen} setScreen={setScreen} />
    </div>
  );
}
