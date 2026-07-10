"use client";

import { useEffect, useState } from "react";
import { usePublicSettings } from "@/hooks/useSettings";

const HomePopupBanner = () => {
  const settingsQuery = usePublicSettings();
  const banner = settingsQuery.data?.data?.popupBanner;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!banner?.enabled || !banner.imageUrl) return;
    const dismissed = sessionStorage.getItem("innerbeast-popup-dismissed");
    if (!dismissed) {
      const timer = window.setTimeout(() => setVisible(true), 800);
      return () => window.clearTimeout(timer);
    }
  }, [banner?.enabled, banner?.imageUrl]);

  if (!visible || !banner?.enabled || !banner.imageUrl) return null;

  const close = () => {
    sessionStorage.setItem("innerbeast-popup-dismissed", "1");
    setVisible(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,.62)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}>
      <div style={{ position: "relative", maxWidth: 720, width: "100%" }}>
        <button onClick={close} aria-label="Close popup" style={{ position: "absolute", top: -14, right: -14, zIndex: 2, width: 36, height: 36, borderRadius: "50%", border: 0, background: "#fff", fontSize: 20, cursor: "pointer" }}>×</button>
        <img src={banner.imageUrl} alt={banner.altText || "Promotional banner"} style={{ width: "100%", borderRadius: 24, display: "block", boxShadow: "0 25px 80px rgba(0,0,0,.35)" }} />
      </div>
    </div>
  );
};

export default HomePopupBanner;
