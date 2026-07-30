import { supabase, isSupabaseConfigured } from "./supabase";
import {
  type Service,
  type Professional,
  type Client,
  type Appointment,
  type Status,
} from "./mock-data";

export type { Service, Professional, Client, Appointment, Status };

function checkSupabaseConnected() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase não está configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas variáveis de ambiente.");
  }
  return supabase;
}

export type StudioRecord = {
  id: string;
  slug: string;
  name: string;
  subscription_status: string;
  subscription_plan: string;
};

export const defaultLashServices: Omit<Service, "id">[] = [
  {
    name: "Volume Brasileiro (Cílios YY)",
    price: 190,
    duration: 130,
    color: "var(--gold)",
    description: "Aplicação em formato Y para um olhar marcante, volumoso e super leve.",
  },
  {
    name: "Volume Russo Artesanal",
    price: 240,
    duration: 150,
    color: "var(--blush-deep)",
    description: "Fans artesanais de 3D a 6D para máximo preenchimento e glamour.",
  },
  {
    name: "Clássico Fio a Fio",
    price: 160,
    duration: 120,
    color: "var(--chart-3)",
    description: "Aplicação de um fio sintético sobre cada cílio natural. Efeito rímel elegante.",
  },
  {
    name: "Volume Híbrido",
    price: 200,
    duration: 130,
    color: "var(--chart-2)",
    description: "Mistura perfeita entre o Fio a Fio e Volume Russo para efeito texturizado.",
  },
  {
    name: "Lash Lifting + Nutrição com Keratina",
    price: 140,
    duration: 60,
    color: "var(--chart-5)",
    description: "Curvatura e tingimento dos cílios naturais promovendo olhar levantado por até 8 semanas.",
  },
  {
    name: "Manutenção de Extensão (Até 20 dias)",
    price: 120,
    duration: 90,
    color: "var(--chart-4)",
    description: "Higienização profunda e reposição de fios para clientes do studio.",
  },
];

export const defaultLashProfessionals: Omit<Professional, "id">[] = [
  {
    name: "Júlia Gatti",
    role: "Master Lash Designer & Fundadora",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80",
    rating: 5.0,
  },
  {
    name: "Driely Santos",
    role: "Lash Designer Specialist",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&q=80",
    rating: 4.9,
  },
];

/**
 * Garante e busca a conta do Studio Júlia Gatti no banco de dados
 */
export async function ensureJuliaGattiStudioInDB(): Promise<StudioRecord> {
  const client = checkSupabaseConnected();

  const { data: existing } = await client
    .from("studios")
    .select("id, slug, name, subscription_status, subscription_plan")
    .eq("slug", "julia-gatti")
    .limit(1);

  if (existing && existing.length > 0) {
    return existing[0] as StudioRecord;
  }

  const { data: newStudio, error } = await client
    .from("studios")
    .insert([
      {
        slug: "julia-gatti",
        name: "Studio Júlia Gatti",
        subscription_status: "active",
        subscription_plan: "pro",
      },
    ])
    .select()
    .single();

  if (!error && newStudio) {
    return newStudio as StudioRecord;
  }

  return {
    id: "default-julia-gatti-id",
    slug: "julia-gatti",
    name: "Studio Júlia Gatti",
    subscription_status: "active",
    subscription_plan: "pro",
  };
}

/**
 * Busca estúdio por slug
 */
export async function getStudioBySlug(slug: string): Promise<StudioRecord> {
  const client = checkSupabaseConnected();
  const { data, error } = await client
    .from("studios")
    .select("id, slug, name, subscription_status, subscription_plan")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    if (slug === "julia-gatti") {
      return await ensureJuliaGattiStudioInDB();
    }
    throw new Error(`Estúdio '${slug}' não foi encontrado.`);
  }

  return data as StudioRecord;
}

// ----------------------------------------------------
// SERVIÇOS DE EXTENSÃO DE CÍLIOS
// ----------------------------------------------------
export async function getServices(studioId?: string): Promise<Service[]> {
  const client = checkSupabaseConnected();
  let targetStudioId = studioId;

  if (!targetStudioId) {
    const studioRec = await ensureJuliaGattiStudioInDB();
    targetStudioId = studioRec.id;
  }

  let { data, error } = await client.from("services").select("*").eq("active", true);

  if (error) {
    console.error("Erro ao buscar serviços no Supabase:", error);
    throw new Error(`Erro ao buscar serviços: ${error.message}`);
  }

  // Se os serviços no banco estiverem vazios, auto-cadastra os serviços de cílios da Júlia Gatti no Supabase
  if (!data || data.length === 0) {
    console.log("Auto-cadastrando serviços de extensão de cílios da Júlia Gatti no Supabase...");
    const toInsert = defaultLashServices.map((s) => ({
      name: s.name,
      price: s.price,
      duration: s.duration,
      color: s.color,
      description: s.description,
      active: true,
      studio_id: targetStudioId,
    }));

    const { data: inserted, error: insertErr } = await client
      .from("services")
      .insert(toInsert)
      .select();

    if (!insertErr && inserted && inserted.length > 0) {
      data = inserted;
    }
  }

  return (data || []).map((s) => ({
    id: s.id,
    name: s.name,
    price: Number(s.price),
    duration: Number(s.duration),
    color: s.color || "var(--gold)",
    description: s.description || "",
  }));
}

