import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { QRCodeCanvas } from 'qrcode.react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState('empresas'); 
  const [empresas, setEmpresas] = useState([]);
  const [reportes, setReportes] = useState([]);
  const [loginData, setLoginData] = useState({ user: '', pass: '' });
  
  // Estados de formularios
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
    const { data } = await supabase.from('logs_escaneos').select('*, promociones(titulo_promo)');
    setReportes(data || []);
  }

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginData.user === 'admin' && loginData.pass === '12345') {
      setIsLoggedIn(true);
    } else {
      alert("Acceso denegado");
    }
  };

  const guardarEmpresa = async (e) => {
    e.preventDefault();
    let logoUrl = '';
    
    // Lógica para subir logo si existe
    if (empresaForm.logo) {
      const file = empresaForm.logo;
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage.from('imagenes').upload(`logos/${fileName}`, file);
      if (data) {
        const { data: publicData } = supabase.storage.from('imagenes').getPublicUrl(`logos/${fileName}`);
        logoUrl = publicData.publicUrl;
      }
    }

    const { error } = await supabase.from('empresas').insert([
      { nombre: empresaForm.nombre, rubro: empresaForm.rubro, logo_url: logoUrl }
    ]);

    if (!error) {
      alert("Empresa registrada con éxito");
      fetchEmpresas();
    }
  };

  function LocationPicker() {
    useMapEvents({
      click(e) {
        setPromoData({ ...promoData, latitud: e.latlng.lat, longitud: e.latlng.lng });
      },
    });
    return <Marker position={[promoData.latitud, promoData.longitud]} />;
  }

  if (!isLoggedIn) {
    return (
      <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#1e293b'}}>
        <form onSubmit={handleLogin} style={{background:'white', padding:'2rem', borderRadius:'8px', width:'320px', boxShadow:'0 4px 6px rgba(0,0,0,0.1)'}}>
          <h2 style={{textAlign:'center', color:'#1e293b', marginBottom:'1.5rem'}}>MIS Admin Login</h2>
          <input type="text" placeholder="Usuario" style={{width:'100%', marginBottom:'1rem', padding:'10px', border:'1px solid #ccc', borderRadius:'4px'}} 
            onChange={e => setLoginData({...loginData, user: e.target.value})} />
          <input type="password" placeholder="Contraseña" style={{width:'100%', marginBottom:'1.5rem', padding:'10px', border:'1px solid #ccc', borderRadius:'4px'}} 
            onChange={e => setLoginData({...loginData, pass: e.target.value})} />
          <button type="submit" style={{width:'100%', padding:'12px', background:'#2563eb', color:'white', border:'none', borderRadius:'4px', fontWeight:'bold', cursor:'pointer'}}>ENTRAR</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{padding:'30px', fontFamily:'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', maxWidth:'1200px', margin:'0 auto'}}>
      <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px', borderBottom:'2px solid #eee', paddingBottom:'15px'}}>
        <h1 style={{color:'#1e293b', margin:0}}>Promo-Flash MIS</h1>
        <nav style={{display:'flex', gap:'15px'}}>
          <button onClick={() => setView('empresas')} style={navBtnStyle(view === 'empresas')}>Empresas</button>
          <button onClick={() => setView('promociones')} style={navBtnStyle(view === 'promociones')}>Promociones</button>
          <button onClick={() => setView('reportes')} style={navBtnStyle(view === 'reportes')}>Reportes</button>
        </nav>
      </header>

      {view === 'empresas' && (
        <section style={{background:'white', padding:'25px', borderRadius:'10px', boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
          <h2 style={{marginTop:0}}>Gestión de Clientes (Empresas)</h2>
          <form onSubmit={guardarEmpresa} style={{display:'flex', flexWrap:'wrap', gap:'15px', marginBottom:'30px'}}>
            <input type="text" placeholder="Nombre de Empresa" required style={inputStyle} onChange={e => setEmpresaForm({...empresaForm, nombre: e.target.value})} />
            <input type="text" placeholder="Rubro (Comida/Ropa)" style={inputStyle} onChange={e => setEmpresaForm({...empresaForm, rubro: e.target.value})} />
            <input type="file" onChange={e => setEmpresaForm({...empresaForm, logo: e.target.files[0]})} />
            <button type="submit" style={{background:'#10b981', color:'white', border:'none', padding:'10px 20px', borderRadius:'4px', cursor:'pointer'}}>Registrar Cliente</button>
          </form>
          
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#f8fafc', textAlign:'left'}}>
                <th style={tdStyle}>Logo</th>
                <th style={tdStyle}>Nombre</th>
                <th style={tdStyle}>Rubro</th>
              </tr>
            </thead>
            <tbody>
              {empresas.map(emp => (
                <tr key={emp.id} style={{borderBottom:'1px solid #eee'}}>
                  <td style={tdStyle}>{emp.logo_url && <img src={emp.logo_url} width="40" alt="logo" />}</td>
                  <td style={tdStyle}>{emp.nombre}</td>
                  <td style={tdStyle}>{emp.rubro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {view === 'promociones' && (
        <section style={{display:'grid', gridTemplateColumns:'1fr 350px', gap:'30px'}}>
          <div style={{background:'white', padding:'25px', borderRadius:'10px', boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
            <h3>Crear Bien / Servicio (Promoción)</h3>
            <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
              <select style={inputStyle} onChange={e => setPromoData({...promoData, empresa_id: e.target.value})}>
                <option value="">Seleccione Empresa...</option>
                {empresas.map(emp => <option key={emp.id} value={emp.id}>{emp.nombre}</option>)}
              </select>
              <input type="text" placeholder="Título de la Promo" style={inputStyle} onChange={e => setPromoData({...promoData, titulo: e.target.value})} />
              <input type="text" placeholder="Código de Cupón" style={inputStyle} onChange={e => setPromoData({...promoData, codigo: e.target.value})} />
              
              <div style={{height:'350px', border:'1px solid #ccc', borderRadius:'8px', overflow:'hidden'}}>
                <MapContainer center={[-17.3935, -66.1570]} zoom={13} style={{height: '100%'}}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationPicker />
                </MapContainer>
              </div>
            </div>
          </div>

          <div style={{background:'white', padding:'25px', borderRadius:'10px', boxShadow:'0 2px 10px rgba(0,0,0,0.05)', textAlign:'center'}}>
            <h3>Vista Previa QR</h3>
            <div style={{padding:'20px', border:'2px dashed #ccc', borderRadius:'10px', background:'#fafafa'}}>
              <QRCodeCanvas value={`promoflash://abrir?id=TEMP`} size={200} />
            </div>
            <p style={{fontSize:'12px', color:'#64748b', marginTop:'15px'}}>Deep Link: promoflash://abrir</p>
          </div>
        </section>
      )}

      {view === 'reportes' && (
        <section style={{background:'white', padding:'25px', borderRadius:'10px', boxShadow:'0 2px 10px rgba(0,0,0,0.05)'}}>
          <h2>Reportes de Estadísticas</h2>
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#f8fafc', textAlign:'left'}}>
                <th style={tdStyle}>Fecha/Hora</th>
                <th style={tdStyle}>Promoción</th>
                <th style={tdStyle}>Válido</th>
                <th style={tdStyle}>Motivo/Error</th>
              </tr>
            </thead>
            <tbody>
              {reportes.map(log => (
                <tr key={log.id} style={{borderBottom:'1px solid #eee'}}>
                  <td style={tdStyle}>{new Date(log.fecha_hora).toLocaleString()}</td>
                  <td style={tdStyle}>{log.promociones?.titulo_promo}</td>
                  <td style={tdStyle}>{log.es_valido ? '✅' : '❌'}</td>
                  <td style={tdStyle}>{log.motivo_error}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

// Estilos rápidos
const navBtnStyle = (active) => ({
  padding: '8px 16px',
  background: active ? '#2563eb' : '#f1f5f9',
  color: active ? 'white' : '#475569',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold'
});

const inputStyle = { padding:'10px', border:'1px solid #ccc', borderRadius:'4px', flex:'1', minWidth:'200px' };
const tdStyle = { padding:'12px', borderBottom:'1px solid #eee' };

export default App;