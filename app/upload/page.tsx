import { BookUploadAutoReader } from "../../components/book-upload-auto-reader";

export default function UploadPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "48px 20px",
        background:
          "radial-gradient(circle at top left, rgba(250,204,21,0.18), transparent 34%), radial-gradient(circle at bottom right, rgba(249,115,22,0.18), transparent 30%), #020617",
      }}
    >
      <BookUploadAutoReader />
    </main>
  );
}