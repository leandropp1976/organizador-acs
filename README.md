# Organizador de Atividades Complementares - Enfermagem UFF

Uma aplicação web simples e intuitiva para alunos do curso de Enfermagem da UFF Rio das Ostras organizarem suas atividades complementares e gerarem relatórios em PDF com certificados anexados.

## 🎯 Funcionalidades

- **Cadastro de Dados do Aluno**: Nome, matrícula, curso e período
- **Gerenciamento de Atividades**: Cadastro de atividades por núcleo (Ensino, Pesquisa, Extensão, Representação Estudantil)
- **Upload de Certificados**: Anexar certificados em PDF, JPG ou PNG para cada atividade
- **Cálculo Automático**: Contabilização automática das horas por núcleo conforme regulamento
- **Progresso Visual**: Barras de progresso mostrando o andamento em cada núcleo
- **Geração de PDF**: Relatório completo com todas as atividades e certificados anexados
- **Backup de Dados**: Exportar/importar dados em formato JSON

## 🚀 Como Usar

1. **Dados do Aluno**: Preencha suas informações pessoais e acadêmicas
2. **Atividades**: Cadastre suas atividades complementares, selecionando o núcleo e tipo
3. **Certificados**: Anexe os certificados de cada atividade (PDF, JPG ou PNG)
4. **Resumo**: Acompanhe seu progresso em cada núcleo
5. **Relatório**: Gere o PDF final com todas as atividades e certificados para entregar à coordenação

## 📋 Regulamento de ACs

O sistema segue o regulamento oficial de Atividades Complementares:

- **Total necessário**: 200 horas
- **Ensino**: Máximo 60 horas
- **Pesquisa**: Máximo 60 horas  
- **Extensão**: Máximo 60 horas
- **Representação Estudantil**: Máximo 30 horas

## 🛠️ Tecnologias Utilizadas

- React 19
- Vite
- Tailwind CSS
- Shadcn/ui
- PDF-lib (geração de PDF)
- Lucide React (ícones)

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

## 🌐 Deploy Gratuito

### Opção 1: Netlify (Recomendado)

1. Acesse [netlify.com](https://netlify.com)
2. Faça login com GitHub/GitLab
3. Clique em "New site from Git"
4. Conecte seu repositório
5. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Clique em "Deploy site"

### Opção 2: Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub/GitLab
3. Clique em "New Project"
4. Importe seu repositório
5. Vercel detectará automaticamente as configurações
6. Clique em "Deploy"

### Opção 3: GitHub Pages

1. No seu repositório GitHub, vá em Settings > Pages
2. Em "Source", selecione "GitHub Actions"
3. Crie o arquivo `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build
      run: npm run build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

## 📱 Uso da Aplicação

### Passo a Passo Detalhado

1. **Primeira Utilização**:
   - Acesse a aplicação
   - Preencha seus dados na aba "Dados do Aluno"
   - Nome completo, matrícula, curso e período são obrigatórios

2. **Cadastrando Atividades**:
   - Vá para a aba "Atividades"
   - Clique em "Nova Atividade"
   - Preencha título, núcleo e horas (obrigatórios)
   - Selecione o tipo de atividade (opcional)
   - Adicione descrição e datas (opcional)
   - Anexe certificados clicando em "Adicionar Certificados"
   - Clique em "Adicionar Atividade"

3. **Acompanhando Progresso**:
   - Na aba "Resumo", visualize seu progresso
   - Barras de progresso mostram horas por núcleo
   - Total geral é calculado automaticamente

4. **Gerando Relatório**:
   - Na aba "Relatório", clique em "Gerar PDF"
   - O sistema criará um PDF com:
     - Dados do aluno
     - Resumo por núcleo
     - Lista detalhada de atividades
     - Certificados anexados (imagens e PDFs)

5. **Backup de Dados**:
   - Use "Exportar Dados" para salvar um backup
   - Use "Importar Dados" para restaurar dados salvos

## ⚠️ Observações Importantes

- **Dados Locais**: Todos os dados ficam armazenados no seu navegador (localStorage)
- **Certificados**: Anexe apenas arquivos PDF, JPG ou PNG
- **Tamanho**: Evite arquivos muito grandes para melhor performance
- **Backup**: Faça backup regular dos seus dados usando "Exportar Dados"
- **Navegador**: Use navegadores modernos (Chrome, Firefox, Safari, Edge)

## 🎓 Sobre o Projeto

Este projeto foi desenvolvido para facilitar a organização das Atividades Complementares dos alunos do curso de Enfermagem da UFF Rio das Ostras, seguindo o regulamento oficial da instituição.

## 📄 Licença

Este projeto é de uso livre para fins educacionais.

---

**Desenvolvido com ❤️ para os alunos de Enfermagem da UFF Rio das Ostras**
