"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PainelPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    async function verificar() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/painel/login");
        return;
      }

      setEmail(data.user.email || null);
    }

    verificar();
  }, [router]);

  if (!email) {
    return <p style={{ padding: 40 }}>Carregando painel...</p>;
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Painel carregou corretamente ✅</h1>
      <p>Usuário logado: {email}</p>
    </main>
  );
}
