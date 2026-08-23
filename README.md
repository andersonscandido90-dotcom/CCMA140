# Candido App CCM — Sistema Integrado de Controle e Gestão de Bordo

> **Painel Operacional e Gerencial de Engenharia, Controle de Avarias (CAV), Estabilidade, Cargas e Quarto de Serviço**

---

## 📌 1. Visão Geral (O que o App faz)

O **Candido App CCM** é uma plataforma integrada de comando, monitoramento e prontidão operativa desenvolvida para centralizar a gestão técnica de bordo no **Centro de Controle de Máquinas (CCM)** e no **Controle de Avarias (CAV)**.

O sistema substitui anotações manuais, planilhas isoladas e quadros brancos tradicionais por uma **interface unificada em tempo real**, permitindo:
- Acompanhamento do estado operacional de todos os equipamentos vitais do navio.
- Cálculo automático de **estabilidade**, **calados**, **trim** e **deslocamento** com base nas curvas hidrostáticas oficiais.
- Controle de **cargas de fluidos** (Óleo Combustível, Óleo Lubrificante, JP-5, Água Doce) e balanço de **Aguada**.
- Gerenciamento de restrições de máquinas, ordens de serviço de **Corte e Solda**, e **Edutores**.
- Supervisão de **Quartos de Serviço**, anotações de bordo, logs de auditoria e lista telefônica de ramais internos.
- Modo de exibição contínua para telões (**Modo TV**) e emissão de **relatórios formais de passagem de serviço** para impressão/PDF.

---

## ⚡ 2. Principais Funcionalidades

### 🖥️ 2.1. Menu Inicial e Visão Geral
- **Dashboard Integrado**: Indicadores rápidos de prontidão operativa, total de equipamentos ativos/restritos, resumo de cargas em toneladas/percentual e métricas de estabilidade.
- **Relatório do Dia**: Histórico diário com navegação por calendário e armazenamento local automático.

### ⚙️ 2.2. Gestão de Equipamentos Vitais
- Monitoramento categorizado por sistemas essenciais:
  - **Propulsão e Geração de Energia** (MCPs, MCAs, Gerador de Emergência).
  - **Climatização do Ar** (URAs 1 a 6).
  - **Osmose e Purificação** (GORs, DEMIN, Separador Água/Óleo, Purificadores).
  - **Governo / Leme** (Máquinas do Leme BE e BB).
  - **Rede de Incêndio** (HPSWs, Bombas de Serviço, Motobombas).
  - **Compressores e Bombas de Resfriamento** (LPSWs, CAPs, CMPs, CBPs).
  - **Planta Frigorífica e Água Quente** (BAGs, Boilers, Frigorífica).
  - **Equipamentos Gerais** (Elevadores de Aeronaves, Guindastes, Estabilizadores, Proteção Catódica).
- **Status Operacionais Padronizados**: *Na Linha* (Verde), *De Serviço* (Azul), *Com Restrição* (Amarelo), *Disponível* (Cinza) e *Indisponível* (Vermelho).
- **Mapeamento de Compartimentos / Conveses**: Cada equipamento possui indicação física de sua praça/localização a bordo (ex: 9H, 9L, 7R, 1K).

### 📝 2.3. Painel de Restrições Técnicas
- Justificativa técnica obrigatória e rastreada para qualquer equipamento operando sob restrição ou indisponibilidade.
- Registro do motivo, impacto operacional e plano de ação para restabelecimento da prontidão.

### ⚖️ 2.4. Estabilidade, Hidrostática e Calados (NAM Atlântico A140)
- **Método Oficial de Cálculo em 3 Etapas**:
  - **1ª Etapa**: Entrada dos calados de Vante ($x$) e Ré ($y$), cálculo do Calado Médio ($z = \frac{x+y}{2}$) e Trim ($w = x - y$). Seleção automática ou manual da condição (*Carregado* com $u=21.490\text{ t}, v=2,703$ ou *Leve* com $u=17.718\text{ t}, v=2,561$).
  - **2ª Etapa**: Interpolação linear precisa na Tabela Hidrostática Oficial de 4 colunas ($a$: De Ré $1,0 \le T < 2,0$; $b$: De Ré $T < 1,0$; $c$: Nível; $d$: De Proa $T < 1,0$) para obtenção de $c$ e $k$. Quando o trim é igual ou maior que 1,0m para ré ($|w| \ge 1,0\text{m}$), adota-se a coluna ($a$).
  - **3ª Etapa**: Determinação do 1º cálculo ($r = c - k$), 2º cálculo / correção de trim ($s = r \times w$), Deslocamento final ($t = c + s$) e Altura Metacêntrica ($p = \frac{v \times t}{u}$).
- **Papeleta de Estabilidade Digital**: Visualização e preenchimento digital idêntico ao modelo oficial da Marinha do Brasil.
- **Análise de Banda e Inclinômetro**: Indicação visual de banda para Boreste (BE) ou Bombordo (BB) com alertas de segurança.

