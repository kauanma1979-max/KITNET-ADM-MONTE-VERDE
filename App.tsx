
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Home, Users, Wallet, FileText, Plus, Edit, Trash2, 
  TrendingUp, TrendingDown, DollarSign, ExternalLink, Cloud, CloudOff, 
  User, Percent, Calendar, CheckCircle2, Database, Search, Download, Upload, ArrowUpRight
} from 'lucide-react';
import { Unit, Tenant, FinancialRecord, TabType } from './types';
import { StorageService } from './services/storageService';
import { isDbConfigured, supabase } from './services/supabaseClient';
import { Modal } from './components/ActionButton';

const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

const formatDate = (dateStr: string | undefined) => {
  if(!dateStr) return '--';
  const date = new Date(dateStr + 'T00:00:00'); 
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [units, setUnits] = useState<Unit[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<'OK' | 'ERROR' | 'CHECKING'>('CHECKING');
  const isCloudActive = isDbConfigured();

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      if (isCloudActive) {
        try {
          const [uCheck, tCheck, rCheck] = await Promise.all([
            supabase.from('units').select('id').limit(1),
            supabase.from('tenants').select('id').limit(1),
            supabase.from('financial_records').select('id').limit(1)
          ]);
          setDbStatus(uCheck.error || tCheck.error || rCheck.error ? 'ERROR' : 'OK');
        } catch { setDbStatus('ERROR'); }
      }
      const data = await StorageService.loadAll();
      setUnits(data.units);
      setTenants(data.tenants);
      setRecords(data.records);
      setIsLoading(false);
    };
    initData();
  }, []);

  const handleSaveUnits = async (newUnits: Unit[]) => {
    setUnits(newUnits);
    await StorageService.saveUnits(newUnits);
  };
  const handleSaveTenants = async (newTenants: Tenant[]) => {
    setTenants(newTenants);
    await StorageService.saveTenants(newTenants);
  };
  const handleSaveRecords = async (newRecords: FinancialRecord[]) => {
    setRecords(newRecords);
    await StorageService.saveRecords(newRecords);
  };

  const addUnit = (unit: Unit) => handleSaveUnits([...units, unit]);
  const updateUnit = (unit: Unit) => handleSaveUnits(units.map(u => u.id === unit.id ? unit : u));
  const deleteUnit = (id: string) => { if(confirm('Excluir unidade?')) handleSaveUnits(units.filter(u => u.id !== id)); };

  const addTenant = (tenant: Tenant) => handleSaveTenants([...tenants, tenant]);
  const updateTenant = (tenant: Tenant) => handleSaveTenants(tenants.map(t => t.id === tenant.id ? tenant : t));
  const deleteTenant = (id: string) => { if(confirm('Excluir inquilino?')) handleSaveTenants(tenants.filter(t => t.id !== id)); };

  const addRecord = (record: FinancialRecord) => handleSaveRecords([...records, record]);
  const updateRecord = (record: FinancialRecord) => handleSaveRecords(records.map(r => r.id === record.id ? record : r));
  const deleteRecord = (id: string) => { if(confirm('Excluir registro?')) handleSaveRecords(records.filter(r => r.id !== id)); };

  const handleExportBackup = () => {
    const backupData = { units, tenants, records, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_kitnet_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.units && json.tenants && json.records) {
          if (confirm("Deseja restaurar o backup e sobrescrever os dados atuais?")) {
            setUnits(json.units); setTenants(json.tenants); setRecords(json.records);
            await StorageService.saveUnits(json.units);
            await StorageService.saveTenants(json.tenants);
            await StorageService.saveRecords(json.records);
            alert("Sucesso!");
          }
        }
      } catch { alert("Arquivo inválido."); }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-6">
        <div className="w-24 h-24 border-4 border-blue-500/20 border-t-blue-400 rounded-full animate-spin"></div>
        <h2 className="text-white font-black text-xl uppercase">KITNET ADM PRÓ</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col">
      <header className="bg-slate-900 text-white sticky top-0 z-50 border-b border-white/5 h-20 flex items-center">
        <div className="max-w-[1600px] mx-auto px-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg">
              <Home className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter uppercase leading-none">KITNET ADM PRÓ</h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gestão Imobiliária</p>
            </div>
          </div>
          <div className={`text-[9px] font-black px-4 py-2 rounded-xl border ${isCloudActive ? 'text-emerald-400 border-emerald-400/20' : 'text-amber-400 border-amber-400/20'}`}>
            {isCloudActive ? 'CLOUD SYNC' : 'MODO LOCAL'}
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-slate-200 sticky top-20 z-40 overflow-x-auto no-scrollbar shadow-sm">
        <div className="max-w-[1600px] mx-auto flex">
          <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20} />} label="Início" />
          <TabButton active={activeTab === 'units'} onClick={() => setActiveTab('units')} icon={<Home size={20} />} label="Unidades" />
          <TabButton active={activeTab === 'tenants'} onClick={() => setActiveTab('tenants')} icon={<Users size={20} />} label="Moradores" />
          <TabButton active={activeTab === 'finances'} onClick={() => setActiveTab('finances')} icon={<Wallet size={20} />} label="Financeiro" />
          <TabButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={<FileText size={20} />} label="Arquivos" />
        </div>
      </nav>

      <main className="flex-1 max-w-[1600px] mx-auto w-full p-6 space-y-8 animate-fade-in">
        {activeTab === 'dashboard' && <DashboardTab units={units} records={records} onUpdateRecord={updateRecord} />}
        {activeTab === 'units' && <UnitsTab units={units} onAdd={addUnit} onUpdate={updateUnit} onDelete={deleteUnit} />}
        {activeTab === 'tenants' && <TenantsTab tenants={tenants} units={units} onAdd={addTenant} onUpdate={updateTenant} onDelete={deleteTenant} />}
        {activeTab === 'finances' && <FinancesTab records={records} tenants={tenants} onAdd={addRecord} onUpdate={updateRecord} onDelete={deleteRecord} />}
        {activeTab === 'reports' && <ReportsTab units={units} tenants={tenants} records={records} dbStatus={dbStatus} onExportJSON={handleExportBackup} onImportJSON={handleImportBackup} />}
      </main>
    </div>
  );
};

