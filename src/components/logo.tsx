import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-xl font-bold text-primary", className)}>
      <Image src="/ipn-logo.png" alt="IPN Logo" width={32} height={32} unoptimized />
      <span className="font-headline">Dr. César Noriega</span>
    </div>
  );
}
