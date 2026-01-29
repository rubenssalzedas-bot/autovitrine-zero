"use client";

"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { carros } from "../data/carros";
import { lojas } from "../../loja/data/lojas";


export default function CarroPage() {
  const pathname = usePathname();

  // Ex: /carro/civic-2019
  const id = pathname.split("/").pop() || "";

  const carro = carros[id as keyof typeof carros];
  const urlDoCarro = `http://localhost:3000/carro/${id}`;
  const searchParams = useSearchParams();
  const slugLoja = searchParams.get("loja") || "";

  const lojaAtual = lojas[slugLoja];
  const whatsappLoja = lojaAtual?.whatsapp || "5511999999999";



  if (!id) {
    return <h1>ID não encontrado na URL</h1>;
  }

  if (!carro) {
    return <h1>Carro não encontrado</h1>;
  }

  return (
    <main style={{ padding: 40, maxWidth: 600 }}>
      <h1>{carro.modelo}</h1>

{carro.tipo === "carro" && (
  <>
      <p><strong>Ano:</strong> {carro.ano}</p>
      <p><strong>Preço:</strong> {carro.preco}</p>
      <p><strong>KM:</strong> {carro.km}</p>
      <p><strong>Câmbio:</strong> {carro.cambio}</p>
      <p><strong>Combustível:</strong> {carro.combustivel}</p>
    </>
)}

      {carro.tipo === "moto" && (
  <>

    <p><strong>Cilindrada:</strong> {carro.cilindrada}</p>
    <p><strong>Partida:</strong> {carro.partida}</p>
    <p><strong>Freio:</strong> {carro.freio}</p>
  </>
)}

      {carro.observacoes && carro.observacoes.length > 0 && (
  <div style={{ marginTop: 20 }}>
    <h3>Observações</h3>
    <ul>
      {carro.observacoes.map((obs, index) => (
        <li key={index}>{obs}</li>
      ))}
    </ul>
  </div>
)}


      <a
          href={`https://wa.me/${whatsappLoja}?text=Olá! Tenho interesse no ${carro.modelo} ${carro.ano}.`}
        target="_blank"
        style={{
          display: "inline-block",
          marginTop: 20,
          padding: "12px 20px",
          backgroundColor: "#25D366",
          color: "#fff",
          textDecoration: "none",
          borderRadius: 6,
        }}
      >
        Falar no WhatsApp
        <div style={{ marginTop: 30 }}>
  <p><strong>Escaneie para ver no celular:</strong></p>

  <img
    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      urlDoCarro
    )}`}
    alt="QR Code do veículo"
  />
</div>

      </a>
    </main>
  );
}
