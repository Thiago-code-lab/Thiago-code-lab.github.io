# V3.1 — limpeza editorial e refinamento

Atualização local em 03/11/2026, sem commit, push ou deploy.

## Revisão editorial

Removidos os rótulos de classificação acima das seções, o resumo de tecnologias e a legenda repetitiva do hero, os chips duplicados do case, os campos Problema/Solução dos cards, os fluxos redundantes dos projetos e as notas sobre implementação, coleta, cache, fallback e validação.

Preservada a headline **Infraestrutura AWS. Do código à operação.** A apresentação agora identifica Thiago, sua atuação em Cloud Engineering, a fundação da CloudStudy e o trabalho com sistemas e produtos AWS em um parágrafo curto.

CloudStudy mantém as cinco etapas, com uma frase por etapa e participação técnica explícita. O painel passou a se chamar **Tecnologias em produção**: apresenta tecnologias e funções, sem desenhar relações entre serviços. A limitação das evidências e as informações necessárias para uma topologia real permanecem em `V3_NOTES.md` e `V2_NOTES.md`, fora da interface.

Os quatro projetos têm nome, uma descrição, tecnologias e link. Fraud Detection continua explicitamente educacional, com transações sintéticas e regras explicáveis. Tour4Friends continua identificado como projeto acadêmico em equipe e em desenvolvimento. Não foram acrescentados resultados, responsabilidades ou tecnologias.

Timeline com cargos e períodos originais e descrições reduzidas. As descrições completas das experiências continuam no currículo existente, que não foi alterado. Certificações profissionais e certificados educacionais continuam em grupos distintos. Nomes dos cursos, capas oficiais e referral codes foram preservados.

## Métricas e mensagens públicas

- `metrics.mjs` não foi modificado: snapshot de 03/11/2026, cache de 24 horas, validação e fallback permanecem.
- Valores continuam acompanhados de **GitHub · [data]**, sem apresentar o snapshot histórico como medição atual.
- Durante a consulta, o status diz apenas **Atualizando…**. Em falha, **Não foi possível atualizar agora.**, mantendo a data e o último conjunto completo.
- PT e EN usam a mesma informação, com data formatada no idioma. Nenhuma mensagem de cache, fallback ou API aparece ao visitante.
- Udemy mantém **3 cursos** e **200+ alunos no total**, em uma única área agregada. A fonte é o total informado pelo proprietário em 03/11/2026, conforme registrado em `V2_NOTES.md`; não são matrículas por curso nem usuários da CloudStudy. A nota sobre a fonte foi removida da página a pedido do proprietário.

## Visual e motion

Títulos assumem a hierarquia sem eyebrows. Cards têm menos linhas e divisores; o case perdeu a altura mínima por etapa e os painéis decorativos redundantes. O mapa técnico tem menos molduras e descrições menores. A leitura permanece completa em celular.

Mantidos reveals, contadores acessíveis, timeline, seleção de componentes, safe areas, menu com foco e suporte a movimento reduzido. Apenas os alvos de motion correspondentes aos labels removidos foram retirados; nenhuma animação nova foi adicionada.

## Redução de texto

Comparação do corpo HTML da V3 antes desta etapa com a V3.1, removendo tags e scripts e contando unidades separadas por espaços:

| Idioma | Antes | Depois | Redução aproximada |
| --- | ---: | ---: | ---: |
| Português | 1.291 | 783 | 39% |
| Inglês | 1.217 | 745 | 39% |

É uma estimativa estática de texto, não uma medição em navegador. A projeção em inglês substitui os textos pelos valores `data-en`; datas e números dinâmicos são cobertos separadamente pelos testes da aplicação.

## Validação

Textos PT/EN foram extraídos para revisão, incluindo labels, legendas, rodapé e feedback de atualização. Os testes editoriais foram ajustados para as mudanças intencionais e incluem proteção contra reaparecimento de notas internas na interface.

Foram preservados destinos e fontes de imagens, dados quantitativos, períodos, credenciais e metadados. PDF, backup e assets originais permanecem intactos.

O navegador continua indisponível na ferramenta de interface. Não houve inspeção visual ou teste de layout real. Resultados de testes automatizados e verificações de sintaxe/diff são informados na entrega; permanece pendente a conferência visual de desktop e mobile.
