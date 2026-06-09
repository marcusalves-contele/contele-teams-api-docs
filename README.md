# Documentação — API de Integração Contele Equipes (Teams)

Site de documentação estático (HTML/CSS/JS puro, **sem build e sem dependências**) para a API de Integração v2 do Contele Equipes.

## Como abrir

Basta abrir o arquivo `index.html` no navegador:

- **Duplo clique** em `index.html`, ou
- Servindo localmente (recomendado, evita restrições de `file://`):

```bash
# Python 3
python3 -m http.server 8000
# depois acesse http://localhost:8000
```

```bash
# Node (npx)
npx serve .
```

## Estrutura

```
contele-teams-api-docs/
├── index.html        # conteúdo da documentação (sidebar + páginas)
├── assets/
│   ├── styles.css    # tema Contele (roxo), responsivo mobile/desktop
│   ├── app.js        # highlighting, botão copiar, scroll-spy, busca, menu mobile
│   └── fonts/        # Inter + JetBrains Mono (woff2 auto-hospedadas, offline)
└── README.md
```

## Recursos

- **Sidebar fixa** com navegação por categorias e *scroll-spy* (destaca a seção ativa).
- **Busca/filtro** de endpoints na sidebar, com estado "nenhum resultado".
- **Syntax highlighting** próprio (JSON e cURL/bash) — funciona offline, sem CDN.
- **Botão "Copiar"** em cada bloco de código.
- **Deep-links**: cada seção e endpoint tem âncora clicável que copia o link direto.
- **Tabelas de parâmetros** (Query / Path / Body) com Nome · Tipo · Obrigatório · Descrição.
- **Selos de status** por endpoint: ✅ testado · 🔴 bug ·
- **Responsivo** (mobile e desktop) com menu off-canvas no mobile.
- **Acessibilidade**: skip link, foco visível por teclado, `aria-*` no menu, e respeito a `prefers-reduced-motion`.
- **Fontes auto-hospedadas** (Inter + JetBrains Mono em `assets/fonts/`) — **100% offline, sem nenhuma dependência externa nem CDN**.

## Conteúdo

Gerado a partir de `doc-api-teams-formatada.md`, que consolida os testes de QA dos endpoints
(`contele-autoops/doc-api-teams-formatada.md`). Cobre POIs, Portfólios, Refunds, Tasks,
Users, Categories, Forms e Webhook, além de uma referência de erros e o resumo dos achados de QA.

- **Base URL:** `https://integration.contelege.com.br/v2`
- **Doc oficial (Swagger):** https://contele.github.io/api_de_integracao_contele_equipes/

## Publicar (GitHub Pages)

Por ser estático, basta subir a pasta para um repositório e habilitar o GitHub Pages
apontando para a raiz (ou `/docs`). Nenhum passo de build é necessário.

## Atualizar o conteúdo

Para alterar/adicionar endpoints, edite diretamente o `index.html` (cada endpoint é um
`<article class="endpoint">`) e, se incluir novos itens, adicione o link correspondente
na sidebar. Os realces de código e o botão de copiar são aplicados automaticamente a
qualquer bloco `<div class="code" data-lang="json|bash">`.