const TabButton: React.FC<{active: boolean, onClick: () => void, icon: any, label: string}> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex items-center gap-3 px-8 py-6 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${active ? 'text-blue-600 border-blue-600 bg-blue-50/30' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>
    {icon} {label}
  </button>
);

const DashboardTab: React.FC<{units: Unit[], records: FinancialRecord[], onUpdateRecord: any}> = ({ units, records, onUpdateRecord }) => {
  const paidRec = records.filter(r => r.type === 'RECEIVABLE' && r.status === 'Pago');
  const paidPay = records.filter(r => r.type === 'PAYABLE' && r.status === 'Pago');
  
  // Lógica corrigida: Receita Bruta = Soma(Valor Aluguel + Extras/Multas)
  const totalFines = paidRec.reduce((sum, r) => sum + (Number(r.fine) || 0), 0);
  const totalBaseRent = paidRec.reduce((sum, r) => sum + Number(r.amount), 0);
  const totalGrossRevenue = totalBaseRent + totalFines;
  
  const totalExpenses = paidPay.reduce((sum, r) => sum + Number(r.amount), 0);
  const netProfit = totalGrossRevenue - totalExpenses;
  
  const totalUnits = units.length;
  const occupiedUnits = units.filter(u => u.status === 'Ocupada').length;
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-5">
        <StatCard label="Unidades" value={totalUnits} icon={<Home size={20}/>} color="bg-blue-600" />
        <StatCard label="Receita Bruta" value={formatCurrency(totalGrossRevenue)} icon={<TrendingUp size={20}/>} color="bg-emerald-600" />
        <StatCard label="Extras/Multas" value={formatCurrency(totalFines)} icon={<ArrowUpRight size={20}/>} color="bg-amber-500" />
        <StatCard label="Despesas" value={formatCurrency(totalExpenses)} icon={<TrendingDown size={20}/>} color="bg-red-500" />
        <StatCard label="Resultado" value={formatCurrency(netProfit)} icon={<Wallet size={20}/>} color="bg-indigo-600" />
        <StatCard label="Ocupação" value={`${occupancyRate}%`} icon={<Percent size={20}/>} color="bg-slate-800" />
      </div>

      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <h3 className="text-xl font-black uppercase tracking-tight mb-8">Fluxo de Recebimento Pendente</h3>
        <div className="space-y-4">
          {records.filter(r => r.status === 'Pendente' && r.type === 'RECEIVABLE').slice(0, 10).map(r => (
            <div key={r.id} className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 flex flex-wrap justify-between items-center group hover:bg-white hover:shadow-lg transition-all">
              <div className="flex items-center gap-4">
                <Calendar size={18} className="text-blue-600" />
                <div>
                  <p className="font-black text-slate-800 text-sm">{r.entity}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vencimento: {formatDate(r.dueDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <p className="font-black text-blue-600 text-lg">{formatCurrency(r.amount + (r.fine || 0))}</p>
                <button onClick={() => onUpdateRecord({...r, status: 'Pago', paymentDate: new Date().toISOString().split('T')[0]})} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase opacity-0 group-hover:opacity-100 transition-all">Confirmar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{label: string, value: any, icon: any, color: string}> = ({ label, value, icon, color }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col hover:shadow-xl transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2.5 rounded-2xl ${color} text-white transition-transform group-hover:scale-110`}>{icon}</div>
      <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{label}</div>
    </div>
    <h3 className="text-xl font-black text-slate-900 tracking-tighter truncate">{value}</h3>
  </div>
);

const UnitsTab: React.FC<{units: Unit[], onAdd: any, onUpdate: any, onDelete: any}> = ({ units, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Unit | null>(null);

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
        <h2 className="text-2xl font-black text-slate-800 uppercase">Unidades</h2>
        <button onClick={() => { setEditing(null); setIsModalOpen(true); }} className="bg-slate-900 text-white px-8 py-4 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase shadow-xl hover:bg-blue-600 transition-all">
          <Plus size={18}/> Nova Unidade
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
            <tr>
              <th className="px-8 py-5">Nº</th>
              <th className="px-8 py-5">Área</th>
              <th className="px-8 py-5">Início Contrato</th>
              <th className="px-8 py-5">Término Contrato</th>
              <th className="px-8 py-5">Valor Aluguel</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-semibold">
            {units.map(u => (
              <tr key={u.id} className="hover:bg-slate-50/80 transition-all group">
                <td className="px-8 py-6 font-black text-blue-900 text-xl">{u.number}</td>
                <td className="px-8 py-6 text-slate-500">{u.size || '--'} m²</td>
                <td className="px-8 py-6 text-slate-600">{formatDate(u.contractStart)}</td>
                <td className="px-8 py-6 text-slate-600">{formatDate(u.contractEnd)}</td>
                <td className="px-8 py-6 font-black text-slate-800">{formatCurrency(u.rent)}</td>
                <td className="px-8 py-6">
                  <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase ${u.status === 'Ocupada' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>{u.status}</span>
                </td>
                <td className="px-8 py-6 text-right flex justify-end gap-2">
                  <button onClick={() => { setEditing(u); setIsModalOpen(true); }} className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl"><Edit size={18}/></button>
                  <button onClick={() => onDelete(u.id)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? "Editar Unidade" : "Cadastro de Unidade"}>
        <form className="space-y-6" onSubmit={(e: any) => {
          e.preventDefault();
          const f = e.target;
          const data: Unit = {
            id: editing?.id || Math.random().toString(36).substr(2, 9),
            number: f.number.value,
            rent: Number(f.rent.value),
            paymentDay: Number(f.paymentDay.value),
            status: f.status.value,
            size: Number(f.size.value || 0),
            contractStart: f.contractStart.value,
            contractEnd: f.contractEnd.value
          };
          editing ? onUpdate(data) : onAdd(data);
          setIsModalOpen(false);
        }}>
          <div className="grid grid-cols-2 gap-5">
            <FormInput label="Número" name="number" defaultValue={editing?.number} required />
            <FormInput label="Área (m²)" name="size" type="number" defaultValue={editing?.size} />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <FormInput label="Aluguel (R$)" name="rent" type="number" step="0.01" defaultValue={editing?.rent} required />
            <FormInput label="Dia Vencimento" name="paymentDay" type="number" defaultValue={editing?.paymentDay} required />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <FormInput label="Início Contrato" name="contractStart" type="date" defaultValue={editing?.contractStart} />
            <FormInput label="Fim Contrato" name="contractEnd" type="date" defaultValue={editing?.contractEnd} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400">Status</label>
            <select name="status" defaultValue={editing?.status || 'Disponível'} className="w-full bg-slate-50 border rounded-2xl p-4 font-bold outline-none">
              <option>Disponível</option><option>Ocupada</option><option>Manutenção</option>
            </select>
          </div>
          <button className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase text-[11px] hover:bg-blue-600 transition-all">Salvar</button>
        </form>
      </Modal>
    </div>
  );
};

const FormInput: React.FC<{label: string} & React.InputHTMLAttributes<HTMLInputElement>> = ({ label, ...props }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</label>
    <input {...props} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-800 outline-none focus:ring-4 focus:ring-blue-100 transition-all" />
  </div>
);

const TenantsTab: React.FC<{tenants: Tenant[], units: Unit[], onAdd: any, onUpdate: any, onDelete: any}> = ({ tenants, units, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Tenant | null>(null);

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
        <h2 className="text-2xl font-black text-slate-800 uppercase">Moradores</h2>
        <button onClick={() => { setEditing(null); setIsModalOpen(true); }} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase shadow-xl hover:bg-indigo-700 transition-all">
          <Plus size={18}/> Novo Morador
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
            <tr><th className="px-8 py-5">Perfil</th><th className="px-8 py-5">Unidade</th><th className="px-8 py-5">Contato</th><th className="px-8 py-5 text-right">Ações</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-bold">
            {tenants.map(t => (
              <tr key={t.id} className="hover:bg-slate-50/50">
                <td className="px-8 py-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden">
                    {t.photo ? <img src={t.photo} className="w-full h-full object-cover" /> : <User size={20} />}
                  </div>
                  <div><p className="font-black text-slate-800">{t.name}</p><p className="text-[9px] text-slate-400 uppercase">{t.cpf || 'PENDENTE'}</p></div>
                </td>
                <td className="px-8 py-6"><span className="text-[11px] font-black uppercase text-indigo-600">KITNET {t.kitnet}</span></td>
                <td className="px-8 py-6 text-slate-500">{t.phone}</td>
                <td className="px-8 py-6 text-right flex justify-end gap-2">
                  <button onClick={() => { setEditing(t); setIsModalOpen(true); }} className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl"><Edit size={18}/></button>
                  <button onClick={() => onDelete(t.id)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? "Editar Morador" : "Cadastro de Morador"}>
        <form className="space-y-6" onSubmit={(e: any) => {
          e.preventDefault();
          const f = e.target;
          const data: Tenant = {
            id: editing?.id || Math.random().toString(36).substr(2, 9),
            name: f.name.value, cpf: f.cpf.value, phone: f.phone.value,
            kitnet: f.kitnet.value, docsLink: f.docsLink.value, photo: f.photo.value,
            status: 'Ativo', email: f.email?.value || '-'
          };
          editing ? onUpdate(data) : onAdd(data);
          setIsModalOpen(false);
        }}>
          <FormInput label="Nome Completo" name="name" defaultValue={editing?.name} required />
          <div className="grid grid-cols-2 gap-5">
            <FormInput label="CPF" name="cpf" defaultValue={editing?.cpf} />
            <FormInput label="Telefone" name="phone" defaultValue={editing?.phone} />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Unidade</label>
              <select name="kitnet" defaultValue={editing?.kitnet} className="w-full bg-slate-50 border rounded-2xl p-4 font-bold outline-none">
                <option value="">Selecione...</option>
                {units.map(u => <option key={u.id} value={u.number}>Kitnet {u.number}</option>)}
              </select>
            </div>
            <FormInput label="URL Foto" name="photo" defaultValue={editing?.photo} />
          </div>
          <FormInput label="Link Documentos (Drive)" name="docsLink" defaultValue={editing?.docsLink} />
          <button className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase text-[11px] hover:bg-blue-600 transition-all">Salvar</button>
        </form>
      </Modal>
    </div>
  );
};

const FinancesTab: React.FC<{records: FinancialRecord[], tenants: Tenant[], onAdd: any, onUpdate: any, onDelete: any}> = ({ records, tenants, onAdd, onUpdate, onDelete }) => {
  const [tab, setTab] = useState<'RECEIVABLE' | 'PAYABLE'>('RECEIVABLE');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<FinancialRecord | null>(null);

  const filtered = records.filter(r => r.type === tab && (r.entity.toLowerCase().includes(searchTerm.toLowerCase()) || r.description.toLowerCase().includes(searchTerm.toLowerCase())));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-6 items-center justify-between">
        <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-200 shadow-sm">
          <button onClick={() => setTab('RECEIVABLE')} className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase transition-all ${tab === 'RECEIVABLE' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400'}`}>RECEITAS</button>
          <button onClick={() => setTab('PAYABLE')} className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase transition-all ${tab === 'PAYABLE' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400'}`}>DESPESAS</button>
        </div>
        <div className="flex-1 max-w-md relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
          <input type="text" placeholder="Filtrar lançamentos..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase outline-none" />
        </div>
        <button onClick={() => { setEditing(null); setIsModalOpen(true); }} className="bg-slate-900 text-white px-8 py-4 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase hover:bg-blue-600 transition-all shadow-xl"><Plus size={18}/> Novo Lançamento</button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
              <tr><th className="px-8 py-6">Detalhamento</th><th className="px-8 py-6">Valor Base</th><th className="px-8 py-6">Extras</th><th className="px-8 py-6">Vencimento</th><th className="px-8 py-6 text-right">Ações</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/50">
                  <td className="px-8 py-6">
                    <p className="font-black text-slate-800">{r.description}</p><p className="text-[9px] text-slate-400 uppercase italic">{r.entity}</p>
                  </td>
                  <td className="px-8 py-6 text-slate-600">{formatCurrency(r.amount)}</td>
                  <td className="px-8 py-6 text-amber-600">{formatCurrency(r.fine || 0)}</td>
                  <td className="px-8 py-6">
                    <p className={`text-sm font-black ${r.status === 'Pago' ? 'text-emerald-600' : 'text-amber-500'}`}>{formatDate(r.dueDate)}</p>
                    <p className="text-[8px] font-black uppercase text-slate-300">{r.status}</p>
                  </td>
                  <td className="px-8 py-6 text-right flex justify-end gap-2">
                    <button onClick={() => { setEditing(r); setIsModalOpen(true); }} className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl"><Edit size={16}/></button>
                    <button onClick={() => onDelete(r.id)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? "Editar Registro" : "Novo Registro"}>
        <form className="space-y-6" onSubmit={(e: any) => {
          e.preventDefault();
          const f = e.target;
          const statusVal = f.status.value as 'Pendente' | 'Pago';
          const data: FinancialRecord = {
            id: editing?.id || Math.random().toString(36).substr(2, 9),
            description: f.description.value, entity: f.entity.value,
            amount: Number(f.amount.value), fine: Number(f.fine?.value || 0),
            dueDate: f.dueDate.value, status: statusVal, type: tab,
            paymentDate: statusVal === 'Pago' ? (f.paymentDate?.value || new Date().toISOString().split('T')[0]) : undefined
          };
          editing ? onUpdate(data) : onAdd(data);
          setIsModalOpen(false);
        }}>
          <FormInput label="Descrição" name="description" defaultValue={editing?.description} required />
          <div className="grid grid-cols-2 gap-5">
            <FormInput label="Valor Base" name="amount" type="number" step="0.01" defaultValue={editing?.amount} required />
            <FormInput label="Acréscimos/Multa" name="fine" type="number" step="0.01" defaultValue={editing?.fine} />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <FormInput label="Vencimento" name="dueDate" type="date" defaultValue={editing?.dueDate} required />
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400">Status</label>
              <select name="status" defaultValue={editing?.status || 'Pendente'} className="w-full bg-slate-50 border rounded-2xl p-4 font-bold outline-none">
                <option value="Pendente">Pendente</option><option value="Pago">Pago</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400">{tab === 'RECEIVABLE' ? 'Inquilino' : 'Fornecedor'}</label>
            <input name="entity" defaultValue={editing?.entity} list="entities" className="w-full bg-slate-50 border rounded-2xl p-4 font-bold outline-none" required />
            <datalist id="entities">{tenants.map(t => <option key={t.id} value={t.name} />)}</datalist>
          </div>
          <FormInput label="Data Pagamento (se pago)" name="paymentDate" type="date" defaultValue={editing?.paymentDate} />
          <button className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase text-[11px] hover:bg-blue-600 transition-all">Confirmar</button>
        </form>
      </Modal>
    </div>
  );
};

const ReportsTab: React.FC<{units: Unit[], tenants: Tenant[], records: FinancialRecord[], dbStatus: string, onExportJSON: any, onImportJSON: any}> = ({ units, tenants, records, dbStatus, onExportJSON, onImportJSON }) => {
  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all">
          <Database size={48} className="text-blue-600 mx-auto mb-6" />
          <h3 className="text-xl font-black uppercase mb-4">Integridade de Dados</h3>
          <p className="text-slate-400 text-[10px] font-bold uppercase mb-8">{dbStatus === 'OK' ? 'Sincronizado com Supabase Cloud' : 'Operando em modo LocalStorage'}</p>
          <div className="flex flex-col gap-4">
            <button onClick={onExportJSON} className="bg-slate-900 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 transition-all"><Download size={16}/> Exportar JSON</button>
            <label className="border-2 border-slate-900 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-all"><Upload size={16}/> Importar JSON<input type="file" className="hidden" accept=".json" onChange={onImportJSON} /></label>
          </div>
        </div>
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 flex flex-col items-center justify-center opacity-50 cursor-not-allowed"><FileText size={48} className="mb-6"/><h3 className="text-xl font-black uppercase mb-4">Relatórios PDF</h3><p className="text-[10px] font-bold uppercase">Módulo em Manutenção</p></div>
        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 flex flex-col items-center justify-center opacity-50 cursor-not-allowed"><Users size={48} className="mb-6"/><h3 className="text-xl font-black uppercase mb-4">Docs Moradores</h3><p className="text-[10px] font-bold uppercase">Módulo em Manutenção</p></div>
      </div>
    </div>
  );
};

export default App;
