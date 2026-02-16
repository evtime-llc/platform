// Supabase configuration for EVTime
window.SUPABASE_URL = "https://tgkvhmxrftcegpryptwq.supabase.co";
window.SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRna3ZobXhyZnRjZWdwcnlwdHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MDg3MDYsImV4cCI6MjA3NDA4NDcwNn0.3ahUcRJjrd3WoMsKDoaYXjcbM2UoltAZbQz7nVSqliQ";

// Single shared Supabase client — all pages use this
function getSb() {
  if (window._sbClient) return window._sbClient;
  if (window.supabase && window.supabase.createClient && window.SUPABASE_ANON_KEY) {
    window._sbClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    return window._sbClient;
  }
  return null;
}
