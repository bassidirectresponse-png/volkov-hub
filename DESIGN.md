# Volkov Hub — Sistema Visual

## Contexto visual

Sala de operação à meia-luz, com superfícies de grafite, informação precisa e o vermelho Volkov usado como um sinal de decisão. A estratégia é **restrained**: quase toda a interface é neutra; cor intensa aparece apenas para ação, atenção e estado.

## Tokens

```css
:root {
  --background: oklch(0.105 0.008 20);
  --surface: oklch(0.145 0.009 20);
  --surface-raised: oklch(0.18 0.01 20);
  --ink: oklch(0.95 0.005 20);
  --muted: oklch(0.68 0.012 20);
  --primary: oklch(0.55 0.18 20);
  --primary-hover: oklch(0.50 0.18 20);
  --accent: oklch(0.78 0.13 80);
  --success: oklch(0.72 0.15 150);
  --warning: oklch(0.78 0.15 80);
  --danger: oklch(0.61 0.20 25);
}
```

## Tipografia e componentes

- Inter como família única, de 12px a 32px em escala compacta.
- Raio de 10–14px para superfícies e 8px para controles.
- Painéis com borda sutil; sombras apenas em menus sobrepostos.
- Barra lateral estável, cabeçalho operacional e tabelas densas.
- Todos os estados de dados mostram um próximo passo claro.
