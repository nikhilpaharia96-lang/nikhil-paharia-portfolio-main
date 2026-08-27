import { useState } from "react";

type AvatarImageProps = {
  src: string;
  alt: string;
  fallback: string;
  className?: string;
};

/** Renders a lazy-loaded image, falling back to initials text if the image fails to load. */
export default function AvatarImage({ src, alt, fallback, className = "" }: AvatarImageProps) {
  const [failed, setFailed] = useState(false);
  if (failed) return <>{fallback}</>;
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={`w-full h-full object-cover ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
