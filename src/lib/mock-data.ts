export type Status = "confirmado" | "pendente" | "concluido" | "cancelado";

export const statusLabel: Record<Status, string> = {
  confirmado: "Confirmado",
  pendente: "Pendente",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export type Service = {
  id: string;
  name: string;
  price: number;
  duration: number;
  color: string;
  description: string;
};

export const services: Service[] = [
  {
    id: "s1",
    name: "Volume Brasileiro",
    price: 180,
    duration: 120,
    color: "var(--gold)",
    description: "Fios em Y aplicados fio a fio para um volume natural e leve.",
  },
  {
    id: "s2",
    name: "Volume Russo",
    price: 240,
    duration: 150,
    color: "var(--blush-deep)",
    description: "Máximo volume com fanning artesanal de 4D a 6D.",
  },
  {
    id: "s3",
    name: "Clássico Fio a Fio",
    price: 150,
    duration: 90,
    color: "var(--chart-3)",
    description: "Um fio de extensão por fio natural. Efeito rímel discreto.",
  },
  {
    id: "s4",
    name: "Lash Lifting",
    price: 130,
    duration: 60,
    color: "var(--chart-5)",
    description: "Curvatura permanente dos fios naturais com nutrição.",
  },
  {
    id: "s5",
    name: "Design de Sobrancelhas",
    price: 70,
    duration: 45,
    color: "var(--gold-soft)",
    description: "Mapeamento facial, pinça e finalização com henna opcional.",
  },
  {
    id: "s6",
    name: "Manutenção",
    price: 110,
    duration: 75,
    color: "var(--chart-4)",
    description: "Reposição dos fios para quem já é cliente do studio.",
  },
];

export type Professional = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
};

export const professionals: Professional[] = [
  {
    id: "p1",
    name: "Júlia Gatti",
    role: "Master Lash Designer & Fundadora",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80",
    rating: 5.0,
  },
  {
    id: "p2",
    name: "Equipe Studio Júlia Gatti",
    role: "Lash Designer Especialista",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&q=80",
    rating: 4.9,
  },
];

export type Client = {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  lastVisit: string;
  nextVisit: string | null;
  totalSpent: number;
  visits: number;
  tag: "VIP" | "Recorrente" | "Nova";
  notes: string;
  history: { date: string; service: string; value: number; pro: string }[];
  gallery: { before: string; after: string; label: string }[];
};

const photo = (n: number) => `https://i.pravatar.cc/160?img=${n}`;

export const clients: Client[] = [
  {
    id: "c1",
    name: "Marina Alves",
    phone: "(11) 98812-4471",
    email: "marina.alves@email.com",
    avatar: photo(5),
    lastVisit: "2026-07-16",
    nextVisit: "2026-07-30",
    totalSpent: 2140,
    visits: 12,
    tag: "VIP",
    notes: "Alergia a adesivo com látex. Prefere curvatura D e mapping felino.",
    history: [
      { date: "2026-07-16", service: "Volume Russo", value: 240, pro: "Camila Duarte" },
      { date: "2026-06-18", service: "Manutenção", value: 110, pro: "Camila Duarte" },
      { date: "2026-05-20", service: "Volume Russo", value: 240, pro: "Rafaela Nunes" },
    ],
    gallery: [
      {
        before: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=70",
        after: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=600&q=70",
        label: "Volume Russo · Julho",
      },
    ],
  },
  {
    id: "c2",
    name: "Juliana Prado",
    phone: "(11) 99741-2280",
    email: "ju.prado@email.com",
    avatar: photo(9),
    lastVisit: "2026-07-22",
    nextVisit: "2026-07-30",
    totalSpent: 1380,
    visits: 8,
    tag: "Recorrente",
    notes: "Gosta de conversar pouco durante o procedimento. Chá de camomila.",
    history: [
      { date: "2026-07-22", service: "Volume Brasileiro", value: 180, pro: "Rafaela Nunes" },
      { date: "2026-06-24", service: "Lash Lifting", value: 130, pro: "Bianca Moreira" },
    ],
    gallery: [
      {
        before: "https://images.unsplash.com/photo-1500840216050-6ffa99d75160?w=600&q=70",
        after: "https://images.unsplash.com/photo-1516726817505-f5ed825624d8?w=600&q=70",
        label: "Volume Brasileiro · Julho",
      },
    ],
  },
  {
    id: "c3",
    name: "Beatriz Ramos",
    phone: "(11) 99120-7788",
    email: "bia.ramos@email.com",
    avatar: photo(16),
    lastVisit: "2026-07-10",
    nextVisit: "2026-07-30",
    totalSpent: 640,
    visits: 4,
    tag: "Recorrente",
    notes: "Trabalha à noite, prefere horários antes das 12h.",
    history: [{ date: "2026-07-10", service: "Clássico Fio a Fio", value: 150, pro: "Camila Duarte" }],
    gallery: [],
  },
  {
    id: "c4",
    name: "Larissa Campos",
    phone: "(11) 98330-1192",
    email: "larissa.campos@email.com",
    avatar: photo(20),
    lastVisit: "2026-07-27",
    nextVisit: null,
    totalSpent: 130,
    visits: 1,
    tag: "Nova",
    notes: "Primeira vez em extensão de cílios. Fios naturais finos.",
    history: [{ date: "2026-07-27", service: "Lash Lifting", value: 130, pro: "Bianca Moreira" }],
    gallery: [],
  },
  {
    id: "c5",
    name: "Renata Figueiredo",
    phone: "(11) 99655-3021",
    email: "renata.f@email.com",
    avatar: photo(24),
    lastVisit: "2026-07-25",
    nextVisit: "2026-07-30",
    totalSpent: 1890,
    visits: 11,
    tag: "VIP",
    notes: "Sempre agenda manutenção a cada 21 dias.",
    history: [
      { date: "2026-07-25", service: "Manutenção", value: 110, pro: "Camila Duarte" },
      { date: "2026-07-04", service: "Volume Russo", value: 240, pro: "Camila Duarte" },
    ],
    gallery: [
      {
        before: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=70",
        after: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&q=70",
        label: "Manutenção · Julho",
      },
    ],
  },
  {
    id: "c6",
    name: "Amanda Teixeira",
    phone: "(11) 98444-6610",
    email: "amanda.tx@email.com",
    avatar: photo(31),
    lastVisit: "2026-06-30",
    nextVisit: "2026-07-31",
    totalSpent: 980,
    visits: 6,
    tag: "Recorrente",
    notes: "Prefere mapping boneca. Alérgica a perfume forte.",
    history: [{ date: "2026-06-30", service: "Design de Sobrancelhas", value: 70, pro: "Bianca Moreira" }],
    gallery: [],
  },
  {
    id: "c7",
    name: "Sofia Bandeira",
    phone: "(11) 99012-4455",
    email: "sofia.b@email.com",
    avatar: photo(36),
    lastVisit: "2026-07-28",
    nextVisit: null,
    totalSpent: 180,
    visits: 1,
    tag: "Nova",
    notes: "Veio por indicação da Marina.",
    history: [{ date: "2026-07-28", service: "Volume Brasileiro", value: 180, pro: "Rafaela Nunes" }],
    gallery: [],
  },
];

