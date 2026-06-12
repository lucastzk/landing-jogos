"use client";

import type { EditableCheckout } from "@/lib/content-types";
import { Txt, Area, AdminCard, inputCls } from "./fields";
import MediaField from "./MediaField";
import ReaisInput from "./ReaisInput";

type Props = {
  value: EditableCheckout;
  onChange: (v: EditableCheckout) => void;
};

export default function CheckoutEditor({ value, onChange }: Props) {
  const set = (patch: Partial<EditableCheckout>) => onChange({ ...value, ...patch });
  const setProduct = (patch: Partial<EditableCheckout["product"]>) =>
    onChange({ ...value, product: { ...value.product, ...patch } });
  const setBump = (patch: Partial<EditableCheckout["orderBump"]>) =>
    onChange({ ...value, orderBump: { ...value.orderBump, ...patch } });
  const setMethods = (patch: Partial<EditableCheckout["methods"]>) =>
    onChange({ ...value, methods: { ...value.methods, ...patch } });

  return (
    <div className="grid gap-4">
      {/* Marca + logo */}
      <AdminCard title="Marca & logo">
        <Txt label="Nome da marca" value={value.brandName} onChange={(v) => set({ brandName: v })} />
        <MediaField
          label="Logo (topo do checkout)"
          value={value.logoImage}
          onChange={(url) => set({ logoImage: url })}
          hint="PNG transparente recomendado. Vazio = mostra o nome da marca."
        />
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-bone/50">Tamanho da logo — {value.logoHeight}px</span>
          <input
            type="range"
            min={24}
            max={200}
            step={2}
            value={value.logoHeight}
            onChange={(e) => set({ logoHeight: Number(e.target.value) })}
            className="w-full accent-red-500"
          />
        </label>
      </AdminCard>

      {/* Produto */}
      <AdminCard title="Produto">
        <Txt label="Nome do produto" value={value.product.name} onChange={(v) => setProduct({ name: v })} />
        <Txt label="Descrição curta" value={value.product.description} onChange={(v) => setProduct({ description: v })} />
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-bone/50">Preço</span>
          <ReaisInput cents={value.product.priceInCents} onChange={(c) => setProduct({ priceInCents: c })} />
        </label>
        <MediaField label="Imagem do produto" value={value.product.image} onChange={(url) => setProduct({ image: url })} />
      </AdminCard>

      {/* Order bump */}
      <AdminCard title="Order bump (oferta extra)">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value.orderBump.enabled}
            onChange={(e) => setBump({ enabled: e.target.checked })}
            className="h-4 w-4 accent-red-500"
          />
          <span className="text-sm text-bone">Ativar order bump (1 clique antes de pagar)</span>
        </label>
        {value.orderBump.enabled && (
          <>
            <Txt label="Título" value={value.orderBump.title} onChange={(v) => setBump({ title: v })} />
            <Area label="Descrição" value={value.orderBump.description} onChange={(v) => setBump({ description: v })} rows={2} />
            <MediaField
              label="Imagem do order bump (opcional)"
              value={value.orderBump.image}
              onChange={(url) => setBump({ image: url })}
              hint="Aparece como miniatura ao lado da oferta. Vazio = sem imagem."
            />
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-bone/50">De (riscado, opcional)</span>
                <ReaisInput cents={value.orderBump.fromInCents} onChange={(c) => setBump({ fromInCents: c })} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-bone/50">Por</span>
                <ReaisInput cents={value.orderBump.priceInCents} onChange={(c) => setBump({ priceInCents: c })} />
              </label>
            </div>
          </>
        )}
      </AdminCard>

      {/* Pagamento */}
      <AdminCard title="Pagamento">
        <div className="flex flex-wrap gap-5">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value.methods.pix}
              onChange={(e) => setMethods({ pix: e.target.checked })}
              className="h-4 w-4 accent-red-500"
            />
            <span className="text-sm text-bone">PIX</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={value.methods.card}
              onChange={(e) => setMethods({ card: e.target.checked })}
              className="h-4 w-4 accent-red-500"
            />
            <span className="text-sm text-bone">Cartão</span>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-bone/50">Parcelas máx.</span>
            <input
              type="number"
              min={1}
              max={24}
              value={value.maxInstallments}
              onChange={(e) => set({ maxInstallments: Number(e.target.value) })}
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-bone/50">Garantia (dias)</span>
            <input
              type="number"
              min={0}
              value={value.guaranteeDays}
              onChange={(e) => set({ guaranteeDays: Number(e.target.value) })}
              className={inputCls}
            />
          </label>
        </div>
        <Txt label="Texto de segurança" value={value.securityText} onChange={(v) => set({ securityText: v })} />
        <Txt label="E-mail de suporte" value={value.supportEmail} onChange={(v) => set({ supportEmail: v })} />
      </AdminCard>
    </div>
  );
}
