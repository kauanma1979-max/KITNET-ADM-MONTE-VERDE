
import { Unit, Tenant, FinancialRecord } from './types';

export const INITIAL_UNITS: Unit[] = [
  { id: 'u1', number: '01', size: 28, rent: 1250.00, paymentDay: 10, status: 'Ocupada', contractStart: '2025-09-15', contractEnd: '2026-09-15' },
  { id: 'u2', number: '02', size: 28, rent: 1129.53, paymentDay: 25, status: 'Ocupada', contractStart: '2025-08-25', contractEnd: '2026-08-25' },
  { id: 'u3', number: '201', size: 28, rent: 880.00, paymentDay: 1, status: 'Disponível' },
  { id: 'u4', number: '202', size: 35, rent: 950.00, paymentDay: 20, status: 'Manutenção' }
];

export const INITIAL_TENANTS: Tenant[] = [
  { 
    id: 't1', 
    name: 'Alexandro Donizeti Domingos', 
    email: '01971alexdomingos@gmail.com', 
    phone: '19 99163-8708', 
    kitnet: '01', 
    status: 'Ativo', 
    cpf: '153.552.118-01', 
    observations: '12 meses de 15/09/2025 a 15/09/2026',
    docsLink: 'https://drive.google.com/drive/folders/exemple' 
  },
  { 
    id: 't2', 
    name: 'Victor Figueiredo Marcondes de Almeida', 
    email: 'victorfiguei@gmail.com', 
    phone: '19 98353-7105', 
    kitnet: '02', 
    status: 'Ativo', 
    cpf: '099.892.399-08', 
    observations: '12 meses de 25/08/2025 a 25/08/2026',
    docsLink: '' 
  }
];

export const INITIAL_RECORDS: FinancialRecord[] = [
  // --- RECEITAS ÚNICAS ---
  { id: 'r1', description: 'ALUGUEL MÊS ATUAL', entity: 'Alexandro Donizeti Domingos', amount: 1250.00, fine: 0, dueDate: '2025-10-10', status: 'Pago', type: 'RECEIVABLE', paymentDate: '2025-10-10' },
  { id: 'r2', description: 'ALUGUEL MÊS ATUAL', entity: 'Victor Figueiredo Marcondes de Almeida', amount: 1129.00, fine: 0, dueDate: '2025-10-25', status: 'Pago', type: 'RECEIVABLE', paymentDate: '2025-10-25' },
  { id: 'r3', description: 'TAXA DE LAVANDERIA', entity: 'Alexandro Donizeti Domingos', amount: 45.00, fine: 0, dueDate: '2025-10-15', status: 'Pago', type: 'RECEIVABLE', paymentDate: '2025-10-15' },
  { id: 'r4', description: 'ALUGUEL PRÓXIMO MÊS', entity: 'Alexandro Donizeti Domingos', amount: 1250.00, fine: 0, dueDate: '2025-11-10', status: 'Pendente', type: 'RECEIVABLE' },

  // --- DESPESAS ÚNICAS ---
  { id: 'p1', description: 'CONTA DE ENERGIA - GERAL', entity: 'CPFL', amount: 130.00, dueDate: '2025-10-25', status: 'Pago', type: 'PAYABLE', paymentDate: '2025-10-25' },
  { id: 'p2', description: 'SEGURO FIANÇA MENSAL', entity: 'PORTO SEGURO', amount: 117.02, dueDate: '2025-10-25', status: 'Pago', type: 'PAYABLE', paymentDate: '2025-10-25' },
  { id: 'p3', description: 'MANUTENÇÃO PREVENTIVA', entity: 'PRESTADOR DE SERVIÇO', amount: 250.00, dueDate: '2025-11-05', status: 'Pendente', type: 'PAYABLE' }
];
