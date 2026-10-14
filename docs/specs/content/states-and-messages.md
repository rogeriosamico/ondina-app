# Estados e mensagens

## Carregando — lista de praias

Exibe `HomeCardSkeleton` em quantidade igual ao total de praias cadastradas. Não exibe texto.

## Carregando — detalhe da praia

Exibe `BeachDetailSkeleton` ocupando toda a área de conteúdo. Não exibe texto.

## Carregando — próximos dias

Exibe `DayCardSkeleton` em quantidade igual a 7 (hoje + 6 dias). Não exibe texto.

## Nenhum resultado (busca)

```
"Nenhuma praia encontrada."
```

Tom neutro. Exibido quando a busca por texto não retorna correspondências. `StateMessage` com ícone `Search`, variante `compact`. Cor: `--text-secondary`.

## Maré indisponível

```
"Dados de maré temporariamente indisponíveis."
```

Tom neutro, sem alarme. Exibido dentro de um bloco com ícone de informação (`opacity: 0.4`), fundo `--surface-terciary`, radius `--radius-minimal`. Não usa cor de condição.

## Erro de carregamento

```
Título: "Não deu pra carregar."
Texto:  "Confere a conexão e tenta de novo."
Botão:  "Tentar de novo"
```

Componente `ErrorState` (`src/components/StateMessage.jsx`). Usado em toda falha de carregamento: lista de praias (Home), detalhe da praia, aba Semana e Favoritos. Ícone `CloudOff` 40px (stroke 1.5), título `--text-primary` em body-bold, texto `--text-secondary`, botão `outline`. Sempre neutro — sem cor de condição. Sempre com retry.

Na página da praia, o erro ocupa a tela sozinho: somem a barra de condição/data (aba Dia), a navegação de semana (aba Semana) e o botão "Favoritar praia".

Em Favoritos, aparece quando a lista de favoritos (Supabase) ou a previsão (API) falha, ou quando nenhuma das praias favoritadas veio na resposta. Nunca cai no estado vazio por causa de uma falha.

## Favoritos vazio

```
"Nenhuma praia favoritada ainda."
```

`StateMessage` com ícone `Heart`. Cor: `--text-secondary`.
