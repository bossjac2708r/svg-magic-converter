import { useEffect } from "react";

interface KeyboardShortcutsOptions {
  onStartPause: () => void;
  onCancel: () => void;
  onDownload: () => void;
  enabled: boolean;
}

export const useKeyboardShortcuts = ({
  onStartPause,
  onCancel,
  onDownload,
  enabled,
}: KeyboardShortcutsOptions) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          onStartPause();
          break;
        case "Escape":
          e.preventDefault();
          onCancel();
          break;
        case "KeyD":
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            onDownload();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onStartPause, onCancel, onDownload, enabled]);
};
