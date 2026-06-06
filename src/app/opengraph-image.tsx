import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

export const alt = "cp0x | Hyperliquid recovery";
export const contentType = "image/png";
export const size = {
  width: 1200,
  height: 630,
};

export default function Image() {
  const imageBuffer = fs.readFileSync(
    path.join(process.cwd(), "public/main_image.png"),
  );
  const imageSrc = `data:image/png;base64,${imageBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#16161f",
          color: "#eeeeee",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          padding: 64,
          position: "relative",
          width: "100%",
        }}
      >
        {/* background glow */}
        <div
          style={{
            background:
              "radial-gradient(circle at 20% 30%, rgba(40,229,229,0.16), transparent 40%), radial-gradient(circle at 80% 70%, rgba(44,255,254,0.09), transparent 38%), #16161f",
            display: "flex",
            height: "100%",
            left: 0,
            position: "absolute",
            top: 0,
            width: "100%",
          }}
        />
        {/* border frame */}
        <div
          style={{
            border: "1px solid rgba(57,69,75,0.8)",
            borderRadius: 16,
            display: "flex",
            height: "calc(100% - 32px)",
            left: 16,
            position: "absolute",
            top: 16,
            width: "calc(100% - 32px)",
          }}
        />

        <div
          style={{
            alignItems: "center",
            display: "flex",
            gap: 48,
            justifyContent: "space-between",
            position: "relative",
            width: "100%",
          }}
        >
          {/* left: text */}
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 680 }}>
            <div style={{ display: "flex", alignItems: "baseline", marginBottom: 28 }}>
              <span style={{ color: "#eeeeee", fontSize: 36, fontWeight: 700 }}>cp</span>
              <span style={{ color: "#2cfffe", fontSize: 36, fontWeight: 700 }}>0</span>
              <span style={{ color: "#eeeeee", fontSize: 36, fontWeight: 700 }}>x</span>
            </div>
            <div
              style={{
                color: "#eeeeee",
                fontSize: 68,
                fontWeight: 750,
                lineHeight: 0.98,
                letterSpacing: -1,
              }}
            >
              Get your assets out of Hyperliquid.
            </div>
            <div
              style={{
                color: "rgba(221,221,221,0.65)",
                fontSize: 27,
                lineHeight: 1.4,
                marginTop: 32,
              }}
            >
              Inspect stuck balances, vault funds, collateral, orders,
              positions, and USDC in one recovery path.
            </div>
          </div>

          {/* right: main_image */}
          <img
            src={imageSrc}
            width={280}
            height={280}
            style={{ objectFit: "contain" }}
          />
        </div>
      </div>
    ),
    size,
  );
}
