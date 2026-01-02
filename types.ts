
export interface Unit {
  id: string;
  number: string;
  size: number;
  rent: number;
  paymentDay: number;
  status: 'Disponível' | 'Ocupada' | 'Manutenção';
  contractStart?: string;
  contractEnd?: string;
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  phone: string;
  kitnet: string; // Armazena o Número da Unidade
  status: 'Ativo' | 'Inativo';
  photo?: string;
  cpf?: string;
  docsLink?: string;
  observations?: string;
}

export interface FinancialRecord {
  id: string;
  description: string;
  entity: string; // Nome do Inquilino ou Fornecedor
  amount: number;
  fine?: number;
  dueDate: string;
  status: 'Pendente' | 'Pago';
  type: 'RECEIVABLE' | 'PAYABLE';
  paymentDate?: string;
}

export interface AIAnalysis {
  summary: string;
  suggestions: string[];
  riskLevel: string;
}

export type TabType = 'dashboard' | 'units' | 'tenants' | 'finances' | 'reports';

declare global {
  interface Window {
    jspdf: any;
    Chart: any;
  }
}
