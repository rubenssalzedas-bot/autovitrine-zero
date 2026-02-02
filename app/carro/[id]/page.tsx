"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";

export default function CarroPage() {
  const params = useParams();
  const id = params.id as string;

  const [carro, setCarro] = useState<any>(null);

  useEffect(() => {
    if (!id) return;

    async function carregar() {
      const { data } = await supabase
        .from("veiculos")
        .select("*")
        .eq("id", id)
        .single();

      setCarro(data);
    }

    carregar();
  }, [id]);

  function baixarPDF() {
    const pdf = new jsPDF();

    pdf.setFontSize(18);
    pdf.text(carro.modelo, 20, 20);

    pdf.setFontSize(12);
    pdf.text(`Ano: ${carro.ano}`, 20, 35);
    pdf.text(`Preço: ${carro.preco}`, 20, 45);

    const canvas = document.querySelector("canvas") as HTMLCanvasElement;
    const imgData = canvas.toDataURL("image/png");

    pdf.addImage(imgData, "PNG", 20, 60, 120, 120);
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

      {carro.km && <p><strong>KM:</strong> {carro.km}</p>}
      {carro.cambio && <p><strong>Câmbio:</strong> {carro.cambio}</p>}
      {carro.combustivel && (
        <p><strong>Combustível:</strong> {carro.combustivel}</p>
      )}

      {carro.observacoes && (
        <>
          <hr />
          <p><strong>Observações:</strong></p>
          <p>{carro.observacoes}</p>
        </>
      )}

      <hr style={{ margin: "30px 0" }} />

      <div style={{ textAlign: "center" }}>
        <QRCodeCanvas
          value={`${baseUrl}/carro/${id}`}
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
