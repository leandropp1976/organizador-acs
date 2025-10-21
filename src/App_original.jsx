import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Trash2, Upload, Download, FileText, Plus, Eye } from 'lucide-react'
import { jsPDF } from 'jspdf'
import { PDFDocument, rgb } from 'pdf-lib'
import './App.css'

// Configurações do regulamento de ACs
const NUCLEOS_CONFIG = {
  'ensino': { nome: 'Ensino', maxHoras: 60, cor: 'bg-blue-100 text-blue-800' },
  'pesquisa': { nome: 'Pesquisa', maxHoras: 60, cor: 'bg-green-100 text-green-800' },
  'extensao': { nome: 'Extensão', maxHoras: 60, cor: 'bg-purple-100 text-purple-800' },
  'representacao': { nome: 'Representação Estudantil', maxHoras: 30, cor: 'bg-orange-100 text-orange-800' }
}

const TIPOS_ATIVIDADE = {
  'ensino': [
    'Monitoria acadêmica',
    'Curso de idiomas',
    'Disciplina optativa',
    'Curso de extensão',
    'Minicurso',
    'Workshop',
    'Palestra',
    'Seminário'
  ],
  'pesquisa': [
    'Iniciação científica',
    'Publicação de artigo',
    'Apresentação em congresso',
    'Participação em grupo de pesquisa',
    'Projeto de pesquisa',
    'TCC em área específica'
  ],
  'extensao': [
    'Projeto de extensão',
    'Ação comunitária',
    'Voluntariado',
    'Estágio não obrigatório',
    'Atividade cultural',
    'Evento científico'
  ],
  'representacao': [
    'Representação discente',
    'Participação em colegiado',
    'Organização de evento acadêmico',
    'Comissão organizadora'
  ]
}

