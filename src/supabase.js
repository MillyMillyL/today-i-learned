import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://cirkbptxbjsdekfwntpv.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpcmticHR4YmpzZGVrZndudHB2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzEwNTQ1OTcsImV4cCI6MTk4NjYzMDU5N30.VjMhMY6VQ1nnzllVtJfhOfAU9YIb5gTsMq6avH7h2cs";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
