import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function LojaPage({ params }: any) {

  const { slug } = await params;

  // BUSCAR LOJA
  const { data: loja } = await supabase
    .from("lojas")
    .select("*")
    .ilike("slug", `%${slug.trim()}%`)
    .single();

  if (!loja) {
    return <h1 style={{ padding: 40 }}>Loja não encontrada</h1>;
  }

  const corLoja = loja.cor?.trim() || "#294460";

  // 🚀 BUSCAR VEÍCULOS DA LOJA
  const { data: veiculos } = await supabase
    .from("veiculos")
    .select("*")
    .ilike("loja_slug", `%${slug.trim()}%`);

  return (
    <main>

      {/* BARRA SUPERIOR */}
      <div style={{
        background: corLoja,
        color: "#fff",
        padding: 20
      }}>
        <h1>{loja.nome?.trim()}</h1>
      </div>

      {/* CONTEÚDO */}
      <div style={{ padding: 20 }}>

        <a
          href={`https://wa.me/${loja.whatsapp?.trim()}`}
          target="_blank"
          style={{
            background: corLoja,
            color: "#fff",
            padding: "14px 20px",
            borderRadius: 10,
            display: "inline-block",
            fontWeight: "bold"
          }}
        >
          Falar no WhatsApp
        </a>

        {/* LISTA VEÍCULOS */}
        <h2 style={{ marginTop: 30 }}>Estoque disponível</h2>

        {!veiculos || veiculos.length === 0 && (
          <p>Nenhum veículo cadastrado.</p>
        )}

        {veiculos?.map((carro: any) => (
          <div
            key={carro.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 10,
              padding: 20,
              marginTop: 15
            }}
          >
            <h3>{carro.modelo}</h3>

            <p>
              {carro.ano} • {carro.preco}
            </p>

            <Link href={`/carro/${carro.id}`}>
              Ver detalhes →
            </Link>

          </div>
        ))}

      </div>

    </main>
  );
}
