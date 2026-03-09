const FTLogo = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 80 40"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="FT"
  >
    {/* F */}
    <path d="M0 0h28v7H9v9h16v7H9v17H0V0z" />
    {/* T */}
    <path d="M32 0h48v7H60.5v33h-9V7H32V0z" />
  </svg>
);

export default FTLogo;
