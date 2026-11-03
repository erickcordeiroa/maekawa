import Image from "next/image"

export function Logo({ size, alt = "Logo Murilo K. Maekawa BJJ", className, priority }: { size: number; alt?: string; className?: string; priority?: boolean }) {
  return <Image src="/logo.webp" width={size} height={size} alt={alt} className={className} priority={priority} />
}
