import Image from "next/image";

export function Brand({ compact = false }: { compact?: boolean }) {
  return <div className="flex min-w-0 items-center gap-2.5"><Image src="/logo-volkov-original.png" width={40} height={40} priority alt="Volkov" className="h-9 w-9 object-contain" />{!compact && <div className="min-w-0"><p className="m-0 text-[13px] font-bold tracking-[.14em] text-white">VOLKOV</p><p className="m-0 text-[10px] font-medium text-[#a9a1a0]">HUB DE PERFORMANCE</p></div>}</div>;
}
