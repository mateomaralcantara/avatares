// ============================================================
// ARCHIVO: components/book-voice-agent.tsx
// FUNCIÓN: Agente de voz que lee el libro completo
// ============================================================

"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type BookChapter = {
  number: number;
  title: string;
  body: string;
};

type BookVoiceAgentProps = {
  title: string;
  subtitle?: string;
  introText?: string;
  chapters: BookChapter[];
  autoStart?: boolean;
};

type ReadingItem = {
  id: string;
  label: string;
  title: string;
  text: string;
};

type ReadingStatus = "idle" | "speaking" | "paused" | "finished";

const MAX_CHUNK_LENGTH = 1400;

function cleanForSpeech(value: string) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
    .trim();
}

function splitTextIntoChunks(text: string) {
  const cleanText = cleanForSpeech(text);

  if (!cleanText) {
    return [];
  }

  const sentences = cleanText.match(/[^.!?;:]+[.!?;:]?/g) || [cleanText];
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    const next = `${current} ${sentence}`.trim();

    if (next.length > MAX_CHUNK_LENGTH && current.length > 0) {
      chunks.push(current);
      current = sentence.trim();
    } else {
      current = next;
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks;
}

export function BookVoiceAgent({
  title,
  subtitle,
  introText,
  chapters,
  autoStart = false,
}: BookVoiceAgentProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState("");
  const [rate, setRate] = useState(1);
  const [status, setStatus] = useState<ReadingStatus>("idle");
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const [autoNext, setAutoNext] = useState(true);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  const stopRequestedRef = useRef(false);
  const autoNextRef = useRef(autoNext);
  const currentChunksRef = useRef<string[]>([]);
  const currentItemIndexRef = useRef(0);
  const selectedVoiceURIRef = useRef("");
  const rateRef = useRef(rate);
  const autoStartedRef = useRef(false);

  const readingItems = useMemo<ReadingItem[]>(() => {
    const intro = cleanForSpeech(
      introText ||
        `${title}. ${subtitle || ""}. Iniciando lectura completa del libro.`
    );

    const items: ReadingItem[] = [];

    if (intro) {
      items.push({
        id: "intro",
        label: "Introducción",
        title: "Introducción",
        text: intro,
      });
    }

    for (const chapter of chapters || []) {
      items.push({
        id: `chapter-${chapter.number}`,
        label: `Capítulo ${chapter.number}`,
        title: chapter.title,
        text: `Capítulo ${chapter.number}. ${chapter.title}. ${chapter.body}`,
      });
    }

    return items;
  }, [chapters, introText, subtitle, title]);

  const currentItem = readingItems[currentItemIndex];

  useEffect(() => {
    autoNextRef.current = autoNext;
  }, [autoNext]);

  useEffect(() => {
    selectedVoiceURIRef.current = selectedVoiceURI;
  }, [selectedVoiceURI]);

  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  useEffect(() => {
    function loadVoices() {
      if (typeof window === "undefined") return;

      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      const spanishVoice =
        availableVoices.find((voice) =>
          voice.lang.toLowerCase().startsWith("es")
        ) || availableVoices[0];

      if (spanishVoice && !selectedVoiceURIRef.current) {
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
  }, []);

  useEffect(() => {
    if (!autoStart || autoStartedRef.current || readingItems.length === 0) {
      return;
    }

    autoStartedRef.current = true;

    const timer = window.setTimeout(() => {
      try {
        startFullBook();
      } catch {
        setAutoplayBlocked(true);
      }
    }, 900);

    return () => window.clearTimeout(timer);
  }, [autoStart, readingItems.length]);

  function getSelectedVoice() {
    return (
      voices.find((voice) => voice.voiceURI === selectedVoiceURIRef.current) ||
      voices.find((voice) => voice.lang.toLowerCase().startsWith("es")) ||
      voices[0] ||
      null
    );
  }

  function speakChunk(chunkIndex: number) {
    if (typeof window === "undefined") return;

    const chunks = currentChunksRef.current;
    const text = chunks[chunkIndex];

    if (!text || stopRequestedRef.current) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = getSelectedVoice();

    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice?.lang || "es-ES";
    utterance.rate = rateRef.current;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setAutoplayBlocked(false);
      setStatus("speaking");
      setCurrentChunkIndex(chunkIndex);
    };

    utterance.onend = () => {
      if (stopRequestedRef.current) {
        return;
      }

      const nextChunkIndex = chunkIndex + 1;

      if (nextChunkIndex < chunks.length) {
        speakChunk(nextChunkIndex);
        return;
      }

      const nextItemIndex = currentItemIndexRef.current + 1;

      if (autoNextRef.current && nextItemIndex < readingItems.length) {
        startItem(nextItemIndex);
        return;
      }

      setStatus("finished");
    };

    utterance.onerror = () => {
      setStatus("idle");
      setAutoplayBlocked(true);
    };

    window.speechSynthesis.speak(utterance);
  }

  function startItem(index: number) {
    if (typeof window === "undefined") return;

    const item = readingItems[index];

    if (!item) {
      alert("No hay contenido disponible para narrar.");
      return;
    }

    const chunks = splitTextIntoChunks(item.text);

    if (chunks.length === 0) {
      alert("Esta sección no tiene texto para leer.");
      return;
    }

    stopRequestedRef.current = false;
    currentItemIndexRef.current = index;
    currentChunksRef.current = chunks;

    setCurrentItemIndex(index);
    setCurrentChunkIndex(0);
    setTotalChunks(chunks.length);
    setStatus("speaking");

    speakChunk(0);
  }

  function startFullBook() {
    startItem(0);
  }

  function startCurrentItem() {
    startItem(currentItemIndex);
  }

  function pauseReading() {
    if (typeof window === "undefined") return;
    window.speechSynthesis.pause();
    setStatus("paused");
  }

  function resumeReading() {
    if (typeof window === "undefined") return;
    window.speechSynthesis.resume();
    setStatus("speaking");
  }

  function stopReading() {
    if (typeof window === "undefined") return;
    stopRequestedRef.current = true;
    window.speechSynthesis.cancel();
    setStatus("idle");
    setCurrentChunkIndex(0);
    setTotalChunks(0);
  }

  function goToPrevious() {
    const nextIndex = Math.max(0, currentItemIndex - 1);
    startItem(nextIndex);
  }

  function goToNext() {
    const nextIndex = Math.min(readingItems.length - 1, currentItemIndex + 1);
    startItem(nextIndex);
  }

  function handleSelectItem(value: string) {
    const index = Number(value);

    if (Number.isNaN(index)) {
      return;
    }

    stopReading();
    setCurrentItemIndex(index);
    currentItemIndexRef.current = index;
  }

  const progressPercent =
    totalChunks > 0
      ? Math.round(((currentChunkIndex + 1) / totalChunks) * 100)
      : 0;

  const isSpeaking = status === "speaking";
  const isPaused = status === "paused";

  return (
    <section
      style={{
        marginTop: "28px",
        padding: "24px",
        borderRadius: "26px",
        background:
          "linear-gradient(135deg, rgba(250,204,21,0.12), rgba(249,115,22,0.08))",
        border: "1px solid rgba(250,204,21,0.28)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.24)",
      }}
    >
      <p
        style={{
          margin: "0 0 8px",
          color: "#facc15",
          fontWeight: 900,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        Agente narrador
      </p>

      <h2
        style={{
          margin: "0 0 10px",
          fontSize: "clamp(26px, 4vw, 38px)",
          color: "white",
        }}
      >
        Leer libro completo en voz alta
      </h2>

      <p
        style={{
          margin: "0 0 18px",
          color: "rgba(255,255,255,0.72)",
          lineHeight: 1.7,
        }}
      >
        Este agente lee el libro completo desde el archivo subido.
      </p>

      {autoplayBlocked ? (
        <div
          style={{
            marginBottom: "18px",
            padding: "14px",
            borderRadius: "16px",
            background: "rgba(239,68,68,0.15)",
            border: "1px solid rgba(239,68,68,0.28)",
            color: "white",
          }}
        >
          El navegador bloqueó el inicio automático. Toca “Leer libro completo”.
        </div>
      ) : null}

      <div
        style={{
          display: "grid",
          gap: "14px",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          marginBottom: "18px",
        }}
      >
        <label
          style={{
            display: "grid",
            gap: "7px",
            color: "rgba(255,255,255,0.78)",
            fontWeight: 800,
          }}
        >
          Sección actual
          <select
            value={currentItemIndex}
            onChange={(event) => handleSelectItem(event.target.value)}
            style={{
              width: "100%",
              borderRadius: "14px",
              padding: "12px",
              border: "1px solid rgba(255,255,255,0.18)",
              background: "#020617",
              color: "white",
            }}
          >
            {readingItems.map((item, index) => (
              <option key={item.id} value={index}>
                {item.label}: {item.title}
              </option>
            ))}
          </select>
        </label>

        <label
          style={{
            display: "grid",
            gap: "7px",
            color: "rgba(255,255,255,0.78)",
            fontWeight: 800,
          }}
        >
          Voz
          <select
            value={selectedVoiceURI}
            onChange={(event) => setSelectedVoiceURI(event.target.value)}
            style={{
              width: "100%",
              borderRadius: "14px",
              padding: "12px",
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
            gap: "7px",
            color: "rgba(255,255,255,0.78)",
            fontWeight: 800,
          }}
        >
          Velocidad: {rate.toFixed(1)}x
          <input
            type="range"
            min="0.7"
            max="1.5"
            step="0.1"
            value={rate}
            onChange={(event) => setRate(Number(event.target.value))}
          />
        </label>
      </div>

      <label
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "10px",
          color: "rgba(255,255,255,0.82)",
          fontWeight: 800,
          marginBottom: "18px",
        }}
      >
        <input
          type="checkbox"
          checked={autoNext}
          onChange={(event) => setAutoNext(event.target.checked)}
        />
        Avanzar automáticamente al próximo capítulo
      </label>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "18px",
        }}
      >
        <button
          type="button"
          onClick={startFullBook}
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
          Leer libro completo
        </button>

        <button
          type="button"
          onClick={startCurrentItem}
          style={{
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: "999px",
            padding: "13px 18px",
            background: "rgba(255,255,255,0.08)",
            color: "white",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Leer sección actual
        </button>

        <button
          type="button"
          onClick={pauseReading}
          disabled={!isSpeaking}
          style={{
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: "999px",
            padding: "13px 18px",
            background: "rgba(255,255,255,0.08)",
            color: "white",
            fontWeight: 800,
            cursor: !isSpeaking ? "not-allowed" : "pointer",
            opacity: !isSpeaking ? 0.55 : 1,
          }}
        >
          Pausar
        </button>

        <button
          type="button"
          onClick={resumeReading}
          disabled={!isPaused}
          style={{
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: "999px",
            padding: "13px 18px",
            background: "rgba(255,255,255,0.08)",
            color: "white",
            fontWeight: 800,
            cursor: !isPaused ? "not-allowed" : "pointer",
            opacity: !isPaused ? 0.55 : 1,
          }}
        >
          Continuar
        </button>

        <button
          type="button"
          onClick={stopReading}
          disabled={status === "idle"}
          style={{
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: "999px",
            padding: "13px 18px",
            background: "rgba(239,68,68,0.18)",
            color: "white",
            fontWeight: 800,
            cursor: status === "idle" ? "not-allowed" : "pointer",
            opacity: status === "idle" ? 0.55 : 1,
          }}
        >
          Detener
        </button>

        <button
          type="button"
          onClick={goToPrevious}
          disabled={currentItemIndex <= 0}
          style={{
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: "999px",
            padding: "13px 18px",
            background: "rgba(255,255,255,0.08)",
            color: "white",
            fontWeight: 800,
            cursor: currentItemIndex <= 0 ? "not-allowed" : "pointer",
            opacity: currentItemIndex <= 0 ? 0.55 : 1,
          }}
        >
          Anterior
        </button>

        <button
          type="button"
          onClick={goToNext}
          disabled={currentItemIndex >= readingItems.length - 1}
          style={{
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: "999px",
            padding: "13px 18px",
            background: "rgba(255,255,255,0.08)",
            color: "white",
            fontWeight: 800,
            cursor:
              currentItemIndex >= readingItems.length - 1
                ? "not-allowed"
                : "pointer",
            opacity: currentItemIndex >= readingItems.length - 1 ? 0.55 : 1,
          }}
        >
          Siguiente
        </button>
      </div>

      <div
        style={{
          padding: "16px",
          borderRadius: "18px",
          background: "rgba(2,6,23,0.5)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <p
          style={{
            margin: "0 0 8px",
            color: "rgba(255,255,255,0.78)",
            lineHeight: 1.6,
          }}
        >
          Estado: <strong>{status}</strong>
        </p>

        <p
          style={{
            margin: "0 0 10px",
            color: "rgba(255,255,255,0.78)",
            lineHeight: 1.6,
          }}
        >
          Leyendo:{" "}
          <strong>
            {currentItem?.label} - {currentItem?.title}
          </strong>
        </p>

        <div
          style={{
            height: "10px",
            width: "100%",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.12)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progressPercent}%`,
              borderRadius: "999px",
              background: "linear-gradient(135deg, #facc15, #f97316)",
              transition: "width 180ms ease",
            }}
          />
        </div>

        <p
          style={{
            margin: "8px 0 0",
            color: "rgba(255,255,255,0.62)",
            fontSize: "14px",
          }}
        >
          Progreso de sección: {progressPercent}%
        </p>
      </div>
    </section>
  );
}

export default BookVoiceAgent;