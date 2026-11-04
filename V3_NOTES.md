# Portfólio V3 — visual, motion e narrativa

Implementação local em 03/11/2026. Sem commit, push, deploy ou instalação de bibliotecas.

## Direção visual

Mantidos fotografia original, capas oficiais, badges, tipografia de sistema e azul principal. A V3 acrescenta uma composição editorial: hero com retrato completo e moldura técnica, CloudStudy em narrativa de cinco etapas, projetos numerados com fluxos técnicos, Open Source em superfície escura, timeline vertical progressiva, credenciais centralizadas e vitrine Udemy com capas enquadradas.

Gradientes restritos a superfícies discretas. Sombras, bordas e microinterações têm baixa amplitude. O contato encerra a página com fundo escuro e tipografia maior. Header com estado de página rolada, seção ativa e progresso de leitura.

## CloudStudy e limite das evidências

Ordem: **Problema → Solução → Arquitetura → Operação → Resultados**. Os textos factuais anteriores foram preservados. Os componentes vêm da confirmação do proprietário já registrada na V2: ECS/Fargate, RDS, Terraform, GitHub Actions/OIDC, Amplify/CloudFront, gestão de segredos e Stripe/Mercado Pago.

O mapa HTML/CSS apresenta seis grupos de componentes, com seleção por botões nativos e destaque contextual durante a leitura. Nenhum detalhe é escondido pela seleção. As linhas conectam as etapas narrativas do case, não os serviços AWS. Não foram desenhadas conexões de rede, relações entre CloudFront e Amplify, sub-redes, permissões IAM, endpoints, alta disponibilidade ou integrações de segredos não documentadas.

Pendência para um diagrama de topologia real: fornecer fluxos e dependências entre serviços, caminhos de distribuição, redes e limites de segurança em documentação sanitizada. A V3 identifica o visual como mapa de componentes, sem alegar representar essa topologia.

No desktop, o painel só fica sticky acima de 1040 px, com viewport de pelo menos 800 px de altura e quando a altura real do painel cabe na tela. No mobile, as etapas seguem verticalmente e o mapa fica no fluxo normal, com componentes em uma coluna nos celulares.

## Motion reutilizável

- Tokens em `v3.css`: duração 640 ms, deslocamento 28 px, stagger 90 ms e easing `cubic-bezier(.22, 1, .36, 1)`.
- Até 720 px: 520 ms, 20 px e 70 ms.
- Sequência do hero: identificação, duas partes da headline, descrição, CTAs e retrato.
- `IntersectionObserver` dispara as entradas uma única vez. Web Animations API aplica transform e opacity, sem classes que deixem conteúdo aguardando invisível. Sem suporte à API de animação, os elementos continuam visíveis.
- Cards de projetos, Open Source, certificações e cursos têm stagger. Badges têm uma entrada de escala curta.
- Timeline usa `scaleY`, com linha completa como fallback sem JavaScript.
- O scroll é passivo e agenda no máximo um `requestAnimationFrame`. Posições são medidas na inicialização, resize e alterações de tamanho via `ResizeObserver`; não são consultadas continuamente a cada evento de scroll.
- Os highlights da CloudStudy são contextuais, sem movimentar a página. Não há scroll-jacking ou parallax.
- Foco em conteúdo cancela sua animação de entrada. Trocar para movimento reduzido ou ocultar a aba cancela animações em andamento.
- `prefers-reduced-motion` desativa animações e contadores decorativos; a timeline permanece completa e o progresso de leitura é desativado.

## Métricas

`metrics.mjs`, seu schema, snapshot, cache e fallback não foram modificados. A contagem decorativa usa o texto numérico real já renderizado pelo módulo da aplicação, uma única vez ao entrar na viewport.

O valor final permanece no elemento original acessível. Uma camada separada com `aria-hidden="true"` apresenta os frames intermediários, que não são registros históricos. Ao concluir, a camada é removida visualmente e o valor original reaparece. Antes de uma troca de idioma ou atualização GitHub, qualquer contagem em andamento é encerrada, evitando números visuais de conjuntos antigos.

Não há gráficos de crescimento, métricas operacionais novas ou projeções. Os três repositórios destacados são os mesmos da V2. Os 200+ alunos continuam sendo um indicador agregado da Udemy, com a referência existente.

## Arquivos

- `index.html`: composição das seções, mapa de componentes, representações dos fluxos documentados e wrappers das capas/contadores.
- `v3.css`: nova camada visual e tokens; carregada após `styles.css`, que mantém a base e as adaptações mobile.
- `motion.mjs`: reveals, contadores decorativos, storytelling, progresso e seleção de componentes.
- `app.js`: inicialização do motion e encerramento dos contadores antes da renderização de métricas.
- `tests/app.test.mjs`: integração do novo módulo com a fixture existente.
- `tests/motion.test.mjs`: novos testes de comportamento e integridade dos contadores.

Nenhuma dependência externa, imagem gerada, screenshot fictício ou substituição de imagem foi acrescentada. A alteração local preexistente do PDF foi preservada.

## Validação e limites

Executados: `node --test` (**31 testes passando**), verificação de sintaxe de JavaScript e revisão de whitespace com `git diff --check`. Os testes existentes continuam cobrindo tradução PT/EN, navegação mobile, âncoras, assets, links preservados, SEO, storage bloqueado, cache e falhas GitHub. Os testes novos verificam contagem decorativa sem reescrever o valor acessível, cancelamento seguro, uma entrada por elemento, movimento reduzido, foco, seleção de componentes e coalescência de frames.

Comparação com o estado anterior: textos traduzíveis originais, destinos, datas e fontes de imagens mantidos; módulo GitHub, PDF, backup e imagens originais preservados. Os fluxos visuais dos projetos derivam da documentação já consultada na V2. A sequência de materiais AWS Data Engineering representa a progressão educacional, não um fluxo de rede de produção.

A ferramenta de interface não encontrou navegador nem conexão nativa disponíveis. **Não foram realizados testes visuais em 320, 375, 390, 430, 768 ou 1440 px**, nem em dispositivos reais, orientação horizontal ou leitor de tela. Não há resultado medido de Lighthouse, CLS ou frames por segundo. Os testes de interação usam fixtures de DOM e eventos, sem motor de layout.

Antes de publicar: revisar visualmente os breakpoints, o contraste, a escala dos títulos, o comportamento sticky, a contagem e o foco em navegador real, incluindo Safari/iPhone e Android. A nova referência a `v3.css` e `motion.mjs` requer publicar esses arquivos junto da página quando houver autorização para deploy.
