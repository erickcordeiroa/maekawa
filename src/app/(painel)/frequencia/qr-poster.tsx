"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/brand/logo"

/** SVG gerado no servidor pela lib qrcode (conteúdo confiável) */
export function QrImage({ svg, size }: { svg: string; size: number }) {
  return <div role="img" aria-label="QR code do check-in" style={{ width: size, height: size }} className="[&>svg]:block [&>svg]:size-full" dangerouslySetInnerHTML={{ __html: svg }} />
}

export function QrPosterButton({ svg }: { svg: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>Ver cartaz do QR</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showCloseButton={false} aria-describedby={undefined} className="max-w-[440px] items-center bg-transparent p-0">
          <div className="flex w-full flex-col items-center gap-[18px] rounded-sm border-[10px] border-gold bg-ink px-7 pt-7 pb-[22px] text-center text-white">
            <Logo size={90} alt="Logo" />
            <DialogTitle className="text-[38px] leading-none font-bold text-gold">Faça seu check-in</DialogTitle>
            <p>Aponte a câmera do celular para o código</p>
            <div className="rounded-xl bg-white p-3">
              <QrImage svg={svg} size={220} />
            </div>
            <ol className="m-0 grid w-full list-none grid-cols-3 gap-2.5 p-0 text-[13px]">
              {["Escaneie o QR code", "Digite seu telefone", "Confirme e bom treino!"].map((t, i) => (
                <li key={t} className="flex flex-col items-center gap-1.5">
                  <span className="display flex size-[30px] items-center justify-center rounded-full bg-gold text-ink">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ol>
            <p className="display text-sm tracking-[5px] text-gold">Brazilian Jiu-Jitsu · Oss!</p>
          </div>
          <div className="flex gap-2.5">
            <Button onClick={() => window.print()} variant="outline">Imprimir</Button>
            <Button onClick={() => setOpen(false)}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
