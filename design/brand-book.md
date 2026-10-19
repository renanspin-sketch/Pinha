Pinha é o app de finanças da casa: o casal (ou a família) lança, paga e acompanha o dinheiro junto, cada um com seu login. A pinha guarda as sementes do pinheiro; o app guarda o que a casa constrói. É um produto **PINDev**, e a assinatura "by PINDev" acompanha a marca nos pontos listados abaixo.

## Princípios

- **Claro antes de bonito.** A pergunta "quanto vai sobrar?" responde-se em um olhar. Um número principal por tela, em `money-xl`.
- **Dos dois, para os dois.** Toda informação mostra quem lançou e de onde saiu o dinheiro, sem julgar. As cores de pessoa (`person-1`, `person-2`) identificam, nunca comparam.
- **Calmo.** Verde e neutros na maior parte da tela. Cor quente (`resina`) e vermelho (`danger`) aparecem só quando significam algo.

## Nome, logo e assinatura

- Escreva o nome como **Pinha** em texto corrido. O wordmark é sempre em minúsculas, **pinha**, no estilo `wordmark` (Bricolage Grotesque 800, espaçamento −0,03em) em `brand-deep` sobre fundos claros e `on-brand-deep` sobre `brand-deep`.
- O símbolo é a pinha de escamas (Logos › `pinha-mark.svg`). Sobre `brand-deep` ou fotos escuras use `pinha-mark-branca.svg`. O ícone do app é `pinha-icone-app.svg` (pinha `resina` sobre `brand-deep`).
- Lockup horizontal: símbolo + wordmark, com espaço de `space-2` entre eles; a altura do símbolo é 1,4× a altura de caixa-alta do wordmark.
- **Assinatura "by PINDev"**: em `caption` com peso 600, cor `ink-muted`, escrita exatamente assim (by minúsculo, PINDev com PIN e D maiúsculos). Aparece:
  - na tela de login e no carregamento, abaixo do lockup;
  - no rodapé do menu lateral (PC) e no fim da tela "Mais" (celular);
  - em e-mails e convites, no rodapé.
  Nunca aparece dentro das telas de uso diário (mês, contas, lançamento).
- Não desenhe a pinha em outras cores além das três versões, não contorne, não gire e não use um pinheiro (árvore) no lugar dela.

## Voz e escrita

- Português do Brasil, tratando por **você**. Frases curtas, verbos diretos: "Pagar", "Salvar gasto", "Copiar contas do mês passado".
- Dinheiro sempre como **R$ 1.234,56**; valor estimado com til: **~R$ 230,00**. Datas curtas **15/10**; mês por extenso no título: **Outubro 2026**.
- Nomeie como a casa fala: "Contas", "Gastos", "Saiu de", "Sobra prevista", "Lançado por". Evite termos de banco ou sistema ("débito em conta-corrente", "transação", "registro").
- Status sempre com palavra, nunca só cor: **Paga**, **A vencer**, **Atrasada**, **Prevista**, **Recebida**, **Fechada**, **Aberta**.
- Erros dizem o que houve e o que fazer: "Não deu para salvar sem internet. O gasto fica guardado e sobe quando a conexão voltar."
- Sem emoji na interface. Categorias usam ícones de traço.

## Cor

- Fundo de tela `surface`; cartões `surface-raised`; trilhos e barras vazias `surface-sunken`; divisórias `line`.
- Texto `ink`; secundário `ink-muted`. Os dois passam 4,5:1 em `surface` e `surface-raised` nos dois temas.
- Ação principal: botão `brand` com texto `on-brand`. Um botão principal por tela.
- O cartão de destaque (sobra prevista) é o único bloco `brand-deep` da tela, com texto `on-brand-deep` e rótulos `on-brand-deep-muted`.
- `resina` é o único acento quente: ícone do app, meta atingida, onboarding. Nunca para texto nem para status.
- Status: pílula `*-tint` com texto do status (`positive`, `warning`, `danger`, `info`). Atrasada e saldo negativo usam `danger`; o botão "Pagar" de uma conta atrasada é `danger` com `on-danger`.
- Pessoas: avatar `person-1`/`person-2` com inicial `on-person-1`/`on-person-2`. Conta conjunta usa `ink-muted` com `on-brand`.
- Foco de teclado: anel `focus` de 2px, afastado 2px, em todos os controles.

## Tipografia

- Bricolage Grotesque (família `display`) só para o wordmark, o número principal (`money-xl`) e o título da tela (`title-lg`).
- Manrope (família `sans`) para todo o resto: `title-md`, `body-strong`, `body`, `label`, `caption`, `overline`.
- Todo número que se alinha em coluna usa `font-variant-numeric: tabular-nums`.
- Ambas vêm do Google Fonts; inclua os pesos 500, 600, 700 e 800 de Manrope e 700 e 800 de Bricolage Grotesque.

## Espaço, forma e camadas

- Margem lateral das telas `space-4`; entre seções `space-6`; dentro de cartões `space-4`.
- Botões e campos `radius-md` com altura mínima de 44px (48–52px no botão de salvar). Cartões `radius-lg`; cartão de destaque e folhas `radius-xl`; chips e avatares `radius-pill`; pílulas de status `radius-sm`.
- Cartões não têm sombra: separam-se do fundo pela cor. `shadow-raised` só no que flutua (botão +, folha de lançamento, aba selecionada).

## Layout

- Celular: barra inferior com Mês, Contas, botão + central (`brand`, 56px, círculo), Cartões e Carteira. Conteúdo rola acima dela.
- PC: menu lateral fixo à esquerda e conteúdo fluido; os blocos Contas, Gastos, Entradas e Reservas ficam lado a lado em grade que vira coluna única em telas estreitas.

## Iconografia

- Ícones de traço de 2px, cantos e pontas arredondados, grade de 24px, cor herdada do texto. Nenhum ícone preenchido, nenhum emoji.
- Categorias de gasto aparecem num quadrado `radius-md` de 40px com fundo suave e ícone na cor do texto do status ou da marca.
