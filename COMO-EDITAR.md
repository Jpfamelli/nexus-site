# Site Nexus — como editar

Site estático em HTML/CSS/JS puro. Não precisa de instalação nem build: basta abrir o `index.html` no navegador (dê dois cliques) ou rodar o servidor `nexus-site` do launch.json.

## Arquivos

| Arquivo | O que tem |
|---|---|
| `index.html` | Todo o conteúdo: textos, preços, seções, links de WhatsApp |
| `styles.css` | Todo o visual: cores, fontes, animações, responsivo |
| `script.js` | Interações: menu, cursor, animações de entrada, acordeão do FAQ |
| `assets/nexus-hero.png` | Imagem do topo (a original do site) |
| `assets/nexus-monograma.svg` | Símbolo da marca (N+X) usado no topo, rodapé e favicon |

## Edições comuns

- **Trocar preços**: procure `R$ 3.500`, `R$ 590`, `R$ 5.000` ou `R$ 990` no `index.html`.
- **Trocar o número do WhatsApp**: procure `5512982211090` no `index.html` (aparece em todos os botões) e substitua pelo novo número com DDI+DDD.
- **Trocar as mensagens prontas do WhatsApp**: são a parte `?text=...` dos links (o texto está codificado para URL — letras acentuadas viram códigos tipo `%C3%A1`).
- **Cores**: no começo do `styles.css`, no bloco `:root` — `--nexus-ink` (azul-tinta), `--nexus-black` (preto), `--nexus-bronze` (bronze da ação), `--nexus-bronze-light` (creme).
- **Fontes**: carregadas no `<head>` do `index.html` (Clash Display e Satoshi via Fontshare + IBM Plex Mono via Google).
- **Projetos**: seção `id="projetos"` no `index.html`; as imagens são `assets/proj-indycar.jpg` e `assets/proj-prado.jpg` — troque as imagens e os textos para adicionar novos projetos.
- **Números da faixa**: os valores animados ficam em `data-target` nos elementos `.counter`.

## Site publicado

**Endereço oficial (Netlify, na conta jpfamellistos):**
https://nexus-taubate.netlify.app

Os outros dois projetos da carteira também estão no ar e são linkados pela seção Projetos:
- IndyCar: https://indycar-taubate.netlify.app
- Prado: https://prado-modasocial.netlify.app

Para atualizar o site no ar depois de editar os arquivos: peça ao Claude ("atualiza o site no Netlify") ou entre em app.netlify.com → projeto nexus-taubate → aba Deploys → arraste a pasta do site. Para domínio próprio (ex.: nexus.com.br), compre o domínio e conecte em Domain settings do projeto.

Cópia extra (Artifact do Claude, arquivo único):
https://claude.ai/code/artifact/a5135f6d-a646-4d3e-9e69-e2d261e9bb15

## Observação sobre a origem

Reconstruído fielmente a partir da sessão original do Manus (que parou por falta de créditos no meio da última revisão). O estado entregue é o mais completo: 2 planos (R$ 3.500 / R$ 5.000), avulsos sem preço com chamada no WhatsApp, prazos reduzidos, tipografia nova e sistema de animações + cursor customizado — tudo o que foi pedido na última mensagem daquela sessão.
