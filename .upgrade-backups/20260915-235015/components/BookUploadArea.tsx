// components/BookUploadArea.tsx
'use client';

import { useState } from 'react';

type UploadedBook = {
  id: string;
  name: string;
  size: string;
  type: string;
};

function formatSize(bytes: number) {
  const mb = bytes / 1024 / 1024;
  return `${mb.toFixed(2)} MB`;
}

export default function BookUploadArea() {
  const [books, setBooks] = useState<UploadedBook[]>([]);
  const [message, setMessage] = useState('');

  function handleFiles(files: FileList | null) {
    if (!files) return;

    const allowedTypes = [
      'application/pdf',
      'application/epub+zip',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    const selectedBooks = Array.from(files)
      .filter((file) => allowedTypes.includes(file.type) || file.name.endsWith('.epub'))
      .map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        size: formatSize(file.size),
        type: file.type || 'Archivo de libro',
      }));

    setBooks((current) => [...selectedBooks, ...current]);
    setMessage(`${selectedBooks.length} libro(s) cargado(s) correctamente.`);
  }

  return (
    <section style={styles.wrapper}>
      <div style={styles.header}>
        <p style={styles.badge}>Biblioteca de libros</p>
        <h2 style={styles.title}>Cargar libros para narrar o resumir</h2>
        <p style={styles.text}>
          Sube libros en PDF, EPUB, TXT o DOCX para convertirlos luego en narraciones con avatares.
        </p>
      </div>

      <label style={styles.uploadBox}>
        <input
          type="file"
          multiple
          accept=".pdf,.epub,.txt,.docx"
          onChange={(event) => handleFiles(event.target.files)}
          style={styles.fileInput}
        />

        <div style={styles.uploadIcon}>📚</div>
        <strong>Haz clic para cargar libros</strong>
        <span>PDF, EPUB, TXT o DOCX</span>
      </label>

      {message && <p style={styles.success}>{message}</p>}

      <div style={styles.list}>
        {books.length === 0 ? (
          <div style={styles.empty}>
            Todavía no has cargado libros.
          </div>
        ) : (
          books.map((book) => (
            <article key={book.id} style={styles.bookCard}>
              <div style={styles.bookIcon}>📘</div>

              <div>
                <strong>{book.name}</strong>
                <p style={styles.bookMeta}>
                  {book.size} · {book.type}
                </p>
              </div>

              <button style={styles.button}>
                Preparar narración
              </button>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    margin: '40px 7vw',
    padding: 28,
    borderRadius: 28,
    background: '#FFFFFF',
    boxShadow: '0 18px 50px rgba(15, 23, 42, 0.09)',
  },
  header: {
    marginBottom: 22,
  },
  badge: {
    display: 'inline-flex',
    padding: '8px 12px',
    borderRadius: 999,
    background: 'rgba(215, 38, 56, 0.12)',
    color: '#D72638',
    fontWeight: 800,
    margin: 0,
  },
  title: {
    color: '#0B1F3A',
    fontSize: '2rem',
    margin: '14px 0 8px',
  },
  text: {
    color: '#4B5563',
    lineHeight: 1.7,
  },
  uploadBox: {
    minHeight: 180,
    border: '2px dashed #123B6D',
    borderRadius: 24,
    background: '#F5F7FA',
    display: 'grid',
    placeItems: 'center',
    textAlign: 'center',
    gap: 8,
    cursor: 'pointer',
    color: '#0B1F3A',
    padding: 24,
  },
  fileInput: {
    display: 'none',
  },
  uploadIcon: {
    fontSize: 48,
  },
  success: {
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    background: '#ECFDF5',
    color: '#047857',
    fontWeight: 800,
  },
  list: {
    display: 'grid',
    gap: 14,
    marginTop: 22,
  },
  empty: {
    padding: 18,
    borderRadius: 16,
    background: '#F5F7FA',
    color: '#6B7280',
  },
  bookCard: {
    display: 'grid',
    gridTemplateColumns: '48px 1fr auto',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 18,
    border: '1px solid #E5E7EB',
    background: '#FFFFFF',
  },
  bookIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    background: '#0B1F3A',
    color: '#FFFFFF',
    display: 'grid',
    placeItems: 'center',
    fontSize: 24,
  },
  bookMeta: {
    margin: '4px 0 0',
    color: '#6B7280',
    fontSize: 14,
  },
  button: {
    border: 0,
    borderRadius: 14,
    padding: '12px 16px',
    background: '#D72638',
    color: '#FFFFFF',
    fontWeight: 900,
    cursor: 'pointer',
  },
};