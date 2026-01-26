import { useUIBlocker } from "../context/ui-blocker-provider.jsx";
import "./UIBlocker-overlay.css";

export default function UIBlockerOverlay() {
  const { isBlocked, message } = useUIBlocker();

  if (!isBlocked) return null;

  return (
    <div className="ui-blocker-overlay" aria-busy="true" aria-live="polite">
      <div className="ui-blocker-center">
        <div className="ui-blocker-spinner" />
        {message ? <div className="ui-blocker-text">{message}</div> : null}
      </div>
    </div>
  );
}
