import { supabase, isSupabaseConfigured } from "./supabase";
import {
  services as initialServices,
  professionals as initialProfessionals,
  clients as initialClients,
  appointments as initialAppointments,
  type Service,
  type Professional,
  type Client,
  type Appointment,
  type Status,
} from "./mock-data";

// Fallback in-memory storage (com persistência no localStorage para testes sem backend)
const STORAGE_KEYS = {
  SERVICES: "lumiere_services",
  PROFESSIONALS: "lumiere_professionals",
  CLIENTS: "lumiere_clients",
  APPOINTMENTS: "lumiere_appointments",
};

function getLocalData<T>(key: string, defaultData: T): T {
  if (typeof window === "undefined") return defaultData;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultData;
  } catch {
    return defaultData;
  }
}

function setLocalData<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Erro ao salvar no localStorage", e);
  }
}

// ----------------------------------------------------
// SERVIÇOS
// ----------------------------------------------------
export async function getServices(): Promise<Service[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("services").select("*").eq("active", true);
    if (!error && data) {
      return data.map((s) => ({
        id: s.id,
        name: s.name,
        price: Number(s.price),
        duration: Number(s.duration),
        color: s.color || "var(--gold)",
        description: s.description || "",
      }));
    }
    return []; // Supabase configurado mas erro na query → vazio
  }
  // Só usa mock quando Supabase NÃO está configurado (dev local sem banco)
  return getLocalData<Service[]>(STORAGE_KEYS.SERVICES, initialServices);
}

export async function createService(serviceData: Omit<Service, "id">): Promise<Service> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("services")
      .insert([serviceData])
      .select()
      .single();
    if (!error && data) {
      return {
        id: data.id,
        name: data.name,
        price: Number(data.price),
        duration: Number(data.duration),
        color: data.color,
        description: data.description,
      };
    }
  }

  const current = getLocalData<Service[]>(STORAGE_KEYS.SERVICES, initialServices);
  const newService: Service = {
    ...serviceData,
    id: `s_${Date.now()}`,
  };
  const updated = [newService, ...current];
  setLocalData(STORAGE_KEYS.SERVICES, updated);
  return newService;
}

// ----------------------------------------------------
// PROFISSIONAIS
// ----------------------------------------------------
export async function getProfessionals(): Promise<Professional[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("professionals").select("*").eq("active", true).order("created_at", { ascending: true });
    if (!error && data) {
      return data.map((p) => ({
        id: p.id,
        name: p.name,
        role: p.role,
        avatar: p.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80",
        rating: Number(p.rating),
      }));
    }
    return [];
  }
  return getLocalData<Professional[]>(STORAGE_KEYS.PROFESSIONALS, initialProfessionals);
}

export async function createProfessional(params: Omit<Professional, "id">): Promise<Professional> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("professionals")
      .insert([
        {
          name: params.name,
          role: params.role,
          avatar: params.avatar || null,
          rating: params.rating || 5.0,
          active: true,
        },
      ])
      .select()
      .single();

    if (!error && data) {
      return {
        id: data.id,
        name: data.name,
        role: data.role,
        avatar: data.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80",
        rating: Number(data.rating),
      };
    }
  }

  const current = getLocalData<Professional[]>(STORAGE_KEYS.PROFESSIONALS, initialProfessionals);
  const newPro: Professional = {
    ...params,
    id: `p_${Date.now()}`,
  };
  setLocalData(STORAGE_KEYS.PROFESSIONALS, [newPro, ...current]);
  return newPro;
}

export async function updateProfessional(id: string, params: Partial<Professional>): Promise<boolean> {
  if (isSupabaseConfigured && supabase && !id.startsWith("p_")) {
    const { error } = await supabase
      .from("professionals")
      .update({
        ...(params.name && { name: params.name }),
        ...(params.role && { role: params.role }),
        ...(params.avatar !== undefined && { avatar: params.avatar }),
        ...(params.rating !== undefined && { rating: params.rating }),
      })
      .eq("id", id);
    if (!error) return true;
  }

  const current = getLocalData<Professional[]>(STORAGE_KEYS.PROFESSIONALS, initialProfessionals);
  const updated = current.map((p) => (p.id === id ? { ...p, ...params } : p));
  setLocalData(STORAGE_KEYS.PROFESSIONALS, updated);
  return true;
}

export async function deleteProfessional(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase && !id.startsWith("p_")) {
    const { error } = await supabase.from("professionals").delete().eq("id", id);
    if (!error) return true;
  }

  const current = getLocalData<Professional[]>(STORAGE_KEYS.PROFESSIONALS, initialProfessionals);
  const updated = current.filter((p) => p.id !== id);
  setLocalData(STORAGE_KEYS.PROFESSIONALS, updated);
  return true;
}

// ----------------------------------------------------
// CLIENTES
// ----------------------------------------------------
export async function getClients(): Promise<Client[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
    if (!error && data) {
      return data.map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email || "",
        avatar: c.avatar || "https://i.pravatar.cc/160",
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
    return [];
  }
  return getLocalData<Client[]>(STORAGE_KEYS.CLIENTS, initialClients);
}

