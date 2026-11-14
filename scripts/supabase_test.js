// Supabase full demo
// Loads config from .env (fallback to hard‑coded values)
import 'dotenv/config';
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://snsumkrntsnphljuembj.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "sb_publishable_fr9WCBHQlu6BPKV_p6jpJg_CRpT8jEn";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  try {
    // Attempt to fetch a single row from a public table (replace 'public_items' with a table you create)
    const { data, error } = await supabase.from('public_items').select('*', { count: 'exact', head: true }).limit(1);
    if (error) {
      console.error('Connection test error (expected if table does not exist yet):', error.message);
    } else {
      console.log('✅ Supabase client connected – sample query succeeded.');
    }
  } catch (e) {
    console.error('❌ Unexpected error during connection test:', e);
  }
}


// ------------
// Example 1: fetch rows from a public table
// -------------------------------------------------
async function fetchExample() {
  // 👉 Replace 'public_items' with the name of a table you created in Supabase
  const { data, error } = await supabase.from("public_items").select("*");
  if (error) {
    console.error("Fetch error:", error.message);
  } else {
    console.log("📦 Fetched rows from public_items:", data);
  }
}

// ------------
// Example 2: Auth (sign‑up / sign‑in)
// -------------------------------------------------
async function authExample() {
  const email = "demo@example.com";
  const password = "demo1234";

  // Sign‑up (idempotent – will error if user already exists)
  const { data: signUp, error: signUpErr } = await supabase.auth.signUp({
    email,
    password,
  });
  if (signUpErr && signUpErr.message !== "User already registered") {
    console.error("Sign‑up error:", signUpErr.message);
    return;
  }
  console.log("✅ Sign‑up successful (or already existed).");

  // Sign‑in
  const { data: signIn, error: signInErr } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (signInErr) {
    console.error("Sign‑in error:", signInErr.message);
    return;
  }
  console.log("🔐 Signed in, session access token:", signIn.session?.access_token?.slice(0, 10) + "...");
}

// ------------
// Example 3: Realtime subscription
// -------------------------------------------------
function realtimeExample() {
  // Listen for INSERTs on the same public table used above
  const subscription = supabase
    .channel("public_items")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "public_items" },
      (payload) => {
        console.log("🔔 New row inserted:", payload.new);
      }
    )
    .subscribe();

  // Auto‑unsubscribe after 30 seconds (demo cleanup)
  setTimeout(() => {
    supabase.removeChannel(subscription);
    console.log("🛑 Realtime subscription removed.");
  }, 30_000);
}

// ------------
// Example 4: Storage upload
// -------------------------------------------------
async function storageExample() {
  // This demo uploads a small text file that we create on‑the‑fly.
  const fileName = "demo.txt";
  const fileContent = new Blob(["Hello from Supabase!"], { type: "text/plain" });

  const { data, error } = await supabase.storage.from("public").upload(fileName, fileContent);
  if (error) {
    console.error("Storage upload error:", error.message);
  } else {
    console.log(`🗄️ Uploaded ${fileName} – path: ${data.path}`);
  }
}

// ------------
// Example 5: Edge Function invoke
// -------------------------------------------------
async function edgeFunctionExample() {
  // Ensure you have an Edge Function named "hello" deployed in Supabase.
  const { data, error } = await supabase.functions.invoke("hello", {
    body: { greeting: "hi" },
  });
  if (error) {
    console.error("Edge function error:", error.message);
  } else {
    console.log("🚀 Edge function response:", data);
  }
}

// -------------------------------------------------
// Run the demos (uncomment the ones you want)
// -------------------------------------------------
await testConnection();
// await fetchExample();
// await authExample();
// realtimeExample();   // runs in background for 30 s
// await storageExample();
// await edgeFunctionExample();
