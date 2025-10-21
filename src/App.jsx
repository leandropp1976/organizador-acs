import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Trash2, Upload, Download, FileText, Plus, Eye, Edit } from 'lucide-react'
import { PDFDocument, rgb } from 'pdf-lib'
import './App.css'

// Configurações do regulamento de ACs
const NUCLEOS_CONFIG = {
  ensino: { nome: 'Ensino', minHoras: 10 },
  pesquisa: { nome: 'Pesquisa', minHoras: 10 },
  extensao: { nome: 'Extensão', minHoras: 10 },
  academicoAdministrativo: { nome: 'Acadêmico-Administrativo', minHoras: 10 }
}

const TOTAL_MINIMO_GERAL = 170;

const TIPOS_ATIVIDADE = {
  ensino: [
    'Participação em Programa de Monitoria e Iniciação à Docência (por disciplina/semestre)',
    'Realização de estágios curriculares não obrigatórios',
    'Palestrante ou debatedor em seminários, congressos, etc.',
    'Participação, como aluno ou ouvinte, em eventos acadêmicos, científicos ou culturais'
  ],
  pesquisa: [
    'Participação integral em Programa de Iniciação Científica',
    'Publicação de artigos, resumos ampliados, livros e capítulos de livros',
    'Apresentação de trabalhos em eventos científicos (Pôster/E-pôster/Comunicação Oral) - Autor',
    'Apresentação de trabalhos em eventos científicos (Pôster/E-pôster/Comunicação Oral) - Relator'
  ],
  extensao: [
    'Participação em Projetos de Extensão cadastrados na PROEX',
    'Participação como estudante universitário em projetos de extensão com parceria',
    'Participação em Programa de Educação Tutorial (PET) de Enfermagem ou áreas afins'
  ],
  academicoAdministrativo: [
    'Participação como representante estudantil',
    'Participação como membro de comissões de processos eleitorais ou grupos de trabalho pedagógico-administrativos',
    'Participação em comissões organizadoras de eventos acadêmicos, esportivos, culturais ou científicos'
  ]
}

const CRITERIOS_CONVERSAO = {
  'Participação em Programa de Monitoria e Iniciação à Docência (por disciplina/semestre)': { tipo: 'multiplicadorPorUnidade', valorUnidade: 10, unidade: 'disciplina/semestre' },
  'Realização de estágios curriculares não obrigatórios': { tipo: 'multiplicador', valor: 0.5 },
  'Palestrante ou debatedor em seminários, congressos, etc.': { tipo: 'multiplicador', valor: 0.7 },
  'Participação, como aluno ou ouvinte, em eventos acadêmicos, científicos ou culturais': { tipo: 'multiplicador', valor: 0.5 },
  'Participação integral em Programa de Iniciação Científica': { tipo: 'horasFixas', valor: 40, por: 'projeto' },
  'Publicação de artigos, resumos ampliados, livros e capítulos de livros': { tipo: 'horasFixas', valor: 20, por: 'publicação' },
  'Apresentação de trabalhos em eventos científicos (Pôster/E-pôster/Comunicação Oral) - Autor': { tipo: 'horasFixas', valor: 10, por: 'trabalho como autor' },
  'Apresentação de trabalhos em eventos científicos (Pôster/E-pôster/Comunicação Oral) - Relator': { tipo: 'horasFixas', valor: 20, por: 'apresentação como relator' },
  'Participação em Projetos de Extensão cadastrados na PROEX': { tipo: 'horasFixas', valor: 40, por: 'projeto' },
  'Participação como estudante universitário em projetos de extensão com parceria': { tipo: 'horasFixas', valor: 2, por: 'projeto ou atividade' },
  'Participação em Programa de Educação Tutorial (PET) de Enfermagem ou áreas afins': { tipo: 'horasFixas', valor: 60, por: 'participação' },
  'Participação como representante estudantil': { tipo: 'horasFixas', valor: 10, por: 'representação e semestre letivo' },
  'Participação como membro de comissões de processos eleitorais ou grupos de trabalho pedagógico-administrativos': { tipo: 'horasFixas', valor: 10, por: 'participação em cada comissão' },
  'Participação em comissões organizadoras de eventos acadêmicos, esportivos, culturais ou científicos': { tipo: 'horasFixas', valor: 10, por: 'participação em cada comissão' }
}

