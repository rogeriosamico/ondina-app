# Claude Design Guide — Ondina

> Guia operacional para geração de telas com Claude Design.
> Contém os valores concretos de tokens, padrões de código e regras de composição extraídos diretamente do codebase.
> Em caso de conflito com este arquivo, o codebase e o DesignSystem (`/design-system`) prevalecem.

---

## 1. Stack e contexto

- **React + Vite + Tailwind + shadcn/ui**
- **Fonte:** Space Grotesk (400 e 700), importada via Google Fonts
- **Layout:** mobile-first, centralizado — `maxWidth: 680px`, `margin: 0 auto`
- **Padding de página:** `padding: "40px 16px 80px"` (HomeScreen) / `padding: "0 0 80px"` (BeachPage, sem padding-top — o Header encosta no topo)
- **Modo:** light mode apenas em produção. Tokens dark existem no CSS mas não estão aprovados.

---

## 2. Tokens CSS

Todos os tokens são CSS custom properties definidos em `src/index.css`. **Nunca usar hex hardcoded em componentes.**

### Cores — neutros

```
--surface-primary     fundo de página, cards
--surface-secondary   fundo do Header, sidebar (tom escuro)
--surface-terciary    hover state, fundos alternativos, inputs readonly

--text-primary        texto principal
--text-secondary      texto de apoio, labels, subtítulos
--text-invert         texto sobre fundo escuro (--surface-secondary)
--text-brand          reservado, sem uso atual

--border-primary      bordas de cards, separadores, inputs
```

### Cores — condições do mar (as 4 únicas condições)

| Condição | `--text-*` | `--surface-*-solid` | `--surface-*-gradient` |
|---|---|---|---|
| storm | `--text-storm` | `--surface-storm-solid` | `--surface-storm-gradient` |
| bom | `--text-bom` | `--surface-bom-solid` | `--surface-bom-gradient` |
| marola | `--text-marola` | `--surface-marola-solid` | `--surface-marola-gradient` |
| flat | `--text-flat` | `--surface-flat-solid` | `--surface-flat-gradient` |

Cor existe exclusivamente para indicar condição do mar. Fora disso, a interface é neutra.

### Espaçamento

```
--spacing-xs    4px    gap entre badge e texto, padding Y de badge
--spacing-sm    8px    gap entre elementos próximos, padding X de badge
--spacing-md    16px   padding interno de cards, gap entre seções
--spacing-lg    32px   gap entre blocos maiores
--spacing-xl    64px   padding de página (reservado para DesignSystem)
```

Nunca usar valores de pixel avulsos em componentes reutilizáveis. Exceção: `padding-top: 40px` e `padding-bottom: 80px` nos layouts de página (ainda sem token formal).

### Border radius

```
--radius-minimal   8px    cards, inputs, badges, botões padrão, tabelas
--radius-rounded   16px   modais (Dialog), botões de share/ação arredondada
--radius-full      32px   definido, sem uso atual
```

Cada componente tem um token atribuído — não escolher por preferência visual.

### Outros

```
--touch-target   44px   área mínima de toque em todos os elementos clicáveis isolados
```

---

## 3. Tipografia

Usar sempre as classes token — elas encapsulam tamanho e peso juntos.

| Classe | Tamanho | Peso | Uso |
|---|---|---|---|
| `.text-token-title` | 32px | 700 | Título de tela |
| `.text-token-title-sm` | 24px | 700 | Condição do dia na BeachPage |
| `.text-token-headline` | 18px | 700 | Nome de praia no BeachCard, label de seção |
| `.text-token-button` | 14px | 700 | Labels de botão |
| `.text-token-input-label` | 16px | 400 | Texto de input (evita zoom no iOS) |
| `.text-token-body` | 14px | 400 | Texto corrido |
| `.text-token-body-bold` | 14px | 700 | Texto corrido com ênfase, label de badge default |
| `.text-token-subtitle` | 11px | 400 | Metadados, labels de apoio |
| `.text-token-subtitle-bold` | 11px | 700 | Badge small, labels compactos |

> **Regra:** nunca aplicar `font-size` e `font-weight` separadamente em componentes. As vars CSS (`--font-size-*`, `--font-weight-*`) são reservadas para contextos sem acesso a classes: SVG labels, estilos inline no Recharts.

---

## 4. Componentes

### Header

Duas variantes. Sempre em `src/components/Header.jsx`.

