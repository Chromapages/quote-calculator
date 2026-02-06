import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Chromapages Quote Calculator";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(to bottom right, #fff5ec, #e0f1ff)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            padding: "40px 80px",
            borderRadius: "40px",
            boxShadow: "0 20px 60px -20px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: "#f46a4d",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              marginBottom: 20,
            }}
          >
            Chromapages
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: "#111118",
              textAlign: "center",
              lineHeight: 1.1,
            }}
          >
            Instant Web Build Estimate
          </div>
          <div
            style={{
              fontSize: 32,
              color: "#4c5162",
              marginTop: 20,
            }}
          >
            Get a transparent quote in 60 seconds.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
