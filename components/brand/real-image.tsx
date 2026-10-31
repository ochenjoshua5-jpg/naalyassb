import Image from "next/image";

/**
 * A rights-cleared campus photograph pulled from Google Drive ("pics website"
 * folder) and served from /images. Falls back gracefully if the file is
 * missing during local development.
 */
export function RealImage({
  src,
  alt,
  className,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      priority={priority}
      sizes={sizes}
      fill
      objectFit="cover"
      objectPosition="center"
    />
  );
}