```jsx
// Tela inicial
<Header variant="default" />

// Tela interna
<Header
  variant="beach"
  title="Nome da Praia"
  onBack={() => navigate("/")}
  showShare={true}
  onShare={() => setShareOpen(true)}
/>
```

- Botões de ícone: sempre `h-[var(--touch-target)] w-[var(--touch-target)]` (44px)
- Com `showShare={false}` (default), um espaçador mantém o título centralizado
- Fundo: `var(--surface-primary)`

#### Menu dropdown (auth-aware)

O menu é dinâmico e muda conforme o estado de autenticação e as props recebidas:

| Ordem | Item | Ícone | Condição de exibição |
|---|---|---|---|
| 1º | Entrar | LogIn 16px | usuário **deslogado** — navega para `/login` |
| 2º | Ver favoritos | Heart 16px | `onFavorites` prop presente |
| 3º | Compartilhar | Share 16px | `onShare` prop presente |
| último | Sair | LogOut 16px | usuário **logado** — executa signOut |

- "Entrar" e "Sair" são mutuamente exclusivos
- O estado de autenticação vem de `useAuth()` do `AuthContext`

---

### BeachCard

Card de listagem da HomeScreen.

```jsx
<BeachCard
  name="Cacimba do Padre"
  state="PE"
  country="Brasil"
  height="3.5"
  condition="storm"   // storm | bom | marola | flat
  label="Storm"
  onClick={() => {}}
/>
```

- Padding: `var(--spacing-md)`
- Hover: `var(--surface-terciary)`
- Badge da condição à direita
- Nome em `.text-token-headline`, localização em `.text-token-subtitle` com `--text-secondary`

---

### Badge

Exclusivo para indicar condição do mar. Não usar como tag de categoria ou status genérico.

```jsx
<Badge variant="storm">Storm</Badge>
<Badge variant="bom" size="small">Bom</Badge>
// variant: storm | bom | marola | flat
// size: default (body-bold 14px) | small (subtitle-bold 11px)
```

- Padding: `8px 8px` (md × sm) para default
- Radius: `var(--radius-minimal)`
- Sem borda

---

### Button

```jsx
<Button>Aplicar</Button>                    // ação primária
<Button variant="outline">Cancelar</Button> // ação secundária
<Button variant="ghost">Voltar</Button>     // sem peso visual

// Ícone isolado — sempre sobrescrever para 44px
<Button size="icon" className="h-[var(--touch-target)] w-[var(--touch-target)]">
  <Calendar className="w-4 h-4" />
</Button>
```

---

### Input

Exclusivo para busca de praias. Sempre com ícone Search à esquerda e botão × para limpar.

```jsx
<div style={{ position: "relative" }}>
  <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
  <Input className="pl-11 h-12" placeholder="Buscar praia..." />
</div>
```

Aparece em `flex` com `DateFilterModal`, ocupando `flex: 1`.

---

### InfoBlock

Sempre em grupo de 3 na BeachPage. Labels fixos, sempre nessa ordem.

```jsx
<div className="flex gap-4 mb-4">
  <InfoBlock label="Altura maré" value="2.5m" />
  <InfoBlock label="Vento" value="45 km/h" />
  <InfoBlock label="Período" value="8s" />
</div>
```

Label acima do valor. Não inverter. Não adaptar para outros dados.

---

### SwellPowerBar

5 segmentos de energia. Cor dos segmentos ativos segue a condição da hora.

```jsx
<SwellPowerBar
  value={3}           // 1–5: flat → marola → bom/bom → storm
  label="1,440 kj"
  sublabel="Bom"      // Fraco | Médio | Bom | Forte | Muito forte
/>
```

Segmentos inativos: `var(--surface-terciary)`. Label fixo interno: "Força do swell".

---

### TideChart + TimeSlider

Sempre juntos dentro de um card com borda.

```jsx
<div className="bg-[var(--surface-primary)] border border-[var(--border-primary)] rounded-[var(--radius-minimal)] p-[var(--spacing-md)] mt-4">
  <span className="text-token-subtitle text-[var(--text-secondary)] block mb-3">Maré</span>
  <TideChart tides={tideData.tides} currentHour={scrubHour} />
  <div className="mt-1">
    <TimeSlider value={scrubHour} onChange={setScrubHour} />
  </div>
</div>
```

- `TideChart` retorna `null` se `tides` estiver vazio
- `TimeSlider` é exclusivo para scrubbing de hora neste contexto. Range 0–24h, passo 1h.

---

### Tabs

