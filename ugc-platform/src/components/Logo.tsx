import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  href?: string;
  className?: string;
}

export default function Logo({ href = "/", className = "" }: LogoProps) {
  return (
    <Link href={href} className={`flex items-center gap-3 ${className}`}>
      <div className="relative h-20 w-48 md:h-24 md:w-56">
        <Image
          src="/bountea.png"
          alt="bountea Logo"
          fill
          priority
          className="object-contain rounded-md"
        />
      </div>
    </Link>
  );
}

