# Design System — Amethyst Elite

Tokens e padrões visuais do LiderTraining. Copie deste arquivo ao criar componentes novos; não invente cores nem fontes.

## Objeto de cores padrão (JavaScript)

```javascript
const C = {
  // base
  bg:   "#0e0e10",  // obsidian (fundo principal)
  sf:   "#131315",  // surface (seções)
  cd:   "#1a1a1e",  // card
  ch:   "#2a2a2c",  // chip / input background
  bd:   "#4d435312", // border sutil

  // accents
  ac:   "#c9a0ff",  // ametista (primário)
  ad:   "#9b6fd4",  // ametista dim (hover/secundário)
  pp:   "#270c51",  // ametista profundo (backgrounds de destaque)
  pm:   "#3d2567",  // ametista médio

  // premium / semântica
  gd:   "#f0c75e",  // dourado (conquistas, VIP)
  tl:   "#5ee6d0",  // teal (informação)
  gn:   "#5ef08a",  // verde (sucesso)
  rd:   "#ff6b8a",  // vermelho (erro, urgente)
  or:   "#ffad5e",  // laranja (atenção)

  // texto
  tx:   "#e5e1e4",  // texto primário
  td:   "#9b97a0",  // texto secundário
  tm:   "#6b6670",  // texto mute
};
```

## Fontes

```javascript
const F = {
  serif: "'Georgia', 'Fraunces', 'Playfair Display', serif",
  sans:  "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
};
```

- **Serif** — títulos grandes, números de destaque, `h1`/`h2`, KPIs
- **Sans** — todo o resto (corpo, UI, labels)

## Regras de composição

- **Tonal layering, não borders.** Camadas se destacam por tom (bg → sf → cd → ch), não por bordas visíveis. Quando precisar de borda, use `${C.bd}` ou `${C.ac}22` (22 = alpha baixo).
- **Shadows são raras.** Só use em elementos realmente flutuantes (modais, tooltips).
- **Border-radius padrão:** 12px para cards, 8px para chips, 20px para botões principais.
- **Espaçamento:** múltiplos de 4px. Padding padrão de cards: 16px/20px/24px.
- **Estados hover:** subir 1 tom (ex: `cd` → `ch`) + leve glow com `${C.ac}20`.

## Padrões de componentes

### Card básico

```jsx
<div style={{
  background: C.cd,
  borderRadius: 12,
  padding: 20,
}}>
  {conteúdo}
</div>
```

### Título de seção (eyebrow + título editorial)

```jsx
<div style={{
  fontSize: 10,
  letterSpacing: ".2em",
  color: C.ac,
  textTransform: "uppercase",
  fontWeight: 600,
  marginBottom: 4,
}}>
  categoria
</div>
<h1 style={{
  fontFamily: F.serif,
  fontSize: 28,
  color: C.tx,
  margin: 0,
  fontWeight: 500,
}}>
  Título editorial
</h1>
```

### KPI / número grande

```jsx
<div style={{ fontFamily: F.serif, fontSize: 36, color: C.ac, fontWeight: 500 }}>
  {valor}
</div>
<div style={{ fontSize: 10, color: C.td, textTransform: "uppercase", letterSpacing: ".08em", marginTop: 2 }}>
  {label}
</div>
```

### Botão primário

```jsx
<button style={{
  background: `linear-gradient(135deg, ${C.ac}, ${C.ad})`,
  color: C.bg,
  border: "none",
  borderRadius: 12,
  padding: "14px 20px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: F.sans,
}}>
  Ação primária
</button>
```

### Chip / badge

```jsx
<span style={{
  fontSize: 10,
  padding: "4px 12px",
  borderRadius: 4,
  background: `${C.ac}15`,
  color: C.ac,
  fontWeight: 600,
  letterSpacing: ".05em",
  textTransform: "uppercase",
}}>
  texto
</span>
```

### Barra de progresso

```jsx
<div style={{ height: 4, background: C.ch, borderRadius: 2 }}>
  <div style={{
    height: "100%",
    width: `${percentual}%`,
    background: `linear-gradient(90deg, ${C.ac}, ${C.ac}cc)`,
    borderRadius: 2,
    transition: "width .6s",
  }} />
</div>
```

## Emojis permitidos

Use emojis minimalistas e consistentes. Preferidos:
- ♫ (áudio)
- ▶ (vídeo)
- ◈ (mapa mental)
- ≡ (texto/report)
- ❑ (flashcard)
- ? (quiz)
- ★ (favorito)
- ✓ (concluído)
- ⚠ (atenção)

Evite emojis coloridos excessivos (🎉🔥💪). Mantenha a estética editorial sóbria.