Segmented control usado no topo da BeachPage para alternar entre "Dia" e "Semana". Não usar como tab genérica em outras telas sem revisão de design.

```jsx
<Tabs value={view} onValueChange={setView}>
  <TabsList className="w-full h-[var(--touch-target)] p-1 rounded-[var(--radius-rounded)] bg-[var(--surface-terciary)] gap-1">
    <TabsTrigger
      value="hoje"
      className="flex-1 h-full rounded-[var(--radius-rounded)] text-button font-token-bold text-[var(--text-secondary)] data-[state=active]:bg-[var(--surface-secondary)] data-[state=active]:text-[var(--text-invert)]"
    >
      Dia
    </TabsTrigger>
    <TabsTrigger value="proximos" className="...">Semana</TabsTrigger>
  </TabsList>
  <TabsContent value="hoje">...</TabsContent>
  <TabsContent value="proximos">...</TabsContent>
</Tabs>
```

- Gerado via shadcn (`@radix-ui/react-tabs`) em `src/components/ui/tabs.jsx` — classes default do CLI (`bg-muted`, `rounded-md`, etc.) são sobrescritas via `className` no ponto de uso, o arquivo gerado não é editado
- Estado ativo: `--surface-secondary` + `--text-invert` (mesmo par de tokens usado para "selecionado" no Calendar e no thumb do Slider)
- Estado inativo: `--surface-terciary` + `--text-secondary`
- Altura `var(--touch-target)` (44px), radius `var(--radius-rounded)`
- Sem cor de condição — regra do sistema: cor só indica qualidade do mar

---

### DayCard

Card de listagem da aba "Semana" da BeachPage. Um item por dia, começando por hoje.

```jsx
<DayCard
  dateIso="2026-08-08"
  condition="bom"   // storm | bom | marola | flat
  label="Bom"
  onClick={() => {}}
/>
```

- Mesmo padrão visual do `BeachCard`: título + subtítulo à esquerda, `Badge` de condição à direita
- Título = dia da semana (`weekdayAndDateLabel` de `lib/dates.js`, ex. "Segunda-feira"), subtítulo = data (ex. "06 de Julho")
- Escopo: item de lista de dias na BeachPage — não adaptar para outro tipo de listagem
- Clique navega para a aba "Dia" com a data daquele card selecionada

---

### DateFilterModal

Aceita qualquer elemento como trigger via prop.

```jsx
<DateFilterModal
  initialDate={selectedDay}   // "yyyy-MM-dd"
  onApply={(day) => setSelectedDay(day)}
  trigger={<Button>Data</Button>}
/>
```

Range disponível: hoje até hoje+7 dias. Locale: `ptBR`. Botão "Hoje" desabilitado quando hoje já está selecionado.

---

### Dialog (Modal)

Estrutura padrão para Share Modal:

```jsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="max-w-[380px] p-6 gap-0 overflow-hidden">
    <DialogHeader className="mb-6">
      <DialogTitle>Compartilhar</DialogTitle>
      <DialogDescription>...</DialogDescription>
    </DialogHeader>
    {/* scroll horizontal de apps */}
    <div className="h-px bg-[var(--border-primary)] mb-6" />
    <Input readOnly value={url} className="mb-3 bg-[var(--surface-terciary)]" />
    <Button className="w-full h-12 rounded-[var(--radius-rounded)]">Copiar link</Button>
  </DialogContent>
</Dialog>
```

---

### Skeleton

Estados de loading:

```jsx
<HomeCardSkeleton />     // placeholder do BeachCard
<BeachDetailSkeleton />  // placeholder da BeachPage inteira (aba "Dia")
<DayCardSkeleton />      // placeholder do DayCard (lista da aba "Semana")
```

---

## 5. Padrão de layout de página

### HomeScreen

```jsx
<div style={{ width: "100%", maxWidth: 680, margin: "0 auto", padding: "40px 16px 80px" }}>
  <Header variant="default" />

  {/* Barra de busca + filtro de data */}
  <div style={{ marginBottom: "var(--spacing-lg)" }}>
    <div style={{ display: "flex", gap: "var(--spacing-sm)", marginBottom: 10 }}>
      {/* Input de busca — flex: 1 */}
      {/* DateFilterModal */}
    </div>
    {/* Label "Exibindo resultados para: [data]" */}
  </div>

  {/* Lista de cards */}
  <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
    {/* BeachCards ou Skeletons ou estado de erro/vazio */}
  </div>

  {/* Legenda de condições */}
  <div style={{ marginTop: 48 }}>
    <div style={{ height: 1, background: "var(--border-primary)", marginBottom: "var(--spacing-md)" }} />
    {/* dots coloridos + labels */}
  </div>
</div>
```

