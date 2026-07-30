"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, ZoomIn, ZoomOut, Maximize2, FileText, ExternalLink } from "lucide-react";
import { Button } from "./Button";

interface PdfViewerModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  fileUrl: string;
  previewUrl?: string;
}

export function PdfViewerModal({
  open,
  onClose,
  title,
  fileUrl,
  previewUrl,
}: PdfViewerModalProps) {
  const [zoom, setZoom] = useState(100);
  const [isFullWidth, setIsFullWidth] = useState(false);

  const targetUrl = previewUrl || fileUrl;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="pdf-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{
              background: "rgba(18, 30, 22, 0.75)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              key="pdf-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className={`w-full ${isFullWidth ? "max-w-7xl h-[92vh]" : "max-w-5xl h-[85vh]"} flex flex-col relative`}
              style={{
                background: "var(--bg-dark, #16241C)",
                borderRadius: "var(--radius-xl, 16px)",
                border: "1px solid rgba(245,236,215,0.15)",
                boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
                overflow: "hidden",
              }}
            >
              {/* Header Chrome */}
              <div
                className="flex items-center justify-between px-6 py-4"
                style={{
                  background: "rgba(22, 36, 28, 0.9)",
                  borderBottom: "1px solid rgba(245,236,215,0.1)",
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="p-2 rounded-lg"
                    style={{ background: "rgba(143, 191, 159, 0.15)", color: "#8FBF9F" }}
                  >
                    <FileText size={18} />
                  </div>
                  <h3
                    className="truncate font-semibold text-base"
                    style={{ color: "#F5ECD7", fontFamily: "var(--font-display)" }}
                  >
                    {title}
                  </h3>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleZoomOut}
                    className="p-2 rounded-lg text-parchment-muted hover:text-parchment hover:bg-white/10 transition-colors"
                    title="Zoom Out"
                    style={{ color: "rgba(245,236,215,0.7)" }}
                  >
                    <ZoomOut size={16} />
                  </button>
                  <span style={{ color: "rgba(245,236,215,0.7)", fontSize: "0.85rem", width: 40, textAlign: "center" }}>
                    {zoom}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    className="p-2 rounded-lg text-parchment-muted hover:text-parchment hover:bg-white/10 transition-colors"
                    title="Zoom In"
                    style={{ color: "rgba(245,236,215,0.7)" }}
                  >
                    <ZoomIn size={16} />
                  </button>

                  <div className="h-4 w-[1px] bg-white/10 mx-1" />

                  <button
                    onClick={() => setIsFullWidth(!isFullWidth)}
                    className="p-2 rounded-lg text-parchment-muted hover:text-parchment hover:bg-white/10 transition-colors"
                    title="Toggle Fullscreen"
                    style={{ color: "rgba(245,236,215,0.7)" }}
                  >
                    <Maximize2 size={16} />
                  </button>

                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-parchment-muted hover:text-parchment hover:bg-white/10 transition-colors"
                    title="Open in new tab"
                    style={{ color: "rgba(245,236,215,0.7)" }}
                  >
                    <ExternalLink size={16} />
                  </a>

                  <a
                    href={fileUrl}
                    download
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{
                      background: "#8FBF9F",
                      color: "#16241C",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Download size={14} />
                    Download
                  </a>

                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors ml-2"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Viewer iframe container */}
              <div className="flex-1 bg-black/40 relative overflow-hidden flex items-center justify-center">
                {targetUrl ? (
                  <iframe
                    src={targetUrl}
                    className="w-full h-full border-0 transition-transform duration-200 origin-top"
                    style={{ transform: `scale(${zoom / 100})` }}
                    title={`PDF Preview: ${title}`}
                  />
                ) : (
                  <div className="text-center p-8">
                    <p style={{ color: "rgba(245,236,215,0.6)" }}>Preview not available for this file format.</p>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block px-4 py-2 rounded-lg font-medium text-sm"
                      style={{ background: "#8FBF9F", color: "#16241C" }}
                    >
                      Download File
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