export async function createService(serviceData: Omit<Service, "id"> & { studioId?: string }): Promise<Service> {
  const client = checkSupabaseConnected();
  let targetStudioId = serviceData.studioId;

  if (!targetStudioId) {
    const studioRec = await ensureJuliaGattiStudioInDB();
    targetStudioId = studioRec.id;
  }

  const { data, error } = await client
    .from("services")
    .insert([
      {
        name: serviceData.name,
        price: serviceData.price,
        duration: serviceData.duration,
        color: serviceData.color,
        description: serviceData.description,
        studio_id: targetStudioId,
      },
    ])
    .select()
    .single();

  if (error || !data) {
    console.error("Erro ao criar serviço no Supabase:", error);
    throw new Error(`Erro ao criar serviço: ${error?.message || "Registro não retornado."}`);
  }

  return {
    id: data.id,
    name: data.name,
    price: Number(data.price),
    duration: Number(data.duration),
    color: data.color,
    description: data.description,
  };
}

export async function updateService(id: string, serviceData: Partial<Service>): Promise<boolean> {
  const client = checkSupabaseConnected();
  const { error } = await client.from("services").update(serviceData).eq("id", id);
  if (error) {
    console.error("Erro ao atualizar serviço no Supabase:", error);
    throw new Error(`Erro ao atualizar serviço: ${error.message}`);
  }
  return true;
}

export async function deleteService(id: string): Promise<boolean> {
  const client = checkSupabaseConnected();
  const { error } = await client.from("services").delete().eq("id", id);
  if (error) {
    console.error("Erro ao deletar serviço no Supabase:", error);
    throw new Error(`Erro ao deletar serviço: ${error.message}`);
  }
  return true;
}

// ----------------------------------------------------
// PROFISSIONAIS DA EQUIPE
// ----------------------------------------------------
export async function getProfessionals(studioId?: string): Promise<Professional[]> {
  const client = checkSupabaseConnected();
  let targetStudioId = studioId;

  if (!targetStudioId) {
    const studioRec = await ensureJuliaGattiStudioInDB();
    targetStudioId = studioRec.id;
  }

  let { data, error } = await client.from("professionals").select("*").eq("active", true).order("created_at", { ascending: true });

  if (error) {
    console.error("Erro ao buscar profissionais no Supabase:", error);
    throw new Error(`Erro ao buscar profissionais: ${error.message}`);
  }

  // Auto-cadastra profissionais no Supabase se a tabela estiver vazia
  if (!data || data.length === 0) {
    console.log("Auto-cadastrando equipe da Júlia Gatti no Supabase...");
    const toInsert = defaultLashProfessionals.map((p) => ({
      name: p.name,
      role: p.role,
      avatar: p.avatar,
      rating: p.rating,
      active: true,
      studio_id: targetStudioId,
    }));

    const { data: inserted, error: insertErr } = await client
      .from("professionals")
      .insert(toInsert)
      .select();

    if (!insertErr && inserted && inserted.length > 0) {
      data = inserted;
    }
  }

  return (data || []).map((p) => ({
    id: p.id,
    name: p.name,
    role: p.role,
    avatar: p.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80",
    rating: Number(p.rating),
  }));
}

export async function createProfessional(params: Omit<Professional, "id"> & { studioId?: string }): Promise<Professional> {
  const client = checkSupabaseConnected();
  let targetStudioId = params.studioId;

  if (!targetStudioId) {
    const studioRec = await ensureJuliaGattiStudioInDB();
    targetStudioId = studioRec.id;
  }

  const { data, error } = await client
    .from("professionals")
    .insert([
      {
        name: params.name,
        role: params.role,
        avatar: params.avatar || null,
        rating: params.rating || 5.0,
        active: true,
        studio_id: targetStudioId,
      },
    ])
    .select()
    .single();

  if (error || !data) {
    console.error("Erro ao criar profissional no Supabase:", error);
    throw new Error(`Erro ao criar profissional: ${error?.message || "Registro não retornado."}`);
  }

  return {
    id: data.id,
    name: data.name,
    role: data.role,
    avatar: data.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80",
    rating: Number(data.rating),
  };
}