function App() {
  const [atividades, setAtividades] = useState([])
  const [novaAtividade, setNovaAtividade] = useState({
    titulo: '',
    nucleo: '',
    tipo: '',
    descricao: '',
    horasDeclardas: '',
    dataInicio: '',
    dataFim: '',
    certificados: []
  })
  const [dadosAluno, setDadosAluno] = useState({
    nome: '',
    matricula: '',
    curso: 'Enfermagem',
    periodo: ''
  })
  const fileInputRef = useRef(null)

  const calcularHorasPorNucleo = () => {
    const horas = {}
    Object.keys(NUCLEOS_CONFIG).forEach(nucleo => {
      horas[nucleo] = atividades
        .filter(ativ => ativ.nucleo === nucleo)
        .reduce((total, ativ) => total + parseInt(ativ.horasDeclardas || 0), 0)
    })
    return horas
  }

  const calcularTotalHoras = () => {
    return atividades.reduce((total, ativ) => total + parseInt(ativ.horasDeclardas || 0), 0)
  }

  const adicionarAtividade = () => {
    if (!novaAtividade.titulo || !novaAtividade.nucleo || !novaAtividade.horasDeclardas) {
      alert('Preencha os campos obrigatórios: Título, Núcleo e Horas')
      return
    }

    const atividade = {
      ...novaAtividade,
      id: Date.now(),
      horasDeclardas: parseInt(novaAtividade.horasDeclardas)
    }

    setAtividades([...atividades, atividade])
    setNovaAtividade({
      titulo: '',
      nucleo: '',
      tipo: '',
      descricao: '',
      horasDeclardas: '',
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

  const gerarRelatorioPDF = async () => {
    if (!dadosAluno.nome || !dadosAluno.matricula) {
      alert('Preencha os dados do aluno antes de gerar o relatório')
      return
    }

    if (atividades.length === 0) {
      alert('Adicione pelo menos uma atividade antes de gerar o relatório')
      return
    }

    const pdf = new jsPDF()
    let yPosition = 20

    // Cabeçalho
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('RELATÓRIO DE ATIVIDADES COMPLEMENTARES', 20, yPosition)
    yPosition += 10
    
    pdf.setFontSize(14)
    pdf.text('Curso de Enfermagem - UFF Rio das Ostras', 20, yPosition)
    yPosition += 20

    // Dados do aluno
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text('DADOS DO ALUNO:', 20, yPosition)
    yPosition += 8
    
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Nome: ${dadosAluno.nome}`, 20, yPosition)
    yPosition += 6
    pdf.text(`Matrícula: ${dadosAluno.matricula}`, 20, yPosition)
    yPosition += 6
    pdf.text(`Curso: ${dadosAluno.curso}`, 20, yPosition)
    yPosition += 6
    pdf.text(`Período: ${dadosAluno.periodo}`, 20, yPosition)
    yPosition += 15

    // Resumo por núcleo
    const horasPorNucleo = calcularHorasPorNucleo()
    pdf.setFont('helvetica', 'bold')
    pdf.text('RESUMO POR NÚCLEO:', 20, yPosition)
    yPosition += 8

    Object.entries(NUCLEOS_CONFIG).forEach(([key, config]) => {
      const horas = horasPorNucleo[key] || 0
      pdf.setFont('helvetica', 'normal')
      pdf.text(`${config.nome}: ${horas}h / ${config.maxHoras}h`, 30, yPosition)
      yPosition += 6
    })

    yPosition += 10
    pdf.setFont('helvetica', 'bold')
    pdf.text(`TOTAL GERAL: ${calcularTotalHoras()}h / 200h`, 20, yPosition)
    yPosition += 20

    // Lista de atividades
    pdf.setFont('helvetica', 'bold')
    pdf.text('ATIVIDADES REALIZADAS:', 20, yPosition)
    yPosition += 10

    atividades.forEach((atividade, index) => {
      if (yPosition > 250) {
        pdf.addPage()
        yPosition = 20
      }

      pdf.setFont('helvetica', 'bold')
      pdf.text(`${index + 1}. ${atividade.titulo}`, 20, yPosition)
      yPosition += 6
      
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Núcleo: ${NUCLEOS_CONFIG[atividade.nucleo]?.nome || atividade.nucleo}`, 30, yPosition)
      yPosition += 5
      
      if (atividade.tipo) {
        pdf.text(`Tipo: ${atividade.tipo}`, 30, yPosition)
        yPosition += 5
      }
      
      pdf.text(`Horas: ${atividade.horasDeclardas}h`, 30, yPosition)
      yPosition += 5
      
      if (atividade.dataInicio) {
        const periodo = atividade.dataFim ? 
          `${atividade.dataInicio} a ${atividade.dataFim}` : 
          atividade.dataInicio
        pdf.text(`Período: ${periodo}`, 30, yPosition)
        yPosition += 5
      }
      
      if (atividade.descricao) {
        const descricaoLinhas = pdf.splitTextToSize(atividade.descricao, 160)
        pdf.text(`Descrição: ${descricaoLinhas[0]}`, 30, yPosition)
        yPosition += 5
        for (let i = 1; i < descricaoLinhas.length; i++) {
          pdf.text(descricaoLinhas[i], 30, yPosition)
          yPosition += 5
        }
      }
      
      if (atividade.certificados.length > 0) {
        pdf.text(`Certificados anexados: ${atividade.certificados.length} arquivo(s)`, 30, yPosition)
        yPosition += 5
      }
      
      yPosition += 5
    })

    // Rodapé
    if (yPosition > 250) {
      pdf.addPage()
      yPosition = 20
    }
    
    yPosition += 20
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, yPosition)
    yPosition += 10
    pdf.text('Assinatura do aluno: _________________________________', 20, yPosition)

    // Salvar PDF
    pdf.save(`Relatorio_ACS_${dadosAluno.nome.replace(/\s+/g, '_')}.pdf`)
  }

  const exportarDados = () => {
    const dados = {
      dadosAluno,
      atividades: atividades.map(ativ => ({
        ...ativ,
        certificados: ativ.certificados.map(cert => ({
          id: cert.id,
          nome: cert.nome
        }))
      }))
    }
    
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dados_acs_${dadosAluno.nome.replace(/\s+/g, '_')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importarDados = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const dados = JSON.parse(e.target.result)
          setDadosAluno(dados.dadosAluno || {})
          setAtividades(dados.atividades || [])
          alert('Dados importados com sucesso!')
        } catch (error) {
          alert('Erro ao importar dados. Verifique se o arquivo está correto.')
        }
      }
      reader.readAsText(file)
    }
  }

  const horasPorNucleo = calcularHorasPorNucleo()
  const totalHoras = calcularTotalHoras()
  const progressoGeral = Math.min((totalHoras / 200) * 100, 100)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Organizador de Atividades Complementares
          </h1>
          <p className="text-lg text-gray-600">
            Curso de Enfermagem - UFF Rio das Ostras
          </p>
        </div>

        <Tabs defaultValue="dados" className="space-y-6">
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
              <CardContent className="space-y-4">
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
                        onValueChange={(value) => setNovaAtividade({...novaAtividade, nucleo: value, tipo: ''})}
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
                    {novaAtividade.nucleo && (
                      <div>
                        <Label htmlFor="tipo">Tipo de Atividade</Label>
                        <Select
                          value={novaAtividade.tipo}
                          onValueChange={(value) => setNovaAtividade({...novaAtividade, tipo: value})}
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
                    <div>
                      <Label htmlFor="horas">Horas Declaradas *</Label>
                      <Input
                        id="horas"
                        type="number"
                        value={novaAtividade.horasDeclardas}
                        onChange={(e) => setNovaAtividade({...novaAtividade, horasDeclardas: e.target.value})}
                        placeholder="Ex: 30"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dataInicio">Data de Início</Label>
                      <Input
                        id="dataInicio"
                        type="date"
                        value={novaAtividade.dataInicio}
                        onChange={(e) => setNovaAtividade({...novaAtividade, dataInicio: e.target.value})}
                      />
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
                            <span className="text-sm">{cert.nome}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
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
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold">{atividade.titulo}</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removerAtividade(atividade.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge className={NUCLEOS_CONFIG[atividade.nucleo]?.cor}>
                              {NUCLEOS_CONFIG[atividade.nucleo]?.nome}
                            </Badge>
                            <Badge variant="secondary">{atividade.horasDeclardas}h</Badge>
                            {atividade.certificados.length > 0 && (
                              <Badge variant="outline">
                                <FileText className="h-3 w-3 mr-1" />
                                {atividade.certificados.length} certificado(s)
                              </Badge>
                            )}
                          </div>
                          {atividade.tipo && (
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Tipo:</strong> {atividade.tipo}
                            </p>
                          )}
                          {atividade.descricao && (
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Descrição:</strong> {atividade.descricao}
                            </p>
                          )}
                          {atividade.dataInicio && (
                            <p className="text-sm text-gray-600">
                              <strong>Período:</strong> {atividade.dataInicio}
                              {atividade.dataFim && ` a ${atividade.dataFim}`}
                            </p>
                          )}
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
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Total Geral</span>
                        <span className="font-medium">{totalHoras}h / 200h</span>
                      </div>
                      <Progress value={progressoGeral} className="h-3" />
                      <p className="text-sm text-gray-600 mt-1">
                        {progressoGeral.toFixed(1)}% concluído
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(NUCLEOS_CONFIG).map(([key, config]) => {
                  const horas = horasPorNucleo[key] || 0
                  const progresso = Math.min((horas / config.maxHoras) * 100, 100)
                  
                  return (
                    <Card key={key}>
                      <CardHeader>
                        <CardTitle className="text-lg">{config.nome}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Horas realizadas</span>
                            <span className="font-medium">{horas}h / {config.maxHoras}h</span>
                          </div>
                          <Progress value={progresso} className="h-2" />
                          <p className="text-sm text-gray-600">
                            {progresso.toFixed(1)}% concluído
                          </p>
                          {horas > config.maxHoras && (
                            <p className="text-sm text-orange-600">
                              ⚠️ Excesso de {horas - config.maxHoras}h (máximo aproveitável: {config.maxHoras}h)
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
                    <li>• <strong>Gerar PDF:</strong> Cria um relatório completo com todas as atividades</li>
                    <li>• <strong>Exportar Dados:</strong> Salva seus dados em formato JSON para backup</li>
                    <li>• <strong>Importar Dados:</strong> Carrega dados previamente salvos</li>
                  </ul>
                </div>

                {totalHoras >= 200 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">🎉 Parabéns!</h4>
                    <p className="text-sm text-green-700">
                      Você já completou as 200 horas necessárias de atividades complementares!
                      Gere seu relatório e entregue à coordenação do curso.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App