export type Appointment = {
  id: string;
  clientId: string;
  clientName: string;
  avatar: string;
  phone: string;
  service: string;
  professional: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  status: Status;
  payment: "PIX" | "Crédito" | "Débito" | "Dinheiro";
  notes: string;
};

export const appointments: Appointment[] = [
  {
    id: "a1",
    clientId: "c1",
    clientName: "Marina Alves",
    avatar: photo(5),
    phone: "(11) 98812-4471",
    service: "Volume Russo",
    professional: "Camila Duarte",
    date: "2026-07-30",
    time: "09:00",
    duration: 150,
    price: 240,
    status: "confirmado",
    payment: "PIX",
    notes: "Cliente alérgica a adesivo com látex. Usar linha sensitive.",
  },
  {
    id: "a2",
    clientId: "c2",
    clientName: "Juliana Prado",
    avatar: photo(9),
    phone: "(11) 99741-2280",
    service: "Volume Brasileiro",
    professional: "Rafaela Nunes",
    date: "2026-07-30",
    time: "10:30",
    duration: 120,
    price: 180,
    status: "confirmado",
    payment: "Crédito",
    notes: "Preparar chá de camomila.",
  },
  {
    id: "a3",
    clientId: "c3",
    clientName: "Beatriz Ramos",
    avatar: photo(16),
    phone: "(11) 99120-7788",
    service: "Clássico Fio a Fio",
    professional: "Camila Duarte",
    date: "2026-07-30",
    time: "12:00",
    duration: 90,
    price: 150,
    status: "pendente",
    payment: "PIX",
    notes: "Confirmar presença por WhatsApp na véspera.",
  },
  {
    id: "a4",
    clientId: "c5",
    clientName: "Renata Figueiredo",
    avatar: photo(24),
    phone: "(11) 99655-3021",
    service: "Manutenção",
    professional: "Camila Duarte",
    date: "2026-07-30",
    time: "14:00",
    duration: 75,
    price: 110,
    status: "confirmado",
    payment: "Débito",
    notes: "Manutenção de 21 dias.",
  },
  {
    id: "a5",
    clientId: "c6",
    clientName: "Amanda Teixeira",
    avatar: photo(31),
    phone: "(11) 98444-6610",
    service: "Design de Sobrancelhas",
    professional: "Bianca Moreira",
    date: "2026-07-30",
    time: "16:00",
    duration: 45,
    price: 70,
    status: "pendente",
    payment: "Dinheiro",
    notes: "Avaliar henna clara.",
  },
  {
    id: "a6",
    clientId: "c7",
    clientName: "Sofia Bandeira",
    avatar: photo(36),
    phone: "(11) 99012-4455",
    service: "Volume Brasileiro",
    professional: "Rafaela Nunes",
    date: "2026-07-31",
    time: "09:00",
    duration: 120,
    price: 180,
    status: "confirmado",
    payment: "PIX",
    notes: "Primeira aplicação.",
  },
  {
    id: "a7",
    clientId: "c4",
    clientName: "Larissa Campos",
    avatar: photo(20),
    phone: "(11) 98330-1192",
    service: "Lash Lifting",
    professional: "Bianca Moreira",
    date: "2026-07-31",
    time: "12:00",
    duration: 60,
    price: 130,
    status: "pendente",
    payment: "PIX",
    notes: "Fios naturais finos, usar bigudim menor.",
  },
  {
    id: "a8",
    clientId: "c1",
    clientName: "Marina Alves",
    avatar: photo(5),
    phone: "(11) 98812-4471",
    service: "Manutenção",
    professional: "Camila Duarte",
    date: "2026-08-03",
    time: "14:00",
    duration: 75,
    price: 110,
    status: "confirmado",
    payment: "PIX",
    notes: "",
  },
  {
    id: "a9",
    clientId: "c2",
    clientName: "Juliana Prado",
    avatar: photo(9),
    phone: "(11) 99741-2280",
    service: "Lash Lifting",
    professional: "Bianca Moreira",
    date: "2026-07-28",
    time: "10:30",
    duration: 60,
    price: 130,
    status: "concluido",
    payment: "Crédito",
    notes: "",
  },
  {
    id: "a10",
    clientId: "c3",
    clientName: "Beatriz Ramos",
    avatar: photo(16),
    phone: "(11) 99120-7788",
    service: "Volume Brasileiro",
    professional: "Rafaela Nunes",
    date: "2026-07-27",
    time: "16:00",
    duration: 120,
    price: 180,
    status: "cancelado",
    payment: "PIX",
    notes: "Cliente remarcou.",
  },
];

