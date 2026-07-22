import Image from "next/image";
import Link from "next/link";

interface InstagramGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    href: string;
  }>;
}

export function InstagramGallery({ images }: InstagramGalleryProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-1">
      {images.map((image, index) => (
        <Link
          key={index}
          href={image.href}
          target="_blank"
          rel="noopener noreferrer"
          className="relative aspect-square group overflow-hidden"
        >
          {image.src ? (
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16vw"
            />
          ) : (
            <div className="absolute inset-0 bg-cream flex items-center justify-center text-muted-foreground text-xs">
              {image.alt}
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
            <span className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 uppercase tracking-wider">
              View
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
