const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "http://supabasekong-rv93xpagkalw8uuvaiimbnle.147.15.86.4.sslip.io";
const supabaseAnonKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4NTQzMTgyMCwiZXhwIjo0OTQxMTA1NDIwLCJyb2xlIjoiYW5vbiJ9.RFNccUj7-CPmrb1J82gdBsb-NhgLFUNQ2tuDLgeVcms";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function registerJulia() {
  console.log("Tentando cadastrar/confirmar a conta da Julia Gatti no Supabase...");
  
  const email = "julia@juliagatti.com.br";
  const password = "JuliaGatti2026!";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: "Júlia Gatti",
        role: "admin",
      },
    },
  });

  if (error) {
    console.error("Erro no signUp:", error.message);
  } else {
    console.log("Resultado do signUp:", JSON.stringify(data, null, 2));
  }
}

registerJulia();
