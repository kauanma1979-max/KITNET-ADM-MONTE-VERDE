
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
  },
  { id: 't3', name: 'Anderson Leo de Sousa', email: 'as.leo@hotmail.com', phone: '-', kitnet: '', status: 'Inativo', observations: 'Saiu em 2024' },
  { id: 't4', name: 'Sandro Haruo Hiramatsu', email: '-', phone: '-', kitnet: '', status: 'Inativo', observations: 'Saiu em 2025' },
  { id: 't5', name: 'Gilmar Santana dos Santos', email: '-', phone: '-', kitnet: '', status: 'Inativo', observations: 'Saiu em 2025' }
];

export const INITIAL_RECORDS: FinancialRecord[] = [
  // --- RECEITAS (Receivables from PDF) ---
  { id: 'r1', description: 'ALUGUEL 1ª LOCAÇÃO', entity: 'Anderson Leo de Sousa', amount: 5540.00, fine: 0, dueDate: '2023-11-23', status: 'Pago', type: 'RECEIVABLE', paymentDate: '2023-11-23' },
  { id: 'r2', description: 'ALUGUEL 2ª LOCAÇÃO', entity: 'Anderson Leo de Sousa', amount: 11243.00, fine: 0, dueDate: '2024-11-11', status: 'Pago', type: 'RECEIVABLE', paymentDate: '2024-11-11' },
  { id: 'r3', description: 'ALUGUEL 3ª LOCAÇÃO', entity: 'Sandro Haruo Hiramatsu', amount: 5250.00, fine: 0, dueDate: '2025-03-11', status: 'Pago', type: 'RECEIVABLE', paymentDate: '2025-03-11' },
  { id: 'r4', description: 'MULTA ANTECIPAÇÃO DO CONTRATO', entity: 'Sandro Haruo Hiramatsu', amount: 0, fine: 1837.50, dueDate: '2025-04-02', status: 'Pago', type: 'RECEIVABLE', paymentDate: '2025-04-02' },
  { id: 'r5', description: 'ALUGUEL 1ª LOCAÇÃO', entity: 'Gilmar Santana dos Santos', amount: 5750.00, fine: 0, dueDate: '2025-07-28', status: 'Pago', type: 'RECEIVABLE', paymentDate: '2025-07-28' },
  { id: 'r6', description: 'MULTA ANTECIPAÇÃO DO CONTRATO', entity: 'Gilmar Santana dos Santos', amount: 0, fine: 2300.00, dueDate: '2025-09-03', status: 'Pago', type: 'RECEIVABLE', paymentDate: '2025-09-03' },
  { id: 'r7', description: 'DIÁRIAS TEMPO PERMANENCIA', entity: 'Gilmar Santana dos Santos', amount: 153.00, fine: 0, dueDate: '2025-09-03', status: 'Pago', type: 'RECEIVABLE', paymentDate: '2025-09-03' },
  { id: 'r8', description: 'ALUGUEL LOCAÇÃO', entity: 'Victor Figueiredo Marcondes de Almeida', amount: 1054.00, fine: 0, dueDate: '2025-09-25', status: 'Pago', type: 'RECEIVABLE', paymentDate: '2025-09-25' },
  { id: 'r9', description: 'ALUGUEL LOCAÇÃO', entity: 'Alexandro Donizeti Domingos', amount: 1083.00, fine: 0, dueDate: '2025-10-10', status: 'Pago', type: 'RECEIVABLE', paymentDate: '2025-10-10' },
  { id: 'r10', description: 'LAVAGEM DE ROUPA', entity: 'Alexandro Donizeti Domingos', amount: 35.00, fine: 0, dueDate: '2025-09-19', status: 'Pago', type: 'RECEIVABLE', paymentDate: '2025-09-19' },
  { id: 'r11', description: 'LAVAGEM DE ROUPA', entity: 'Alexandro Donizeti Domingos', amount: 35.00, fine: 0, dueDate: '2025-09-26', status: 'Pago', type: 'RECEIVABLE', paymentDate: '2025-09-26' },
  { id: 'r12', description: 'LAVAGEM DE ROUPA', entity: 'Alexandro Donizeti Domingos', amount: 35.00, fine: 0, dueDate: '2025-10-03', status: 'Pago', type: 'RECEIVABLE', paymentDate: '2025-10-03' },
  { id: 'r13', description: 'ALUGUEL LOCAÇÃO', entity: 'Victor Figueiredo Marcondes de Almeida', amount: 1129.00, fine: 0, dueDate: '2025-10-20', status: 'Pago', type: 'RECEIVABLE', paymentDate: '2025-10-20' },
  { id: 'r14', description: 'LAVAGEM DE ROUPA', entity: 'Alexandro Donizeti Domingos', amount: 45.00, fine: 0, dueDate: '2025-10-10', status: 'Pago', type: 'RECEIVABLE', paymentDate: '2025-10-10' },
  { id: 'r15', description: 'LAVAGEM DE ROUPA', entity: 'Alexandro Donizeti Domingos', amount: 45.00, fine: 0, dueDate: '2025-10-17', status: 'Pago', type: 'RECEIVABLE', paymentDate: '2025-10-17' },
  { id: 'r16', description: 'LAVAGEM DE ROUPA', entity: 'Alexandro Donizeti Domingos', amount: 45.00, fine: 0, dueDate: '2025-10-31', status: 'Pago', type: 'RECEIVABLE', paymentDate: '2025-10-31' },
  { id: 'r17', description: 'ALUGUEL LOCAÇÃO', entity: 'Alexandro Donizeti Domingos', amount: 1250.00, fine: 0, dueDate: '2025-11-10', status: 'Pendente', type: 'RECEIVABLE' },
  { id: 'r18', description: 'ALUGUEL LOCAÇÃO', entity: 'Victor Figueiredo Marcondes de Almeida', amount: 1129.00, fine: 0, dueDate: '2025-11-25', status: 'Pendente', type: 'RECEIVABLE' },

  // --- DESPESAS (Payables from PDF) ---
  { id: 'p1', description: 'SEGURO FIANÇA ANDERSON - 1 LOCAÇÃO', entity: 'PORTO SEGURO', amount: 712.80, dueDate: '2023-11-30', status: 'Pago', type: 'PAYABLE', paymentDate: '2023-11-30' },
  { id: 'p2', description: 'SEGURO FIANÇA ANDERSON - 2 LOCAÇÃO', entity: 'PORTO SEGURO', amount: 1420.50, dueDate: '2024-11-23', status: 'Pago', type: 'PAYABLE', paymentDate: '2024-11-23' },
  { id: 'p3', description: 'TAXA BOLETO', entity: 'EFI', amount: 62.10, dueDate: '2023-11-11', status: 'Pago', type: 'PAYABLE', paymentDate: '2023-11-11' },
  { id: 'p4', description: 'TAXA BOLETO', entity: 'EFI', amount: 17.25, dueDate: '2025-03-11', status: 'Pago', type: 'PAYABLE', paymentDate: '2025-03-11' },
  { id: 'p5', description: 'TAXA BOLETO', entity: 'EFI', amount: 13.80, dueDate: '2025-07-28', status: 'Pago', type: 'PAYABLE', paymentDate: '2025-07-28' },
  { id: 'p6', description: 'GÁS', entity: 'DEPÓSITO DE GÁS', amount: 113.00, dueDate: '2024-11-11', status: 'Pago', type: 'PAYABLE', paymentDate: '2024-11-11' },
  { id: 'p7', description: 'SEGURO FIANÇA - VICTOR', entity: 'TOO SEGUROS', amount: 129.53, dueDate: '2025-09-15', status: 'Pago', type: 'PAYABLE', paymentDate: '2025-09-15' },
  { id: 'p8', description: 'SEGURO FIANÇA - ALEXANDRO', entity: 'PORTO SEGURO', amount: 117.02, dueDate: '2025-09-23', status: 'Pago', type: 'PAYABLE', paymentDate: '2025-09-23' },
  { id: 'p9', description: 'ENERGIA DE JUNHO/23 A AGOSTO/25', entity: 'CPFL', amount: 1540.00, dueDate: '2025-08-15', status: 'Pago', type: 'PAYABLE', paymentDate: '2025-08-15' },
  { id: 'p10', description: 'ENERGIA KIT 01', entity: 'CPFL', amount: 65.00, dueDate: '2025-10-25', status: 'Pago', type: 'PAYABLE', paymentDate: '2025-10-25' },
  { id: 'p11', description: 'ENERGIA KIT 02', entity: 'CPFL', amount: 65.00, dueDate: '2025-10-10', status: 'Pago', type: 'PAYABLE', paymentDate: '2025-10-10' },
  { id: 'p12', description: 'SEGURO FIANÇA - VICTOR', entity: 'TOO SEGUROS', amount: 129.51, dueDate: '2025-10-01', status: 'Pago', type: 'PAYABLE', paymentDate: '2025-10-01' },
  { id: 'p13', description: 'SEGURO FIANÇA - ALEXANDRO', entity: 'PORTO SEGURO', amount: 117.02, dueDate: '2025-10-25', status: 'Pago', type: 'PAYABLE', paymentDate: '2025-10-25' },
  { id: 'p14', description: 'SEGURO FIANÇA - VICTOR', entity: 'TOO SEGUROS', amount: 129.53, dueDate: '2025-11-01', status: 'Pago', type: 'PAYABLE', paymentDate: '2025-11-01' },
  { id: 'p15', description: 'SEGURO FIANÇA - ALEXANDRO', entity: 'PORTO SEGURO', amount: 117.02, dueDate: '2025-11-24', status: 'Pendente', type: 'PAYABLE' },
  { id: 'p16', description: 'ENERGIA KIT 01', entity: 'CPFL', amount: 65.00, dueDate: '2025-11-10', status: 'Pago', type: 'PAYABLE', paymentDate: '2025-11-10' },
  { id: 'p17', description: 'ENERGIA KIT 02', entity: 'CPFL', amount: 65.00, dueDate: '2025-11-10', status: 'Pago', type: 'PAYABLE', paymentDate: '2025-11-10' }
];
