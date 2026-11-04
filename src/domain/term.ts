/**
 * Termo de Responsabilidade e Ciência exibido na matrícula.
 * Ao mudar qualquer texto, troque TERM_VERSION: o aceite gravado aponta para a versão lida.
 */
export const TERM_VERSION = "2026-11-04"

export const TERM_TITLE = "Termo de Responsabilidade e Ciência"

export type TermSection = {
  title: string
  paragraphs?: string[]
  intro?: string
  items?: string[]
  /** Só aparece (e só vale) quando o aluno é menor de 18 anos */
  minorOnly?: boolean
}

export const TERM_SECTIONS: TermSection[] = [
  {
    title: "Responsabilidade e condições de saúde",
    paragraphs: [
      "Declaro que estou ciente de que o Jiu-Jitsu é uma modalidade esportiva que envolve contato físico, movimentos de defesa, quedas e técnicas de imobilização, podendo apresentar riscos de lesões e acidentes.",
      "Declaro que as informações sobre minha condição de saúde são verdadeiras e que me comprometo a comunicar à academia qualquer condição, limitação ou alteração de saúde que possa interferir na prática da atividade.",
      "Comprometo-me a respeitar meus próprios limites e interromper a atividade caso sinta dor, mal-estar ou qualquer desconforto.",
    ],
  },
  {
    title: "Regras de conduta, higiene e segurança",
    intro: "Comprometo-me a:",
    items: [
      "Respeitar os professores, colegas e demais frequentadores da academia.",
      "Seguir as orientações dos professores durante os treinamentos.",
      "Manter unhas das mãos e dos pés cortadas e boa higiene pessoal.",
      "Utilizar kimono ou roupa adequada para a prática do Jiu-Jitsu.",
      "Para as alunas, é obrigatório o uso de rash guard ou camiseta fechada, que cubra adequadamente o tronco, durante os treinamentos, por se tratar de uma modalidade esportiva de contato físico.",
      "Utilizar roupas apropriadas, confortáveis e que não ofereçam riscos durante a execução das técnicas.",
      "Não realizar técnicas sem orientação ou autorização do professor.",
      "Não participar dos treinos sob efeito de álcool ou outras substâncias que comprometam a segurança.",
      "Comunicar imediatamente qualquer acidente, lesão ou mal-estar ocorrido durante as aulas.",
      "Zelar pelos materiais, equipamentos e instalações da academia.",
    ],
  },
  {
    title: "Ciência dos riscos da modalidade",
    paragraphs: [
      "Estou ciente de que, mesmo com os cuidados e orientações dos professores, o Jiu-Jitsu envolve riscos próprios de uma atividade física de contato.",
      "Comprometo-me a praticar a modalidade com responsabilidade, respeitando as regras e orientações de segurança.",
      "Este termo não representa renúncia a direitos nem isenta a academia de suas responsabilidades legais.",
    ],
  },
  {
    title: "Alunos menores de idade",
    minorOnly: true,
    paragraphs: [
      "No caso de aluno menor de 18 anos, o pai, mãe ou responsável legal declara estar ciente da participação do menor nas aulas de Jiu-Jitsu, autoriza sua prática esportiva e compromete-se a informar à academia qualquer condição de saúde ou necessidade especial relevante para sua segurança.",
    ],
  },
  {
    title: "Declaração final",
    paragraphs: [
      "Declaro que li e compreendi as informações deste documento e que estou ciente das responsabilidades relacionadas à prática do Jiu-Jitsu.",
    ],
  },
]

export const termSectionsFor = (isMinor: boolean) => TERM_SECTIONS.filter((s) => isMinor || !s.minorOnly)

export type TermSignerRole = "aluno" | "responsavel"
export const SIGNER_LABEL: Record<TermSignerRole, string> = { aluno: "Aluno", responsavel: "Responsável legal" }