### 🛢️ 2.5. Controle de Cargas e Fluidos
- Medição em toneladas e percentual da capacidade máxima:
  - **Óleo Combustível** (ex: 1.868,58 t)
  - **Óleo Lubrificante** (ex: 84,54 t)
  - **Combustível de Aviação JP-5** (ex: 450,00 t)
  - **Água Doce** (ex: 581,00 t)
- Barras de nível com código de cores e avisos de reserva crítica.

### 💧 2.6. Módulo Especializado de Aguada
- Registro diário e balanço hídrico do navio:
  - Consumo diário e estimativa de autonomia restante em dias.
  - Produção diária pelos Grupos de Osmose Reversa (GORs).
  - Sondagem tanque a tanque (Vante, Meio-Navio e Ré).
  - Controle de cloro residual (ppm), dosadores e status dos BAGs em serviço.

### 🔥 2.7. Controle de Avarias (CAV) e Segurança
- **Edutores de Esgoto**: Monitoramento de prontidão e abertura/fechamento das redes de esgotamento das praças de máquinas e porões.
- **Permissões de Corte e Solda**: Registro rigoroso de trabalhos a quente com local, horário, responsável e medidas preventivas contra incêndio.
- **Sistema ISIS**: Acompanhamento dos alarmes e parâmetros monitorados pelo sistema supervisório automatizado.

### 👥 2.8. Tabela de Quarto e Pessoal de Serviço
- Escalação dos postos de comando:
  - **Supervisor MO** (Máquinas Operacionais)
  - **Supervisor EL** (Elétrica)
  - **Fiel CAV** (Controle de Avarias)
  - **Encarregado de Máquinas**
  - **Auxiliares e Patrulhas de Serviço** por quarto (08-12, 12-16, 16-20).
- Livro de Anotações do Serviço para passagem de quarto e histórico de ocorrências.

### 📞 2.9. Lista Telefônica Interna Oficial
- Catálogo de ramais de comunicação rápida de bordo:
  - Linhas prioritárias e emergência (Passadiço, Combate/COC, CCM, Enfermaria, Ramal 999).
  - Busca instantânea por número, setor ou departamento.
  - Botão de cópia rápida e marcação de favoritos.

### 📺 2.10. Modo TV (Telão do CCM)
- Interface de alta visibilidade projetada para exibição em televisores e monitores de grande porte no CCM.
- Rotação rápida ou manual entre telas de equipamentos, estabilidade, cargas, aguada, CAV e serviço.

### 📄 2.11. Relatórios Oficiais e Backup
- **Emissão de Relatório em PDF/Impressão**: Formatação oficial no padrão da Marinha para o Livro de Registro e passagem de serviço da Supervisão.
- **Backup e Restauração Segura**: Exportação e importação de relatórios em formato JSON estruturado, sem risco de perda de dados.

---

## 🛠️ 3. Arquitetura e Tecnologias Utilizadas

O sistema foi construído utilizando as tecnologias mais modernas de desenvolvimento web de alta performance e disponibilidade:

| Tecnologia | Finalidade no Projeto |
| :--- | :--- |
| **React 19** | Biblioteca principal de interface reativa e componentização modular |
| **TypeScript** | Tipagem estática rigorosa que garante segurança nas operações matemáticas de hidrostática e dados vitais |
| **Vite 6** | Motor de build ultrarrápido otimizado para navegadores modernos |
| **Tailwind CSS v4** | Design responsivo com estética naval profissional, contrastes nítidos e legibilidade no CCM |
| **Lucide Icons** | Conjunto padronizado de ícones táticos e operacionais de alta legibilidade |
| **Recharts** | Visualização gráfica de status e distribuição de fluidos |
| **html2pdf.js** | Geração e impressão direta de relatórios operacionais formatados |
| **LocalStorage API** | Persistência local imediata e offline dos relatórios diários de bordo |

---

## 🎯 4. Pontos-Chave para Apresentação aos Oficiais Superiores / Almirantes

Ao apresentar o sistema, destaque os seguintes ganhos estratégicos para o navio:

1. **Consciência Situacional Imediata (Prontidão Operativa)**:
   > *"Com apenas uma olhada na tela principal ou no Modo TV do CCM, o Oficial de Serviço e o Comando sabem exatamente quais equipamentos estão na linha, qual a reserva de combustível/água e a estabilidade da embarcação."*

2. **Segurança e Rigor Técnico na Estabilidade**:
   > *"Elimina erros de cálculo manual. O aplicativo interpola a tabela hidrostática oficial em segundos, calculando deslocamento, trim e GM com precisão absoluta."*

3. **Padronização na Passagem de Serviço**:
   > *"Acaba com as perdas de informação entre os quartos. A rotina de anotações, status de BAGs, edutores e permissões de corte e solda fica salva e pode ser impressa em formato de relatório diário."*

4. **Operação 100% Autônoma e Resiliente**:
   > *"O sistema opera diretamente no navegador da rede local do navio, não depende de conexão com a internet para funcionar e possui rotinas simples de backup e restauração."*

---

*Candido App CCM — Desenvolvido com foco na eficiência, segurança e prontidão operativa da Força Naval.*
