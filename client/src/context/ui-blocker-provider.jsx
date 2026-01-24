import React, { createContext, useContext, useMemo, useState, useCallback } from "react";

const UIBlockerContext = createContext(null);

export function UIBlockerProvider({ children }) {
  const [isBlocked, setIsBlocked] = useState(false);
  const [message, setMessage] = useState("");

  const block = useCallback((msg = "Loading...") => {
    setMessage(msg);
    setIsBlocked(true);
    // Lock scrolling while blocked
    document.body.style.overflow = "hidden";
  }, []);

  const unblock = useCallback(() => {
    setIsBlocked(false);
    setMessage("");
    document.body.style.overflow = "";
  }, []);

  /**
   * Wrap any async operation so the UI is locked until it completes.
   * - Shows a global loading overlay (we’ll add it next step)
   * - Prevents user clicking around mid-request
   * - Guarantees unblock in finally
   */
  const withUIBlock = useCallback(
    async (fn, msg = "Loading...") => {
      block(msg);
      try {
        return await fn();
      } finally {
        unblock();
      }
    },
    [block, unblock]
  );

  const value = useMemo(
    () => ({
      isBlocked,
      message,
      block,
      unblock,
      withUIBlock,
    }),
    [isBlocked, message, block, unblock, withUIBlock]
  );

  return (
    <UIBlockerContext.Provider value={value}>
      {children}
    </UIBlockerContext.Provider>
  );
}

export function useUIBlocker() {
  const ctx = useContext(UIBlockerContext);
  if (!ctx) {
    throw new Error("useUIBlocker must be used within a UIBlockerProvider");
  }
  return ctx;
}
