import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Upload, Save, Clock, MessageCircle, QrCode, Palette, Bell, Building2 } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { WhatsappFabView } from "@/components/whatsapp-fab";
import { useStudioSettings, type FabStyle } from "@/lib/studio-settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/dashboard/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações · Lumière Lash Studio" },
      {
        name: "description",
        content: "Ajuste dados do studio, horários, WhatsApp, PIX, tema e notificações.",
      },
      { property: "og:title", content: "Configurações · Lumière Lash Studio" },
      {
        property: "og:description",
        content: "Ajuste dados do studio, horários, WhatsApp, PIX, tema e notificações.",
      },
    ],
  }),
  component: ConfiguracoesPage,
});

const days = [
  ["Segunda", "09:00", "19:00", true],
  ["Terça", "09:00", "19:00", true],
  ["Quarta", "09:00", "19:00", true],
  ["Quinta", "09:00", "20:00", true],
  ["Sexta", "09:00", "20:00", true],
  ["Sábado", "09:00", "16:00", true],
  ["Domingo", "—", "—", false],
] as const;

function SwitchRow({
  title,
  description,
  defaultChecked,
}: {
  title: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}

const fabStyles: { value: FabStyle; label: string; swatch: string }[] = [
  { value: "whatsapp", label: "Verde WhatsApp", swatch: "bg-[#25D366]" },
  { value: "gold", label: "Dourado", swatch: "bg-gold" },
  { value: "blush", label: "Rosa claro", swatch: "bg-blush" },
  { value: "dark", label: "Preto", swatch: "bg-foreground" },
];

function FloatingButtonCard() {
  const { settings, update } = useStudioSettings();

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg">Botão flutuante de conversa</CardTitle>
        <CardDescription>
          Exibe um atalho de WhatsApp em todas as telas da página pública. Personalize e veja o
          resultado ao vivo.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
          <div className="min-w-0">
            <p className="text-sm font-medium">Mostrar botão na página pública</p>
            <p className="text-xs text-muted-foreground">
              Suas clientes falam com você em um toque.
            </p>
          </div>
          <Switch
            checked={settings.fabEnabled}
            onCheckedChange={(v) => update({ fabEnabled: v })}
          />
        </div>

        {settings.fabEnabled ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Número do WhatsApp</Label>
                <Input
                  className="rounded-xl"
                  value={settings.fabPhone}
                  onChange={(e) => update({ fabPhone: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Texto do botão</Label>
                <Input
                  className="rounded-xl"
                  value={settings.fabLabel}
                  placeholder="Fale com a gente"
                  onChange={(e) => update({ fabLabel: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Mensagem inicial da cliente</Label>
              <Textarea
                className="rounded-xl"
                value={settings.fabMessage}
                onChange={(e) => update({ fabMessage: e.target.value })}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Posição na tela</Label>
                <Select
                  value={settings.fabPosition}
                  onValueChange={(v) => update({ fabPosition: v as "left" | "right" })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="right">Canto inferior direito</SelectItem>
                    <SelectItem value="left">Canto inferior esquerdo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Cor do botão</Label>
                <div className="flex flex-wrap gap-2">
                  {fabStyles.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => update({ fabStyle: s.value })}
                      title={s.label}
                      aria-label={s.label}
                      className={`size-9 rounded-full ring-offset-2 ring-offset-background transition ${s.swatch} ${
                        settings.fabStyle === s.value ? "ring-2 ring-gold" : "hover:scale-105"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
              <div className="min-w-0">
                <p className="text-sm font-medium">Mostrar texto ao lado do ícone</p>
                <p className="text-xs text-muted-foreground">
                  Desative para um botão apenas com ícone.
                </p>
              </div>
              <Switch
                checked={settings.fabShowLabel}
                onCheckedChange={(v) => update({ fabShowLabel: v })}
              />
            </div>

            <div className="rounded-xl border bg-muted/40 p-6">
              <p className="mb-4 text-xs font-medium text-muted-foreground">Pré-visualização</p>
              <div
                className={`flex ${settings.fabPosition === "right" ? "justify-end" : "justify-start"}`}
              >
                <WhatsappFabView settings={settings} preview />
              </div>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ConfiguracoesPage() {
  const [dark, setDark] = useState(false);

  return (
    <PageShell
      title="Configurações"
      description="Personalize o funcionamento e a identidade do seu studio."
      actions={
        <Button className="rounded-xl" onClick={() => toast.success("Configurações salvas!")}>
          <Save className="size-4" /> Salvar alterações
        </Button>
      }
    >
      <Tabs defaultValue="geral">
        <div className="overflow-x-auto pb-2">
          <TabsList className="rounded-xl">
            <TabsTrigger value="geral" className="rounded-lg">
              <Building2 className="size-3.5" /> Geral
            </TabsTrigger>
            <TabsTrigger value="horarios" className="rounded-lg">
              <Clock className="size-3.5" /> Horários
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="rounded-lg">
              <MessageCircle className="size-3.5" /> WhatsApp
            </TabsTrigger>
            <TabsTrigger value="pix" className="rounded-lg">
              <QrCode className="size-3.5" /> PIX
            </TabsTrigger>
            <TabsTrigger value="perfil" className="rounded-lg">
              Perfil
            </TabsTrigger>
            <TabsTrigger value="tema" className="rounded-lg">
              <Palette className="size-3.5" /> Tema
            </TabsTrigger>
            <TabsTrigger value="notificacoes" className="rounded-lg">
              <Bell className="size-3.5" /> Notificações
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="geral" className="mt-4">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Dados do studio</CardTitle>
              <CardDescription>Informações exibidas na página pública.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="grid size-20 shrink-0 place-items-center rounded-2xl border border-dashed bg-muted/40 text-xs text-muted-foreground">
                  Logo
                </div>
                <div>
                  <Button variant="outline" className="rounded-xl">
                    <Upload className="size-4" /> Enviar logo
                  </Button>
                  <p className="mt-2 text-xs text-muted-foreground">PNG ou SVG até 2 MB.</p>
                </div>
              </div>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Nome do studio</Label>
                  <Input defaultValue="Lumière Lash Studio" className="rounded-xl" />
                </div>
                <div className="grid gap-2">
                  <Label>Telefone</Label>
                  <Input defaultValue="(11) 98812-0000" className="rounded-xl" />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label>Endereço</Label>
                  <Input
                    defaultValue="Rua Oscar Freire, 1042 · Jardins, São Paulo"
                    className="rounded-xl"
                  />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label>Descrição</Label>
                  <Textarea
                    className="rounded-xl"
                    defaultValue="Studio boutique especializado em extensão de cílios e design de olhar."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="horarios" className="mt-4">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Horário de funcionamento</CardTitle>
              <CardDescription>Define os horários disponíveis para agendamento.</CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              {days.map(([d, open, close, active]) => (
                <div key={d} className="flex flex-wrap items-center gap-3 py-3">
                  <Switch defaultChecked={active as boolean} />
                  <span className="w-24 text-sm font-medium">{d}</span>
                  <Input defaultValue={open as string} className="h-9 w-24 rounded-xl" />
                  <span className="text-muted-foreground">às</span>
                  <Input defaultValue={close as string} className="h-9 w-24 rounded-xl" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp" className="mt-4 grid gap-4">
          <FloatingButtonCard />
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Integração WhatsApp</CardTitle>
              <CardDescription>Confirmações e lembretes automáticos.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label>Número conectado</Label>
                <Input defaultValue="+55 11 98812-0000" className="rounded-xl" />
              </div>
              <div className="grid gap-2">
                <Label>Mensagem de confirmação</Label>
                <Textarea
                  className="rounded-xl"
                  defaultValue="Oi {nome}! Seu horário de {servico} está confirmado para {data} às {hora}. Te espero no Lumière ✨"
                />
              </div>
              <Separator />
              <div className="divide-y">
                <SwitchRow
                  title="Lembrete 24h antes"
                  description="Envia um lembrete automático na véspera."
                  defaultChecked
                />
                <SwitchRow
                  title="Pedido de avaliação"
                  description="Solicita avaliação após o atendimento."
                  defaultChecked
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pix" className="mt-4">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Recebimento via PIX</CardTitle>
              <CardDescription>Cobrança de sinal e pagamento antecipado.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Tipo de chave</Label>
                  <Select defaultValue="cnpj">
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cpf">CPF</SelectItem>
                      <SelectItem value="cnpj">CNPJ</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="telefone">Telefone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Chave PIX</Label>
                  <Input defaultValue="42.118.905/0001-70" className="rounded-xl" />
                </div>
              </div>
              <Separator />
              <SwitchRow
                title="Exigir sinal de 30%"
                description="Cliente paga parte do valor ao agendar."
                defaultChecked
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="perfil" className="mt-4">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Perfil da profissional</CardTitle>
              <CardDescription>Como você aparece para suas clientes.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="flex items-center gap-4">
                <Avatar className="size-20 ring-2 ring-gold/40">
                  <AvatarImage src="https://i.pravatar.cc/160?img=45" alt="Camila Duarte" />
                  <AvatarFallback>CD</AvatarFallback>
                </Avatar>
                <Button variant="outline" className="rounded-xl">
                  <Upload className="size-4" /> Alterar foto
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Nome</Label>
                  <Input defaultValue="Camila Duarte" className="rounded-xl" />
                </div>
                <div className="grid gap-2">
                  <Label>Especialidade</Label>
                  <Input defaultValue="Lash Designer Master" className="rounded-xl" />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label>E-mail</Label>
                  <Input defaultValue="camila@lumierelash.com.br" className="rounded-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tema" className="mt-4">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Aparência</CardTitle>
              <CardDescription>Escolha como o painel é exibido.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium">Modo escuro</p>
                  <p className="text-xs text-muted-foreground">Ideal para atendimentos noturnos.</p>
                </div>
                <Switch
                  checked={dark}
                  onCheckedChange={(v) => {
                    setDark(v);
                    document.documentElement.classList.toggle("dark", v);
                  }}
                />
              </div>
              <Separator />
              <div>
                <p className="mb-3 text-sm font-medium">Cor de destaque</p>
                <div className="flex gap-3">
                  {["var(--gold)", "var(--blush-deep)", "var(--foreground)", "var(--chart-5)"].map(
                    (c, i) => (
                      <button
                        key={c}
                        className="size-9 rounded-full ring-2 ring-offset-2 ring-offset-background transition-transform hover:scale-110"
                        style={{
                          backgroundColor: c,
                          boxShadow: i === 0 ? "0 0 0 2px var(--gold)" : undefined,
                        }}
                        aria-label={`Cor ${i + 1}`}
                      />
                    ),
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes" className="mt-4">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Notificações</CardTitle>
              <CardDescription>Escolha o que você quer receber.</CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              <SwitchRow
                title="Novo agendamento"
                description="Alerta imediato quando uma cliente agenda."
                defaultChecked
              />
              <SwitchRow
                title="Cancelamentos"
                description="Aviso quando um horário é liberado."
                defaultChecked
              />
              <SwitchRow
                title="Resumo diário"
                description="Um resumo da agenda todo dia às 8h."
                defaultChecked
              />
              <SwitchRow
                title="Novidades do produto"
                description="Dicas e novos recursos por e-mail."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}
