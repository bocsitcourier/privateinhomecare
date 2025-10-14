import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// --- Fix: Disable or clean up Service Worker interference ---
if ("serviceWorker" in navigator) {
  // Unregister any existing service workers (they can block GTM/Recaptcha/fonts)
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister().then(() => {
        console.log("Old Service Worker unregistered:", registration.scope);
      });
    });
  });

  // Optionally, clear all old caches to ensure no stale intercepts remain
  if (window.caches) {
    caches.keys().then((keys) => {
      keys.forEach((key) => {
        caches.delete(key);
        console.log("Deleted cache:", key);
      });
    });
  }

  // 🚫 DO NOT register a new service worker until GTM/Recaptcha issues are fixed
  console.log("Service Workers disabled to prevent external script blocking.");
}

createRoot(document.getElementById("root")!).render(<App />);