export async function updateProfessional(id: string, params: Partial<Professional>): Promise<boolean> {
  const client = checkSupabaseConnected();
  const { error } = await client
    .from("professionals")
    .update({
      ...(params.name && { name: params.name }),
      ...(params.role && { role: params.role }),
      ...(params.avatar !== undefined && { avatar: params.avatar }),
      ...(params.rating !== undefined && { rating: params.rating }),
    })
    .eq("id", id);

  if (error) {
    console.error("Erro ao atualizar profissional no Supabase:", error);
    throw new Error(`Erro ao atualizar profissional: ${error.message}`);
  }

  return true;
}

export async function deleteProfessional(id: string): Promise<boolean> {
  const client = checkSupabaseConnected();
  const { error } = await client.from("professionals").delete().eq("id", id);
  if (error) {
    console.error("Erro ao deletar profissional no Supabase:", error);
    throw new Error(`Erro ao deletar profissional: ${error.message}`);
  }
  return true;
}

// ----------------------------------------------------
// CLIENTES
// ----------------------------------------------------
export async function getClients(studioId?: string): Promise<Client[]> {
  const client = checkSupabaseConnected();
  let query = client.from("clients").select("*").order("created_at", { ascending: false });

  if (studioId) {
    query = query.eq("studio_id", studioId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar clientes no Supabase:", error);
    throw new Error(`Erro ao buscar clientes: ${error.message}`);
  }

  return (data || []).map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email || "",
    avatar: c.avatar || "",
    lastVisit: c.created_at ? new Date(c.created_at).toISOString().split("T")[0] : "N/A",
    nextVisit: null,
    totalSpent: Number(c.total_spent || 0),
    visits: Number(c.visits_count || 1),
    tag: (c.tag as "VIP" | "Recorrente" | "Nova") || "Nova",
    notes: c.notes || "",
    history: [],
    gallery: [],
  }));
}