### BeachPage

```jsx
<div style={{ width: "100%", maxWidth: 680, margin: "0 auto", padding: "0 0 80px" }}>
  <Header variant="beach" title={beach} onBack={...} showShare={true} onShare={...} />

  <Tabs value={view} onValueChange={setView}>
    {/* TabsList — segmented control "Dia" | "Semana", abre em "hoje" por padrão */}

    <TabsContent value="hoje">
      {/* Barra de navegação de data — sticky */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "var(--surface-primary)" }}>
        {/* condição do dia (dot + label) | ChevronLeft + DateFilterModal + ChevronRight */}
      </div>

      <div style={{ padding: "16px 16px 0" }}>
        {/* loading → <BeachDetailSkeleton /> */}
        {/* erro → <ErrorState onRetry={...} /> */}
        {/* dados → */}
          {/* "Condições às [hora]" + Badge horário */}
          {/* InfoBlock × 3 */}
          {/* SwellPowerBar */}
          {/* TideChart + TimeSlider */}
      </div>
    </TabsContent>

    <TabsContent value="proximos">
      <div style={{ padding: "16px 16px 0" }}>
        {/* intervalo de 7 dias (weekStart..weekStart+6) com ChevronLeft/ChevronRight — só 1 passo à frente é possível (limite hoje+7 da API) */}
        {/* loading → 7x <DayCardSkeleton /> */}
        {/* erro → <ErrorState onRetry={...} /> */}
        {/* dados → 7x <DayCard /> (hoje + 6 dias), clique navega para a aba "Dia" com a data do card */}
      </div>
    </TabsContent>
  </Tabs>

  {/* Botão "Favoritar praia" — fora do Tabs, visível nas duas abas */}

  {/* Share Dialog */}
</div>
```

---

## 6. Terminologia fixa da UI

**Condições:**

| Condição | Label | Descrição na legenda |
|---|---|---|
| storm | Storm | Cuidado |
| bom | Bom | Vai surfar! |
| marola | Marola | Vai depender |
| flat | Flat | Não vale a pena |

**Labels de seção — não variar:**

| Elemento | Label |
|---|---|
| InfoBlock 1 | "Altura maré" |
| InfoBlock 2 | "Vento" |
| InfoBlock 3 | "Período" |
| SwellPowerBar | "Força do swell" (interno, não parametrizado) |
| Seção de maré | "Maré" |
| Cabeçalho horário | "Condições às [hora]" |
| Tab 1 | "Dia" |
| Tab 2 | "Semana" |

**Níveis de SwellPowerBar (1→5):** Fraco · Médio · Bom · Forte · Muito forte

---

## 7. Regras que não podem ser quebradas

1. **Nenhuma cor hex hardcoded** em componentes — somente `var(--*)`.
2. **Badge** é exclusivo para condição do mar — não usar como tag genérica.
3. **InfoBlock** sempre em trio, sempre na ordem: Altura maré / Vento / Período.
4. **Condições** são sempre uma de quatro: `storm`, `bom`, `marola`, `flat`.
5. **Touch target** mínimo de 44px (`var(--touch-target)`) em todos os elementos interativos isolados.
6. **TimeSlider** é exclusivo para scrubbing de hora no TideChart.
7. **Radius por contexto:** cards/inputs/badges → `--radius-minimal`; modais/botões arredondados → `--radius-rounded`.
8. **Label acima do valor** nos InfoBlocks — nunca inverter.
9. **Texto em português**, exceto `"Flat"` e `"Storm"`.
10. **Hierarquia visual via tamanho tipográfico e posição** — não via cor (cor é só para condições).

---

## 8. Novos componentes / telas

Ao criar uma tela nova:

- Encaixar no padrão `maxWidth: 680 / margin: 0 auto / padding lateral 16px`
- Usar `Header variant="beach"` com back button se for tela interna
- Aplicar somente tokens existentes — não criar tokens novos sem atualizar `src/index.css`
- Se precisar de um novo componente de domínio, criá-lo em `src/components/` seguindo o padrão de props dos existentes
- Estados obrigatórios: loading (Skeleton), erro (`ErrorState` com retry) e vazio (`StateMessage`) — ambos em `src/components/StateMessage.jsx`, neutros
- Adicionar a rota em `src/App.jsx`
