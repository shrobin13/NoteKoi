"use client";

export function AmbientBackground() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      {/* Blob 1 — primary green */}
      <div
        className="ambient-blob"
        style={{
          width: 600,
          height: 600,
          top: "-10%",
          left: "-5%",
          background: "radial-gradient(circle, rgba(143,191,159,0.35) 0%, transparent 70%)",
        }}
      />
      {/* Blob 2 — accent amber */}
      <div
        className="ambient-blob"
        style={{
          width: 400,
          height: 400,
          top: "30%",
          right: "-8%",
          background: "radial-gradient(circle, rgba(241,143,1,0.18) 0%, transparent 70%)",
          animationDelay: "-3s",
        }}
      />
      {/* Blob 3 — forest green */}
      <div
        className="ambient-blob"
        style={{
          width: 500,
          height: 500,
          bottom: "-10%",
          left: "30%",
          background: "radial-gradient(circle, rgba(36,97,59,0.12) 0%, transparent 70%)",
          animationDelay: "-6s",
        }}
      />
    </div>
  );
}
