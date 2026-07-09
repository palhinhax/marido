import { ImageResponse } from "next/og";

// Edge runtime: lets @vercel/og bundle its default font (avoids a Node
// fileURLToPath "Invalid URL" during static prerender on Windows).
export const runtime = "edge";

// Default social share card for the whole site (og:image + twitter:image).
export const alt =
  "Vizinho — Marido de aluguer e serviços para casa em Portugal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background: "linear-gradient(135deg, #0b3f3a 0%, #0d6b60 100%)",
        color: "#ffffff",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: -1,
        }}
      >
        Vizinho
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 68,
          fontWeight: 800,
          lineHeight: 1.1,
          marginTop: 24,
          maxWidth: 960,
          letterSpacing: -2,
        }}
      >
        Marido de aluguer e serviços para casa
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 30,
          marginTop: 28,
          color: "rgba(255,255,255,0.85)",
        }}
      >
        Reparações · Canalização · Eletricidade · Montagens · Pintura
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 28,
          marginTop: 40,
          color: "#f97316",
          fontWeight: 700,
        }}
      >
        Portugal · preço definido · marcação online
      </div>
    </div>,
    { ...size }
  );
}
