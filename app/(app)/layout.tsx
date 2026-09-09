import { AppSidebar } from "@/components/app-sidebar";
import { Topbar } from "@/components/topbar";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) { const supabase = await createClient(); const user = supabase ? (await supabase.auth.getUser()).data.user : null; const profile = supabase && user ? (await supabase.from("profiles").select("full_name, role").eq("id", user.id).maybeSingle()).data : null; return <div className="flex min-h-screen"><AppSidebar/><div className="min-w-0 flex-1"><Topbar profile={profile}/><main className="mx-auto max-w-[1640px] p-4 lg:p-7">{children}</main></div></div>; }
