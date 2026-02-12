"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";

export default function CarroPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const id = params.id as string;
  const slugLoja = searchParams.get("loja");

  const [carro, setCarro] = useState<any>(null);
  const [whatsappLoja, setWhatsappLoja] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function carregar() {
      // Buscar veículo
      const { data: veiculo } = await supabase
        .from("veiculos")
        .select("*")
        .eq("id", id)
        .single();

      setCarro(veiculo);

      // Buscar WhatsApp da loja
      if (slugLoja) {
        const { data: loja } = await supabase
          .from("lojas")
          .select("whatsapp")
          .eq("slug", slugLoja)
          .single();

        setWhatsappLoja(loja?.whatsapp || null);
      }
    }

    carregar();
  }, [id, slugLoja]);

  function baixarPDF() {
    if (!carro) return;

    const pdf = new jsPDF();

    pdf.setFontSize(18);
    pdf.text(carro.modelo, 20, 20);

    pdf.setFontSize(12);
    pdf.text(`Ano: ${carro.ano}`, 20, 35);

    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    if (canvas) {
      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 20, 55, 120, 120);
    }

    pdf.text("Escaneie o QR Code para ver este veículo", 20, 190);
    pdf.save(`qr-${carro.modelo}.pdf`);
  }

  if (!carro) {
    return <p style={{ padding: 40 }}>Carregando...</p>;
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return (
    <main style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <h1>{carro.modelo}</h1>

      <p><strong>Ano:</strong> {carro.ano}</p>
      <p><strong>Preço:</strong> {carro.preco}</p>

      {/* ===== DADOS ESPECÍFICOS ===== */}

      {carro.tipo === "carro" && (
        <>
          {carro.km && <p><strong>KM:</strong> {carro.km}</p>}
          {carro.cambio && <p><strong>Câmbio:</strong> {carro.cambio}</p>}
          {carro.combustivel && (
            <p><strong>Combustível:</strong> {carro.combustivel}</p>
          )}
        </>
      )}

      {carro.tipo === "moto" && (
        <>
          {carro.cilindrada && (
            <p><strong>Cilindrada:</strong> {carro.cilindrada}</p>
          )}
          {carro.partida && (
            <p><strong>Partida:</strong> {carro.partida}</p>
          )}
          {carro.freio && (
            <p><strong>Freio:</strong> {carro.freio}</p>
          )}
        </>
      )}

      {/* ===== OBSERVAÇÕES ===== */}
      {carro.observacoes && (
       <>
    <hr />
    <p><strong>Observações:</strong></p>
    <ul style={{ paddingLeft: 20 }}>
      {carro.observacoes
        .split("\n")
        .filter((item: string) => item.trim() !== "")
        .map((item: string, index: number) => (
          <li key={index} style={{ marginBottom: 6 }}>
            {item}
          </li>
        ))}
    </ul>
  </>
      )}

      {/* ===== WHATSAPP ===== */}
      {whatsappLoja && (
        <a
          href={`https://wa.me/${whatsappLoja}?text=Olá! Tenho interesse no ${carro.modelo} ${carro.ano}.`}
          target="_blank"
          style={{
            display: "block",
            marginTop: 25,
            background: "#25D366",
            color: "#fff",
            padding: "14px",
            borderRadius: 8,
            textAlign: "center",
            fontWeight: "bold",
            textDecoration: "none"
          }}
        >
          Falar no WhatsApp
        </a>
      )}

      <hr style={{ margin: "30px 0" }} />

      {/* ===== QR CODE ===== */}
      <div style={{ textAlign: "center" }}>
        <QRCodeCanvas
          value={`${baseUrl}/carro/${id}?loja=${slugLoja}`}
          size={220}
        />

        <br /><br />

        <button
          onClick={baixarPDF}
          style={{
            background: "#294460",
            color: "#fff",
            border: "none",
            padding: "14px 20px",
            borderRadius: 8,
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Baixar QR Code em PDF
        </button>
      </div>
    </main>
  );
}
