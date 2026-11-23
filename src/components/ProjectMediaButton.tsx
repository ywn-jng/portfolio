import type { ButtonHTMLAttributes } from "react";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "className"> & {
  icon: "download" | "muted" | "sound";
};

export default function ProjectMediaButton({ icon, ...props }: Props) {
  return (
    <button {...props} type="button" className="project-media-button">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {icon === "download" ? (
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 13l5 5 5-5M12 3v15" />
        ) : (
          <>
            <path d="M11 5 6 9H3v6h3l5 4z" />
            {icon === "sound"
              ? <path d="M15 9a4 4 0 0 1 0 6m3-9a8 8 0 0 1 0 12" />
              : <path d="m16 10 5 5m0-5-5 5" />}
          </>
        )}
      </svg>
    </button>
  );
}
