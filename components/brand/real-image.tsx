import Image from "next/image";
import { PhotoPlaceholder } from "@/components/brand/photo-placeholder";
import { isPublishable } from "@/lib/photos";

/**
 * A rights-cleared campus photograph pulled from Google Drive ("pics website" folder)
 * and served from /images. A photo that has not been approved (see lib/photos.ts) is
 * replaced by the neutral placeholder with the same size, so the layout does not shift.
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
  if (!isPublishable(src)) {
    return <PhotoPlaceholder className={className} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      priority={priority}
      sizes={sizes}
      fill={false}
    />
  );
}
