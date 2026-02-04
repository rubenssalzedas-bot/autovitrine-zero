"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LojaPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [loja, setLoja] = useState<any>(null);
  const [veiculos, setVeiculos] = useState<any[]>([]);

  useEffect(() => {
    if (!slug) return;

    async function carregar() {
      // Buscar dados da loja
      const { data: lojaData } = await supabase
        .from("lojas")
        .select("*")
        .eq("slug", slug)
        .single();

      setLoja(lojaData);

      // Buscar veículos da loja
      const { data: veiculosData } = await supabase
        .from("veiculos")
        .select("*")
        .eq("loja_slug", slug);

      setVeiculos(veiculosData || []);
    }

    carregar();
  }, [slug]);

  if (!loja) {
    return <p style={{ padding: 40 }}>Carregando loja...</p>;
  }

  return (
    <main style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      {/* CABEÇALHO DA LOJA */}
      <div
        style={{
          background: loja.cor || "#294460",
          color: "#fff",
          padding: 20,
          borderRadius: 8,
          marginBottom: 30
        }}
      >
        <h1>{loja.nome}</h1>
      </div>

      {/* LISTA DE VEÍCULOS */}
      <h2>Veículos disponíveis</h2>

      {veiculos.length === 0 && <p>Nenhum veículo cadastrado.</p>}

      <div style={{ display: "grid", gap: 16 }}>
        {veiculos.map((veiculo) => (
          <div
            key={veiculo.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 16
            }}
          >
            <h3>{veiculo.modelo}</h3>
            <p>
              {veiculo.ano} • {veiculo.preco}
            </p>

            {/* LINK CORRETO COM SLUG DA LOJA */}
            <Link
              href={`/carro/${veiculo.id}?loja=${slug}`}
              style={{
                color: "#294460",
                fontWeight: "bold",
                textDecoration: "none"
              }}
            >
              Ver detalhes →
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
