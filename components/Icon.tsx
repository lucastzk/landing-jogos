type IconName =
  | "package"
  | "download"
  | "devices"
  | "play"
  | "infinity"
  | "refresh"
  | "clock"
  | "target"
  | "dollar"
  | "sparkles";

const paths: Record<IconName, React.ReactNode> = {
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" />
    </>
  ),
  dollar: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6.5v11" />
      <path d="M14.7 8.8c-.5-.6-1.4-1-2.7-1-1.7 0-3 .8-3 2s1.3 2 3 2 3 .8 3 2-1.3 2-3 2c-1.3 0-2.2-.4-2.7-1" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3l1.6 4.7L18 9.5l-4.4 1.8L12 16l-1.6-4.7L6 9.5l4.4-1.8z" />
      <path d="M18.5 13.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" />
    </>
  ),
  package: (
    <>
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </>
  ),
  download: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m7 10 5 5 5-5" />
      <path d="M12 15V3" />
    </>
  ),
  devices: (
    <>
      <rect x="2" y="4" width="14" height="11" rx="2" />
      <path d="M2 19h12" />
      <rect x="17" y="9" width="5" height="11" rx="1" />
    </>
  ),
  play: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m10 8 6 4-6 4Z" />
    </>
  ),
  infinity: (
    <path d="M6 16c3 0 5-2 6-4 1-2 3-4 6-4a4 4 0 0 1 0 8c-3 0-5-2-6-4-1-2-3-4-6-4a4 4 0 0 0 0 8Z" />
  ),
  refresh: (
    <>
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 21v-5h5" />
    </>
  ),
};

export default function Icon({ name, className = "h-6 w-6" }: { name: IconName; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
