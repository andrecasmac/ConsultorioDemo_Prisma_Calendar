import Image from 'next/image';

export function Logo() {
  return (
    <div className="flex items-center gap-2 text-xl font-bold text-primary">
      <Image src="/ipn-logo.png" alt="IPN Logo" width={32} height={32} unoptimized />
      <span className="font-headline">Dr. César Noriega</span>
    </div>
  );
}
