
import { Unit, Tenant, FinancialRecord } from '../types';
import { INITIAL_UNITS, INITIAL_TENANTS, INITIAL_RECORDS } from '../constants';
import { supabase, isDbConfigured } from './supabaseClient';

const STORAGE_KEYS = {
  UNITS: 'kitnet_units',
  TENANTS: 'kitnet_tenants',
  RECORDS: 'kitnet_records'
};

const mapUnitToSql = (item: Unit) => ({
  id: item.id,
  number: item.number,
  size: item.size,
  rent: item.rent,
  payment_day: item.paymentDay,
  status: item.status,
  contract_start: item.contractStart || null,
  contract_end: item.contractEnd || null
});

const mapTenantToSql = (item: Tenant) => ({
  id: item.id,
  name: item.name,
  phone: item.phone,
  kitnet: item.kitnet,
  status: item.status,
  cpf: item.cpf || null,
  photo: item.photo || null,
  docs_link: item.docsLink || null
});

const mapRecordToSql = (item: FinancialRecord) => ({
  id: item.id,
  description: item.description,
  entity: item.entity,
  amount: item.amount,
  fine: item.fine || 0,
  status: item.status,
  type: item.type,
  due_date: item.dueDate,
  payment_date: item.paymentDate || null
});

const mapFromSql = (item: any) => {
  const mapped: any = { ...item };
  if (item.payment_day !== undefined) mapped.paymentDay = item.payment_day;
  if (item.contract_start !== undefined) mapped.contractStart = item.contract_start;
  if (item.contract_end !== undefined) mapped.contractEnd = item.contract_end;
  if (item.docs_link !== undefined) mapped.docsLink = item.docs_link;
  if (item.due_date !== undefined) mapped.dueDate = item.due_date;
  if (item.payment_date !== undefined) mapped.paymentDate = item.payment_date;
  return mapped;
};

export const StorageService = {
  async loadAll(): Promise<{units: Unit[], tenants: Tenant[], records: FinancialRecord[]}> {
    if (!isDbConfigured()) {
      return {
        units: this.getUnitsLocal(),
        tenants: this.getTenantsLocal(),
        records: this.getRecordsLocal()
      };
    }

    try {
      const [uRes, tRes, rRes] = await Promise.all([
        supabase.from('units').select('*'),
        supabase.from('tenants').select('*'),
        supabase.from('financial_records').select('*')
      ]);

      const units = uRes.data?.length ? uRes.data.map(mapFromSql) as Unit[] : this.getUnitsLocal();
      const tenants = tRes.data?.length ? tRes.data.map(mapFromSql) as Tenant[] : this.getTenantsLocal();
      const records = rRes.data?.length ? rRes.data.map(mapFromSql) as FinancialRecord[] : this.getRecordsLocal();

      return { units, tenants, records };
    } catch (e) {
      console.error("Erro ao carregar do SQL, usando local:", e);
      return {
        units: this.getUnitsLocal(),
        tenants: this.getTenantsLocal(),
        records: this.getRecordsLocal()
      };
    }
  },

  getUnitsLocal: (): Unit[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.UNITS) || 'null') || INITIAL_UNITS,
  getTenantsLocal: (): Tenant[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.TENANTS) || 'null') || INITIAL_TENANTS,
  getRecordsLocal: (): FinancialRecord[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.RECORDS) || 'null') || INITIAL_RECORDS,

  async saveUnits(units: Unit[]) {
    localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(units));
    if (isDbConfigured()) {
      try {
        const payload = units.map(mapUnitToSql);
        const { error } = await supabase.from('units').upsert(payload);
        if (error) throw error;
      } catch (e) { console.error("Erro ao salvar unidades no SQL:", e); }
    }
  },
  
  async saveTenants(tenants: Tenant[]) {
    localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify(tenants));
    if (isDbConfigured()) {
      try {
        const payload = tenants.map(mapTenantToSql);
        const { error } = await supabase.from('tenants').upsert(payload);
        if (error) throw error;
      } catch (e) { console.error("Erro ao salvar inquilinos no SQL:", e); }
    }
  },

  async saveRecords(records: FinancialRecord[]) {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    if (isDbConfigured()) {
      try {
        const payload = records.map(mapRecordToSql);
        const { error } = await supabase.from('financial_records').upsert(payload);
        if (error) throw error;
      } catch (e) { console.error("Erro ao salvar registros financeiros no SQL:", e); }
    }
  }
};