// ----------------------------------------------------
// AGENDAMENTOS
// ----------------------------------------------------
export async function getAppointments(studioId?: string): Promise<Appointment[]> {
  const client = checkSupabaseConnected();
  let query = client
    .from("appointments")
    .select(`
      *,
      services ( name, duration, price ),
      professionals ( name )
    `)
    .order("date", { ascending: true });

  if (studioId) {
    query = query.eq("studio_id", studioId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao buscar agendamentos no Supabase:", error);
    throw new Error(`Erro ao buscar agendamentos: ${error.message}`);
  }

  return (data || []).map((a) => ({
    id: a.id,
    clientId: a.client_id || `c_${a.id}`,
    clientName: a.client_name,
    avatar: "",
    phone: a.client_phone,
    service: a.services?.name || "Serviço",
    professional: a.professionals?.name || "Profissional",
    date: a.date,
    time: a.time,
    duration: a.services?.duration || 60,
    price: Number(a.price || a.services?.price || 0),
    status: a.status as Status,
    payment: "PIX",
    notes: a.notes || "",
  }));
}

export type CreateAppointmentParams = {
  serviceId: string;
  serviceName: string;
  price: number;
  duration: number;
  professionalId: string;
  professionalName: string;
  date: string;
  time: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  notes?: string;
  studioId?: string;
};

const isUUID = (str?: string) =>
  Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

export async function createAppointment(
  params: CreateAppointmentParams,
  initialStatus: string = "confirmado"
): Promise<Appointment> {
  const client = checkSupabaseConnected();
  let targetStudioId = params.studioId;

  if (!targetStudioId) {
    const studioRec = await ensureJuliaGattiStudioInDB();
    targetStudioId = studioRec.id;
  }

  // 1. Criar ou buscar cliente existente por telefone
  let clientId: string | null = null;
  try {
    const { data: existingClients } = await client
      .from("clients")
      .select("id")
      .eq("phone", params.clientPhone)
      .limit(1);

    if (existingClients && existingClients.length > 0) {
      clientId = existingClients[0].id;
    } else {
      const { data: newClient } = await client
        .from("clients")
        .insert([
          {
            name: params.clientName,
            phone: params.clientPhone,
            email: params.clientEmail || null,
            tag: "Nova",
            studio_id: targetStudioId,
          },
        ])
        .select()
        .single();

      if (newClient) clientId = newClient.id;
    }
  } catch (e) {
    console.warn("Aviso ao vincular cliente:", e);
  }

  // 2. Inserir agendamento no Supabase
  const validServiceId = isUUID(params.serviceId) ? params.serviceId : null;
  const validProId = isUUID(params.professionalId) ? params.professionalId : null;

  const { data: appt, error } = await client
    .from("appointments")
    .insert([
      {
        service_id: validServiceId,
        professional_id: validProId,
        client_id: isUUID(clientId ?? "") ? clientId : null,
        client_name: params.clientName,
        client_phone: params.clientPhone,
        client_email: params.clientEmail || null,
        date: params.date,
        time: params.time,
        price: params.price,
        status: initialStatus,
        notes: params.notes || null,
        studio_id: targetStudioId,
      },
    ])
    .select()
    .single();

  if (error || !appt) {
    console.error("Erro no insert do agendamento no Supabase:", error);
    throw new Error(`Erro ao criar agendamento no Supabase: ${error?.message || "Falha ao retornar registro."}`);
  }

  return {
    id: appt.id,
    clientId: clientId || `c_${appt.id}`,
    clientName: params.clientName,
    avatar: "",
    phone: params.clientPhone,
    service: params.serviceName,
    professional: params.professionalName,
    date: params.date,
    time: params.time,
    duration: params.duration,
    price: params.price,
    status: initialStatus as Status,
    payment: "PIX",
    notes: params.notes || "",
  };
}

export async function updateAppointmentStatus(id: string, newStatus: Status): Promise<boolean> {
  const client = checkSupabaseConnected();
  const { error } = await client
    .from("appointments")
    .update({ status: newStatus })
    .eq("id", id);

  if (error) {
    console.error("Erro ao atualizar agendamento no Supabase:", error);
    throw new Error(`Erro ao atualizar status do agendamento: ${error.message}`);
  }
  return true;
}

// ----------------------------------------------------
// CONFIGURAÇÕES DO STUDIO (studio_settings)
// ----------------------------------------------------
export type StudioHour = { day: string; time: string };

export type StudioInfo = {
  studio_name: string;
  tagline: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  address: string;
  maps_url: string;
  cover_url: string;
  logo_url: string;
  rating: string;
  reviews: string;
  hours: StudioHour[];
};

const defaultStudioInfo: StudioInfo = {
  studio_name: "Studio Júlia Gatti",
  tagline: "Extensão de Cílios",
  whatsapp: "(13) 99117-6958",
  instagram: "@studiojuliagatti",
  facebook: "",
  address: "Baixada Santista · São Paulo",
  maps_url: "https://maps.google.com/?q=Studio+Julia+Gatti",
  cover_url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1600&q=75",
  logo_url: "",
  rating: "5.0",
  reviews: "0",
  hours: [
    { day: "Segunda", time: "09:00 – 19:00" },
    { day: "Terça", time: "09:00 – 19:00" },
    { day: "Quarta", time: "09:00 – 20:00" },
    { day: "Quinta", time: "09:00 – 20:00" },
    { day: "Sexta", time: "09:00 – 20:00" },
    { day: "Sábado", time: "09:00 – 16:00" },
    { day: "Domingo", time: "Fechado" },
  ],
};

export async function getStudioSettings(studioId?: string): Promise<StudioInfo> {
  const client = checkSupabaseConnected();
  let query = client.from("studio_settings").select("key, value");

  if (studioId) {
    query = query.eq("studio_id", studioId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Erro ao carregar studio_settings do Supabase:", error);
    throw new Error(`Erro ao buscar configurações: ${error.message}`);
  }

  if (data && data.length > 0) {
    const map: Record<string, string> = {};
    data.forEach((row: { key: string; value: string }) => {
      map[row.key] = row.value;
    });

    return {
      studio_name: map.studio_name || defaultStudioInfo.studio_name,
      tagline: map.tagline || defaultStudioInfo.tagline,
      whatsapp: map.whatsapp || defaultStudioInfo.whatsapp,
      instagram: map.instagram || defaultStudioInfo.instagram,
      facebook: map.facebook || defaultStudioInfo.facebook,
      address: map.address || defaultStudioInfo.address,
      maps_url: map.maps_url || defaultStudioInfo.maps_url,
      cover_url: map.cover_url || defaultStudioInfo.cover_url,
      logo_url: map.logo_url || defaultStudioInfo.logo_url,
      rating: map.rating || defaultStudioInfo.rating,
      reviews: map.reviews || defaultStudioInfo.reviews,
      hours: map.hours ? JSON.parse(map.hours) : defaultStudioInfo.hours,
    };
  }

  return defaultStudioInfo;
}

export async function saveStudioSetting(key: string, value: string, studioId?: string): Promise<void> {
  const client = checkSupabaseConnected();
  const { error } = await client
    .from("studio_settings")
    .upsert({ key, value, studio_id: studioId || null, updated_at: new Date().toISOString() }, { onConflict: "key" });

  if (error) {
    console.error("Erro ao salvar studio_setting no Supabase:", error);
    throw new Error(`Erro ao salvar configuração: ${error.message}`);
  }
}
