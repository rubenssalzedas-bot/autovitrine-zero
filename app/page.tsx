import { supabase } from "@/lib/supabase";

export default async function Home() {

  const { data, error } = await supabase
    .from("lojas")
    .select("*");

  console.log(data);

  return (
    <main style={{ padding: 40 }}>
      <h1>Supabase conectado</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
