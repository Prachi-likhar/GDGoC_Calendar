export default function BracketMark({ className = 'h-8 w-8' }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="10" className="fill-[var(--bg-subtle)]" />
      <path
        d="M16.5 12L9.5 20L16.5 28"
        stroke="#4285F4"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 12L12.5 16.6"
        stroke="#EA4335"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M23.5 12L30.5 20L23.5 28"
        stroke="#34A853"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23.5 12L27.5 16.6"
        stroke="#FBBC05"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

