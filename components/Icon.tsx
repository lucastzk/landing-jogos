type IconName =
  | "package"
  | "download"
  | "devices"
  | "play"
  | "infinity"
  | "refresh";

const paths: Record<IconName, React.ReactNode> = {
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