function App() {
  const [activeTab, setActiveTab] = useState('dados')
  const [dadosAluno, setDadosAluno] = useState({
    nome: '',
    matricula: '',
    curso: 'Enfermagem',
    periodo: ''
  })
  
  const [atividades, setAtividades] = useState([])
  const [novaAtividade, setNovaAtividade] = useState({
    titulo: '',
    nucleo: '',
    tipo: '',
    descricao: '',
    horasDeclaradas: '',
    quantidadeUnidades: '', // Novo campo para atividades por unidade
    dataInicio: '',
    dataFim: '',
    certificados: []
  })
  
  // Estados para edição de certificados
  const [atividadeEditando, setAtividadeEditando] = useState(null)
  const [certificadosEditando, setCertificadosEditando] = useState([])
  const [dialogAberto, setDialogAberto] = useState(false)
  
  const fileInputRef = useRef(null)
  const fileInputEditRef = useRef(null)

  const calcularHorasAproveitadas = (atividade) => {
    const criterio = CRITERIOS_CONVERSAO[atividade.tipo]
    let horasCalculadas = parseInt(atividade.horasDeclaradas) || 0

    if (criterio) {
      if (criterio.tipo === 'multiplicador') {
        horasCalculadas = horasCalculadas * criterio.valor
      } else if (criterio.tipo === 'horasFixas') {
        horasCalculadas = criterio.valor
      } else if (criterio.tipo === 'multiplicadorPorUnidade') {
        horasCalculadas = (parseInt(atividade.quantidadeUnidades) || 0) * criterio.valorUnidade
      }
    }
    return horasCalculadas
  }

  const adicionarAtividade = () => {
    if (!novaAtividade.titulo || !novaAtividade.nucleo) {
      alert('Preencha os campos obrigatórios (título e núcleo)')
      return
    }

    // Validação específica para 'multiplicadorPorUnidade'
    const criterio = CRITERIOS_CONVERSAO[novaAtividade.tipo]
    if (criterio && criterio.tipo === 'multiplicadorPorUnidade' && !novaAtividade.quantidadeUnidades) {
      alert(`Preencha a quantidade de ${criterio.unidade}s para esta atividade.`)
      return
    }

    if (!(criterio && criterio.tipo === 'multiplicadorPorUnidade') && !novaAtividade.horasDeclaradas) {
      alert('Preencha as horas declaradas para esta atividade.')
      return
    }

    const atividade = {
      id: Date.now(),
      ...novaAtividade,
      horasDeclaradas: parseInt(novaAtividade.horasDeclaradas) || 0,
      quantidadeUnidades: parseInt(novaAtividade.quantidadeUnidades) || 0,
      horasAproveitadas: calcularHorasAproveitadas(novaAtividade)
    }

    setAtividades([...atividades, atividade])
    setNovaAtividade({
      titulo: '',
      nucleo: '',
      tipo: '',
      descricao: '',
      horasDeclaradas: '',
      quantidadeUnidades: '',
      dataInicio: '',
      dataFim: '',
      certificados: []
    })
  }

  const removerAtividade = (id) => {
    setAtividades(atividades.filter(ativ => ativ.id !== id))
  }

  const adicionarCertificado = (event) => {
    const files = Array.from(event.target.files)
    const novosArquivos = files.map(file => ({
      id: Date.now() + Math.random(),
      nome: file.name,
      arquivo: file,
      url: URL.createObjectURL(file)
    }))
    
    setNovaAtividade({
      ...novaAtividade,
      certificados: [...novaAtividade.certificados, ...novosArquivos]
    })
  }

  const removerCertificado = (id) => {
    const certificados = novaAtividade.certificados.filter(cert => cert.id !== id)
    setNovaAtividade({ ...novaAtividade, certificados })
  }

  // Funções para edição de certificados de atividades existentes
  const abrirEdicaoCertificados = (atividade) => {
    setAtividadeEditando(atividade)
    setCertificadosEditando([...atividade.certificados])
    setDialogAberto(true)
  }

  const adicionarCertificadoEdicao = (event) => {
    const files = Array.from(event.target.files)
    const novosArquivos = files.map(file => ({
      id: Date.now() + Math.random(),
      nome: file.name,
      arquivo: file,
      url: URL.createObjectURL(file)
    }))
    
    setCertificadosEditando([...certificadosEditando, ...novosArquivos])
  }

  const removerCertificadoEdicao = (id) => {
    setCertificadosEditando(certificadosEditando.filter(cert => cert.id !== id))
  }

  const salvarCertificadosEdicao = () => {
    const atividadesAtualizadas = atividades.map(ativ => 
      ativ.id === atividadeEditando.id 
        ? { ...ativ, certificados: certificadosEditando }
        : ativ
    )
    setAtividades(atividadesAtualizadas)
    setDialogAberto(false)
    setAtividadeEditando(null)
    setCertificadosEditando([])
  }

  const gerarRelatorioPDF = async () => {
    if (!dadosAluno.nome || !dadosAluno.matricula) {
      alert('Preencha os dados do aluno antes de gerar o relatório')
      return
    }

    if (atividades.length === 0) {
      alert('Adicione pelo menos uma atividade antes de gerar o relatório')
      return
    }

    try {
      // Criar documento PDF principal
      const pdfDoc = await PDFDocument.create()
      
      // Criar primeira página com relatório
      let page = pdfDoc.addPage()
      const { width, height } = page.getSize()
      let yPosition = height - 50

      // Cabeçalho
      page.drawText('RELATÓRIO DE ATIVIDADES COMPLEMENTARES', {
        x: 50,
        y: yPosition,
        size: 16,
        color: rgb(0, 0, 0),
      })
      yPosition -= 20
      
      page.drawText('Curso de Enfermagem - UFF Rio das Ostras', {
        x: 50,
        y: yPosition,
        size: 14,
        color: rgb(0, 0, 0),
      })
      yPosition -= 30

      // Dados do aluno
      page.drawText('DADOS DO ALUNO:', {
        x: 50,
        y: yPosition,
        size: 12,
        color: rgb(0, 0, 0),
      })
      yPosition -= 20
      
      page.drawText(`Nome: ${dadosAluno.nome}`, { x: 70, y: yPosition, size: 10 })
      yPosition -= 15
      page.drawText(`Matrícula: ${dadosAluno.matricula}`, { x: 70, y: yPosition, size: 10 })
      yPosition -= 15
      page.drawText(`Curso: ${dadosAluno.curso}`, { x: 70, y: yPosition, size: 10 })
      yPosition -= 15
      page.drawText(`Período: ${dadosAluno.periodo}`, { x: 70, y: yPosition, size: 10 })
      yPosition -= 30

      // Resumo por núcleo
      const horasPorNucleo = calcularHorasPorNucleo()
      page.drawText('RESUMO POR NÚCLEO:', {
        x: 50,
        y: yPosition,
        size: 12,
        color: rgb(0, 0, 0),
      })
      yPosition -= 20

      Object.entries(NUCLEOS_CONFIG).forEach(([key, config]) => {
        const horas = horasPorNucleo[key] || 0
        page.drawText(`${config.nome}: ${horas}h (Mínimo: ${config.minHoras}h)`, {
          x: 70,
          y: yPosition,
          size: 10
        })
        yPosition -= 15
      })

      yPosition -= 10
      page.drawText(`TOTAL GERAL: ${calcularTotalHoras()}h / ${TOTAL_MINIMO_GERAL}h`, {
        x: 50,
        y: yPosition,
        size: 12,
        color: rgb(0, 0, 0),
      })
      yPosition -= 30

      // Lista de atividades
      page.drawText('ATIVIDADES REALIZADAS:', {
        x: 50,
        y: yPosition,
        size: 12,
        color: rgb(0, 0, 0),
      })
      yPosition -= 20

      atividades.forEach((atividade, index) => {
        if (yPosition < 100) {
          page = pdfDoc.addPage()
          yPosition = height - 50
        }

        page.drawText(`${index + 1}. ${atividade.titulo}`, {
          x: 50,
          y: yPosition,
          size: 11,
          color: rgb(0, 0, 0),
        })
        yPosition -= 15
        
        page.drawText(`Núcleo: ${NUCLEOS_CONFIG[atividade.nucleo]?.nome || atividade.nucleo}`, {
          x: 70,
          y: yPosition,
          size: 9
        })
        yPosition -= 12
        
        if (atividade.tipo) {
          page.drawText(`Tipo: ${atividade.tipo}`, { x: 70, y: yPosition, size: 9 })
          yPosition -= 12
        }

        if (CRITERIOS_CONVERSAO[atividade.tipo]?.tipo === 'multiplicadorPorUnidade') {
          page.drawText(`Quantidade de ${CRITERIOS_CONVERSAO[atividade.tipo].unidade}s: ${atividade.quantidadeUnidades}`, { x: 70, y: yPosition, size: 9 })
          yPosition -= 12
        } else {
          page.drawText(`Horas Declaradas: ${atividade.horasDeclaradas}h`, { x: 70, y: yPosition, size: 9 })
          yPosition -= 12
        }
        
        page.drawText(`Horas Aproveitadas: ${atividade.horasAproveitadas}h`, { x: 70, y: yPosition, size: 9 })
        yPosition -= 12
        
        if (atividade.dataInicio) {
          const periodo = atividade.dataFim ? 
            `${atividade.dataInicio} a ${atividade.dataFim}` : 
            atividade.dataInicio
          page.drawText(`Período: ${periodo}`, { x: 70, y: yPosition, size: 9 })
          yPosition -= 12
        }
        
        if (atividade.descricao) {
          const maxWidth = 450
          const words = atividade.descricao.split(' ')
          let line = 'Descrição: '
          
          for (const word of words) {
            const testLine = line + word + ' '
            if (testLine.length * 5 > maxWidth) {
              page.drawText(line.trim(), { x: 70, y: yPosition, size: 9 })
              yPosition -= 12
              line = word + ' '
            } else {
              line = testLine
            }
          }
          if (line.trim()) {
            page.drawText(line.trim(), { x: 70, y: yPosition, size: 9 })
            yPosition -= 12
          }
        }
        
        if (atividade.certificados.length > 0) {
          page.drawText(`Certificados anexados: ${atividade.certificados.length} arquivo(s)`, {
            x: 70,
            y: yPosition,
            size: 9,
            color: rgb(0, 0.5, 0)
          })
          yPosition -= 12
        }
        
        yPosition -= 10
      })

      // Data de geração
      if (yPosition < 50) {
        page = pdfDoc.addPage()
        yPosition = height - 50
      }
      
      page.drawText(`Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')}`, {
        x: 50,
        y: yPosition - 20,
        size: 9,
        color: rgb(0.5, 0.5, 0.5)
      })

      // Anexar certificados das atividades
      for (const atividade of atividades) {
        for (const certificado of atividade.certificados) {
          try {
            if (certificado.arquivo.type === 'application/pdf') {
              // Anexar PDF
              const arrayBuffer = await certificado.arquivo.arrayBuffer()
              const pdfToMerge = await PDFDocument.load(arrayBuffer)
              const copiedPages = await pdfDoc.copyPages(pdfToMerge, pdfToMerge.getPageIndices())
              
              // Adicionar página de separação
              const separatorPage = pdfDoc.addPage()
              separatorPage.drawText(`CERTIFICADO: ${atividade.titulo}`, {
                x: 50,
                y: separatorPage.getSize().height - 50,
                size: 14,
                color: rgb(0, 0, 0)
              })
              separatorPage.drawText(`Arquivo: ${certificado.nome}`, {
                x: 50,
                y: separatorPage.getSize().height - 80,
                size: 10,
                color: rgb(0.5, 0.5, 0.5)
              })
              
              copiedPages.forEach((page) => pdfDoc.addPage(page))
            } else if (certificado.arquivo.type.startsWith('image/')) {
              // Anexar imagem
              const arrayBuffer = await certificado.arquivo.arrayBuffer()
              let image
              
              if (certificado.arquivo.type === 'image/png') {
                image = await pdfDoc.embedPng(arrayBuffer)
              } else {
                image = await pdfDoc.embedJpg(arrayBuffer)
              }
              
              const imagePage = pdfDoc.addPage()
              const { width: pageWidth, height: pageHeight } = imagePage.getSize()
              
              // Adicionar título
              imagePage.drawText(`CERTIFICADO: ${atividade.titulo}`, {
                x: 50,
                y: pageHeight - 50,
                size: 14,
                color: rgb(0, 0, 0)
              })
              imagePage.drawText(`Arquivo: ${certificado.nome}`, {
                x: 50,
                y: pageHeight - 80,
                size: 10,
                color: rgb(0.5, 0.5, 0.5)
              })
              
              // Calcular dimensões da imagem mantendo proporção
              const imageAspectRatio = image.width / image.height
              const maxWidth = pageWidth - 100
              const maxHeight = pageHeight - 150
              
              let imageWidth = maxWidth
              let imageHeight = maxWidth / imageAspectRatio
              
              if (imageHeight > maxHeight) {
                imageHeight = maxHeight
                imageWidth = maxHeight * imageAspectRatio
              }
              
              imagePage.drawImage(image, {
                x: (pageWidth - imageWidth) / 2,
                y: (pageHeight - imageHeight - 100) / 2,
                width: imageWidth,
                height: imageHeight
              })
            }
          } catch (error) {
            console.error(`Erro ao anexar certificado ${certificado.nome}:`, error)
          }
        }
      }

      // Salvar PDF
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `Relatorio_ACS_${dadosAluno.nome.replace(/\s+/g, '_')}_${dadosAluno.matricula}.pdf`
      link.click()
      
      URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      alert('Erro ao gerar o relatório PDF. Tente novamente.')
    }
  }

  // Função para converter arquivo para base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })
  }

  // Função para converter base64 para arquivo
  const base64ToFile = (base64, filename) => {
    const arr = base64.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, { type: mime })
  }

  const exportarDados = async () => {
    try {
      // Converter certificados para base64
      const atividadesComCertificados = await Promise.all(
        atividades.map(async (ativ) => {
          const certificadosBase64 = await Promise.all(
            ativ.certificados.map(async (cert) => ({
              id: cert.id,
              nome: cert.nome,
              base64: await fileToBase64(cert.arquivo)
            }))
          )
          return {
            ...ativ,
            certificados: certificadosBase64
          }
        })
      )

      const dados = {
        dadosAluno,
        atividades: atividadesComCertificados
      }
      
      const dataStr = JSON.stringify(dados, null, 2)
      const dataBlob = new Blob([dataStr], {type: 'application/json'})
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `dados_acs_${dadosAluno.matricula || 'backup'}.json`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao exportar dados:', error)
      alert('Erro ao exportar dados. Tente novamente.')
    }
  }

  const importarDados = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const dados = JSON.parse(e.target.result)
        if (dados.dadosAluno) setDadosAluno(dados.dadosAluno)
        if (dados.atividades) {
          // Converter base64 de volta para arquivos
          const atividadesComArquivos = dados.atividades.map(ativ => ({
            ...ativ,
            certificados: ativ.certificados.map(cert => ({
              id: cert.id,
              nome: cert.nome,
              arquivo: cert.base64 ? base64ToFile(cert.base64, cert.nome) : null,
              url: cert.base64 ? cert.base64 : null
            })).filter(cert => cert.arquivo) // Remove certificados sem arquivo
          }))
          setAtividades(atividadesComArquivos)
        }
        alert('Dados importados com sucesso!')
      } catch (error) {
        console.error('Erro ao importar dados:', error)
        alert('Erro ao importar dados. Verifique se o arquivo está correto.')
      }
    }
    reader.readAsText(file)
  }

  const calcularHorasPorNucleo = () => {
    const horas = {}
    Object.keys(NUCLEOS_CONFIG).forEach(nucleo => {
      horas[nucleo] = atividades
        .filter(ativ => ativ.nucleo === nucleo)
        .reduce((total, ativ) => total + ativ.horasAproveitadas, 0)
    })
    return horas
  }

  const calcularTotalHoras = () => {
    return atividades.reduce((total, ativ) => total + ativ.horasAproveitadas, 0)
  }

  // Função para verificar se todos os núcleos atingiram o mínimo
  const verificarMinimoNucleos = () => {
    const horasPorNucleo = calcularHorasPorNucleo()
    const nucleosInsuficientes = []
    
    Object.entries(NUCLEOS_CONFIG).forEach(([key, config]) => {
      const horas = horasPorNucleo[key] || 0
      if (horas < config.minHoras) {
        nucleosInsuficientes.push(config.nome)
      }
    })
    
    return nucleosInsuficientes
  }

  const horasPorNucleo = calcularHorasPorNucleo()
  const totalHoras = calcularTotalHoras()
  const nucleosInsuficientes = verificarMinimoNucleos()

  const isMonitoriaOuIniciacao = novaAtividade.tipo === 'Participação em Programa de Monitoria e Iniciação à Docência (por disciplina/semestre)'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Organizador de Atividades Complementares
          </h1>
          <p className="text-gray-600">Curso de Enfermagem - UFF Rio das Ostras</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dados">Dados do Aluno</TabsTrigger>
            <TabsTrigger value="atividades">Atividades</TabsTrigger>
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="relatorio">Relatório</TabsTrigger>
          </TabsList>

          <TabsContent value="dados">
            <Card>
              <CardHeader>
                <CardTitle>Dados do Aluno</CardTitle>
                <CardDescription>
                  Preencha suas informações pessoais e acadêmicas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={dadosAluno.nome}
                      onChange={(e) => setDadosAluno({...dadosAluno, nome: e.target.value})}
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="matricula">Matrícula *</Label>
                    <Input
                      id="matricula"
                      value={dadosAluno.matricula}
                      onChange={(e) => setDadosAluno({...dadosAluno, matricula: e.target.value})}
                      placeholder="Sua matrícula"
                    />
                  </div>
                  <div>
                    <Label htmlFor="curso">Curso</Label>
                    <Input
                      id="curso"
                      value={dadosAluno.curso}
                      onChange={(e) => setDadosAluno({...dadosAluno, curso: e.target.value})}
                      placeholder="Enfermagem"
                    />
                  </div>
                  <div>
                    <Label htmlFor="periodo">Período Atual</Label>
                    <Input
                      id="periodo"
                      value={dadosAluno.periodo}
                      onChange={(e) => setDadosAluno({...dadosAluno, periodo: e.target.value})}
                      placeholder="Ex: 8º período"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="atividades">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Nova Atividade</CardTitle>
                  <CardDescription>
                    Adicione uma nova atividade complementar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="titulo">Título da Atividade *</Label>
                        <Input
                          id="titulo"
                          value={novaAtividade.titulo}
                          onChange={(e) => setNovaAtividade({...novaAtividade, titulo: e.target.value})}
                          placeholder="Ex: Monitoria de Anatomia"
                        />
                      </div>
                      <div>
                        <Label htmlFor="nucleo">Núcleo *</Label>
                        <Select
                          value={novaAtividade.nucleo}
                          onValueChange={(value) => setNovaAtividade({...novaAtividade, nucleo: value, tipo: '', horasDeclaradas: '', quantidadeUnidades: ''})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o núcleo" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(NUCLEOS_CONFIG).map(([key, config]) => (
                              <SelectItem key={key} value={key}>
                                {config.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {novaAtividade.nucleo && (
                      <div>
                        <Label htmlFor="tipo">Tipo de Atividade</Label>
                        <Select
                          value={novaAtividade.tipo}
                          onValueChange={(value) => setNovaAtividade({...novaAtividade, tipo: value, horasDeclaradas: '', quantidadeUnidades: ''})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIPOS_ATIVIDADE[novaAtividade.nucleo]?.map((tipo) => (
                              <SelectItem key={tipo} value={tipo}>
                                {tipo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {isMonitoriaOuIniciacao ? (
                        <div>
                          <Label htmlFor="quantidadeUnidades">Quantidade de Disciplinas/Semestres *</Label>
                          <Input
                            id="quantidadeUnidades"
                            type="number"
                            value={novaAtividade.quantidadeUnidades}
                            onChange={(e) => setNovaAtividade({...novaAtividade, quantidadeUnidades: e.target.value})}
                            placeholder="Ex: 2"
                          />
                        </div>
                      ) : (
                        <div>
                          <Label htmlFor="horas">Horas Declaradas *</Label>
                          <Input
                            id="horas"
                            type="number"
                            value={novaAtividade.horasDeclaradas}
                            onChange={(e) => setNovaAtividade({...novaAtividade, horasDeclaradas: e.target.value})}
                            placeholder="Ex: 30"
                          />
                        </div>
                      )}
                      <div>
                        <Label htmlFor="dataInicio">Data de Início</Label>
                        <Input
                          id="dataInicio"
                          type="date"
                          value={novaAtividade.dataInicio}
                          onChange={(e) => setNovaAtividade({...novaAtividade, dataInicio: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="dataFim">Data de Fim</Label>
                      <Input
                        id="dataFim"
                        type="date"
                        value={novaAtividade.dataFim}
                        onChange={(e) => setNovaAtividade({...novaAtividade, dataFim: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={novaAtividade.descricao}
                      onChange={(e) => setNovaAtividade({...novaAtividade, descricao: e.target.value})}
                      placeholder="Descreva a atividade realizada..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Certificados</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Adicionar Certificados
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={adicionarCertificado}
                        className="hidden"
                      />
                    </div>
                    {novaAtividade.certificados.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {novaAtividade.certificados.map((cert) => (
                          <div key={cert.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span className="text-sm">{cert.nome}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removerCertificado(cert.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button onClick={adicionarAtividade} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Atividade
                  </Button>
                </CardContent>
              </Card>

              {atividades.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Atividades Cadastradas ({atividades.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {atividades.map((atividade) => (
                        <div key={atividade.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium">{atividade.titulo}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary">
                                  {NUCLEOS_CONFIG[atividade.nucleo]?.nome}
                                </Badge>
                                <span className="text-sm text-gray-600">
                                  {CRITERIOS_CONVERSAO[atividade.tipo]?.tipo === 'multiplicadorPorUnidade' ? 
                                    `${atividade.quantidadeUnidades} ${CRITERIOS_CONVERSAO[atividade.tipo].unidade}(s)` : 
                                    `${atividade.horasDeclaradas}h`
                                  }
                                  (Aproveitadas: {atividade.horasAproveitadas}h)
                                </span>
                              </div>
                              {atividade.tipo && (
                                <p className="text-sm text-gray-600 mt-1">
                                  <strong>Tipo:</strong> {atividade.tipo}
                                </p>
                              )}
                              {atividade.descricao && (
                                <p className="text-sm text-gray-600 mt-1">
                                  <strong>Descrição:</strong> {atividade.descricao}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                {atividade.certificados.length > 0 && (
                                  <p className="text-sm text-green-600">
                                    📎 {atividade.certificados.length} certificado(s) anexado(s)
                                  </p>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => abrirEdicaoCertificados(atividade)}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Editar Certificados
                                </Button>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removerAtividade(atividade.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="resumo">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Progresso Geral</CardTitle>
                  <CardDescription>
                    Acompanhe seu progresso nas atividades complementares
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Geral</span>
                      <span className="font-bold">{totalHoras}h / {TOTAL_MINIMO_GERAL}h</span>
                    </div>
                    <Progress value={Math.min((totalHoras / TOTAL_MINIMO_GERAL) * 100, 100)} className="h-3" />
                    <p className="text-sm text-gray-600">
                      {((totalHoras / TOTAL_MINIMO_GERAL) * 100).toFixed(1)}% concluído
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(NUCLEOS_CONFIG).map(([key, config]) => {
                  const horas = horasPorNucleo[key] || 0
                  const progresso = Math.min((horas / config.minHoras) * 100, 100)
                  
                  return (
                    <Card key={key}>
                      <CardHeader>
                        <CardTitle className="text-lg">{config.nome}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Horas aproveitadas</span>
                            <span className="font-medium">{horas}h (Mínimo: {config.minHoras}h)</span>
                          </div>
                          <Progress value={progresso} className="h-2" />
                          <p className="text-sm text-gray-600">
                            {progresso.toFixed(1)}% do mínimo concluído
                          </p>
                          {horas < config.minHoras && (
                            <p className="text-sm text-red-600">
                              ❌ Horas insuficientes. Mínimo de {config.minHoras}h exigido.
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="relatorio">
            <Card>
              <CardHeader>
                <CardTitle>Gerar Relatório</CardTitle>
                <CardDescription>
                  Gere um relatório em PDF com todas as suas atividades complementares
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button onClick={gerarRelatorioPDF} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Gerar PDF
                  </Button>
                  <Button onClick={exportarDados} variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Dados
                  </Button>
                  <div>
                    <input
                      type="file"
                      accept=".json"
                      onChange={importarDados}
                      className="hidden"
                      id="importar"
                    />
                    <Button
                      onClick={() => document.getElementById('importar')?.click()}
                      variant="outline"
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Importar Dados
                    </Button>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">📋 Instruções:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• <strong>Gerar PDF:</strong> Cria um relatório completo com todas as atividades e certificados anexados</li>
                    <li>• <strong>Exportar Dados:</strong> Salva seus dados em formato JSON para backup (inclui certificados)</li>
                    <li>• <strong>Importar Dados:</strong> Carrega dados previamente salvos (restaura certificados)</li>
                  </ul>
                </div>

                {totalHoras >= TOTAL_MINIMO_GERAL && nucleosInsuficientes.length === 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">🎉 Parabéns!</h4>
                    <p className="text-sm text-green-700">
                      Você completou as {TOTAL_MINIMO_GERAL} horas necessárias de atividades complementares e atingiu o mínimo em todos os núcleos!
                      Gere seu relatório e entregue à coordenação do curso através do e-mail: <strong>rge.rhs@id.uff.br</strong> para análise e validação.
                    </p>
                  </div>
                )}

                {(totalHoras < TOTAL_MINIMO_GERAL || nucleosInsuficientes.length > 0) && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-medium text-orange-800 mb-2">⚠️ Atenção!</h4>
                    <div className="text-sm text-orange-700 space-y-1">
                      {totalHoras < TOTAL_MINIMO_GERAL && (
                        <p>• Você ainda precisa de {TOTAL_MINIMO_GERAL - totalHoras} horas para completar o total mínimo de {TOTAL_MINIMO_GERAL}h.</p>
                      )}
                      {nucleosInsuficientes.length > 0 && (
                        <p>• Você ainda não completou a carga horária mínima nos seguintes núcleos: <strong>{nucleosInsuficientes.join(', ')}</strong>.</p>
                      )}
                      <p>• Continue adicionando atividades para completar os requisitos.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog para edição de certificados */}
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Certificados</DialogTitle>
              <DialogDescription>
                {atividadeEditando && `Gerenciar certificados da atividade: ${atividadeEditando.titulo}`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Adicionar Certificados</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputEditRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Adicionar Certificados
                  </Button>
                  <input
                    ref={fileInputEditRef}
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={adicionarCertificadoEdicao}
                    className="hidden"
                  />
                </div>
              </div>
              
              {certificadosEditando.length > 0 && (
                <div>
                  <Label>Certificados Anexados</Label>
                  <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                    {certificadosEditando.map((cert) => (
                      <div key={cert.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm">{cert.nome}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removerCertificadoEdicao(cert.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogAberto(false)}>
                  Cancelar
                </Button>
                <Button onClick={salvarCertificadosEdicao}>
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default App
