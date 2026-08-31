interface DevFlowLogoProps {
  collapsed?: boolean;
}

export function DevFlowLogo({
  collapsed = false,
}: DevFlowLogoProps) {
  return (
    <div className="df-logo">
      <div className="df-logo-mark">
        <svg
          viewBox="0 0 40 40"
          aria-hidden="true"
        >
          <path
            d="M9 11h12"
            className="logo-line"
          />
          <path
            d="M9 20h8"
            className="logo-line"
          />
          <path
            d="M9 29h12"
            className="logo-line"
          />
          <circle
            cx="28"
            cy="20"
            r="5"
            className="logo-node"
          />
          <path
            d="M22 20h-5"
            className="logo-line"
          />
        </svg>
      </div>

      {!collapsed && (
        <div>
          <strong>DevFlow</strong>
          <span>Developer workspace</span>
        </div>
      )}
    </div>
  );
}