import Image from "next/image";

export function Brand({ compact = false }: { compact?: boolean }) {
  return <div className="flex min-w-0 items-center gap-2.5"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[var(--line)] bg-black"><Image src="/logo-volkov-original.png" width={40} height={40} priority alt="Volkov" className="h-9 w-9 object-contain" /></span>{!compact && <div className="min-w-0"><p className="m-0 text-[13px] font-bold tracking-[.14em] text-white">VOLKOV</p><p className="m-0 text-[10px] font-semibold tracking-[.08em] text-[var(--gold)]">HUB DE PERFORMANCE</p></div>}</div>;
}
