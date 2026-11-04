# Portfólio V2 — entrega local

Referência editorial: 03/11/2026. Sem commit, push ou deploy.

## Escopo e arquivos

- `index.html`: nova hierarquia, textos PT-BR/EN, case CloudStudy, projetos, open source, experiência, educação e metadados.
- `styles.css`: identidade minimalista preservada, layouts responsivos e navegação com melhoria progressiva.
- `app.js`: tradução de textos e acessibilidade, metadados, menu com gerenciamento de foco e atualização opcional de métricas.
- `metrics.mjs`: snapshot, API GitHub, validação, timeout e cache.
- `thiago-720.jpg`: JPEG real de 720 × 720 px, 72.446 bytes. O original `thiago.jpg` foi preservado.
- `cloudstudy-84.png`: logo dimensionado, 3.431 bytes. Original preservado.
- `tests/`: testes Node sem dependências externas para métricas, estrutura e comportamento em DOM simulado.

Nenhum arquivo preexistente além de `index.html` foi alterado. O PDF, o backup, os badges e os assets originais permanecem intactos.

## Conteúdo e hierarquia

1. Apresentação como Cloud Engineer, com foco em AWS, infraestrutura e automação.
2. CloudStudy como case principal: problema, solução, participação técnica, entrega e arquitetura.
3. Projetos: Fraud Detection, Tour4Friends Data Lake, Netflix e materiais AWS Data Engineering.
4. Ecossistema Open Source: Solutions Architect Associate, Cloud Practitioner e AI Practitioner.
5. Experiência e formação com períodos detalhados.
6. Certificações profissionais AWS, certificados educacionais separados e vitrine Udemy em posição secundária.
7. Contato.

Foram retirados da página principal o destaque da idade, a contagem antiga de seguidores e as métricas GitHub anteriores. O banner promocional não é mais carregado. Seus arquivos foram preservados. O curso continua acessível pelo link de indicação existente e pela âncora `#curso`.

Todos os destinos externos da página principal anterior foram mantidos. Os placeholders e o formulário legado permanecem apenas no backup, que não foi editado nem vinculado à navegação V2.

## Fontes e limites das afirmações

### Informações fornecidas pelo proprietário

- Posicionamento profissional, períodos das experiências e snapshot GitHub de 03/11/2026.
- CloudStudy lançada em setembro de 2026, com usuários, assinaturas e infraestrutura de produção.
- Nesta conversa, o proprietário confirmou o uso de ECS/Fargate, RDS, Terraform, GitHub Actions com OIDC, Amplify/CloudFront, gerenciamento de segredos e pagamentos com Stripe e Mercado Pago, sem exigir link público.

A arquitetura CloudStudy é descrita com base nessa confirmação. Não foi auditado seu código, ambiente AWS ou operação. Não foram identificados os serviços específicos de segredos, topologia de rede, configurações de resiliência, indicadores de disponibilidade ou custos; nada disso foi inventado.

### Documentação pública consultada

- https://www.cloudstudy.com.br/ — apresentação pública do produto e recursos de estudo.
- https://github.com/Thiago-code-lab/aws-streaming-fraud-detection/blob/main/README.md — pipeline educacional, dados sintéticos, regras explicáveis, processamento batch e streaming opcional. Não usa ML nem comprova operação antifraude em produção.
- https://github.com/Thiago-code-lab/tour4friends-datalake — projeto acadêmico em grupo, identificado como em desenvolvimento; arquitetura MongoDB, AWS Batch, S3, Glue/Spark, Athena e analytics.
- https://github.com/Thiago-code-lab/data-engineering-netflix — ETL modular, PostgreSQL e visualizações.
- https://github.com/Thiago-code-lab/aws-data-engineering-course/blob/master/README.md — materiais e projetos educacionais, incluindo Terraform e CI/CD com OIDC.

As responsabilidades da Pixxel e Compass, formações e certificados educacionais vêm do currículo existente, inspecionado na auditoria anterior. Não foi atribuída autoria exclusiva ao projeto Tour4Friends nem foram acrescentadas certificações.

## Métricas públicas

Snapshot aprovado pelo proprietário, em 03/11/2026:

| Repositório | Stars | Forks |
| --- | ---: | ---: |
| Solutions Architect Associate | 989 | 254 |
| Cloud Practitioner | 753 | 157 |
| AI Practitioner | 463 | 131 |
| Total dos três | 2.205 | 542 |
| Fraud Detection, separado do total | 49 | 13 |