// ----------------------------------------------------
// AGENDAMENTOS
// ----------------------------------------------------
export async function getAppointments(): Promise<Appointment[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        *,
        services ( name, duration, price ),
        professionals ( name )
      `)
      .order("date", { ascending: true });

    if (!error && data) {
      return data.map((a) => ({
        id: a.id,
        clientId: a.client_id || `c_${a.id}`,
        clientName: a.client_name,
        avatar: "https://i.pravatar.cc/160",
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
    return [];
  }
  return getLocalData<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, initialAppointments);
}

export type CreateAppointmentParams = {
  serviceId: string;
  serviceName: string;
  price: number;
  duration: number;
  professionalId: string;
  professionalName: string;
  date: string; // YYYY-MM-DD
  time: string; // "09:00"
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  notes?: string;
};

const isUUID = (str?: string) =>
  Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

export async function createAppointment(params: CreateAppointmentParams): Promise<Appointment> {
  if (isSupabaseConfigured && supabase) {
    // 1. Criar ou buscar cliente
    let clientId: string | null = null;
    try {
      const { data: existingClients } = await supabase
        .from("clients")
        .select("id")
        .eq("phone", params.clientPhone)
        .limit(1);

      if (existingClients && existingClients.length > 0) {
        clientId = existingClients[0].id;
      } else {
        const { data: newClient } = await supabase
          .from("clients")
          .insert([
            {
              name: params.clientName,
              phone: params.clientPhone,
              email: params.clientEmail || null,
              tag: "Nova",
            },
          ])
          .select()
          .single();

        if (newClient) clientId = newClient.id;
      }
    } catch (e) {
      console.warn("Aviso ao vincular cliente:", e);
    }

    // 2. Inserir agendamento garantindo UUIDs válidos ou null
    const validServiceId = isUUID(params.serviceId) ? params.serviceId : null;
    const validProId = isUUID(params.professionalId) ? params.professionalId : null;

    const { data: appt, error } = await supabase
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
          status: "confirmado",
          notes: params.notes || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Erro no insert do agendamento no Supabase:", error);
    }

    if (!error && appt) {
      return {
        id: appt.id,
        clientId: clientId || `c_${appt.id}`,
        clientName: params.clientName,
        avatar: "https://i.pravatar.cc/160",
        phone: params.clientPhone,
        service: params.serviceName,
        professional: params.professionalName,
        date: params.date,
        time: params.time,
        duration: params.duration,
        price: params.price,
        status: "confirmado",
        payment: "PIX",
        notes: params.notes || "",
      };
    }
  }

  // Fallback Local Storage
  const currentAppts = getLocalData<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, initialAppointments);
  const newAppt: Appointment = {
    id: `a_${Date.now()}`,
    clientId: `c_${Date.now()}`,
    clientName: params.clientName,
    avatar: `https://i.pravatar.cc/160?img=${Math.floor(Math.random() * 50)}`,
    phone: params.clientPhone,
    service: params.serviceName,
    professional: params.professionalName,
    date: params.date,
    time: params.time,
    duration: params.duration,
    price: params.price,
    status: "confirmado",
    payment: "PIX",
    notes: params.notes || "",
  };

  const updatedAppts = [newAppt, ...currentAppts];
  setLocalData(STORAGE_KEYS.APPOINTMENTS, updatedAppts);

  // Também criar/atualizar cliente no localStorage
  const currentClients = getLocalData<Client[]>(STORAGE_KEYS.CLIENTS, initialClients);
  if (!currentClients.some((c) => c.phone === params.clientPhone)) {
    const newClient: Client = {
      id: newAppt.clientId,
      name: params.clientName,
      phone: params.clientPhone,
      email: params.clientEmail || "",
      avatar: newAppt.avatar,
      lastVisit: params.date,
      nextVisit: params.date,
      totalSpent: params.price,
      visits: 1,
      tag: "Nova",
      notes: params.notes || "",
      history: [{ date: params.date, service: params.serviceName, value: params.price, pro: params.professionalName }],
      gallery: [],
    };
    setLocalData(STORAGE_KEYS.CLIENTS, [newClient, ...currentClients]);
  }

  return newAppt;
}

export async function updateAppointmentStatus(id: string, newStatus: Status): Promise<boolean> {
  if (isSupabaseConfigured && supabase && !id.startsWith("a_")) {
    const { error } = await supabase
      .from("appointments")
      .update({ status: newStatus })
      .eq("id", id);
    if (!error) return true;
  }

  const currentAppts = getLocalData<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, initialAppointments);
  const updatedAppts = currentAppts.map((a) => (a.id === id ? { ...a, status: newStatus } : a));
  setLocalData(STORAGE_KEYS.APPOINTMENTS, updatedAppts);
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

export async function getStudioSettings(): Promise<StudioInfo> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("studio_settings").select("key, value");
    if (!error && data && data.length > 0) {
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
  }
  return defaultStudioInfo;
}

export async function saveStudioSetting(key: string, value: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    await supabase
      .from("studio_settings")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  }
}

