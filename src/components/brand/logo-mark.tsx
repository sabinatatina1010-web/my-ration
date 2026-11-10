type LogoMarkProps = {
  className?: string;
};

export function LogoMark({ className = "h-7 w-7" }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M26.5 5.5C18 6.5 11.2 11.8 8.2 19.8c4.8-.4 9.1 1.2 12.6 4.7 4.8-5.4 6.4-11.8 5.7-19Z"
        fill="currentColor"
      />
      <path
        d="M9.2 20.2c1.8 3.4 4.7 5.8 8.4 7.1-2.7.4-5.1-.2-7.2-1.8-1.6-1.2-2.8-2.9-3.5-4.9.7-.2 1.5-.3 2.3-.4Z"
        fill="currentColor"
        opacity="0.55"
      />
      <path
        d="M18.2 8.2c-1.6 4.2-4.4 7.5-8.2 9.8"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}
