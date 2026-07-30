import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bell, Search, Moon, Sun, LogOut, User, Settings as SettingsIcon } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { clients, appointments } from "@/lib/mock-data";

const pages = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Agenda", to: "/dashboard/agenda" },
  { label: "Agendamentos", to: "/dashboard/agendamentos" },
  { label: "Clientes", to: "/dashboard/clientes" },
  { label: "Serviços", to: "/dashboard/servicos" },
  { label: "Financeiro", to: "/dashboard/financeiro" },
  { label: "Configurações", to: "/dashboard/configuracoes" },
] as const;

export function Topbar() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur-xl sm:px-6">
      <SidebarTrigger className="shrink-0" />

      <button
        onClick={() => setOpen(true)}
        className="group ml-1 flex h-9 min-w-0 flex-1 items-center gap-2 rounded-xl border bg-muted/40 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted sm:max-w-sm"
      >
        <Search className="size-4 shrink-0" />
        <span className="truncate">Buscar cliente, serviço...</span>
        <kbd className="ml-auto hidden rounded-md border bg-background px-1.5 py-0.5 text-[10px] font-medium sm:inline">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-xl" onClick={toggleTheme}>
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Alternar tema</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-xl">
              <Bell className="size-4" />
              <span className="absolute right-2 top-2 size-2 animate-pulse rounded-full bg-gold" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notificações <Badge variant="secondary">3 novas</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {appointments.slice(0, 3).map((a) => (
              <DropdownMenuItem key={a.id} className="flex-col items-start gap-0.5 py-2.5">
                <span className="text-sm font-medium">{a.clientName} confirmou o horário</span>
                <span className="text-xs text-muted-foreground">
                  {a.service} · {a.time}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 flex items-center gap-2 rounded-xl p-1 pr-2 transition-colors hover:bg-muted">
              <Avatar className="size-8 ring-2 ring-gold/40">
                <AvatarImage src="https://i.pravatar.cc/160?img=45" alt="Camila Duarte" />
                <AvatarFallback>CD</AvatarFallback>
              </Avatar>
              <span className="hidden text-left leading-tight lg:block">
                <span className="block text-xs font-semibold">Camila Duarte</span>
                <span className="block text-[11px] text-muted-foreground">Lash Designer</span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate({ to: "/dashboard/configuracoes" })}>
              <User className="size-4" /> Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate({ to: "/dashboard/configuracoes" })}>
              <SettingsIcon className="size-4" /> Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <LogOut className="size-4" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Buscar páginas e clientes..." />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          <CommandGroup heading="Páginas">
            {pages.map((p) => (
              <CommandItem
                key={p.to}
                value={p.label}
                onSelect={() => {
                  setOpen(false);
                  navigate({ to: p.to });
                }}
              >
                {p.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Clientes">
            {clients.map((c) => (
              <CommandItem
                key={c.id}
                value={c.name}
                onSelect={() => {
                  setOpen(false);
                  navigate({ to: "/dashboard/clientes" });
                }}
              >
                {c.name}
                <span className="ml-auto text-xs text-muted-foreground">{c.phone}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
}
