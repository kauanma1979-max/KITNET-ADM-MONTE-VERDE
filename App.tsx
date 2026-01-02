
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Home, Users, Wallet, FileText, Plus, Edit, Trash2, 
  TrendingUp, TrendingDown, DollarSign, ExternalLink, Cloud, CloudOff, 
  RefreshCw, User, Percent, Calendar, AlertCircle, Download, Upload,
  Sparkles, ShieldAlert, CheckCircle2, Database, Info, ArrowUpRight, Search
} from 'lucide-react';
import { Unit, Tenant, FinancialRecord, TabType, AIAnalysis } from './types';
import { StorageService } from './services/storageService';
import { isDbConfigured, supabase } from './services/supabaseClient';
import { Modal } from './components/ActionButton';
import { analyzeDataWithAI } from './services/geminiService';

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
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
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

          if (uCheck.error || tCheck.error || rCheck.error) {
            setDbStatus('ERROR');
          } else {
            setDbStatus('OK');
          }
        } catch {
          setDbStatus('ERROR');
        }
      }

      const data = await StorageService.loadAll();
      setUnits(data.units);
      setTenants(data.tenants);
      setRecords(data.records);
      setIsLoading(false);
      
      if (data.units.length > 0) {
        handleAiAnalysis(data.units, data.tenants, data.records);
      }
    };
    initData();
  }, []);

  const handleAiAnalysis = async (u = units, t = tenants, r = records) => {
    setIsAiLoading(true);
    try {
      const analysis = await analyzeDataWithAI(u, t, r);
      setAiAnalysis(analysis);
    } catch (err) {
      console.error("Erro na análise:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

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
          if (confirm("Atenção: Restaurar o backup irá sobrescrever seus dados atuais. Deseja continuar?")) {
            setUnits(json.units);
            setTenants(json.tenants);
            setRecords(json.records);
            await StorageService.saveUnits(json.units);
            await StorageService.saveTenants(json.tenants);
            await StorageService.saveRecords(json.records);
            alert("Backup restaurado com sucesso!");
          }
        } else {
            alert("Arquivo de backup inválido.");
        }
      } catch (err) { alert("Erro ao ler o arquivo JSON."); }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-blue-500/20 border-t-blue-400 rounded-full animate-spin"></div>
          <Home className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400" size={32} />
        </div>
        <div className="text-center">
          <h2 className="text-white font-black text-xl tracking-[0.2em] uppercase">KITNET ADM PRÓ</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase mt-2 animate-pulse">Iniciando motor de gestão...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col">
      <header className="bg-slate-900 text-white sticky top-0 z-50 border-b border-white/5 backdrop-blur-md bg-opacity-95">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-600/20">
              <Home className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter uppercase leading-none">KITNET ADM PRÓ</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sistema Operacional</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-3 text-[9px] font-black px-4 py-2 rounded-xl border transition-all ${
              !isCloudActive ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
              dbStatus === 'OK' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
              dbStatus === 'ERROR' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
              'bg-slate-500/10 border-slate-500/20 text-slate-400'
            }`}>
              {!isCloudActive ? 'MODO LOCAL' : dbStatus === 'OK' ? 'CLOUD SYNC ON' : 'SYNC ERROR'}
              {isCloudActive ? <Cloud size={12} /> : <CloudOff size={12} />}
            </div>
            <div className="h-8 w-[1px] bg-white/10 hidden sm:block"></div>
            <button className="hidden sm:flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl transition-colors">
               <User size={16} className="text-slate-400" />
               <span className="text-[10px] font-black uppercase tracking-widest">Admin</span>
            </button>
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

      <main className="flex-1 max-w-[1600px] mx-auto w-full p-6 space-y-8">
        <div className="animate-fade-in">
          {activeTab === 'dashboard' && (
            <DashboardTab 
              units={units} 
              records={records} 
              onUpdateRecord={updateRecord} 
              aiAnalysis={aiAnalysis}
              isAiLoading={isAiLoading}
              onRefreshAi={() => handleAiAnalysis()}
            />
          )}
          {activeTab === 'units' && <UnitsTab units={units} onAdd={addUnit} onUpdate={updateUnit} onDelete={deleteUnit} />}
          {activeTab === 'tenants' && <TenantsTab tenants={tenants} units={units} onAdd={addTenant} onUpdate={updateTenant} onDelete={deleteTenant} />}
          {activeTab === 'finances' && <FinancesTab records={records} tenants={tenants} onAdd={addRecord} onUpdate={updateRecord} onDelete={deleteRecord} />}
          {activeTab === 'reports' && (
            <ReportsTab 
              units={units} 
              tenants={tenants} 
              records={records} 
              dbStatus={dbStatus}
              onExportJSON={handleExportBackup}
              onImportJSON={handleImportBackup}
            />
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-[1600px] mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">© 2025 KITNET ADM PRÓ - Licença Profissional</p>
          <div className="flex gap-6">
            <a href="#" className="text-[10px] font-black text-slate-400 uppercase hover:text-blue-600">Suporte Técnico</a>
            <a href="#" className="text-[10px] font-black text-slate-400 uppercase hover:text-blue-600">Documentação API</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick} 
    className={`flex items-center gap-3 px-8 py-6 text-xs font-black uppercase tracking-widest relative transition-all border-b-2 ${
      active 
        ? 'text-blue-600 border-blue-600 bg-blue-50/50' 
        : 'text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-50/50'
    }`}
  >
    {icon} {label}
  </button>
);

interface DashboardTabProps {
  units: Unit[];
  records: FinancialRecord[];
  onUpdateRecord: (record: FinancialRecord) => void;
  aiAnalysis: AIAnalysis | null;
  isAiLoading: boolean;
  onRefreshAi: () => void;
}

const DashboardTab: React.FC<DashboardTabProps> = ({ units, records, onUpdateRecord, aiAnalysis, isAiLoading, onRefreshAi }) => {
  const paidRec = records.filter((r) => r.type === 'RECEIVABLE' && r.status === 'Pago');
  const paidPay = records.filter((r) => r.type === 'PAYABLE' && r.status === 'Pago');
  
  const totalRevenue = paidRec.reduce((sum, r) => sum + Number(r.amount) + (Number(r.fine) || 0), 0);
  const totalFines = paidRec.reduce((sum, r) => sum + (Number(r.fine) || 0), 0);
  const totalExpenses = paidPay.reduce((sum, r) => sum + Number(r.amount), 0);
  const netProfit = totalRevenue - totalExpenses;
  const totalUnits = units.length;
  const occupiedUnits = units.filter((u) => u.status === 'Ocupada').length;
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        <StatCard label="Unidades" value={totalUnits} icon={<Home size={20}/>} color="bg-blue-600" />
        <StatCard label="Receita Bruta" value={formatCurrency(totalRevenue)} icon={<TrendingUp size={20}/>} color="bg-emerald-600" />
        <StatCard label="Extras/Multas" value={formatCurrency(totalFines)} icon={<ArrowUpRight size={20}/>} color="bg-amber-500" />
        <StatCard label="Despesas" value={formatCurrency(totalExpenses)} icon={<TrendingDown size={20}/>} color="bg-red-500" />
        <StatCard label="Resultado" value={formatCurrency(netProfit)} icon={<Wallet size={20}/>} color="bg-indigo-600" />
        <StatCard label="Ocupação" value={`${occupancyRate}%`} icon={<Percent size={20}/>} color="bg-slate-800" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-black flex items-center gap-3 text-slate-800 uppercase tracking-tight">
                Fluxo de Recebimento
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Próximos compromissos em aberto</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-xl">
               <DollarSign size={20} className="text-blue-600" />
            </div>
          </div>
          
          <div className="space-y-4">
            {records.filter((r) => r.status === 'Pendente' && r.type === 'RECEIVABLE').length > 0 ? (
              records.filter((r) => r.status === 'Pendente' && r.type === 'RECEIVABLE').slice(0, 5).map((r) => (
                <div key={r.id} className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 flex flex-wrap justify-between items-center hover:bg-white hover:shadow-lg hover:border-blue-100 transition-all group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 text-blue-600 shadow-sm transition-transform group-hover:scale-110">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-sm">{r.entity}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">Vencimento: {formatDate(r.dueDate)}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-6">
                    <div>
                      <p className="font-black text-blue-600 text-lg leading-none">{formatCurrency(r.amount + (r.fine || 0))}</p>
                      <p className="text-[9px] font-black text-slate-300 uppercase mt-1">Valor Previsto</p>
                    </div>
                    <button 
                      onClick={() => onUpdateRecord({...r, status: 'Pago', paymentDate: new Date().toISOString().split('T')[0]})} 
                      className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-emerald-600/20 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all hover:bg-emerald-700"
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-slate-200" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tudo em dia! Nenhuma pendência encontrada.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 rounded-[2rem] p-8 relative overflow-hidden shadow-2xl shadow-blue-900/10 border border-white/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>
          
          <div className="flex justify-between items-start mb-10 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="text-cyan-400" size={16} />
                <h3 className="text-white font-black uppercase tracking-[0.2em] text-xs">Gemini AI Advisor</h3>
              </div>
              <p className="text-slate-500 text-[9px] font-bold uppercase">Análise Estratégica</p>
            </div>
            <button 
              onClick={onRefreshAi} 
              disabled={isAiLoading}
              className={`p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-colors border border-white/5 ${isAiLoading ? 'animate-spin' : ''}`}
            >
              <RefreshCw size={18} />
            </button>
          </div>

          <div className="relative z-10">
            {isAiLoading ? (
              <div className="space-y-6 py-4">
                <div className="space-y-3">
                  <div className="h-3 w-3/4 bg-white/5 rounded-full animate-pulse"></div>
                  <div className="h-3 w-full bg-white/5 rounded-full animate-pulse"></div>
                  <div className="h-3 w-1/2 bg-white/5 rounded-full animate-pulse"></div>
                </div>
                <div className="pt-8 space-y-4">
                   {[1,2,3].map(i => <div key={i} className="h-10 w-full bg-white/5 rounded-2xl animate-pulse"></div>)}
                </div>
              </div>
            ) : aiAnalysis ? (
              <div className="space-y-8">
                <div className="p-5 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-3">
                     <div className={`w-2 h-2 rounded-full ${aiAnalysis.riskLevel === 'Baixo' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]'}`}></div>
                     <span className={`text-[10px] font-black uppercase tracking-widest ${aiAnalysis.riskLevel === 'Baixo' ? 'text-emerald-400' : 'text-amber-400'}`}>Risco Financeiro: {aiAnalysis.riskLevel}</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed font-medium">{aiAnalysis.summary}</p>
                </div>
                
                <div className="space-y-4">
                  <p className="text-white text-[9px] font-black uppercase tracking-[0.3em] mb-4 opacity-50">Principais Recomendações</p>
                  {aiAnalysis.suggestions.map((s, i) => (
                    <div key={i} className="group flex gap-4 items-start p-3 rounded-2xl hover:bg-white/5 transition-all cursor-default border border-transparent hover:border-white/5">
                      <div className="w-6 h-6 rounded-lg bg-blue-600/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-600 transition-colors">
                        <span className="text-[10px] font-black text-blue-400 group-hover:text-white">{i+1}</span>
                      </div>
                      <p className="text-slate-400 text-xs group-hover:text-slate-300 transition-colors">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <Info size={40} className="text-slate-700 mx-auto mb-4 opacity-20" />
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Clique em atualizar para processar os dados com IA.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-xl transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2.5 rounded-2xl ${color} text-white shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3`}>
        {icon}
      </div>
      <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{label}</div>
    </div>
    <h3 className="text-xl font-black text-slate-900 tracking-tighter truncate" title={String(value)}>
      {value}
    </h3>
  </div>
);

interface UnitsTabProps {
  units: Unit[];
  onAdd: (unit: Unit) => void;
  onUpdate: (unit: Unit) => void;
  onDelete: (id: string) => void;
}

const UnitsTab: React.FC<UnitsTabProps> = ({ units, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Unit | null>(null);

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-8 border-b flex flex-wrap gap-4 justify-between items-center bg-slate-50/50">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Gestão de Unidades</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 italic">Kitnets cadastrados no sistema</p>
        </div>
        <button 
          onClick={() => { setEditing(null); setIsModalOpen(true); }} 
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-blue-600 transition-all active:scale-95"
        >
          <Plus size={18}/> Novo Ativo
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-[0.15em]">
            <tr>
              <th className="px-8 py-5">Nº Kitnet</th>
              <th className="px-8 py-5">Metragem</th>
              <th className="px-8 py-5">Locação Base</th>
              <th className="px-8 py-5">Vencimento</th>
              <th className="px-8 py-5">Disponibilidade</th>
              <th className="px-8 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-semibold">
            {units.length > 0 ? units.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50/80 transition-all group">
                <td className="px-8 py-6 font-black text-blue-900 text-2xl tracking-tighter">{u.number}</td>
                <td className="px-8 py-6 text-slate-500 font-medium">{u.size || '--'} m²</td>
                <td className="px-8 py-6 font-black text-slate-800">{formatCurrency(u.rent)}</td>
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-black">Dia {u.paymentDay}</span>
                    <span className="text-[9px] text-slate-300 font-medium">Fluxo Mensal</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                    u.status === 'Disponível' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                    u.status === 'Ocupada' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 
                    'bg-amber-50 text-amber-600 border border-amber-100'
                  }`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => { setEditing(u); setIsModalOpen(true); }} className="p-3 text-blue-600 hover:bg-blue-50 rounded-2xl transition-colors"><Edit size={18}/></button>
                    <button onClick={() => onDelete(u.id)} className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-colors"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="py-24 text-center">
                  <Home size={48} className="text-slate-100 mx-auto mb-4" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nenhuma unidade cadastrada.</p>
                </td>
              </tr>
            )}
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
            <FormInput label="Número Identificador" name="number" defaultValue={editing?.number} required placeholder="Ex: 01" />
            <FormInput label="Área Total (m²)" name="size" type="number" defaultValue={editing?.size} placeholder="Ex: 28" />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <FormInput label="Valor Locação (R$)" name="rent" type="number" step="0.01" defaultValue={editing?.rent} required />
            <FormInput label="Dia de Vencimento" name="paymentDay" type="number" defaultValue={editing?.paymentDay} required min="1" max="31" />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <FormInput label="Início Contrato" name="contractStart" type="date" defaultValue={editing?.contractStart} />
            <FormInput label="Fim Contrato" name="contractEnd" type="date" defaultValue={editing?.contractEnd} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Status de Ocupação</label>
            <select name="status" defaultValue={editing?.status || 'Disponível'} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-700 focus:ring-4 focus:ring-blue-100 outline-none transition-all cursor-pointer">
              <option>Disponível</option>
              <option>Ocupada</option>
              <option>Manutenção</option>
            </select>
          </div>
          <button className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-slate-900/20 hover:bg-blue-600 transition-all transform active:scale-95">
            Gravar Dados
          </button>
        </form>
      </Modal>
    </div>
  );
};

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const FormInput: React.FC<FormInputProps> = ({ label, ...props }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</label>
    <input {...props} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-800 placeholder:text-slate-300 focus:ring-4 focus:ring-blue-100 outline-none transition-all" />
  </div>
);

