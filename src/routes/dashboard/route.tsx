import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Topbar } from "@/components/topbar";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { getCurrentStudioSubscription, type StudioSubscriptionInfo } from "@/lib/subscription-service";
import { Loader2, AlertTriangle, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const loading = useRequireAuth();
  const [subInfo, setSubInfo] = useState<StudioSubscriptionInfo>({ status: "active", plan: "pro", isPastDue: false });

  useEffect(() => {
    async function checkSub() {
      const info = await getCurrentStudioSubscription();
      setSubInfo(info);
    }
    checkSub();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <Loader2 className="size-8 animate-spin text-[#F87171]" />
      </div>
    );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="min-w-0 flex-1">
          <Topbar />
          {subInfo.isPastDue && (
            <div className="bg-amber-500 text-slate-950 px-4 py-3 text-xs font-semibold flex items-center justify-between gap-2 shadow-sm">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 shrink-0" />
                <span>
                  Sua assinatura do SaaS está em atraso ({subInfo.status}). Regularize o pagamento para evitar a suspensão dos agendamentos online.
                </span>
              </div>
              <Button size="sm" variant="secondary" className="h-8 rounded-lg text-xs font-bold shrink-0">
                <CreditCard className="size-3.5 mr-1" /> Regularizar Assinatura
              </Button>
            </div>
          )}
          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