- Nenhuma chamada à API no carregamento da página.
- Botão opcional consulta quatro endpoints públicos de repositórios, em paralelo, sem token.
- Timeout de oito segundos; validação de identidade e contagens inteiras não negativas.
- Atualização atômica: falha de um endpoint preserva o último conjunto completo.
- Cache validado de até 24 horas; cache expirado, futuro, incompleto ou malformado é descartado.
- Datas são mostradas junto aos números. Cache e erro têm indicação acessível.
- Falhas de armazenamento não impedem renderização ou atualização.
- Não há contagem de seguidores ou métricas financeiras/de usuários.

## Design e acessibilidade

Preservados azul de ação, superfícies claras/escuras, fonte de sistema, tipografia ampla, container de 1.120 px e cards arredondados. A arquitetura aparece como descrição textual, sem diagrama inventado ou screenshot simulado.

O conteúdo e a navegação permanecem acessíveis sem JavaScript. O menu fechado usa `hidden` e `inert`; ao abrir, move o foco para a navegação, limita o ciclo de Tab e fecha com Escape. Mudanças de breakpoint limpam o bloqueio de scroll. Textos acessíveis e metadados são atualizados com o idioma. `?lang=pt` e `?lang=en` selecionam o idioma; a preferência também pode ser salva localmente.

O canonical usa a URL pública indicada no repositório e no perfil: https://thiago-code-lab.github.io/. Open Graph e Twitter usam imagem absoluta com formato JPEG correto.

## Validação

No diretório `Thiago-code-lab.github.io`, executar:

```text
node --test
node --check app.js
node --check metrics.mjs
git diff --check
```

Resultado na implementação: 19 testes passaram. Foram verificados aninhamento estrutural de HTML, IDs únicos, âncoras, recursos locais, links originais, traduções pareadas, atributos de imagens, SEO, ausência de requisições na inicialização, storage bloqueado, métricas/cache/API e menu com foco em DOM simulado.

Limitações: o verificador estrutural não substitui um validador HTML completo. Não houve navegador disponível via ferramenta de interface: sem inspeção visual de desktop/mobile, leitor de tela, Lighthouse ou testes reais de CORS/API no navegador. Os testes de API usam respostas simuladas. Destinos autenticados, pasta Drive e credenciais individuais não foram autenticados ou auditados. Os assets gerados foram inspecionados, com revisão visual do retrato.

O JavaScript usa módulos; a prévia deve ser servida por HTTP local, em vez de aberta por `file://`.

## Preservação Git

- Repositório externo: `D:\Códigos\Portfolio`.
- Repositório interno: `D:\Códigos\Portfolio\Thiago-code-lab.github.io`.
- O externo já tinha gitlink divergente e quatro arquivos não rastreados; esse estado foi preservado.
- O interno começou sem alterações locais. A V2 modifica somente seu `index.html` e adiciona os arquivos listados acima.
- A divergência do gitlink e a ausência preexistente de `.gitmodules` não foram corrigidas nesta etapa.
- `index_backup.html`, `cv-thiago-cardoso.pdf`, imagens originais e `.gitignore` foram conferidos sem diferenças.

## Pendências antes de deploy

- Revisar a redação final do case e da participação técnica, especialmente o papel individual em Tour4Friends.
- Fazer QA visual em desktop/mobile e teste com teclado e leitor de tela em navegador real.
- Testar atualização GitHub no navegador, inclusive indisponibilidade e limite de API.
- Confirmar canonical/domínio caso a hospedagem efetiva seja diferente da URL pública atual.
- Fornecer, se desejado, diagrama sanitizado da arquitetura de produção e capturas reais da CloudStudy. Não há imagens fictícias no case.
- Fornecer links individuais de verificação das três certificações, caso queira publicá-los. A pasta original foi mantida.
- Planejar uma versão revisada do PDF em tarefa separada; seu conteúdo anterior continua disponível pelo download.
- Decidir posteriormente se o backup deve ser excluído da publicação; ele ainda contém os problemas legados registrados na auditoria.

Não há pendência de números comerciais: eles foram deliberadamente omitidos. Nenhum valor de receita, conversão, usuários ou assinantes foi publicado.