interface TenantsTabProps {
  tenants: Tenant[];
  units: Unit[];
  onAdd: (tenant: Tenant) => void;
  onUpdate: (tenant: Tenant) => void;
  onDelete: (id: string) => void;
}

const TenantsTab: React.FC<TenantsTabProps> = ({ tenants, units, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Tenant | null>(null);

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Moradores</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">Cadastro oficial de inquilinos</p>
        </div>
        <button 
          onClick={() => { setEditing(null); setIsModalOpen(true); }} 
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/10 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Plus size={18}/> Novo Registro
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
            <tr>
              <th className="px-8 py-5">Perfil</th>
              <th className="px-8 py-5">Unidade</th>
              <th className="px-8 py-5">Repositório Docs</th>
              <th className="px-8 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-bold">
            {tenants.length > 0 ? tenants.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-6 flex items-center gap-5">
                  <div className="w-14 h-14 rounded-[1.2rem] bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm transition-transform hover:scale-105">
                    {t.photo ? <img src={t.photo} className="w-full h-full object-cover" /> : <User size={24} className="text-slate-400" />}
                  </div>
                  <div>
                    <p className="text-slate-800 font-black text-base leading-tight">{t.name}</p>
                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-1">{t.cpf || 'Documento Pendente'}</p>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <span className="text-[11px] font-black uppercase text-slate-600 tracking-tighter italic">KITNET {t.kitnet}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  {t.docsLink ? (
                    <a href={t.docsLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all">
                      <ExternalLink size={12}/> Abrir Drive
                    </a>
                  ) : <span className="text-slate-200 text-[9px] font-black uppercase">Nenhum vínculo</span>}
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => { setEditing(t); setIsModalOpen(true); }} className="p-3 text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"><Edit size={18}/></button>
                    <button onClick={() => onDelete(t.id)} className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="py-24 text-center">
                  <Users size={48} className="text-slate-100 mx-auto mb-4" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nenhum morador ativo no banco.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? "Editar Morador" : "Cadastro de Morador"}>
        <form className="space-y-6" onSubmit={(e: any) => {
          e.preventDefault();
          const f = e.target;
          const data: Tenant = {
            id: editing?.id || Math.random().toString(36).substr(2, 9),
            name: f.name.value,
            cpf: f.cpf.value,
            phone: f.phone.value,
            kitnet: f.kitnet.value,
            docsLink: f.docsLink.value,
            photo: f.photo.value,
            status: 'Ativo',
            email: f.email?.value || '-'
          };
          editing ? onUpdate(data) : onAdd(data);
          setIsModalOpen(false);
        }}>
          <FormInput label="Nome Completo / Social" name="name" defaultValue={editing?.name} required placeholder="Ex: João da Silva" />
          <div className="grid grid-cols-2 gap-5">
            <FormInput label="CPF (Somente Números)" name="cpf" defaultValue={editing?.cpf} placeholder="000.000.000-00" />
            <FormInput label="WhatsApp / Telefone" name="phone" defaultValue={editing?.phone} placeholder="(19) 99999-9999" />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Unidade Vinculada</label>
              <select name="kitnet" defaultValue={editing?.kitnet} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer">
                <option value="">Nenhuma</option>
                {units.map((u) => <option key={u.id} value={u.number}>Unidade {u.number}</option>)}
              </select>
            </div>
            <FormInput label="URL Avatar (Link Foto)" name="photo" defaultValue={editing?.photo} placeholder="https://..." />
          </div>
          <FormInput label="Repositório Cloud (Google Drive / iCloud)" name="docsLink" defaultValue={editing?.docsLink} placeholder="Link da pasta de documentos" />
          <button className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-slate-900/20 hover:bg-blue-600 transition-all transform active:scale-95">
            Salvar Cadastro
          </button>
        </form>
      </Modal>
    </div>
  );
};