export const weeklyRevenue = [
  { day: "Seg", value: 540, atendimentos: 4 },
  { day: "Ter", value: 730, atendimentos: 5 },
  { day: "Qua", value: 420, atendimentos: 3 },
  { day: "Qui", value: 890, atendimentos: 6 },
  { day: "Sex", value: 1120, atendimentos: 7 },
  { day: "Sáb", value: 1340, atendimentos: 8 },
  { day: "Dom", value: 260, atendimentos: 2 },
];

export const monthlyRevenue = [
  { month: "Jan", value: 12400 },
  { month: "Fev", value: 11800 },
  { month: "Mar", value: 14200 },
  { month: "Abr", value: 13100 },
  { month: "Mai", value: 15600 },
  { month: "Jun", value: 16900 },
  { month: "Jul", value: 18400 },
];

export type Transaction = {
  id: string;
  date: string;
  client: string;
  service: string;
  payment: "PIX" | "Crédito" | "Débito" | "Dinheiro";
  value: number;
  status: "pago" | "pendente" | "estornado";
};

export const transactions: Transaction[] = [
  { id: "t1", date: "2026-07-29", client: "Marina Alves", service: "Volume Russo", payment: "PIX", value: 240, status: "pago" },
  { id: "t2", date: "2026-07-29", client: "Juliana Prado", service: "Volume Brasileiro", payment: "Crédito", value: 180, status: "pago" },
  { id: "t3", date: "2026-07-28", client: "Sofia Bandeira", service: "Volume Brasileiro", payment: "PIX", value: 180, status: "pago" },
  { id: "t4", date: "2026-07-28", client: "Beatriz Ramos", service: "Clássico Fio a Fio", payment: "Débito", value: 150, status: "pendente" },
  { id: "t5", date: "2026-07-27", client: "Larissa Campos", service: "Lash Lifting", payment: "PIX", value: 130, status: "pago" },
  { id: "t6", date: "2026-07-27", client: "Renata Figueiredo", service: "Manutenção", payment: "Dinheiro", value: 110, status: "pago" },
  { id: "t7", date: "2026-07-26", client: "Amanda Teixeira", service: "Design de Sobrancelhas", payment: "PIX", value: 70, status: "estornado" },
  { id: "t8", date: "2026-07-26", client: "Marina Alves", service: "Manutenção", payment: "PIX", value: 110, status: "pago" },
];

export const studio = {
  name: "Studio Júlia Gatti",
  tagline: "Extensão de Cílios",
  rating: 5.0,
  reviews: 142,
  address: "Baixada Santista · São Paulo",
  mapsUrl: "https://maps.google.com/?q=Studio+Julia+Gatti",
  instagram: "@studiojuliagatti",
  whatsapp: "(13) 99117-6958",
  hours: [
    { day: "Segunda", time: "09:00 – 19:00" },
    { day: "Terça", time: "09:00 – 19:00" },
    { day: "Quarta", time: "09:00 – 20:00" },
    { day: "Quinta", time: "09:00 – 20:00" },
    { day: "Sexta", time: "09:00 – 20:00" },
    { day: "Sábado", time: "09:00 – 16:00" },
    { day: "Domingo", time: "Fechado" },
  ],
  cover:
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&q=75",
};

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const brlExact = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const formatDateBR = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
};

export const TODAY = "2026-07-30";
