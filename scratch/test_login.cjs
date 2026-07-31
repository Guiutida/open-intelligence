const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "http://supabasekong-rv93xpagkalw8uuvaiimbnle.147.15.86.4.sslip.io";
const supabaseAnonKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4NTQzMTgyMCwiZXhwIjo0OTQxMTA1NDIwLCJyb2xlIjoiYW5vbiJ9.RFNccUj7-CPmrb1J82gdBsb-NhgLFUNQ2tuDLgeVcms";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "julia@juliagatti.com.br",
    password: "JuliaGatti2026!",
  });

  if (error) {
    console.error("Login erro:", error.message);
  } else {
    console.log("Login SUCESSO!", data.user.email);
  }
}

testLogin();
