export interface MedicoSeed {
  documento: string;
  matricula: number;
  valor_consulta: number;
}

export const MEDICOS_SEED: MedicoSeed[] = [
  { documento: '24567890', matricula: 10001, valor_consulta: 15000 },
  { documento: '27345678', matricula: 10002, valor_consulta: 18000 },
  { documento: '29876543', matricula: 10003, valor_consulta: 20000 },
  { documento: '30123987', matricula: 10004, valor_consulta: 17000 },
  { documento: '26789012', matricula: 10005, valor_consulta: 16000 },
];