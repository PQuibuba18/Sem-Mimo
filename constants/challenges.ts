export type Challenge = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

export const DAILY_CHALLENGES: Challenge[] = [
  { id: 'c01', title: 'Silêncio Produtivo', description: 'Passe 24 horas sem reclamar de nada. Nem uma palavra negativa.', icon: '🤐' },
  { id: 'c02', title: 'Diário de Decisões', description: 'Anote três decisões importantes que você vem adiando.', icon: '📓' },
  { id: 'c03', title: 'Madrugada do Campeão', description: 'Acorde uma hora mais cedo do que o habitual. Use esse tempo para você.', icon: '🌅' },
  { id: 'c04', title: 'Desconexão Digital', description: 'Fique 4 horas sem redes sociais. Observe o que sente.', icon: '📵' },
  { id: 'c05', title: 'Gratidão em Ação', description: 'Escreva 10 coisas pelas quais você é genuinamente grato hoje.', icon: '🙏' },
  { id: 'c06', title: 'Leitura de Ferro', description: 'Leia 30 páginas de um livro que expanda sua mente hoje.', icon: '📚' },
  { id: 'c07', title: 'Corpo em Movimento', description: 'Exercite-se por pelo menos 45 minutos. Empurre seus limites.', icon: '💪' },
  { id: 'c08', title: 'Foco Absoluto', description: 'Trabalhe por 2 horas sem interrupção alguma. Sem celular, sem distração.', icon: '🎯' },
  { id: 'c09', title: 'Conversa com o Inimigo', description: 'Identifique seu maior medo e escreva um plano para enfrentá-lo.', icon: '⚔️' },
  { id: 'c10', title: 'Plano dos Sonhos', description: 'Escreva em detalhes onde você quer estar daqui a 5 anos.', icon: '🚀' },
  { id: 'c11', title: 'Jejum Mental', description: 'Não assista nenhum vídeo ou série por 24 horas. Use esse tempo para criar.', icon: '🧠' },
  { id: 'c12', title: 'Banho de Ferro', description: 'Tome um banho frio por pelo menos 2 minutos. Discipline seu corpo.', icon: '🧊' },
  { id: 'c13', title: 'Meditação de Aço', description: 'Medite em silêncio por 20 minutos. Apenas observe seus pensamentos.', icon: '🧘' },
  { id: 'c14', title: 'Generosidade Anônima', description: 'Faça algo útil por alguém hoje sem esperar reconhecimento.', icon: '🤝' },
  { id: 'c15', title: 'Uma Conversa Real', description: 'Ligue para alguém importante e tenha uma conversa profunda por 30 minutos.', icon: '📞' },
];

export const getDailyChallenge = (): Challenge => {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return DAILY_CHALLENGES[dayOfYear % DAILY_CHALLENGES.length];
};