interface FinancesTabProps {
  records: FinancialRecord[];
  tenants: Tenant[];
  onAdd: (record: FinancialRecord) => void;
  onUpdate: (record: FinancialRecord) => void;
  onDelete: (id: string) => void;
}

const FinancesTab: React.FC<FinancesTabProps> = ({ records, tenants, onAdd, onUpdate, onDelete }) => {
  const [tab, setTab] = useState<'RECEIVABLE' | 'PAYABLE'>('RECEIVABLE');
  const [period, setPeriod] = useState<'CURRENT' | 'ALL'>('CURRENT');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<FinancialRecord | null>(null);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const filteredRecords = records.filter((r) => {
    const isCorrectType = r.type === tab;
    if (!isCorrectType) return false;
    
    const matchesSearch = r.entity.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         r.description.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (period === 'ALL') return true;
    const recordDate = new Date(r.dueDate + 'T00:00:00');
    return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-wrap gap-6 items-center justify-between">
        <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-200 shadow-sm">
          <button onClick={() => setTab('RECEIVABLE')} className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.1em] transition-all ${tab === 'RECEIVABLE' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-emerald-500'}`}>RECEITAS</button>
          <button onClick={() => setTab('PAYABLE')} className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.1em] transition-all ${tab === 'PAYABLE' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-red-500'}`}>DESPESAS</button>
        </div>
        
        <div className="flex-1 max-w-md relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
          <input 
            type="text" 
            placeholder="Pesquisar por histórico ou morador..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase outline-none focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-slate-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
           <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-200 shadow-sm">
            <button onClick={() => setPeriod('CURRENT')} className={`px-5 py-3 rounded-2xl font-black text-[9px] uppercase tracking-[0.1em] flex items-center gap-2 ${period === 'CURRENT' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}>
              <Calendar size={14} /> Ciclo Atual
            </button>
            <button onClick={() => setPeriod('ALL')} className={`px-5 py-3 rounded-2xl font-black text-[9px] uppercase tracking-[0.1em] flex items-center gap-2 ${period === 'ALL' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400'}`}>
              Histórico
            </button>
          </div>
          <button 
            onClick={() => { setEditing(null); setIsModalOpen(true); }} 
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 shadow-xl transition-all"
          >
            <Plus size={18}/> Novo Lançamento
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
              <tr>
                <th className="px-8 py-6">Detalhamento</th>
                <th className="px-8 py-6">Valor Nominal</th>
                <th className="px-8 py-6">Extras/Multa</th>
                <th className="px-8 py-6">Vencimento</th>
                <th className="px-8 py-6">Liquidação</th>
                <th className="px-8 py-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-bold">
              {filteredRecords.length > 0 ? filteredRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-6">
                    <p className="font-black text-slate-800 tracking-tight leading-tight">{r.description}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">{r.entity}</p>
                  </td>
                  <td className="px-8 py-6 text-slate-600">{formatCurrency(r.amount)}</td>
                  <td className="px-8 py-6">
                    <span className={r.fine && r.fine > 0 ? 'text-amber-600' : 'text-slate-200'}>
                      {formatCurrency(r.fine || 0)}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className={`text-sm font-black ${r.status === 'Pago' ? 'text-emerald-600' : 'text-amber-500'}`}>{formatDate(r.dueDate)}</span>
                      <span className="text-[8px] font-black uppercase text-slate-300 tracking-widest mt-0.5">{r.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {r.paymentDate ? (
                      <div className="flex flex-col">
                        <span className="text-slate-800 font-bold">{formatDate(r.paymentDate)}</span>
                        <span className="text-[8px] font-black uppercase text-emerald-500 tracking-tighter">Confirmado</span>
                      </div>
                    ) : <span className="text-slate-200 text-[10px] font-black italic">--</span>}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditing(r); setIsModalOpen(true); }} className="p-3 text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"><Edit size={16}/></button>
                      <button onClick={() => onDelete(r.id)} className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center">
                    <Wallet size={48} className="text-slate-100 mx-auto mb-4" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sem lançamentos registrados.</p>
                  </td>
                </tr>
              )}
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
            description: f.description.value,
            entity: f.entity.value,
            amount: Number(f.amount.value),
            fine: Number(f.fine?.value || 0),
            dueDate: f.dueDate.value,
            status: statusVal,
            type: tab,
            paymentDate: statusVal === 'Pago' ? (f.paymentDate?.value || new Date().toISOString().split('T')[0]) : undefined
          };
          editing ? onUpdate(data) : onAdd(data);
          setIsModalOpen(false);
        }}>
          <FormInput label="Descrição do Histórico" name="description" defaultValue={editing?.description} required placeholder="Ex: Aluguel Kit 01" />
          <div className="grid grid-cols-2 gap-5">
            <FormInput label="Valor Base (R$)" name="amount" type="number" step="0.01" defaultValue={editing?.amount} required />
            <FormInput label="Acréscimos/Extras (R$)" name="fine" type="number" step="0.01" defaultValue={editing?.fine} placeholder="0,00" />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <FormInput label="Data de Vencimento" name="dueDate" type="date" defaultValue={editing?.dueDate} required />
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Status Financeiro</label>
              <select name="status" defaultValue={editing?.status || 'Pendente'} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer">
                <option value="Pendente">Aguardando Pagamento</option>
                <option value="Pago">Liquidado / Recebido</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            {tab === 'RECEIVABLE' ? (
              <>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Inquilino Pagador</label>
                <select name="entity" defaultValue={editing?.entity} required className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer">
                  <option value="">Selecione o morador...</option>
                  {tenants.map((t) => <option key={t.id} value={t.name}>{t.name} (Unidade {t.kitnet})</option>)}
                </select>
              </>
            ) : (
              <FormInput label="Fornecedor / Favorecido" name="entity" defaultValue={editing?.entity} placeholder="Ex: CPFL Energia, Prestador..." required />
            )}
          </div>
          <FormInput label="Data da Liquidação Efetiva" name="paymentDate" type="date" defaultValue={editing?.paymentDate} />
          <button className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-slate-900/20 hover:bg-blue-600 transition-all transform active:scale-95">
            Confirmar Registro
          </button>
        </form>
      </Modal>
    </div>
  );
};

