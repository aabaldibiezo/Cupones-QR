import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { QRCodeCanvas } from 'qrcode.react';
import { PlusCircle, Trash2, BarChart3, List, Save } from 'lucide-react';

function App() {
  const [promociones, setPromociones] = useState([]);
  const [vista, setVista] = useState('listado');
  const [stats, setStats] = useState({ total: 0, exitosos: 0, fallidos: 0 });
  const [formData, setFormData] = useState({
    nombre_negocio: '', titulo_promo: '', descripcion: '',
    codigo_cupon: '', latitud: '', longitud: '',
    hora_inicio: '', hora_fin: '', logo_url: ''
  });

  useEffect(() => {
    fetchPromociones();
    fetchStats();
  }, [vista]);

  async function fetchPromociones() {
    const { data } = await supabase.from('promociones').select('*').order('created_at', { ascending: false });
    setPromociones(data || []);
  }

  async function fetchStats() {
    const { data, count } = await supabase.from('logs_escaneos').select('*', { count: 'exact' });
    if (data) {
      const exitosos = data.filter(log => log.es_valido).length;
      setStats({ total: count, exitosos, fallidos: count - exitosos });
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('promociones').insert([formData]);
    if (error) {
      alert("Error de RLS o Validación: " + error.message);
    } else {
      alert("¡Promoción creada exitosamente");
      setVista('listado');
    }
  };

  const eliminarPromo = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este cupón?")) {
      await supabase.from('promociones').delete().eq('id', id);
      fetchPromociones();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white font-bold text-xl">QR</div>
          <span className="font-bold text-xl tracking-tight">Promo-Flash MIS</span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setVista('listado')} className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-md transition-all">
            <List size={18}/> Listado
          </button>
          <button onClick={() => setVista('reportes')} className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-md transition-all">
            <BarChart3 size={18}/> Estadísticas
          </button>
          <button onClick={() => setVista('nuevo')} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 shadow-md transition-all">
            <PlusCircle size={18}/> Nueva Promo
          </button>
        </div>
      </nav>

      <main className="p-8">
        {/* LISTADO DE CUPONES */}
        {vista === 'listado' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promociones.map(p => (
              <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">{p.nombre_negocio}</h3>
                      <p className="text-blue-600 text-sm font-semibold">{p.titulo_promo}</p>
                    </div>
                    <button onClick={() => eliminarPromo(p.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 size={20}/>
                    </button>
                  </div>
                  <div className="flex justify-center bg-slate-50 p-4 rounded-xl mb-4 border border-dashed border-slate-300">
                    <QRCodeCanvas value={`https://tps-app-url.com/scan?id=${p.id}`} size={140} />
                  </div>
                  <div className="text-xs text-slate-500 space-y-1">
                    <p>📍 {p.latitud}, {p.longitud}</p>
                    <p>⏰ {p.hora_inicio} - {p.hora_fin}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FORMULARIO DE REGISTRO */}
        {vista === 'nuevo' && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
              <PlusCircle className="text-blue-600" /> Registrar Promoción
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Nombre Negocio</label>
                  <input type="text" className="w-full border border-slate-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    onChange={e => setFormData({...formData, nombre_negocio: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Título Promo</label>
                  <input type="text" className="w-full border border-slate-300 p-2 rounded-lg" 
                    onChange={e => setFormData({...formData, titulo_promo: e.target.value})} required />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Código del Cupón (Lo que verá el cliente)</label>
                <input type="text" className="w-full border border-slate-300 p-2 rounded-lg" 
                  onChange={e => setFormData({...formData, codigo_cupon: e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Latitud</label>
                  <input type="number" step="any" className="w-full border border-slate-300 p-2 rounded-lg" 
                    onChange={e => setFormData({...formData, latitud: parseFloat(e.target.value)})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Longitud</label>
                  <input type="number" step="any" className="w-full border border-slate-300 p-2 rounded-lg" 
                    onChange={e => setFormData({...formData, longitud: parseFloat(e.target.value)})} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Hora Inicio</label>
                  <input type="time" className="w-full border border-slate-300 p-2 rounded-lg" 
                    onChange={e => setFormData({...formData, hora_inicio: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Hora Fin</label>
                  <input type="time" className="w-full border border-slate-300 p-2 rounded-lg" 
                    onChange={e => setFormData({...formData, hora_fin: e.target.value})} required />
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg flex items-center justify-center gap-2">
                <Save size={20}/> Guardar Promoción
              </button>
            </form>
          </div>
        )}

        {/* ESTADÍSTICAS */}
        {vista === 'reportes' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Total Escaneos" value={stats.total} color="blue" />
              <StatCard title="Canjes Exitosos" value={stats.exitosos} color="green" />
              <StatCard title="Intentos Fallidos" value={stats.fallidos} color="red" />
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-lg mb-2">Información de Gestión</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Este panel permite al administrador monitorear el desempeño de los QRs en tiempo real. 
                Los intentos fallidos indican que los usuarios están intentando canjear cupones fuera de las zonas geográficas permitidas o de los horarios establecidos.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Componente pequeño para las tarjetas de stats
function StatCard({ title, value, color }) {
  const colors = {
    blue: "border-blue-500",
    green: "border-green-500",
    red: "border-red-500"
  };
  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border-b-4 ${colors[color]} text-center`}>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
      <p className="text-4xl font-black text-slate-800">{value}</p>
    </div>
  );
}

export default App;