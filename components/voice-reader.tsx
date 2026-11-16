"use client";

import { useEffect, useMemo, useState } from "react";

type VoiceReaderProps = {
  title?: string;
  text: string;
};

export function VoiceReader({
  title = "Narrador de voz",
  text,
}: VoiceReaderProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1);

  const cleanText = useMemo(() => {
    return String(text || "")
      .replace(/\s+/g, " ")
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
      .trim();
  }, [text]);

  useEffect(() => {
    function loadVoices() {
      if (typeof window === "undefined") return;

      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      const spanishVoice =
        availableVoices.find((voice) =>
          voice.lang.toLowerCase().startsWith("es")
        ) || availableVoices[0];

      if (spanishVoice && !selectedVoiceURI) {
        setSelectedVoiceURI(spanishVoice.voiceURI);
      }
    }

    loadVoices();

    if (typeof window !== "undefined") {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (typeof window !== "undefined") {
        window.speechSynthesis.cancel();
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [selectedVoiceURI]);

  function getSelectedVoice() {
    return (
      voices.find((voice) => voice.voiceURI === selectedVoiceURI) ||
      voices.find((voice) => voice.lang.toLowerCase().startsWith("es")) ||
      null
    );
  }

  function startReading() {
    if (typeof window === "undefined") return;

    if (!cleanText) {
      alert("No hay texto disponible para narrar.");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const selectedVoice = getSelectedVoice();

    utterance.lang = selectedVoice?.lang || "es-ES";
    utterance.voice = selectedVoice;
    utterance.rate = rate;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  }

  function pauseReading() {
    if (typeof window === "undefined") return;

    window.speechSynthesis.pause();
    setIsPaused(true);
  }

  function resumeReading() {
    if (typeof window === "undefined") return;

    window.speechSynthesis.resume();
    setIsPaused(false);
  }

  function stopReading() {
    if (typeof window === "undefined") return;

    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }

  return (
    <section
      style={{
        marginTop: "24px",
        padding: "20px",
        borderRadius: "22px",
        background: "rgba(250,204,21,0.09)",
        border: "1px solid rgba(250,204,21,0.28)",
      }}
    >
      <div style={{ marginBottom: "16px" }}>
        <p
          style={{
            margin: "0 0 6px",
            color: "#facc15",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Voz activa
        </p>

        <h2
          style={{
            margin: 0,
            fontSize: "24px",
            color: "white",
          }}
        >
          {title}
        </h2>

        <p
          style={{
            margin: "8px 0 0",
            color: "rgba(255,255,255,0.72)",
            lineHeight: 1.6,
          }}
        >
          Dale a escuchar y el navegador leerá este contenido en voz alta.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gap: "12px",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          marginBottom: "16px",
        }}
      >
        <label
          style={{
            display: "grid",
            gap: "6px",
            color: "rgba(255,255,255,0.78)",
            fontWeight: 700,
          }}
        >
          Voz
          <select
            value={selectedVoiceURI}
            onChange={(event) => setSelectedVoiceURI(event.target.value)}
            style={{
              width: "100%",
              borderRadius: "14px",
              padding: "11px 12px",
              border: "1px solid rgba(255,255,255,0.18)",
              background: "#020617",
              color: "white",
            }}
          >
            {voices.length === 0 ? (
              <option value="">Voz automática</option>
            ) : (
              voices.map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} - {voice.lang}
                </option>
              ))
            )}
          </select>
        </label>

        <label
          style={{
            display: "grid",
            gap: "6px",
            color: "rgba(255,255,255,0.78)",
            fontWeight: 700,
          }}
        >
          Velocidad: {rate.toFixed(1)}x
          <input
            type="range"
            min="0.7"
            max="1.4"
            step="0.1"
            value={rate}
            onChange={(event) => setRate(Number(event.target.value))}
          />
        </label>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <button
          type="button"
          onClick={startReading}
          style={{
            border: 0,
            borderRadius: "999px",
            padding: "13px 18px",
            background: "linear-gradient(135deg, #facc15, #f97316)",
            color: "#111827",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          Escuchar
        </button>

        <button
          type="button"
          onClick={pauseReading}
          disabled={!isSpeaking || isPaused}
          style={{
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: "999px",
            padding: "13px 18px",
            background: "rgba(255,255,255,0.08)",
            color: "white",
            fontWeight: 800,
            cursor: !isSpeaking || isPaused ? "not-allowed" : "pointer",
            opacity: !isSpeaking || isPaused ? 0.55 : 1,
          }}
        >
          Pausar
        </button>

        <button
          type="button"
          onClick={resumeReading}
          disabled={!isSpeaking || !isPaused}
          style={{
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: "999px",
            padding: "13px 18px",
            background: "rgba(255,255,255,0.08)",
            color: "white",
            fontWeight: 800,
            cursor: !isSpeaking || !isPaused ? "not-allowed" : "pointer",
            opacity: !isSpeaking || !isPaused ? 0.55 : 1,
          }}
        >
          Continuar
        </button>

        <button
          type="button"
          onClick={stopReading}
          disabled={!isSpeaking}
          style={{
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: "999px",
            padding: "13px 18px",
            background: "rgba(239,68,68,0.18)",
            color: "white",
            fontWeight: 800,
            cursor: !isSpeaking ? "not-allowed" : "pointer",
            opacity: !isSpeaking ? 0.55 : 1,
          }}
        >
          Detener
        </button>
      </div>

      <p
        style={{
          margin: "14px 0 0",
          color: "rgba(255,255,255,0.62)",
          fontSize: "14px",
          lineHeight: 1.5,
        }}
      >
        Nota: la calidad de la voz depende de las voces instaladas en Windows,
        Chrome o Edge.
      </p>
    </section>
  );
}

export default VoiceReader;