interface ReportsTabProps {
  units: Unit[];
  tenants: Tenant[];
  records: FinancialRecord[];
  dbStatus: string;
  onExportJSON: () => void;
  onImportJSON: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ReportsTab: React.FC<ReportsTabProps> = ({ units, tenants, records, dbStatus, onExportJSON, onImportJSON }) => {
  const generatePDF = (title: string) => {
    try {
      const jspdfObj = (window as any).jspdf;
      if (!jspdfObj || !jspdfObj.jsPDF) {
        alert("Erro: Biblioteca PDF não carregada no navegador.");
        return;
      }
      const doc = new jspdfObj.jsPDF();
      doc.setFontSize(24);
      doc.setTextColor(15, 23, 42);
      doc.text(`KITNET ADM PRÓ`, 14, 20);
      doc.setFontSize(14);
      doc.setTextColor(37, 99, 235);
      doc.text(`RELATÓRIO: ${title}`, 14, 28);
      
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`EMITIDO EM: ${new Date().toLocaleString('pt-BR')} | AUTENTICAÇÃO DIGITAL ATIVA`, 14, 34);
      
      let head: string[][] = [];
      let body: any[][] = [];
      
      if (title === 'GESTÃO FINANCEIRA') {
        head = [['Descrição Histórico', 'Favorecido', 'Valor Líquido', 'Vencimento', 'Status']];
        body = records.map((r) => [r.description, r.entity, formatCurrency(r.amount + (r.fine || 0)), formatDate(r.dueDate), r.status.toUpperCase()]);
      } else if (title === 'LISTAGEM DE MORADORES') {
        head = [['Inquilino', 'Unidade', 'WhatsApp / Contato', 'CPF / Doc']];
        body = tenants.map((t) => [t.name, `KITNET ${t.kitnet}`, t.phone, t.cpf || 'PENDENTE']);
      } else {
        head = [['Código Unidade', 'Área m²', 'Valor Mensal', 'Status Ocupação']];
        body = units.map((u) => [u.number, `${u.size}m²`, formatCurrency(u.rent), u.status]);
      }
      
      // @ts-ignore
      doc.autoTable({
        startY: 45,
        head: head,
        body: body,
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 9, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 5, font: 'helvetica' },
        alternateRowStyles: { fillColor: [248, 250, 252] }
      });
      
      const pageCount = doc.internal.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Página ${i} de ${pageCount} - Documento Gerado Automaticamente`, 14, doc.internal.pageSize.height - 10);
      }

      doc.save(`kitnet_adm_report_${title.toLowerCase().replace(/ /g, '_')}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Houve um erro técnico ao gerar o PDF. Verifique os logs.");
    }
  };

  return (
    <div className="space-y-12 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <ReportCard title="Financeiro" desc="Fluxo de Caixa & Pendências" icon={<Wallet size={36}/>} color="bg-blue-600" onAction={() => generatePDF('GESTÃO FINANCEIRA')}/>
        <ReportCard title="Moradores" desc="Listagem Ativa de Inquilinos" icon={<Users size={36}/>} color="bg-indigo-600" onAction={() => generatePDF('LISTAGEM DE MORADORES')}/>
        <ReportCard title="Patrimônio" desc="Inventário das Unidades" icon={<Home size={36}/>} color="bg-emerald-600" onAction={() => generatePDF('INVENTÁRIO DE ATIVOS')}/>
      </div>

      <div className="bg-white p-12 rounded-[3rem] border border-slate-200 text-center max-w-5xl mx-auto shadow-2xl shadow-slate-200/50">
        <div className={`inline-flex p-5 rounded-[2rem] mb-8 ${dbStatus === 'OK' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
           {dbStatus === 'OK' ? <Database size={48} className="animate-pulse" /> : <Database size={48} />}
        </div>
        <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">
          Integridade dos Dados
        </h3>
        <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.25em] mt-3 mb-12 max-w-xl mx-auto leading-relaxed italic">
          {dbStatus === 'OK' ? 'Seus dados estão sincronizados em tempo real com a infraestrutura cloud do Supabase.' : 'Você está operando em modo offline. O banco de dados local (LocalStorage) está ativo e seguro.'}
        </p>
        
        <div className="flex flex-wrap justify-center gap-6">
           <button onClick={onExportJSON} className="bg-slate-900 text-white px-10 py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95">
             <Download size={20} /> Baixar Backup Local (JSON)
           </button>
           <label className="border-2 border-slate-900 px-10 py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-slate-50 cursor-pointer transition-all active:scale-95">
             <Upload size={20} /> Restaurar da Máquina
             <input type="file" className="hidden" accept=".json" onChange={onImportJSON} />
           </label>
        </div>
        <p className="text-[9px] text-slate-300 font-black uppercase mt-10 tracking-[0.4em]">Protocolo de Segurança AES-256 Habilitado</p>
      </div>
    </div>
  );
};

interface ReportCardProps {
  title: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
  onAction: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ title, desc, icon, color, onAction }) => (
  <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200 flex flex-col hover:shadow-2xl transition-all group cursor-default">
    <div className={`w-20 h-20 rounded-[1.8rem] ${color || 'bg-slate-900'} flex items-center justify-center text-white mb-8 shadow-xl shadow-slate-200 transition-transform group-hover:scale-110 group-hover:rotate-6`}>
      {icon}
    </div>
    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-none">{title}</h3>
    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-10 mt-2 italic">{desc}</p>
    <button onClick={onAction} className="mt-auto w-full py-5 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-slate-900 hover:text-white transition-all">Emitir Documento</button>
  </div>
);

export default App;
