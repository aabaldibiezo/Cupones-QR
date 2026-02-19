import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { QRCodeCanvas } from 'qrcode.react';
import { toPng } from 'html-to-image';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ValidadorPublico from './components/ValidadorPublico';

// Configuración de iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// --- SUBCOMPONENTE PARA EL PANEL ADMINISTRATIVO ---
const AdminPanel = ({ 
  isLoggedIn, handleLogin, loginData, setLoginData, view, setView,
  empresas, guardarEmpresa, empresaForm, setEmpresaForm,
  promoData, setPromoData, guardarPromocionCompleta, loading, 
  cuponRef, ultimoIdGenerado, reportes, historialPromos, fetchHistorial
}) => {
  
  function LocationPicker() {
    useMapEvents({
      click(e) { setPromoData({ ...promoData, latitud: e.latlng.lat, longitud: e.latlng.lng }); },
    });
    return <Marker position={[promoData.latitud, promoData.longitud]} />;
  }

  // Función para imprimir el QR generado
  const imprimirQR = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    const ventana = window.open('', '_blank');
    ventana.document.write(`
      <html>
        <head><title>Imprimir QR - ${promoData.titulo}</title></head>
        <body style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; text-align:center;">
          <h1 style="margin-bottom:10px;">QR QPON</h1>
          <h2 style="color:#2563eb;">${promoData.titulo || 'Promoción'}</h2>
          <img src="${dataUrl}" style="width:350px; height:350px; border: 10px solid #eee; padding:10px;"/>
          <p style="margin-top:20px; font-size:20px;">Escanea con la App para validar</p>
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    ventana.document.close();
  };

  if (!isLoggedIn) {
    return (
      <div style={loginContainer}>
        <form onSubmit={handleLogin} style={loginCard}>
          <h2 style={{textAlign:'center', color:'#1e293b'}}>MIS Admin Login</h2>
          <input type="text" placeholder="Usuario" style={inputStyleFull} onChange={e => setLoginData({...loginData, user: e.target.value})} />
          <input type="password" placeholder="Contraseña" style={inputStyleFull} onChange={e => setLoginData({...loginData, pass: e.target.value})} />
          <button type="submit" style={btnPrimary}>ENTRAR</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{padding:'30px', maxWidth:'1200px', margin:'0 auto', fontFamily:'sans-serif'}}>
      <header style={headerStyle}>
        <h1>QR QPON</h1>
        <nav style={{display:'flex', gap:'10px'}}>
          <button onClick={() => setView('empresas')} style={navBtn(view==='empresas')}>Empresas</button>
          <button onClick={() => setView('promociones')} style={navBtn(view==='promociones')}>Promociones</button>
          <button onClick={() => setView('reportes')} style={navBtn(view==='reportes')}>Monitoreo</button>
          <button onClick={() => { setView('historial'); fetchHistorial(); }} style={navBtn(view==='historial')}>Historial</button>
        </nav>
      </header>

      {view === 'empresas' && (
        <section style={cardStyle}>
          <h3>Gestión de Clientes (Empresas)</h3>
          <form onSubmit={guardarEmpresa} style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
            <input type="text" placeholder="Nombre" required style={inputStyle} onChange={e => setEmpresaForm({...empresaForm, nombre: e.target.value})} />
            <input type="text" placeholder="Rubro" style={inputStyle} onChange={e => setEmpresaForm({...empresaForm, rubro: e.target.value})} />
            <input type="file" onChange={e => setEmpresaForm({...empresaForm, logo: e.target.files[0]})} />
            <button type="submit" style={btnSave}>Registrar</button>
          </form>
          <table style={tableStyle}>
            <thead><tr><th>Logo</th><th>Nombre</th><th>Rubro</th></tr></thead>
            <tbody>
              {empresas.map(e => <tr key={e.id}><td><img src={e.logo_url} width="30" alt="logo" style={{borderRadius:'50%'}}/></td><td>{e.nombre}</td><td>{e.rubro}</td></tr>)}
            </tbody>
          </table>
        </section>
      )}

      {view === 'promociones' && (
        <div style={{display:'grid', gridTemplateColumns:'1fr 400px', gap:'20px'}}>
          <section style={cardStyle}>
            <h3>Nueva Promoción (Control Temporal/GPS)</h3>
            <form onSubmit={guardarPromocionCompleta} style={{display:'flex', flexDirection:'column', gap:'10px'}}>
              <select required style={inputStyle} onChange={e => setPromoData({...promoData, empresa_id: e.target.value})}>
                <option value="">Seleccionar Empresa...</option>
                {empresas.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
              </select>
              <input type="text" placeholder="Título Promo" required style={inputStyle} onChange={e => setPromoData({...promoData, titulo: e.target.value})} />
              <input type="text" placeholder="Código Cupón" required style={inputStyle} onChange={e => setPromoData({...promoData, codigo: e.target.value})} />
              
              <div style={{display:'flex', gap:'10px'}}>
                <div style={{flex:1}}><label>Inicio:</label><input type="time" style={inputStyleFull} onChange={e => setPromoData({...promoData, inicio: e.target.value})} /></div>
                <div style={{flex:1}}><label>Fin:</label><input type="time" style={inputStyleFull} onChange={e => setPromoData({...promoData, fin: e.target.value})} /></div>
              </div>
              
              <label>Validez hasta:</label>
              <input type="date" min={new Date().toISOString().split("T")[0]} style={inputStyle} onChange={e => setPromoData({...promoData, validez: e.target.value})} />

              <div style={{height:'200px', borderRadius:'8px', overflow:'hidden', border:'1px solid #ddd', marginTop:'10px'}}>
                <MapContainer center={[-17.3935, -66.1570]} zoom={13} style={{height: '100%'}}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationPicker />
                </MapContainer>
              </div>
              <button type="submit" disabled={loading} style={btnPrimary}>
                {loading ? 'GENERANDO RECURSOS...' : 'GUARDAR Y GENERAR CUPÓN'}
              </button>
            </form>
          </section>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={cardStyle}>
              <h4>Vista Previa del Cupón</h4>
              <div ref={cuponRef} style={disenoCupon}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h4 style={{ margin: 0, color: '#1e293b' }}>
                      {empresas.find(e => e.id === promoData.empresa_id)?.nombre || 'Empresa'}
                    </h4>
                    {empresas.find(e => e.id === promoData.empresa_id)?.logo_url && (
                      <img 
                        src={empresas.find(e => e.id === promoData.empresa_id).logo_url} 
                        alt="logo" 
                        style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover' }}
                        crossOrigin="anonymous"
                      />
                    )}
                  </div>
                  <small style={{ color: '#64748b' }}>{promoData.validez}</small>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ fontSize: '18px', margin: '0 0 10px 0' }}>{promoData.titulo || 'TÍTULO'}</h2>
                  <div style={cuponCodeBox}>{promoData.codigo || 'CÓDIGO'}</div>
                </div>
                <p style={{ fontSize: '10px', textAlign: 'center', marginTop: '10px', color: '#94a3b8' }}>
                  Válido de {promoData.inicio} a {promoData.fin}
                </p>
              </div>
            </div>

            {ultimoIdGenerado && (
              <div style={{ ...cardStyle, textAlign: 'center', border:'2px solid #22c55e' }}>
                <h4 style={{color:'#16a34a'}}>¡QR LISTO!</h4>
                <QRCodeCanvas value={`promoflash://abrir?id=${ultimoIdGenerado}`} size={160} />
                <p style={{ fontSize: '10px', marginTop: '10px' }}>ID: {ultimoIdGenerado}</p>
                <button onClick={imprimirQR} style={{...btnSave, width:'100%', marginTop:'10px', background:'#16a34a'}}>
                   🖨️ IMPRIMIR QR
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      {view === 'historial' && (
        <section style={cardStyle}>
          <h3>Historial de Generaciones</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {historialPromos.map(p => (
              <div key={p.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '15px', background: '#f8fafc' }}>
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                   <QRCodeCanvas value={`promoflash://abrir?id=${p.id}`} size={100} />
                </div>
                <img src={p.imagen_cupon_url} alt="cupón" style={{ width: '100%', borderRadius: '6px' }} />
                <div style={{ marginTop: '10px', fontSize: '12px' }}>
                  <strong>{p.empresas?.nombre}</strong> - {p.titulo_promo}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {view === 'reportes' && (
        <section style={cardStyle}>
          <h3>Monitoreo de Validaciones TPS</h3>
          <p style={{fontSize:'13px', color:'#64748b'}}>Aquí aparecerán los escaneos realizados desde los dispositivos móviles.</p>
          <table style={tableStyle}>
            <thead><tr><th>Fecha/Hora</th><th>Promoción</th><th>Estado</th></tr></thead>
            <tbody>
              {reportes.length === 0 ? (
                <tr><td colSpan="3" style={{textAlign:'center', padding:'20px'}}>No hay escaneos registrados aún.</td></tr>
              ) : (
                reportes.map(l => <tr key={l.id}><td>{new Date(l.fecha_hora).toLocaleString()}</td><td>{l.promociones?.titulo_promo}</td><td>{l.es_valido?'✅ VÁLIDO':'❌ RECHAZADO'}</td></tr>)
              )}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
};

// --- COMPONENTE PRINCIPAL APP ---
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState('empresas');
  const [empresas, setEmpresas] = useState([]);
  const [reportes, setReportes] = useState([]);
  const [historialPromos, setHistorialPromos] = useState([]);
  const [ultimoIdGenerado, setUltimoIdGenerado] = useState(null);
  const [loading, setLoading] = useState(false);
  const cuponRef = useRef(null);

  const [loginData, setLoginData] = useState({ user: '', pass: '' });
  const [empresaForm, setEmpresaForm] = useState({ nombre: '', rubro: '', logo: null });
  const [promoData, setPromoData] = useState({
    empresa_id: '', titulo: '', codigo: '', 
    latitud: -17.3935, longitud: -66.1570, 
    inicio: '09:00', fin: '21:00', validez: ''
  });

  useEffect(() => {
    if (isLoggedIn) {
      fetchEmpresas();
      fetchReportes();
    }
  }, [isLoggedIn]);

  async function fetchEmpresas() {
    const { data } = await supabase.from('empresas').select('*');
    setEmpresas(data || []);
  }

  async function fetchReportes() {
  // Cambiamos la consulta para que use 'id_qr' que es el nombre en tu tabla
  const { data, error } = await supabase
    .from('logs_escaneos')
    .select(`
      id,
      fecha_hora,
      es_valido,
      id_qr,
      promociones (
        titulo_promo
      )
    `)
    .order('fecha_hora', { ascending: false });

  if (error) {
    console.error("Error al traer monitoreo:", error);
  } else {
    setReportes(data || []);
  }
}

  async function fetchHistorial() {
    const { data } = await supabase.from('promociones').select('*, empresas(nombre, logo_url)').order('created_at', { ascending: false });
    setHistorialPromos(data || []);
  }

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginData.user === 'admin' && loginData.pass === '12345') setIsLoggedIn(true);
    else alert("Credenciales incorrectas");
  };

  const guardarEmpresa = async (e) => {
    e.preventDefault();
    setLoading(true);
    let logoUrl = '';
    if (empresaForm.logo) {
      const file = empresaForm.logo;
      const fileName = `${Date.now()}-${file.name}`;
      await supabase.storage.from('imagenes').upload(`logos/${fileName}`, file);
      const { data: pData } = supabase.storage.from('imagenes').getPublicUrl(`logos/${fileName}`);
      logoUrl = pData.publicUrl;
    }
    await supabase.from('empresas').insert([{ nombre: empresaForm.nombre, rubro: empresaForm.rubro, logo_url: logoUrl }]);
    setLoading(false);
    fetchEmpresas();
    alert("Empresa registrada con éxito");
  };

  const guardarPromocionCompleta = async (e) => {
    e.preventDefault();
    if (!promoData.empresa_id) return alert("Selecciona una empresa");
    setLoading(true);
    try {
      const dataUrl = await toPng(cuponRef.current, { cacheBust: true });
      const blob = await (await fetch(dataUrl)).blob();
      const fileName = `cupon-${Date.now()}.png`;
      await supabase.storage.from('imagenes').upload(`cupones/${fileName}`, blob);
      const { data: urlData } = supabase.storage.from('imagenes').getPublicUrl(`cupones/${fileName}`);

      const { data, error } = await supabase.from('promociones').insert([{
        empresa_id: promoData.empresa_id,
        titulo_promo: promoData.titulo,
        codigo_cupon: promoData.codigo,
        latitud: promoData.latitud,
        longitud: promoData.longitud,
        hora_inicio: promoData.inicio,
        hora_fin: promoData.fin,
        fecha_validez: promoData.validez,
        imagen_cupon_url: urlData.publicUrl
      }]).select();

      if (!error) {
        setUltimoIdGenerado(data[0].id);
        alert("¡Promoción e Imagen generadas correctamente!");
        fetchHistorial();
      }
    } catch (err) {
      alert("Error al generar los recursos");
    }
    setLoading(false);
  };

  return (
    <Router>
      <Routes>
        <Route exact path="/validar/:id" element={<ValidadorPublico />} />
        <Route path="/" element={
          <AdminPanel 
            isLoggedIn={isLoggedIn} handleLogin={handleLogin} loginData={loginData} setLoginData={setLoginData}
            view={view} setView={setView} empresas={empresas} guardarEmpresa={guardarEmpresa}
            empresaForm={empresaForm} setEmpresaForm={setEmpresaForm} promoData={promoData}
            setPromoData={setPromoData} guardarPromocionCompleta={guardarPromocionCompleta}
            loading={loading} cuponRef={cuponRef} ultimoIdGenerado={ultimoIdGenerado} reportes={reportes}
            historialPromos={historialPromos} fetchHistorial={fetchHistorial}
          />
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

// ESTILOS
const loginContainer = { display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#0f172a' };
const loginCard = { background:'white', padding:'40px', borderRadius:'12px', width:'350px', boxShadow:'0 10px 15px -3px rgba(0,0,0,0.1)' };
const inputStyleFull = { width:'100%', padding:'12px', marginBottom:'15px', boxSizing:'border-box', borderRadius:'6px', border:'1px solid #cbd5e1' };
const inputStyle = { padding:'10px', borderRadius:'6px', border:'1px solid #cbd5e1', flex:1 };
const btnPrimary = { width:'100%', padding:'12px', background:'#2563eb', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'bold' };
const btnSave = { padding:'10px 20px', background:'#10b981', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'bold' };
const headerStyle = { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px', borderBottom:'2px solid #f1f5f9', paddingBottom:'20px' };
const navBtn = (active) => ({ padding:'10px 18px', background: active ? '#2563eb' : '#f1f5f9', color: active ? 'white' : '#475569', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold' });
const cardStyle = { background:'white', padding:'25px', borderRadius:'12px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)' };
const tableStyle = { width:'100%', borderCollapse:'collapse', marginTop:'15px' };
const disenoCupon = { background:'white', border:'2px solid #2563eb', padding:'20px', borderRadius:'12px', minHeight:'160px', position:'relative' };
const cuponCodeBox = { border:'2px dashed #2563eb', padding:'12px', textAlign:'center', fontSize:'22px', fontWeight:'bold', background:'#eff6ff', borderRadius:'8px' };

export default App;