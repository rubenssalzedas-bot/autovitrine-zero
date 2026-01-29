"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { carros } from "../../carro/data/carros";
import { useSearchParams } from "next/navigation";
import { lojas } from "../../loja/data/lojas";


export default function LojaPage() {
  const pathname = usePathname();
  const slug = pathname.split("/").pop() || "";

  const loja = lojas[slug];
  const searchParams = useSearchParams();
  const slugLoja = searchParams.get("loja") || "";
  const lojaAtual = lojas[slugLoja];
  const whatsappLoja = lojaAtual?.whatsapp || "5511999999999";




  if (!loja) {
    return <h1>Loja não encontrada</h1>;
  }

  return (
    <div className="container">
      <h1>{loja.nome}</h1>
      <p>Estoque disponível</p>

      {loja.carros.map((id) => {
        const carro = carros[id];
        if (!carro) return null;

        return (
          <div key={id} className="card">
            <h2>{carro.modelo}</h2>
            <p>
              {carro.ano} • {carro.preco}
            </p>

            <Link href={`/carro/${id}?loja=${slug}`}>Ver detalhes →</Link>

          </div>
        );
      })}
    </div>
  );
}