## Atualização pontual — vitrine Udemy (03/11/2026)

A apresentação individual do curso foi substituída por três cards em educação, mantendo `#curso`, a hierarquia geral e os três links de indicação fornecidos. Títulos, descrições, assuntos e acessibilidade têm versões PT-BR/EN.

Indicadores estáticos autorizados pelo proprietário: **3 cursos na Udemy** e **200+ alunos na Udemy**. O número de alunos é agregado na plataforma, considerando todos os cursos; não indica matrículas por curso nem usuários/assinantes da CloudStudy. A fonte e a data aparecem junto aos indicadores.

As capas oficiais foram fornecidas pelo proprietário na raiz do workspace e copiadas sem alterações para `assets/courses/`: `capa-aws.webp`, `capa-cyber.webp` e `capa-bootcamp.webp`. A capa AWS disponível foi preferida ao banner promocional. Os WebP originais foram preservados, com carregamento lazy, dimensões declaradas e proporção consistente nos cards.

Layout: três colunas no desktop, duas até 920 px e uma até 720 px; títulos sem truncamento e links com área mínima de 44 px. Não foram adicionados preços, avaliações, duração ou números individuais de matrículas.

Validação: 19 testes existentes passaram, além da conferência dos três destinos/referral codes e igualdade binária das capas. O navegador permaneceu indisponível, portanto ainda é necessária a revisão visual em desktop e mobile.

## Adaptação mobile — 03/11/2026

Escopo desta etapa: CSS responsivo, navegação mobile, `viewport-fit=cover`, chips de tecnologias já descritas no case e testes de comportamento. Os textos profissionais, números, links, imagens e a alteração local preexistente do currículo foram preservados.

Breakpoints mantidos: **1040 px** para navegação mobile e safe areas, **920 px** para composição tablet e **720 px** para celular. Não foram criadas regras por modelo de dispositivo. Os estilos existentes de desktop acima de 1040 px foram preservados; os chips adicionais da CloudStudy aparecem apenas até 920 px.

- Header/menu: safe areas, altura disponível com `svh`/`dvh`, rolagem interna para telas baixas e animação de entrada leve. O blur é desativado no header mobile para não criar um containing block que limite o menu fixo ao tamanho do cabeçalho. O corpo fica fixo enquanto o menu está aberto, com posição restaurada ao fechar. Escape, seleção de seção, clique na marca e mudança para desktop fecham o menu; PT/EN permanece funcional. Offsets negativos de overscroll são normalizados.
- Hero: escala tipográfica fluida, leitura com entrelinha mais confortável, CTAs alinhados, menor espaçamento e retrato quadrado completo, sem recorte adicional no mobile.
- CloudStudy: separação entre tópicos, logo dimensionado para não competir com o título, chips com quebra e painel técnico com espaçamentos próprios.
- Projetos/Open Source: cards com limites intrínsecos ajustados, textos longos quebráveis, tags flexíveis, contagens alinhadas e atualização de métricas com botão de largura disponível.
- Educação/Udemy: um curso por linha até 720 px; capas oficiais e proporções mantidas; indicadores em duas colunas equilibradas e links maiores. Tablet mantém dois cursos por linha.
- Experiência/credenciais: timeline vertical, datas e cargos diferenciados, dois cards de certificação no tablet e um no celular, badges centralizados e alturas naturais.
- Contato/footer: ações empilhadas no celular, links do rodapé com quebra e padding inferior que considera safe area.

Não há `overflow-x: hidden` ou corte de texto usado para mascarar problemas estruturais. `prefers-reduced-motion` desativa também a animação do menu. O carregamento das imagens e a ausência de chamadas GitHub na inicialização permanecem iguais.

Validação: **24 testes passaram**, incluindo os novos testes de bloqueio/restauração de scroll, seleção de âncoras, troca de idioma com menu aberto, clique na marca e offsets negativos de overscroll. Sintaxe JavaScript e `git diff --check` passaram. Os testes de interação usam DOM simulado.

Limitação explícita: a ferramenta não encontrou navegador nem conexão nativa. Não foram executados testes visuais nem medições reais de overflow em **320, 360, 375, 390, 414, 430 ou 768 px**, tampouco em orientação horizontal, Safari/iPhone ou Android reais. A revisão de CSS e os testes simulados não substituem essa validação. O desktop também não recebeu comparação visual automatizada.
