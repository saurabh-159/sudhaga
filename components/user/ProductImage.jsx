import Image from 'next/image';

export default function ProductImage({ src, alt, className = '', sizes, priority = false }) {
  if (!src) {
    return <span className={`block h-full w-full bg-[#f3ebe3] ${className}`} role="img" aria-label={alt} />;
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes || '(max-width: 768px) 50vw, 25vw'}
      priority={priority}
      className={className}
    />
  );
}
