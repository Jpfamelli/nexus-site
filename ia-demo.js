/**
 * NEXUS — Demonstração do atendente de IA.
 *
 * O visitante conversa aqui e vê, na prática, o que a Nexus instala no
 * WhatsApp do cliente. Roda 100% no navegador: sem chave de API exposta,
 * sem custo por conversa e sem depender de servidor no ar.
 *
 * Para plugar um modelo de verdade depois, basta preencher NX_IA.endpoint
 * com a URL de uma função serverless (a chave fica no servidor, nunca aqui).
 */
(function () {
  "use strict";

  var WHATS = "https://wa.me/5512982211090?text=";
  var linkWhats = function (msg) {
    return WHATS + encodeURIComponent(msg);
  };

  /* ------------------------------------------------------------------
     Base de conhecimento: cada entrada tem gatilhos e uma resposta.
     Escrita na voz da Nexus — direta, sem jargão, sempre com próximo passo.
     ------------------------------------------------------------------ */
  var BASE = [
    {
      id: "saudacao",
      gatilhos: ["oi", "ola", "olá", "bom dia", "boa tarde", "boa noite", "eae", "e ai", "opa", "hey"],
      resposta: "Oi! Sou o atendente da Nexus 👋 Posso te explicar serviços, preços e prazos — ou já agendar seu diagnóstico gratuito. O que você precisa resolver na sua empresa?",
      sugestoes: ["Quanto custa um site?", "Como funciona a IA no WhatsApp?", "Em quantos dias fica pronto?"]
    },
    {
      id: "preco",
      gatilhos: ["preco", "preço", "quanto custa", "valor", "custa", "investimento", "orcamento", "orçamento", "caro", "barato", "quanto e", "quanto é", "pagar"],
      resposta: "Temos três caminhos:\n\n• **Essencial** — a partir de R$ 3.500 + R$ 590/mês (site institucional, Google, IA no WhatsApp e 8 vídeos/mês)\n• **Crescimento** — a partir de R$ 5.000 + R$ 990/mês (tudo do Essencial + agendamento automático, 16 peças de social media, diária de gravação e identidade visual)\n• **Ultra** — a partir de R$ 7.500 + R$ 1.890/mês (a operação completa: anúncios gerenciados, recuperação de orçamento, sistema com painel, 2 diárias por mês e reunião estratégica)\n\nDá para contratar peças separadas também. O valor final sai fechado depois do diagnóstico, que é gratuito.",
      sugestoes: ["Posso contratar só o site?", "O que entra no acompanhamento mensal?", "Quero agendar o diagnóstico"]
    },
    {
      id: "prazo",
      gatilhos: ["prazo", "quanto tempo", "quantos dias", "demora", "rapido", "rápido", "quando fica", "entrega", "urgente"],
      resposta: "Site no ar em **5 dias** no Essencial, **9 dias** no Crescimento e **15 dias** no Ultra. Só o site avulso sai em 5 a 8 dias; a IA no WhatsApp fica ativa em até 10 dias; social media, anúncios e vídeos da diária têm primeira entrega em até 7 dias; sistema sob medida, a partir de 30 dias.\n\nA proposta chega em 24 horas depois do diagnóstico. Se você tem uma data apertada, me conta qual é que a gente vê o que dá para priorizar.",
      sugestoes: ["Quanto custa?", "Quero agendar o diagnóstico"]
    },
    {
      id: "ia",
      gatilhos: ["ia", "ia no whatsapp", "como funciona a ia", "funciona a ia", "a ia", "inteligencia artificial", "inteligência", "automacao", "automação", "robo", "robô", "bot", "atendente", "atendimento automatico", "chatbot", "responde sozinho", "atendente de ia", "atendente virtual"],
      resposta: "É exatamente o que você está usando agora 🙂\n\nA IA fica no **seu** WhatsApp e: responde na hora as perguntas que se repetem todo dia, coleta nome e o que a pessoa precisa, agenda sem trocar vinte mensagens, retoma orçamento parado e passa a conversa para uma pessoa quando sai do combinado.\n\nEla é treinada só com as informações que você aprovar — nada inventado. É a mesma família da IA que atende no WhatsApp da **IndyCar** hoje.",
      sugestoes: ["E se ela responder errado?", "Preciso ter site para contratar?", "Quanto custa?"]
    },
    {
      id: "erro-ia",
      gatilhos: ["responder errado", "responde errado", "errado", "erro", "falar besteira", "inventar", "confiavel", "confiável", "seguro"],
      resposta: "Boa pergunta — é a dúvida número um.\n\nA IA trabalha com limites claros e só com as informações que a sua empresa aprovou. Quando a pergunta foge do combinado, ela não inventa: passa a conversa para uma pessoa da equipe e avisa o cliente que alguém vai continuar dali.",
      sugestoes: ["Como funciona a IA no WhatsApp?", "Quero agendar o diagnóstico"]
    },
    {
      id: "site",
      gatilhos: ["site", "pagina", "página", "landing", "website", "presenca digital", "presença digital", "google"],
      resposta: "Montamos o site que explica o que você faz sem enrolação: rápido no celular, Google Perfil da Empresa configurado, caminho curto até o WhatsApp e estrutura para aparecer nas buscas da região.\n\nSó o site sai a partir de **R$ 3.900**, pronto em 5 a 8 dias. Quer ver exemplos? IndyCar, Prado, Eletronic, Sarbomix e ALVEXZ estão no ar agora — e este site também é nosso.",
      sugestoes: ["Quero ver os projetos", "Quanto custa o pacote completo?", "Em quantos dias fica pronto?"]
    },
    {
      id: "conteudo",
      gatilhos: ["conteudo", "conteúdo", "social media", "instagram", "post", "video", "vídeo", "gravacao", "gravação", "reels", "edicao", "edição"],
      resposta: "Cuidamos da pauta, da gravação e da edição — o perfil deixa de depender do tempo que sobra.\n\nSocial media mensal sai a partir de **R$ 1.890/mês** (12 peças, textos, artes e calendário). A diária de gravação é **R$ 1.790** e rende 8 vídeos curtos editados, com legendas e capas.",
      sugestoes: ["Quanto custa o pacote completo?", "Quero agendar o diagnóstico"]
    },
    {
      id: "anuncios",
      gatilhos: ["anuncio", "anúncio", "anuncios", "anúncios", "trafego", "tráfego", "trafego pago", "tráfego pago", "ads", "google ads", "meta ads", "facebook ads", "instagram ads", "impulsionar", "patrocinado", "campanha", "radar de alertas", "painel de anuncios", "relatorio diario"],
      resposta: "Gestão de anúncios no Google ou Instagram por **R$ 1.490/mês** + a verba de mídia que você definir. Entra configuração da campanha, ajustes semanais e um relatório mensal direto — sem relatório de cinquenta páginas. Campanha no ar em até 7 dias.\n\nPara quem já anuncia, dá para montar uma central como a da **IndyCar**: painel Meta + Google, radar que avisa quando algo sai do padrão e relatório diário chegando no WhatsApp do dono. No **Ultra**, os anúncios gerenciados já estão inclusos.",
      sugestoes: ["Quanto custa?", "Quero agendar o diagnóstico"]
    },
    {
      id: "sistema",
      gatilhos: ["sistema", "sistemas", "planilha", "painel", "gestao", "gestão", "software", "programa", "sob medida", "sistema sob medida", "sistema proprio", "sistema próprio"],
      resposta: "Quando a planilha e o grupo de mensagens já não dão conta, montamos um fluxo mais simples: painéis para acompanhar pedidos, cadastros organizados, tarefas que rodam sem cobrança manual e as ferramentas conversando entre si.\n\nExemplos reais rodando hoje: os sete sistemas da **IndyCar** (agendamento, atendimento com IA, CRM, pós-venda, tráfego pago, robôs e banco único) e o painel de estoque da **Eletronic**.\n\nProjeto a partir de **R$ 6.900**, prazo a partir de 30 dias, com treinamento da equipe incluso. No pacote **Ultra** já entra um sistema sob medida com painel de indicadores.",
      sugestoes: ["Quanto custa?", "Quero agendar o diagnóstico"]
    },
    {
      id: "avulso",
      gatilhos: ["avulso", "so o site", "só o site", "separado", "sem pacote", "uma parte", "apenas"],
      resposta: "Pode sim! Dá para contratar só a parte que te aperta agora: site profissional, automação com IA, social media, anúncios, diária de gravação ou sistema sob medida.\n\nSe depois fizer sentido juntar mais coisa, a gente combina o próximo passo — sem te obrigar a trocar de pacote.",
      sugestoes: ["Quanto custa um site?", "Como funciona a IA no WhatsApp?"]
    },
    {
      id: "pacote",
      gatilhos: ["pacote", "plano", "planos", "pacotes", "diferenca entre os planos", "qual a diferenca", "comparar planos", "essencial", "crescimento", "mensalidade", "mensal", "acompanhamento", "assinatura"],
      resposta: "**Essencial** (R$ 3.500 + R$ 590/mês): site institucional, Google Perfil da Empresa, IA no WhatsApp, 8 vídeos curtos por mês e suporte.\n\n**Crescimento** (R$ 5.000 + R$ 990/mês): tudo do Essencial + agendamento e cobrança automáticos, 16 peças de social media, uma diária de gravação por mês, identidade visual e relatório mensal.\n\n**Ultra** (R$ 7.500 + R$ 1.890/mês): tudo do Crescimento + anúncios gerenciados, recuperação de orçamento parado, sistema sob medida com painel, 2 diárias por mês, 24 peças, vídeo institucional e reunião estratégica.\n\nA mensalidade é o acompanhamento: revisamos o uso, corrigimos atritos e ajustamos conforme a empresa muda.",
      sugestoes: ["Como cancelo depois?", "Quero agendar o diagnóstico"]
    },
    {
      id: "cancelar",
      gatilhos: ["cancelar", "cancelamento", "fidelidade", "contrato", "multa", "sair", "parar"],
      resposta: "Prazo, aviso e o que está incluído ficam escritos na proposta **antes** de começar. Você sabe como funciona antes de contratar — sem regra escondida depois.",
      sugestoes: ["Quanto custa?", "Quero agendar o diagnóstico"]
    },
    {
      id: "regiao",
      gatilhos: ["onde", "regiao", "região", "cidade", "cidades", "taubate", "taubaté", "vale do paraiba", "vale do paraíba", "presencial", "distancia", "distância", "atende", "atendem", "pindamonhangaba", "pinda", "sao jose", "são josé", "sao jose dos campos", "jacarei", "jacareí", "caraguatatuba", "caragua", "ubatuba", "guaratingueta", "guaratinguetá", "tremembe", "tremembé", "cacapava", "caçapava", "lorena", "aparecida", "cruzeiro", "campos do jordao", "sao sebastiao", "litoral norte", "sao paulo", "capital", "interior", "outra cidade", "outro estado", "fora daqui", "meu estado", "online", "remoto"],
      resposta: "Somos de **Taubaté** e atendemos todo o **Vale do Paraíba** — São José dos Campos, Jacareí, Pindamonhangaba, Guaratinguetá, Caçapava, Tremembé, Lorena e o litoral norte incluídos. Projetos à distância também rolam numa boa: a **Sarbomix**, que está no ar, fica na região de São Roque e Itapevi, e foi feita inteira a distância.\n\nSó as gravações presenciais fora da região precisam de um alinhamento de logística antes da proposta.",
      sugestoes: ["Quero agendar o diagnóstico", "Quanto custa?"]
    },
    {
      id: "diagnostico",
      gatilhos: ["diagnostico", "diagnóstico", "agendar", "conversar", "reuniao", "reunião", "falar com alguem", "falar com alguém", "contato", "comecar", "começar", "contratar", "quero"],
      resposta: "Perfeito. O diagnóstico é **gratuito e leva 30 minutos**: você conta onde a rotina trava e a gente mostra o que vale organizar primeiro — e o que pode esperar. A proposta chega em 24 horas.\n\nÉ só chamar no WhatsApp que a gente marca o horário.",
      cta: {
        texto: "Agendar meu diagnóstico no WhatsApp",
        link: linkWhats("Olá, testei o atendente de IA no site da Nexus e quero agendar meu diagnóstico gratuito.")
      },
      sugestoes: ["Quanto custa?", "Em quantos dias fica pronto?"]
    },
    {
      id: "projetos",
      gatilhos: ["projeto", "projetos", "portfolio", "portfólio", "exemplo", "exemplos", "trabalho", "trabalhos", "case", "cases", "ver site", "clientes", "quais sites", "sites que voces fizeram", "sites que vocês fizeram", "ja fizeram", "já fizeram", "todos os sites", "galeria", "o que voces ja fizeram"],
      resposta: "Sete sites feitos pela Nexus — seis no ar agora:\n\n• **IndyCar Centro Automotivo** — oficina de Taubaté, site + sete sistemas ligados no mesmo banco\n• **Prado Moda Social** — catálogo com sacola e fechamento no WhatsApp\n• **Eletronic** — boutique de iPhones com vitrine em tempo real e painel\n• **Sarbomix Concreto Usinado** — concreteira com calculadora de m³ e pedido pelo WhatsApp\n• **ALVEXZ Imports** — e-commerce de streetwear com carrinho e checkout\n• **Kamiguchi Odontologia** — clínica de Taubaté, site pronto, em publicação\n• **Nexus** — este site, o nosso portfólio vivo\n\nNa galeria \"Todos os sites\" você filtra por Sites, Sistemas e IA e abre cada um ao vivo. Me pergunta de qualquer um deles que eu conto os detalhes.",
      sugestoes: ["Quanto custa um site assim?", "Quero agendar o diagnóstico"]
    },
    {
      id: "nexus",
      gatilhos: ["nexus", "quem e voces", "quem são vocês", "quem sao voces", "quem é a nexus", "sobre a empresa", "fazem o que", "o que voces fazem", "o que vocês fazem", "o que faz", "quais servicos", "quais serviços"],
      resposta: "A Nexus monta a presença e o atendimento que mantêm empresas locais vendendo mesmo quando o dono está ocupado.\n\nNa prática: site e presença digital, atendimento automático com IA no WhatsApp, conteúdo (gravação, edição e social media) e sistemas sob medida.",
      sugestoes: ["Quanto custa?", "Quero ver os projetos"]
    },
    {
      id: "app",
      gatilhos: ["aplicativo", "app", "android", "ios", "loja de aplicativo", "play store", "app store"],
      resposta: "Aplicativo de loja (Play Store / App Store) não é o nosso carro-chefe — o que a gente entrega é sistema web sob medida, que abre no navegador do celular e do computador, sem o cliente precisar instalar nada.\n\nSe o seu caso pede um app mesmo, me conta o que ele faria no diagnóstico que eu te falo com sinceridade se é o melhor caminho.",
      sugestoes: ["Como funciona o sistema sob medida?", "Quero agendar o diagnóstico"]
    },
    {
      id: "obrigado",
      gatilhos: ["obrigado", "obrigada", "valeu", "vlw", "brigado", "show", "legal", "otimo", "ótimo", "perfeito", "massa", "daora"],
      resposta: "Imagina, é o meu trabalho 😄 Se quiser seguir com uma conversa de verdade, é só chamar no WhatsApp — o diagnóstico é gratuito e sem compromisso.",
      cta: {
        texto: "Falar com a equipe no WhatsApp",
        link: linkWhats("Olá, testei o atendente de IA no site da Nexus e quero conversar sobre a minha empresa.")
      },
      sugestoes: ["Quanto custa?", "Como funciona a IA no WhatsApp?"]
    },
    {
      id: "humano",
      gatilhos: ["humano", "pessoa", "atendente real", "falar com humano", "gente de verdade", "robô mesmo", "voce e um robo", "você é um robô"],
      resposta: "Sou uma IA, sim — igualzinha à que a Nexus instala no WhatsApp dos clientes. Quando a conversa precisa de gente de verdade, eu passo a bola: é só chamar no WhatsApp que uma pessoa da equipe assume dali.",
      cta: {
        texto: "Falar com uma pessoa no WhatsApp",
        link: linkWhats("Olá, vim do atendente de IA do site da Nexus e quero falar com uma pessoa da equipe.")
      },
      sugestoes: ["Como funciona a IA no WhatsApp?", "Quanto custa?"]
    }
,
    {
      id: "pagamento",
      gatilhos: ["como funciona o pagamento", "formas de pagamento", "aceita pix", "aceita cartao", "aceita cartão de crédito", "da pra parcelar", "parcelamento", "posso pagar em quantas vezes", "paga tudo de uma vez", "tem que pagar tudo adiantado", "aceita boleto", "aceita transferencia", "como pago", "pagto", "forma de pgto", "pago antes ou depois", "quando começa a mensalidade", "posso pagar depois de pronto", "parcela a implantacao"],
      resposta: "A implantação é dividida: uma parte na aprovação do projeto e o resto na entrega. A mensalidade (**R$ 590** no Essencial, **R$ 990** no Crescimento) só começa depois que tudo está no ar e funcionando.\n\nPix ou cartão. As condições exatas de parcelamento saem na proposta, em até **24 horas**. Chama no WhatsApp que a gente monta do jeito que cabe no seu caixa.",
      sugestoes: ["Tem desconto à vista?", "O que entra no Essencial?", "Quero a proposta"],
      cta: { texto: "Ver condições no WhatsApp", link: linkWhats("Olá, vim do atendente de IA do site da Nexus. Ver condições no WhatsApp.") },
    },
    {
      id: "desconto",
      gatilhos: ["tem desconto", "faz por menos", "consegue melhorar o preço", "ta caro da um desconto", "desconto a vista", "qual seu melhor preço", "tem promocao", "promoção", "faz mais barato", "abaixa o valor", "desconto pra fechar hoje", "da um precinho", "consegue fazer por 2 mil", "kd o desconto", "tem algum abatimento", "nao cabe no meu orçamento"],
      resposta: "O preço da tabela é o preço real — não inflo valor pra depois fingir desconto.\n\nO que dá pra ajustar é o escopo: entrar mais leve, tirando o que você não vai usar agora, ou fechar à vista e negociar a implantação. Também dá pra começar só pelo site (**R$ 3.900**) ou só pela automação com IA (**R$ 2.900** + **R$ 690/mês**).\n\nMe diga quanto cabe no seu orçamento no diagnóstico gratuito de **30 minutos** e eu monto a versão possível.",
      sugestoes: ["Qual a diferença entre os pacotes?", "Dá pra começar só com o site?", "Agendar o diagnóstico"],
      cta: { texto: "Agendar diagnóstico gratuito", link: linkWhats("Olá, vim do atendente de IA do site da Nexus. Agendar diagnóstico gratuito.") },
    },
    {
      id: "garantia",
      gatilhos: ["e se eu nao gostar", "tem garantia", "e se não funcionar", "se der errado", "e se nao der certo", "posso desistir", "devolve o dinheiro", "reembolso", "garantia de resultado", "e se o site ficar feio", "e se eu não gostar do layout", "vcs garantem", "qual a garantia", "e se eu nao aprovar", "posso testar antes", "vcs garantem cliente", "garantem mais clientes", "garante mais clientes", "garantem clientes", "mais clientes", "trazer clientes", "garantem", "garante"],
      resposta: "Nada vai pro ar sem o seu sim. Você aprova o layout antes de a gente programar, então \"não gostei\" vira ajuste, não prejuízo.\n\nO que eu garanto é entrega no prazo combinado (**5 dias** no Essencial, **9** no Crescimento, **15** no Ultra) e conserto do que sair fora do que foi acordado, sem cobrar de novo. Volume de venda ninguém honesto garante — quem garante está vendendo ilusão.\n\nA mensalidade você avalia mês a mês. Quer ver como funciona antes de decidir? O diagnóstico é gratuito.",
      sugestoes: ["Como é o processo de aprovação?", "Tem contrato?", "Quero o diagnóstico gratuito"],
      cta: { texto: "Falar com a Nexus", link: linkWhats("Olá, vim do atendente de IA do site da Nexus. Falar com a Nexus.") },
    },
    {
      id: "propriedade",
      gatilhos: ["o site é meu", "de quem fica o site", "quem é o dono do site", "se eu sair fico com o site", "o dominio é meu", "as contas ficam no meu nome", "posso levar o site", "site fica comigo", "propriedade do site", "quem fica com o codigo", "se eu cancelar perco o site", "o instagram fica no meu nome", "quem controla o google", "posso migrar pra outro", "de quem é o material", "fico refem de voces"],
      resposta: "Tudo é seu. Domínio, site, textos, fotos, Google Perfil da Empresa e conta de anúncio ficam no **seu nome**, não no da Nexus.\n\nA gente opera, você é o dono. Se um dia quiser levar pra outra pessoa, leva: passamos todos os acessos e senhas sem drama. Ninguém aqui fica refém de fornecedor.",
      sugestoes: ["Tem fidelidade?", "Como faço se quiser cancelar?", "Quero entender os pacotes"],
    },
    {
      id: "hospedagem-dominio",
      gatilhos: ["hospedagem", "tem que pagar hospedagem", "hospedagem é a parte", "e o dominio", "dominio ta incluso", "quanto custa o dominio", "preciso comprar dominio", "tem custo extra", "tem taxa escondida", "custo adicional", "alem da mensalidade pago mais alguma coisa", "o que mais eu pago", "hospedagm", "dominio incluso no pacote", "preciso pagar servidor", "tem pegadinha no preço"],
      resposta: "A hospedagem está dentro da mensalidade. Você não paga servidor separado nem recebe cobrança surpresa.\n\nO domínio (o www.suaempresa.com.br) fica registrado no **seu nome** e custa por volta de **R$ 40 por ano** direto no Registro.br — a gente faz o registro pra você. Já tem domínio? Melhor ainda, a gente aponta pro site novo.\n\nÚnico outro custo possível é a verba de anúncio, e só se você quiser anunciar. Fora isso, não tem taxa escondida.",
      sugestoes: ["Quanto custa a gestão de anúncios?", "O que a mensalidade cobre?", "Quero uma proposta"],
    },
    {
      id: "editar-sozinho",
      gatilhos: ["posso editar o site", "eu mesmo mudo", "consigo mexer sozinho", "como faço pra trocar uma foto", "preciso de voces pra mudar", "da pra alterar preço sozinho", "tem painel", "tem area administrativa", "eu que atualizo", "quem atualiza o site", "se eu quiser mudar um texto", "preciso saber programar", "nao entendo de tecnologia consigo mexer", "tem cms", "é dificil de mexer", "mexer no site", "mexer sozinho", "editar sozinho", "alterar sozinho", "mudar sozinho", "atualizar sozinho", "mexer depois", "eu consigo mexer", "mexo no site"],
      resposta: "Dos dois jeitos, você escolhe.\n\nO caminho fácil: manda no WhatsApp o texto, a foto ou o preço novo e a gente aplica. Está dentro da mensalidade, sem cobrar por alteração.\n\nO caminho autônomo: entregamos o painel e ensinamos numa call de 20 minutos. É clicar e digitar, nada de código. Você não precisa entender de tecnologia — esse é justamente o ponto.",
      sugestoes: ["Alteração tem limite?", "O que entra na mensalidade?", "Quero ver um projeto no ar"],
    },
    {
      id: "resultado-tempo",
      gatilhos: ["quanto tempo pra dar resultado", "em quanto tempo vejo resultado", "quando começa a aparecer cliente", "demora pra dar retorno", "quantos clientes vou ter", "em quanto tempo se paga", "vale a pena mesmo", "quando vou ver retorno", "isso funciona mesmo", "da resultado", "vou vender mais", "quanto tempo pra aparecer no google", "quando começa a chegar lead", "resultado em quanto tempo", "prazo de resultado", "isso trás cliente"],
      resposta: "São duas coisas diferentes, e é bom separar.\n\n• **Entrega**: no ar em **5 dias** (Essencial) ou **9 dias** (Crescimento).\n• **Resultado**: vem em camadas. A IA no WhatsApp funciona no primeiro dia — você para de perder quem chama fora do horário. O Google Perfil da Empresa costuma ganhar tração em **30 a 60 dias**. Conteúdo e anúncio maturam a partir do segundo mês.\n\nQuem promete fila de cliente na primeira semana está vendendo ilusão. No diagnóstico eu mostro qual ponta do seu negócio dá retorno mais rápido.",
      sugestoes: ["O que a IA responde no WhatsApp?", "Como funciona o relatório mensal?", "Agendar o diagnóstico"],
      cta: { texto: "Agendar diagnóstico gratuito", link: linkWhats("Olá, vim do atendente de IA do site da Nexus. Agendar diagnóstico gratuito.") },
    },
    {
      id: "segmento",
      gatilhos: ["voces atendem oficina", "trabalha com clinica", "atende loja de roupa", "faz pra restaurante", "atende advogado", "escritorio de advocacia", "assistencia tecnica", "salão de beleza", "atende barbearia", "petshop", "meu ramo é diferente", "funciona pro meu segmento", "ja fez pra alguem do meu ramo", "atende academia", "serve pra qualquer negocio", "atende dentista", "faz pra imobiliaria", "atende autonomo", "oficina", "oficina mecanica", "mecanica", "clinica", "loja de roupa", "restaurante", "advocacia", "barbearia", "salao", "academia", "dentista", "imobiliaria", "meu ramo", "meu segmento", "meu tipo de negocio"],
      resposta: "Sim. O foco da Nexus é negócio local de serviço e varejo: oficina, loja, assistência técnica, clínica, prestador de serviço.\n\nExemplos no ar agora: **IndyCar** (oficina), **Prado** (moda masculina), **Eletronic** (loja de iPhones), **Sarbomix** (concreteira), **ALVEXZ** (e-commerce de streetwear) e a **Kamiguchi** (clínica odontológica, em publicação). Ramos bem diferentes, mesma engrenagem — aparecer no Google, responder rápido no WhatsApp e agendar sem depender de alguém livre pra digitar.\n\nMe conta qual é o seu ramo. Se não fizer sentido pro seu caso, eu falo na hora.",
      sugestoes: ["Quero ver os projetos no ar", "Como a IA atenderia meu negócio?", "Agendar o diagnóstico"],
      cta: { texto: "Contar meu ramo no WhatsApp", link: linkWhats("Olá, vim do atendente de IA do site da Nexus. Contar meu ramo no WhatsApp.") },
    },
    {
      id: "cnpj-nota",
      gatilhos: ["precisa de cnpj", "sou mei da certo", "nao tenho cnpj", "atende pessoa fisica", "trabalho como autonomo", "emite nota fiscal", "tem nota", "nota fiscal", "sou mei", "preciso ter empresa aberta", "cpf serve", "consigo contratar sem cnpj", "emite nf", "manda nota", "preciso abrir empresa", "sou autonomo posso contratar", "cnpj", "mei", "pessoa fisica", "nota"],
      resposta: "Não precisa de CNPJ. MEI, autônomo e pessoa física contratam normal — boa parte dos clientes é MEI.\n\nNota fiscal sai em todo pagamento, então dá pra lançar como despesa se você tiver empresa. Só um detalhe: o Google Perfil da Empresa pede endereço ou área de atendimento, e isso a gente resolve junto na implantação.\n\nMe manda o nome que vai no site e a gente começa.",
      sugestoes: ["O que preciso mandar pra começar?", "Como funciona o Google Perfil da Empresa?", "Quero a proposta"],
      cta: { texto: "Começar pelo WhatsApp", link: linkWhats("Olá, vim do atendente de IA do site da Nexus. Começar pelo WhatsApp.") },
    },
    {
      id: "contrato-fidelidade",
      gatilhos: ["tem contrato", "assina contrato", "precisa assinar", "tem fidelidade", "quanto tempo de contrato", "contrato de quantos meses", "fica preso", "tem multa", "multa por cancelamento", "prazo minimo", "contrato de fidelidade", "e no papel", "tem que assinar alguma coisa", "contrato mensal", "carencia", "é tudo no boca a boca"],
      resposta: "Tem contrato, sim. Curto e em português claro: o que entra, o prazo de entrega, o valor e de quem são os acessos.\n\nEle existe pra te proteger, não pra te prender. A mensalidade é mês a mês — quer parar, você avisa e a gente encerra passando tudo que é seu.\n\nO contrato chega junto com a proposta, em até **24 horas** depois do diagnóstico.",
      sugestoes: ["Como faço pra cancelar?", "O site fica no meu nome?", "Quero a proposta"],
      cta: { texto: "Pedir proposta e contrato", link: linkWhats("Olá, vim do atendente de IA do site da Nexus. Pedir proposta e contrato.") },
    },
    {
      id: "fazer-sozinho",
      gatilhos: ["meu sobrinho faz", "tenho um primo que mexe com isso", "posso fazer no wix", "da pra fazer sozinho", "por que nao usar chatgpt", "pra que pagar se tenho o canva", "freelancer cobra menos", "achei mais barato com um freela", "vi um cara fazendo por 500", "qual a diferença de fazer sozinho", "porque nao contratar um freelancer", "site gratis", "tem site de graça", "vale a pena fazer eu mesmo", "meu funcionario pode fazer", "é so um site né"],
      resposta: "Dá pra fazer sozinho, sem ironia. O problema nunca é começar — é manter.\n\nUm site no Wix fica no ar. O que não fica é alguém respondendo o WhatsApp às 21h, postando toda semana, atualizando o Google e olhando o que converteu. Freelancer entrega e some; sobrinho some antes.\n\nA Nexus fica operando junto: **8 vídeos/mês** no Essencial, **16 peças** no Crescimento, IA respondendo 24h e suporte direto comigo. Se sua equipe dá conta disso, faça por dentro — falo isso numa boa. Se não dá, a gente conversa.",
      sugestoes: ["O que entra na mensalidade?", "Quero ver os projetos no ar", "Agendar o diagnóstico"],
      cta: { texto: "Conversar no WhatsApp", link: linkWhats("Olá, vim do atendente de IA do site da Nexus. Conversar no WhatsApp.") },
    },
    {
      id: "comecar-material",
      gatilhos: ["o que preciso mandar", "o que voces precisam de mim", "como começa", "como comeco", "como começo", "por onde comeco", "por onde começo", "quero comecar", "quero começar", "quero começar o que faço", "preciso mandar fotos", "e se eu nao tiver logo", "nao tenho fotos", "preciso ter material pronto", "que informações precisa", "o que devo enviar", "como é o processo", "qual o primeiro passo", "e depois que eu fechar", "quanto do meu tempo vai tomar", "preciso parar minha rotina", "tenho que ficar em cima"],
      resposta: "Pouca coisa: nome da empresa, o que você vende, endereço, telefone e o que já tiver de foto e logo.\n\nNão tem logo? Identidade visual está inclusa no **Crescimento**. Não tem foto boa? A diária de gravação (**R$ 1.790**) resolve com 8 vídeos editados.\n\nSeu tempo total gira em torno de **1 hora**: o diagnóstico de 30 minutos e uma call de aprovação. O resto corre por aqui. Manda um oi no WhatsApp que eu já te passo a listinha.",
      sugestoes: ["Quanto tempo até o site ir ao ar?", "Quero a lista do que enviar", "Agendar o diagnóstico"],
      cta: { texto: "Começar agora no WhatsApp", link: linkWhats("Olá, vim do atendente de IA do site da Nexus. Começar agora no WhatsApp.") },
    },
    {
      id: "manutencao",
      gatilhos: ["e depois que entrega", "tem manutencao", "manutencao", "manutenção", "manutencao do site", "manutenção do site", "quem cuida depois", "e se der problema", "site sair do ar quem arruma", "tem suporte", "suporte depois", "manutençao mensal", "a mensalidade cobre o que", "pra que serve a mensalidade", "pq pagar mensalidade", "o que eu pago todo mes", "e se eu so quiser o site sem mensalidade", "atualização do site", "quem atualiza depois", "some depois de entregar"],
      resposta: "A mensalidade é exatamente isso: hospedagem, monitoramento, correções, ajustes de texto e foto, a IA do WhatsApp rodando e o conteúdo do mês.\n\nDeu problema, você chama no WhatsApp e fala com quem fez o seu projeto. Sem central, sem protocolo, sem ticket.\n\nSe você quer só o site e cuidar do resto por conta, existe o avulso de **R$ 3.900** — aí a manutenção fica com você. Vale dizer: site parado envelhece rápido.",
      sugestoes: ["Qual o horário do suporte?", "Diferença entre o avulso e o Essencial", "Quero a proposta"],
    },
    {
      id: "alteracoes",
      gatilhos: ["quantas alterações posso pedir", "posso pedir mudança", "e se eu quiser mudar depois", "tem limite de alteração", "quantas revisões", "cobra pra mudar", "mudança tem custo", "se eu quiser trocar uma foto cobra", "posso pedir ajuste", "alteracao é cobrada", "quantas vezes posso mexer", "revisao do layout", "posso mudar o layout depois", "muda quantas vezes", "troca de preço no site cobra"],
      resposta: "Na implantação, alteração faz parte do jogo: você aprova o layout antes de a gente programar e ajusta até ficar do seu jeito.\n\nDepois no ar, mudança de texto, foto, preço, horário e telefone entra na mensalidade — sem contar quantas. É pra você não ter medo de pedir.\n\nO que vira orçamento à parte é obra nova: página a mais, funcionalidade nova, outra automação. Aí eu te falo o valor antes, nunca depois.",
      sugestoes: ["Posso editar sozinho?", "O que entra na mensalidade?", "Quero a proposta"],
    },
    {
      id: "tempo-resposta",
      gatilhos: ["quanto tempo a ia demora", "demora pra responder", "responde em quanto tempo", "tempo de resposta", "responde na hora", "responde rapido", "responde rápido", "é instantaneo", "instantaneo", "demora muito pra responder", "ia demora", "leva quanto tempo pra responder", "responde na hora mesmo", "resposta automatica demora", "demora a resposta", "qnto tempo responde"],
      resposta: "Na hora. A resposta sai em **poucos segundos**, seja às 9h de terça ou às 2h de domingo, e não importa se tem uma ou vinte pessoas chamando ao mesmo tempo.\n\nEsse é o ponto que mais muda o jogo: cliente que espera duas horas por um retorno já pediu orçamento em outro lugar. Você mesmo está testando isso agora — repare no tempo entre a sua pergunta e esta resposta.",
      sugestoes: ["Ela funciona fora do horário?", "Quantas conversas aguenta?", "Quanto custa a automação?"],
    },
    {
      id: "whatsapp-tipo",
      gatilhos: ["precisa de whatsapp business", "whatsapp business", "funciona no meu whatsapp normal", "meu whatsapp comum", "tenho que trocar de numero", "preciso de numero novo", "perco meu numero", "whatsapp api", "precisa de api", "posso usar meu whatsapp", "muda o numero", "conta business", "wpp business", "zap business", "meu numero atual", "tem que ser business"],
      resposta: "Funciona no **seu número de sempre** — o cliente continua chamando o mesmo WhatsApp que já está no cartão, na fachada e no Google. Você não perde contatos nem histórico.\n\nDependendo do volume de mensagens, a gente usa o WhatsApp Business (gratuito) ou a API oficial da Meta. Qual dos dois faz sentido no seu caso a gente define no diagnóstico, sem você precisar entender de nada disso.",
      sugestoes: ["Preciso deixar o celular ligado?", "Quantas conversas aguenta?", "Quero agendar o diagnóstico"],
    },
    {
      id: "celular-ligado",
      gatilhos: ["precisa deixar o celular ligado", "celular ligado", "meu celular precisa ficar ligado", "e se o celular descarregar", "se acabar a bateria", "celular desligado", "roda no meu celular", "precisa de computador ligado", "fica na nuvem", "e se a internet cair", "sem internet", "depende do meu telefone", "celular tem que ficar online", "tem que ficar com o app aberto", "se eu viajar"],
      resposta: "Não precisa. A IA roda **na nuvem**, não dentro do seu aparelho.\n\nCelular descarregado, sem sinal, desligado ou esquecido em casa: o atendimento continua. Quando você abrir o WhatsApp, todas as conversas estão lá, organizadas e com o que cada cliente pediu.",
      sugestoes: ["Ela funciona fora do horário?", "Funciona no meu WhatsApp normal?", "Quanto custa a automação?"],
    },
    {
      id: "volume-conversas",
      gatilhos: ["quantas conversas aguenta", "aguenta quantas pessoas", "muitas pessoas ao mesmo tempo", "limite de conversas", "quantos clientes ao mesmo tempo", "muita gente falando junto", "trava se lotar", "aguenta o volume", "atende varias pessoas", "capacidade", "quantas mensagens por mes", "limite de mensagens", "e se vier muita gente", "dia de pico", "atende quantos"],
      resposta: "Não existe fila. Ela conversa com **dez, cinquenta ou duzentas pessoas ao mesmo tempo**, na mesma velocidade, sem misturar uma conversa com a outra.\n\nÉ justamente no dia de movimento — promoção, feriado, campanha no ar — que ela paga o próprio custo, porque é quando a equipe humana não dá conta e o cliente desiste.",
      sugestoes: ["Quanto tempo ela demora pra responder?", "E se ela responder errado?", "Quanto custa a automação?"],
    },
    {
      id: "agenda-integra",
      gatilhos: ["ela agenda", "sistema de agendamento", "agendamento da indycar", "agenda na minha agenda", "google agenda", "google calendar", "integra com minha agenda", "marca horario sozinha", "ela marca horario", "agendamento automatico", "vai bater com minha agenda", "conflito de horario", "dois clientes no mesmo horario", "marcar consulta", "marca no meu calendario", "horario ocupado", "agenda automatica"],
      resposta: "Agenda sim. Ela consulta os horários livres, fecha com o cliente e lança o compromisso na agenda que a sua equipe já usa — Google Agenda ou o painel que a gente monta. Horário ocupado ela simplesmente não oferece, então acaba a história de dois clientes marcados às 14h.\n\nAgendamento e cobrança automáticos entram no pacote **Crescimento (a partir de R$ 5.000 + R$ 990/mês)**. Foi assim que fizemos na IndyCar.",
      sugestoes: ["Integra com meu sistema?", "Quero ver os projetos", "Quero agendar o diagnóstico"],
    },
    {
      id: "integracao-sistema",
      gatilhos: ["integra com meu sistema", "integração", "integracao", "conecta com meu sistema", "meu erp", "meu crm", "sistema que eu ja uso", "funciona com planilha", "google planilhas", "puxa os dados", "conversa com meu programa", "tem api", "sincroniza", "meu sistema de gestao", "software que uso", "integra com excel"],
      resposta: "Na maioria dos casos sim. Agenda, planilhas do Google, CRM e boa parte dos sistemas de gestão têm integração pronta — os dados passam a andar sozinhos entre WhatsApp, agenda e cadastro.\n\nSe o seu sistema for fechado ou muito antigo, a gente avalia o que dá para conectar e o que compensa mais substituir por um fluxo sob medida (**a partir de R$ 6.900**). Me diz o nome do sistema que você usa hoje.",
      sugestoes: ["Ela agenda na minha agenda?", "Como funciona o sistema sob medida?", "Quero agendar o diagnóstico"],
      cta: { texto: "Falar sobre integração no WhatsApp", link: linkWhats("Olá, vim do atendente de IA do site da Nexus. Falar sobre integração no WhatsApp.") },
    },
    {
      id: "fora-horario",
      gatilhos: ["funciona fora do horario", "fora do expediente", "de madrugada", "fim de semana", "final de semana", "domingo", "sabado", "feriado", "depois que fecha", "24 horas", "atende de noite", "quando estou dormindo", "horario comercial", "atende sempre", "e a noite", "fora do horario comercial"],
      resposta: "**24 horas por dia, todos os dias** — inclusive domingo e feriado.\n\nMuita gente pesquisa e pede orçamento à noite ou no fim de semana, que é exatamente quando a maioria das empresas some. A IA responde na hora, entende o que a pessoa quer e já deixa o atendimento encaminhado para quando você abrir.",
      sugestoes: ["Quanto tempo ela demora pra responder?", "E se o cliente quiser falar com uma pessoa?", "Quanto custa a automação?"],
    },
    {
      id: "site-celular",
      gatilhos: ["site no celular", "fica bom no celular", "abre no celular", "responsivo", "é responsivo", "site rapido", "carrega rapido", "site lento", "site pesado", "demora pra carregar", "mobile", "tablet", "adapta na tela", "velocidade do site", "funciona em qualquer celular", "fica quebrado no celular"],
      resposta: "O site é feito **começando pelo celular**, que é de onde vem a maior parte das visitas — e não o contrário. Ele se ajusta a qualquer tela, carrega em poucos segundos e mantém o botão de WhatsApp sempre à mão.\n\nIsso não é capricho: site pesado espanta cliente antes de abrir e ainda derruba sua posição no Google. Quer ver rodando? A IndyCar e a Prado estão no ar, abra pelo seu celular.",
      sugestoes: ["Quero ver os projetos", "O site aparece no Google?", "Quanto custa um site?"],
    },
    {
      id: "google-busca",
      gatilhos: ["aparecer no google", "como apareco no google", "seo", "otimizado para o google", "pesquisa no google", "primeiro lugar no google", "ser encontrado", "meu concorrente aparece e eu nao", "google meu negocio", "google perfil da empresa", "google maps", "maps", "ranquear", "aparece quando pesquisam", "nao apareco no google", "busca do google"],
      resposta: "Trabalhamos os dois lados. Configuramos o **Google Perfil da Empresa** — aquele quadro que aparece no Maps com telefone, horário, fotos e avaliações — e montamos o site com a estrutura certa para as buscas da sua região. Os dois pacotes já incluem isso.\n\nSer honesto aqui importa: ninguém garante primeiro lugar no Google, isso é conquista de rotina, e é o que a gente ajusta no acompanhamento mensal. Se você precisa de resultado mais rápido, tem gestão de anúncios por **R$ 1.490/mês** + verba.",
      sugestoes: ["Como funciona a gestão de anúncios?", "O site fica rápido no celular?", "Quero agendar o diagnóstico"],
    },
    {
      id: "lgpd",
      gatilhos: ["lgpd", "dados do cliente", "privacidade", "é seguro", "seguranca dos dados", "segurança", "vaza dados", "vazamento", "quem ve as conversas", "onde ficam os dados", "as conversas ficam salvas", "protecao de dados", "proteção de dados", "meus dados", "confidencial", "voces guardam as conversas"],
      resposta: "Os dados são seus, não nossos. As conversas ficam em ambiente com acesso controlado, a IA coleta só o necessário para atender (nome, contato e o que a pessoa precisa) e nada é vendido nem usado para outra finalidade.\n\nNa implantação a gente já deixa o aviso de privacidade no site e a política de dados escrita no contrato — LGPD resolvida sem você ter que caçar advogado.",
      sugestoes: ["E se ela responder errado?", "Integra com meu sistema?", "Quero agendar o diagnóstico"],
    },
    {
      id: "textos-fotos",
      gatilhos: ["quem escreve os textos", "quem faz os textos", "eu que escrevo", "preciso mandar o texto", "quem tira as fotos", "e as fotos", "preciso de fotos", "nao tenho foto", "não tenho fotos", "quem produz o conteudo", "copy", "conteudo do site", "quem grava os videos", "preciso aparecer nos videos", "material do site", "quem faz a logo"],
      resposta: "A gente escreve e a gente grava. Você conta como o seu negócio funciona numa conversa e nós transformamos isso em texto de site, legenda de Instagram e roteiro de vídeo — sem você travar na frente da tela em branco.\n\nFoto e vídeo saem da **diária de gravação (R$ 1.790, 8 vídeos editados)**, que já vem uma vez por mês no pacote Crescimento. Se você tem material bom, aproveitamos o que der.",
      sugestoes: ["Como funciona o social media?", "Quanto custa o pacote Crescimento?", "Quero agendar o diagnóstico"],
    },
    {
      id: "ecommerce",
      gatilhos: ["vender online", "loja virtual", "ecommerce", "e-commerce", "loja online", "carrinho", "pagamento online", "cartao no site", "receber pagamento pelo site", "vender pelo site", "catalogo de produtos", "catálogo", "pix no site", "checkout", "vender produto no site", "site de vendas"],
      resposta: "Dá sim. Para quem está começando, o caminho que mais converte é **catálogo no site + fechamento no WhatsApp**: foi o que fizemos na **Prado Moda Social** — o cliente monta a sacola e o pedido chega pronto no seu WhatsApp, sem taxa de plataforma.\n\nLoja completa com carrinho, checkout online e estoque num banco de verdade é projeto sob medida, **a partir de R$ 6.900** — foi o caminho da **ALVEXZ Imports**, que está no ar. Me conta quantos produtos você vende que eu te digo qual dos dois compensa.",
      sugestoes: ["Quero ver os projetos", "Como funciona o sistema sob medida?", "Quanto custa um site?"],
      cta: { texto: "Falar sobre minha loja no WhatsApp", link: linkWhats("Olá, vim do atendente de IA do site da Nexus. Falar sobre minha loja no WhatsApp.") },
    },
    {
      id: "site-existente",
      gatilhos: ["ja tenho site", "já tenho site", "aproveitar meu site", "meu site atual", "posso migrar", "migrar o site", "meu dominio", "domínio", "perco meu dominio", "refazer o site", "reformar o site", "atualizar meu site", "meu site esta velho", "so mexer no que ja tenho", "wix", "wordpress", "meu site nao converte"],
      resposta: "Pode aproveitar, sim. **O domínio continua sendo seu** — o endereço que os clientes já conhecem não muda — e reaproveitamos textos, fotos e o que já tem posição no Google.\n\nNa prática, reconstruir costuma sair mais rápido e mais barato do que remendar site antigo, mas isso só dá para dizer olhando o seu. Manda o endereço no WhatsApp que a gente avalia no diagnóstico, sem custo.",
      sugestoes: ["Quanto custa só o site?", "O site aparece no Google?", "Quero agendar o diagnóstico"],
      cta: { texto: "Mandar meu site para avaliação", link: linkWhats("Olá, vim do atendente de IA do site da Nexus. Mandar meu site para avaliação.") },
    },
    {
      id: "esta-caro",
      gatilhos: ["esta caro", "está caro", "ta caro", "tá caro", "muito caro", "caro demais", "achei caro", "nao tenho esse dinheiro", "não tenho esse valor", "fora do meu orcamento", "sem orçamento agora", "tem desconto", "faz por menos", "parcela", "da pra parcelar", "mais barato", "valor alto", "nao cabe no bolso"],
      resposta: "Entendo, e a conta que vale fazer é outra: quanto custa continuar como está. Um orçamento perdido por semana porque ninguém respondeu a tempo já cobre a mensalidade inteira.\n\nSe o investimento inicial pesa agora, dá para começar por uma peça só — **site R$ 3.900** ou **automação com IA R$ 2.900 + R$ 690/mês** — e juntar o resto quando o caixa permitir. Parcelamento a gente combina na proposta.\n\nChama no WhatsApp que eu te mostro por onde começar gastando menos.",
      sugestoes: ["Posso contratar só uma parte?", "Quanto custa o pacote Essencial?", "Quero agendar o diagnóstico"],
      cta: { texto: "Ver o que cabe no meu orçamento", link: linkWhats("Olá, vim do atendente de IA do site da Nexus. Ver o que cabe no meu orçamento.") },
    }
,
    {
      id: "ultra",
      gatilhos: ["ultra", "plano ultra", "pacote ultra", "o mais completo", "mais completo", "o melhor plano", "plano top", "pacote top", "completo", "operacao completa", "tudo incluso", "plano premium", "premium", "o maior", "mais caro", "top de linha"],
      resposta: "O **Ultra** é a operação inteira rodando: implantação a partir de **R$ 7.500** + **R$ 1.890/mês**, no ar em 15 dias.\n\nEntra tudo do Crescimento e mais:\n• Anúncios no Google e Instagram gerenciados\n• Recuperação automática de orçamento parado\n• Sistema sob medida com painel de indicadores\n• Duas diárias de gravação por mês\n• Social media com 24 peças + vídeo institucional\n• Reunião estratégica mensal e atendimento prioritário\n\nÉ para quem não quer depender de ninguém lembrar de nada: atrai, atende, vende e acompanha sozinho.",
      sugestoes: ["Qual a diferença para o Crescimento?", "Quero agendar o diagnóstico", "Dá para começar menor?"],
      cta: { texto: "Falar sobre o Ultra no WhatsApp", link: linkWhats("Olá, vim do atendente de IA do site da Nexus. Quero saber mais sobre o pacote Ultra.") }
    },
    /* ---------- v27: portfólio completo, módulos do ecossistema, processo ---------- */
    {
      id: "indycar",
      gatilhos: ["indycar", "indy car", "centro automotivo", "site da indycar", "oficina de taubate", "ecossistema", "ecossistema da indycar", "sete sistemas", "7 sistemas", "banco unico", "banco único", "supabase", "tudo ligado", "mesmo banco"],
      resposta: "A **IndyCar Centro Automotivo** é uma oficina de Taubaté e o nosso caso mais completo. Além do site (indycar-taubate.netlify.app), a Nexus montou sete sistemas que conversam entre si pelo mesmo banco:\n\n• **Agendamento** — marca revisões com confirmação pelo WhatsApp\n• **Atendimento com IA** — responde na hora no número da oficina\n• **CRM** — leads, pipeline e resumo semanal escrito por IA\n• **Pós-venda** — aniversário, retorno e pesquisa de satisfação automáticos\n• **Tráfego pago** — painel Meta + Google com radar de alertas\n• **Robôs** — backup diário e vigia que avisa o dono no WhatsApp\n• **Banco único** — o cliente é identificado pelo telefone em tudo\n\nNa seção Ecossistema do site você toca em cada módulo e vê o que ele faz.",
      cta: { texto: "Abrir o site da IndyCar", link: "https://indycar-taubate.netlify.app" },
      sugestoes: ["Quero um ecossistema assim", "O que o CRM faz?", "Quanto custa um sistema sob medida?"]
    },
    {
      id: "prado",
      gatilhos: ["prado", "moda social", "prado moda social", "loja de roupa social", "roupa social"],
      resposta: "A **Prado Moda Social** é uma loja de moda social masculina. O site é editorial, com catálogo das peças, sacola e fechamento do pedido direto no WhatsApp da loja — sem plataforma no meio, o pedido chega pronto no número dela.\n\nEstá no ar em prado-modasocial.netlify.app.",
      cta: { texto: "Abrir o site da Prado", link: "https://prado-modasocial.netlify.app" },
      sugestoes: ["Quero uma loja assim", "Dá para vender pelo site?", "Quanto custa um site?"]
    },
    {
      id: "eletronic",
      gatilhos: ["eletronic", "boutique de iphones", "loja de iphone", "iphone", "iphones", "black club", "vitrine", "vitrine viva"],
      resposta: "A **Eletronic** é uma boutique de iPhones de Taubaté. O site tem catálogo em tempo real integrado ao estoque: a loja atualiza produto e preço no painel e a vitrine pública muda na hora, sem mexer em código. Tem também o clube de vantagens Black Club e um quiz de modelo.\n\nEstá no ar em jpfamelli.github.io/eletronic-site.",
      cta: { texto: "Abrir o site da Eletronic", link: "https://jpfamelli.github.io/eletronic-site/" },
      sugestoes: ["Como funciona o painel da loja?", "Quero uma vitrine assim", "Quanto custa?"]
    },
    {
      id: "sarbomix",
      gatilhos: ["sarbomix", "sarbo mix", "concreto", "concreteira", "concreto usinado", "calculadora de m3", "calculadora de metros", "construcao", "construção", "industria", "indústria"],
      resposta: "A **Sarbomix Concreto Usinado** é uma concreteira com usina própria. O site tem fotos e avaliações reais, calculadora de metros cúbicos e um formulário que chega pronto no WhatsApp de vendas.\n\nÉ também a prova de que projeto a distância funciona: a Sarbomix fica na região de São Roque e Itapevi, fora do Vale do Paraíba. Está no ar em sarbomix-concreto.netlify.app.",
      cta: { texto: "Abrir o site da Sarbomix", link: "https://sarbomix-concreto.netlify.app" },
      sugestoes: ["Vocês atendem fora de Taubaté?", "Quero um site assim", "Quanto custa um site?"]
    },
    {
      id: "kamiguchi",
      gatilhos: ["kamiguchi", "odontologia", "clinica odontologica", "clínica odontológica", "dentista", "consultorio", "consultório", "square offices"],
      resposta: "A **Kamiguchi Odontologia** é uma clínica de Taubaté, no Square Offices. O site está pronto — com agendamento em três passos direto no WhatsApp da clínica — e aguarda a publicação no domínio dela, por isso ainda não tem link público. Na galeria do site você vê a tela dele.\n\nSe o seu caso é clínica ou consultório, o caminho costuma ser esse: site + agendamento pelo WhatsApp + Google Perfil da Empresa.",
      sugestoes: ["Quero um site assim", "A IA agenda consultas?", "Em quantos dias fica pronto?"]
    },
    {
      id: "alvexz",
      gatilhos: ["alvexz", "alvez", "alvexz imports", "streetwear", "imports", "roupa importada", "loja de streetwear", "moda de rua"],
      resposta: "A **ALVEXZ Imports** é um e-commerce de streetwear importado: catálogo com busca e categorias, carrinho e checkout online, com o estoque num banco de verdade. É o nosso exemplo de loja completa — diferente da Prado, que fecha o pedido pelo WhatsApp.\n\nEstá no ar em jpfamelli.github.io/alvexz-imports.",
      cta: { texto: "Abrir a loja da ALVEXZ", link: "https://jpfamelli.github.io/alvexz-imports/" },
      sugestoes: ["Quero uma loja online assim", "Quanto custa uma loja online?", "Dá para vender pelo WhatsApp?"]
    },
    {
      id: "este-site",
      gatilhos: ["este site", "esse site", "site da nexus", "site de voces", "site de vocês", "quem fez esse site", "quem fez este site", "portfolio vivo", "portfólio vivo", "esse site e de voces", "voces fizeram esse site", "esse site aqui", "site que estou vendo"],
      resposta: "Este site é da própria Nexus — e é o nosso portfólio vivo. Herói em canvas, gráficos em SVG, a calculadora \"quanto custa não responder\", este atendente de IA que você está testando e o diagnóstico em 60 segundos no fim da página. Tudo em HTML, CSS e JS puros, sem framework.\n\nEstá no ar em nexus-taubate.netlify.app. Se quiser um site nesse nível para a sua empresa, é só chamar.",
      cta: { texto: "Quero um site nesse nível", link: linkWhats("Olá, testei o atendente de IA no site da Nexus e quero um site com esse nível para a minha empresa.") },
      sugestoes: ["Quais sites vocês já fizeram?", "Quanto custa um site?", "Quero agendar o diagnóstico"]
    },
    {
      id: "crm",
      gatilhos: ["crm", "crm da indycar", "pipeline", "leads", "lead", "funil de vendas", "funil", "resumo semanal", "origem do contato", "de onde veio o cliente", "controle de orcamentos", "controle de orçamentos", "acompanhar orcamentos"],
      resposta: "O **CRM** que montamos para a IndyCar junta leads, pipeline e a origem de cada contato num só lugar — e toda semana uma IA escreve um resumo para o dono saber o que andou e o que parou, sem abrir planilha.\n\nEle roda no mesmo banco do atendimento e da agenda, então o cliente que chamou no WhatsApp já aparece no funil com o histórico. Um CRM assim entra como sistema sob medida ou dentro do pacote **Ultra**.",
      sugestoes: ["Como funciona o sistema sob medida?", "O que é o ecossistema da IndyCar?", "Quanto custa o Ultra?"]
    },
    {
      id: "posvenda",
      gatilhos: ["pos venda", "pós-venda", "pos-venda", "posvenda", "aniversario", "aniversário", "lembrete de retorno", "pesquisa de satisfacao", "pesquisa de satisfação", "satisfacao", "satisfação", "mensagem automatica", "mensagens programadas", "cliente que sumiu", "reativar cliente", "cliente voltar", "fidelizar"],
      resposta: "O **pós-venda** automático manda, pelo WhatsApp da empresa, mensagem de aniversário, mensagem de pós-venda alguns dias depois do serviço e lembrete de retorno quando o cliente fica um tempo sem voltar — mais uma pesquisa de satisfação depois de cada atendimento.\n\nÉ o módulo 06 do ecossistema da IndyCar e roda hoje. Ele nasce desligado e o dono liga campanha por campanha.",
      sugestoes: ["O que é o ecossistema da IndyCar?", "A IA retoma orçamento parado?", "Quanto custa?"]
    },
    {
      id: "robos",
      gatilhos: ["robo de backup", "robos", "robôs", "backup", "vigia", "monitoramento", "se o sistema cair", "e se cair", "cair do ar", "sair do ar", "quem avisa se parar", "sistema parou", "fora do ar", "seguranca do sistema"],
      resposta: "Os **robôs** da IndyCar são dois: um faz backup diário do banco e o outro é um vigia que confere o sistema de 10 em 10 minutos — WhatsApp conectado, atendimento e agenda no ar, cliente esperando resposta — e avisa o dono no WhatsApp se alguma parte parar. Avisa uma vez por problema e manda \"voltou ao normal\" depois, sem gritar à toa.\n\nÉ o módulo 08 do ecossistema e entra em qualquer sistema sob medida que a gente monte.",
      sugestoes: ["O que é o ecossistema da IndyCar?", "Tem suporte depois da entrega?", "Como funciona o sistema sob medida?"]
    },
    {
      id: "painel-eletronic",
      gatilhos: ["painel da eletronic", "painel administrativo", "painel da loja", "atualizar estoque", "estoque", "catalogo em tempo real", "catálogo em tempo real", "tempo real", "atualiza sozinho", "mudar preco no site", "mudar preço no site"],
      resposta: "O **painel da Eletronic** é onde a loja cadastra produto, preço e estoque. A vitrine pública lê esse mesmo banco em tempo real: mudou no painel, mudou no site na hora — sem mexer em código e sem depender da Nexus para trocar um preço.\n\nÉ o mesmo princípio do ecossistema da IndyCar: um banco só, e as telas enxergam a mesma informação.",
      cta: { texto: "Ver a vitrine da Eletronic", link: "https://jpfamelli.github.io/eletronic-site/" },
      sugestoes: ["Posso editar o site sozinho?", "Quero uma vitrine assim", "Quanto custa?"]
    },
    {
      id: "processo",
      gatilhos: ["como funciona o processo", "etapas", "passo a passo", "como e o processo", "como é o processo", "como voces trabalham", "como vocês trabalham", "fluxo de trabalho", "aprovacao", "aprovação", "treinamento", "montagem", "como funciona a nexus", "como voces fazem", "como vocês fazem"],
      resposta: "Cinco etapas, com entrega, aprovação e próximo passo em cada uma:\n\n1. **Diagnóstico gratuito** — 30 minutos, você mostra onde perde tempo\n2. **Proposta em 24 horas** — o que será feito, quanto custa, o que entra primeiro e o prazo\n3. **Montagem por etapas** — você aprova as partes importantes antes de seguirmos\n4. **Entrega com treinamento** — sua equipe aprende a usar e sabe quando assumir uma conversa\n5. **Acompanhamento mensal** — revisamos o uso, corrigimos atritos e ajustamos conforme a empresa muda\n\nNada aparece pronto do nada e nada vai ao ar sem o seu sim.",
      sugestoes: ["Em quantos dias fica pronto?", "O que preciso mandar para começar?", "Quero agendar o diagnóstico"]
    },
    {
      id: "diagnostico-60s",
      gatilhos: ["diagnostico em 60 segundos", "60 segundos", "diagnostico rapido", "diagnóstico rápido", "formulario", "formulário", "preencher", "ordem de servico", "ordem de serviço", "numero de os", "resumo do diagnostico", "fim da pagina"],
      resposta: "No fim desta página tem o **diagnóstico em 60 segundos**: quatro etapas — quem é você e qual é o negócio, a cidade, o que trava hoje e como prefere ser contatado. Nada é enviado até você clicar, fica salvo só no seu navegador e o resumo sai pronto, com número de ordem de serviço, para o nosso WhatsApp.\n\nDepois disso vem o diagnóstico de verdade: 30 minutos com hora marcada, gratuito, e a proposta em 24 horas.",
      cta: { texto: "Prefiro chamar direto no WhatsApp", link: linkWhats("Olá, testei o atendente de IA no site da Nexus e quero marcar meu diagnóstico gratuito.") },
      sugestoes: ["Como funciona o processo?", "Quanto custa?", "Em quantos dias fica pronto?"]
    },
    {
      id: "nao-fazemos",
      gatilhos: ["o que voces nao fazem", "o que vocês não fazem", "nao fazem", "não fazem", "garantem resultado", "garante vendas", "promete resultado", "primeiro lugar garantido", "fazem tudo", "o que nao entra", "nao trabalham com", "limites", "o que a nexus nao faz", "nao fazemos"],
      resposta: "Para ser direto, quatro coisas que a Nexus **não** faz:\n\n• Não promete resultado nem volume de venda — a própria calculadora do site avisa: \"nada aqui é promessa\". Primeiro lugar no Google também ninguém honesto garante.\n• Não faz aplicativo de loja (Play Store / App Store) — o que entregamos é sistema web sob medida, que abre no navegador sem instalar nada.\n• Não entrega relatório de cinquenta páginas nem conversa técnica — o relatório mensal é direto.\n• Não coloca nada no ar sem o seu sim: você aprova antes de programarmos.\n\nO que fazemos está no site: site e presença digital, IA no WhatsApp, conteúdo, anúncios e sistemas sob medida.",
      sugestoes: ["O que a Nexus faz?", "Tem garantia?", "Quero agendar o diagnóstico"]
    },
    {
      id: "suporte",
      gatilhos: ["suporte", "horario do suporte", "horário do suporte", "atendimento prioritario", "atendimento prioritário", "falar com o suporte", "deu problema", "quem me atende depois", "canal de suporte", "suporte tecnico", "suporte técnico"],
      resposta: "O suporte é pelo **WhatsApp**, com quem fez o seu projeto — sem central, sem protocolo, sem ticket. Está em todos os pacotes (o Essencial já inclui \"suporte por WhatsApp\") e o **Ultra** tem atendimento prioritário e reunião estratégica mensal.\n\nA resposta vem em horário comercial. Se o sistema parar fora dele, os robôs de vigia avisam a gente antes de você perceber.",
      sugestoes: ["O que entra na mensalidade?", "Tem garantia?", "Quero agendar o diagnóstico"]
    },
    {
      id: "horario",
      gatilhos: ["horario de atendimento", "horário de atendimento", "horario de funcionamento", "horário de funcionamento", "que horas", "que horas atendem", "que horas funciona", "atendem que horas", "horario comercial", "horário comercial", "fim de semana", "sabado", "sábado", "domingo", "feriado", "horario", "horário", "abre que horas", "funcionam ate que horas"],
      resposta: "A equipe da Nexus responde no WhatsApp em **horário comercial**, e o diagnóstico gratuito é com hora marcada — 30 minutos, no horário que for melhor para você.\n\nJá a IA que instalamos no WhatsApp da sua empresa não tem horário: é ela que responde à noite, no fim de semana e no feriado, como na cena da IndyCar aqui do site.",
      sugestoes: ["Quero agendar o diagnóstico", "Como funciona a IA no WhatsApp?", "Quanto custa?"]
    },
  ];

  var FALLBACK = {
    resposta: "Essa eu prefiro não chutar 🙂 Numa instalação de verdade, eu seria treinado com as informações da sua empresa e responderia certinho — e quando a pergunta fugisse do combinado, passaria para uma pessoa.\n\nO jeito mais rápido de tirar essa dúvida é o **diagnóstico gratuito**: 30 minutos, com hora marcada, e a proposta em 24 horas. Enquanto isso, posso te ajudar com serviços, preços, prazos e os sites que já fizemos.",
    cta: { texto: "Agendar meu diagnóstico gratuito", link: linkWhats("Olá, testei o atendente de IA no site da Nexus e tenho uma dúvida que ele não soube responder — quero agendar meu diagnóstico gratuito.") },
    sugestoes: ["Quanto custa?", "Quais sites vocês já fizeram?", "Quero agendar o diagnóstico"]
  };

  var ABERTURA = {
    resposta: "Oi! Eu sou o atendente de IA da Nexus 👋\n\nEste é o mesmo tipo de atendimento que a gente instala no WhatsApp da sua empresa. Pode perguntar à vontade: preços, prazos, serviços — ou peça para agendar um diagnóstico.",
    sugestoes: ["Quanto custa um site?", "Quais sites vocês já fizeram?", "Como funciona a IA no WhatsApp?"]
  };

  /* ---------- Normalização e busca por intenção ---------- */
  function normalizar(txt) {
    return txt
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /* Palavras que aparecem em qualquer frase e não ajudam a identificar
     o assunto — pesam pouco na comparação. */
  var VAZIAS = {
    a: 1, o: 1, as: 1, os: 1, um: 1, uma: 1, de: 1, do: 1, da: 1, dos: 1, das: 1,
    e: 1, ou: 1, que: 1, com: 1, sem: 1, para: 1, pra: 1, por: 1, em: 1, no: 1,
    na: 1, nos: 1, nas: 1, ao: 1, aos: 1, se: 1, me: 1, meu: 1, minha: 1, eu: 1,
    voce: 1, voces: 1, vc: 1, vcs: 1, tem: 1, ter: 1, e_: 1, ja: 1, mais: 1,
    muito: 1, tudo: 1, isso: 1, essa: 1, esse: 1, qual: 1, quais: 1, como: 1,
    quanto: 1, quantos: 1, quando: 1, onde: 1, sobre: 1, ai: 1, la: 1, ne: 1,
    ser: 1, sao: 1, esta: 1, estao: 1, vai: 1, vou: 1, fica: 1, faz: 1, fazer: 1, fazem: 1, fazemos: 1, funciona: 1,
    pode: 1, posso: 1, preciso: 1, precisa: 1, quero: 1, queria: 1, gostaria: 1,
    ainda: 1, tambem: 1, so: 1, mas: 1, nao: 1, sim: 1, depois: 1, antes: 1
  };

  function palavras(txt) {
    return normalizar(txt)
      .split(" ")
      .filter(function (p) {
        return p.length > 1;
      });
  }

  function responder(pergunta) {
    var t = normalizar(pergunta);
    if (!t) return FALLBACK;
    var tPal = palavras(pergunta);
    var tSet = {};
    tPal.forEach(function (p) {
      tSet[p] = 1;
    });

    var melhor = null;
    var melhorNota = 0;

    for (var i = 0; i < BASE.length; i++) {
      var item = BASE[i];
      var nota = 0;

      for (var g = 0; g < item.gatilhos.length; g++) {
        var alvo = normalizar(item.gatilhos[g]);
        if (!alvo) continue;
        var gPal = alvo.split(" ").filter(function (p) {
          return p.length > 1;
        });
        if (!gPal.length) continue;

        /* frase inteira igual */
        if (t === alvo) {
          nota = Math.max(nota, 100 + gPal.length * 10);
          continue;
        }

        /* gatilho aparece literalmente na pergunta: quanto mais
           palavras, mais específico — e mais confiável */
        if (t.indexOf(alvo) !== -1) {
          nota = Math.max(nota, 14 * gPal.length * gPal.length + alvo.length);
          continue;
        }

        /* senão, mede quantas palavras do gatilho estão na pergunta,
           dando peso maior às palavras que realmente distinguem */
        var acertos = 0;
        var peso = 0;
        for (var k = 0; k < gPal.length; k++) {
          var w = gPal[k];
          if (!tSet[w]) continue;
          acertos++;
          peso += VAZIAS[w] ? 1 : Math.min(9, w.length);
        }
        /* v27: gatilho feito só de palavras vazias ("o que faz") não pode
           vencer um nome próprio ("crm", "robôs") por casar palavra a palavra */
        if (acertos === gPal.length && gPal.length > 1 && peso > gPal.length) {
          var fortes = 0;
          for (var f = 0; f < gPal.length; f++) if (!VAZIAS[gPal[f]]) fortes++;
          nota = Math.max(nota, 12 * fortes + peso);
        } else if (acertos > 0) {
          var cobertura = acertos / gPal.length;
          nota = Math.max(nota, Math.round(peso * cobertura * 2.2));
        }
      }

      /* saudação só vence em frase curta */
      if (item.id === "saudacao" && tPal.length > 3) nota = 0;

      if (nota > melhorNota) {
        melhorNota = nota;
        melhor = item;
      }
    }
    return melhorNota >= 8 && melhor ? melhor : FALLBACK;
  }

  /* Ponto de extensão: se um dia houver função serverless com a chave
     guardada no servidor, é só definir window.NX_IA = { endpoint: "..." } */
  function responderRemoto(pergunta) {
    var cfg = window.NX_IA;
    if (!cfg || !cfg.endpoint) return null;
    return fetch(cfg.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pergunta: pergunta })
    })
      .then(function (r) {
        if (!r.ok) throw new Error("falhou");
        return r.json();
      })
      .then(function (d) {
        return { resposta: d.resposta, sugestoes: d.sugestoes || [] };
      })
      .catch(function () {
        return null;
      });
  }

  /* ---------- Interface ---------- */
  var overlay = document.getElementById("ia-overlay");
  var painel = overlay ? overlay.querySelector(".ia-panel") : null;
  var thread = document.getElementById("ia-thread");
  var chips = document.getElementById("ia-chips");
  var form = document.getElementById("ia-form");
  var input = document.getElementById("ia-input");
  var btnAbrir = document.getElementById("chat-try");
  var btnFechar = document.getElementById("ia-close");
  var backdrop = document.getElementById("ia-backdrop");
  if (!overlay || !thread || !form || !input || !btnAbrir) return;

  var reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var aberto = false;
  var pensando = false;
  var focoAnterior = null;
  var iniciado = false;

  function rolarFim() {
    thread.scrollTop = thread.scrollHeight;
  }

  function formatar(txt) {
    var esc = txt
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    esc = esc.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    return esc.replace(/\n/g, "<br />");
  }

  function addMensagem(texto, quem, cta, aoTerminar) {
    var el = document.createElement("div");
    el.className = "ia-msg ia-" + quem;
    var bolha = document.createElement("div");
    bolha.className = "ia-bolha";
    el.appendChild(bolha);
    thread.appendChild(el);

    var concluirBolha = function () {
      if (cta) {
        var a = document.createElement("a");
        a.className = "ia-cta";
        a.href = cta.link;
        a.target = "_blank";
        a.rel = "noreferrer";
        a.textContent = cta.texto;
        el.appendChild(a);
      }
      rolarFim();
      if (aoTerminar) aoTerminar();
    };

    if (quem === "bot" && !reduzido) {
      /* Resposta digitada ao vivo, ~2-3 caracteres a cada 28ms.
         Posição por relógio real (não por tique): se a aba perder o
         foco e o intervalo for estrangulado, o texto salta para onde
         deveria estar em vez de rastejar. */
      bolha.classList.add("is-typing");
      var t0 = Date.now();
      var tique = window.setInterval(function () {
        var i = Math.ceil(((Date.now() - t0) / 28) * 2.5);
        if (i >= texto.length) {
          window.clearInterval(tique);
          bolha.innerHTML = formatar(texto);
          bolha.classList.remove("is-typing");
          concluirBolha();
          return;
        }
        bolha.innerHTML = formatar(texto.slice(0, i));
        rolarFim();
      }, 28);
    } else {
      bolha.innerHTML = formatar(texto);
      concluirBolha();
    }
    rolarFim();
    return el;
  }

  function mostrarSugestoes(lista) {
    chips.innerHTML = "";
    if (!lista || !lista.length) return;
    lista.forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "ia-chip";
      b.textContent = s;
      b.addEventListener("click", function () {
        enviar(s);
      });
      chips.appendChild(b);
    });
  }

  function digitando() {
    var el = document.createElement("div");
    el.className = "ia-msg ia-bot ia-pensando";
    el.innerHTML = '<div class="ia-bolha"><span class="ia-pt"></span><span class="ia-pt"></span><span class="ia-pt"></span></div>';
    thread.appendChild(el);
    rolarFim();
    return el;
  }

  function enviar(texto) {
    if (pensando) return;
    var pergunta = String(texto || "").trim();
    if (!pergunta) return;

    addMensagem(pergunta, "user");
    input.value = "";
    chips.innerHTML = "";
    pensando = true;

    var bolhaEspera = digitando();
    var remoto = responderRemoto(pergunta);
    var atraso = reduzido ? 200 : 300 + Math.min(500, pergunta.length * 8);

    var concluir = function (r) {
      window.setTimeout(function () {
        if (bolhaEspera.parentNode) bolhaEspera.parentNode.removeChild(bolhaEspera);
        addMensagem(r.resposta, "bot", r.cta, function () {
          mostrarSugestoes(r.sugestoes);
          pensando = false;
          if (aberto) input.focus();
        });
      }, atraso);
    };

    if (remoto && typeof remoto.then === "function") {
      remoto.then(function (r) {
        concluir(r || responder(pergunta));
      });
    } else {
      concluir(responder(pergunta));
    }
  }

  /* v26 (a11y): com o diálogo aberto, o resto da página fica inerte —
     nem foco, nem leitor de tela chegam atrás do painel. */
  function inerte(sim) {
    var irmaos = document.querySelectorAll(".site-shell > :not(#ia-overlay)");
    for (var i = 0; i < irmaos.length; i++) {
      if (sim) irmaos[i].setAttribute("inert", "");
      else irmaos[i].removeAttribute("inert");
    }
  }

  /* v26 (iOS): enquanto o teclado está aberto, o painel acompanha a
     viewport visual em vez de ficar escondido atrás dele. */
  var vv = window.visualViewport;
  function ajustarViewport() {
    if (!vv || !aberto || !painel) return;
    var folga = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
    overlay.style.setProperty("--kb", folga + "px");
  }
  if (vv) {
    vv.addEventListener("resize", ajustarViewport);
    vv.addEventListener("scroll", ajustarViewport);
  }

  function abrir() {
    focoAnterior = document.activeElement;
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    inerte(true);
    /* força reflow para a transição de entrada acontecer */
    void overlay.offsetWidth;
    overlay.classList.add("is-open");
    aberto = true;
    ajustarViewport();

    if (!iniciado) {
      iniciado = true;
      window.setTimeout(function () {
        addMensagem(ABERTURA.resposta, "bot", null, function () {
          mostrarSugestoes(ABERTURA.sugestoes);
        });
      }, reduzido ? 0 : 350);
    }
    window.setTimeout(function () {
      input.focus();
    }, reduzido ? 0 : 420);
  }

  function fechar() {
    overlay.classList.remove("is-open");
    aberto = false;
    document.body.style.overflow = "";
    inerte(false);
    overlay.style.removeProperty("--kb");
    var esconder = function () {
      overlay.hidden = true;
    };
    if (reduzido) esconder();
    else window.setTimeout(esconder, 320);
    if (focoAnterior && focoAnterior.focus) focoAnterior.focus();
  }

  btnAbrir.addEventListener("click", abrir);
  /* v27: o cartão da Nexus na galeria também abre a demonstração */
  Array.prototype.slice.call(document.querySelectorAll("[data-ia-open]")).forEach(function (b) {
    b.addEventListener("click", abrir);
  });
  if (btnFechar) btnFechar.addEventListener("click", fechar);
  if (backdrop) backdrop.addEventListener("click", fechar);

  document.addEventListener("keydown", function (e) {
    if (!aberto) return;
    if (e.key === "Escape") {
      fechar();
      return;
    }
    /* mantém o foco preso no painel enquanto ele está aberto */
    if (e.key === "Tab" && painel) {
      var focaveis = painel.querySelectorAll("button, input, a[href]");
      if (!focaveis.length) return;
      var primeiro = focaveis[0];
      var ultimo = focaveis[focaveis.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    enviar(input.value);
  });
})();
