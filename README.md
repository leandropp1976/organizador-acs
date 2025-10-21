# Organizador de Atividades Complementares - Enfermagem UFF

Uma aplicação web simples e intuitiva para alunos do curso de Enfermagem da UFF Rio das Ostras organizarem suas atividades complementares e gerarem relatórios em PDF com certificados anexados.

## 🎯 Funcionalidades

- **Cadastro de Dados do Aluno**: Nome, matrícula, curso e período.
- **Gerenciamento de Atividades**: Cadastro detalhado de atividades por núcleo (Ensino, Pesquisa, Extensão, Acadêmico-Administrativo) e tipo específico.
- **Upload e Gerenciamento de Certificados**: Anexar certificados em PDF, JPG ou PNG para cada atividade, com a possibilidade de adicionar ou remover certificados mesmo após o cadastro da atividade.
- **Cálculo Automático de Horas**: Contabilização automática das horas aproveitadas por núcleo e total geral, seguindo o regulamento oficial da UFF.
- **Progresso Visual e Validação**: Barras de progresso mostrando o andamento em cada núcleo, com alertas claros se o mínimo de horas por núcleo ou o total geral não foram atingidos.
- **Geração de PDF Completo**: Relatório em PDF com dados do aluno, resumo por núcleo, lista detalhada de atividades e **todos os certificados anexados** em um único documento.
- **Backup e Restauração de Dados**: Exportar e importar dados em formato JSON, **incluindo os certificados anexados**, para backup e restauração.

## 🚀 Como Usar

1.  **Dados do Aluno**: Preencha suas informações pessoais e acadêmicas na aba `Dados do Aluno`.
2.  **Atividades**: Cadastre suas atividades complementares na aba `Atividades`. Selecione o núcleo e o tipo. Para atividades de monitoria, informe a quantidade de semestres/disciplinas. Anexe os certificados.
3.  **Resumo**: Acompanhe seu progresso na aba `Resumo`. Verifique as horas aproveitadas por núcleo e o total geral.
4.  **Relatório**: Na aba `Relatório`, gere o PDF final com todas as atividades e certificados para entregar à coordenação.
5.  **Backup**: Use `Exportar Dados` para salvar um backup do seu progresso (com certificados) e `Importar Dados` para restaurá-lo.

## 📋 Regulamento de Atividades Complementares (Baseado no Regulamento de ACs 2022)

O sistema segue o regulamento oficial de Atividades Complementares do Curso de Enfermagem da UFF Rio das Ostras, com os seguintes critérios:

-   **Total Geral Mínimo Necessário**: 170 horas
-   **Horas Mínimas por Núcleo**: 10 horas em cada um dos seguintes núcleos:
    -   Ensino
    -   Pesquisa
    -   Extensão
    -   Acadêmico-Administrativo
-   **Não há carga horária máxima por núcleo**, apenas o mínimo exigido e o total geral.

### Critérios Específicos:

-   **Ensino - Participação em Programa de Monitoria e Iniciação à Docência**: 10 horas serão atribuídas por semestre letivo em que o aluno foi monitor em determinada disciplina.
-   **Pesquisa - Apresentação de trabalhos em eventos científicos (Pôster/E-pôster/Comunicação Oral)**:
    -   Como **Autor**: 10 horas por trabalho.
    -   Como **Relator**: 20 horas por apresentação.

## 🛠️ Tecnologias Utilizadas

-   React 19
-   Vite
-   Tailwind CSS
-   Shadcn/ui
-   PDF-lib (geração e manipulação de PDF)
-   Lucide React (ícones)

## 📦 Instalação Local

```bash
# Clone o repositório
git clone <url-do-repositorio>

# Entre no diretório
cd acs-organizador

# Instale as dependências
npm install

# Execute em modo desenvolvimento
npm run dev

# Para build de produção
npm run build
```

## 🌐 Deploy Gratuito (Sites Estáticos)

O sistema foi configurado para deploy fácil e gratuito em plataformas de hospedagem de sites estáticos. As configurações recomendadas são:

-   **Build command**: `npm run build`
-   **Publish directory**: `dist`
-   **Branch to deploy**: `main` (ou `master`)
-   **Base directory**: (Deixe em branco)
-   **Functions directory**: (Deixe em branco)
-   **Environment Variables**: (Deixe em branco, não são necessárias para esta aplicação)

### Plataformas Sugeridas:

-   [Netlify](https://www.netlify.com/)
-   [Vercel](https://vercel.com/)
-   [GitHub Pages](https://pages.github.com/)

## ⚠️ Observações Importantes

-   **Dados Locais**: Todos os dados (incluindo certificados) ficam armazenados no seu navegador (`localStorage`). Eles são persistentes entre sessões, mas são específicos do navegador e dispositivo. Use a função `Exportar Dados` para backup.
-   **Certificados**: Anexe apenas arquivos PDF, JPG ou PNG. O sistema embeda esses arquivos no PDF final.
-   **Tamanho dos Arquivos**: Evite anexar arquivos de certificados muito grandes para melhor performance e para evitar problemas de limite de armazenamento no navegador.
-   **Backup Regular**: Faça backup regular dos seus dados usando a função `Exportar Dados` para evitar perdas acidentais.
-   **Navegador**: Use navegadores modernos (Chrome, Firefox, Safari, Edge) para garantir compatibilidade total.

## 🎓 Sobre o Projeto

Este projeto foi desenvolvido para facilitar a organização das Atividades Complementares dos alunos do curso de Enfermagem da UFF Rio das Ostras, seguindo o regulamento oficial da instituição.

## 📄 Licença

Este projeto é de uso livre para fins educacionais.

---

**Desenvolvido com ❤️ para os alunos de Enfermagem da UFF Rio das Ostras**

