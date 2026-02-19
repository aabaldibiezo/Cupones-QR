import React from "react";

const Beneficios = () => {
  return (
    <div className="py-5 text-white" style={{
      background: "linear-gradient(135deg, #1e3c72, #2a5298)"
    }}>
      <div className="container text-center">

        <h1 className="fw-bold display-4 mb-4">
          Convierte Promociones en Ventas Reales 🚀
        </h1>

        <p className="lead mb-5" style={{ maxWidth: "800px", margin: "0 auto" }}>
          Nuestra plataforma digital de cupones permite a tu empresa llegar
          directamente a clientes listos para comprar. No es solo publicidad,
          es una estrategia inteligente basada en conversión, visibilidad
          y resultados medibles.
        </p>

        <div className="row mt-4">

          <div className="col-md-4 mb-4">
            <div className="card bg-warning text-dark shadow-lg h-100 p-4 border-0">
              <h3 className="fw-bold">📈 Aumento de Ventas</h3>
              <p>
                Incrementa tu facturación con promociones diseñadas para
                atraer tráfico inmediato a tu negocio.
              </p>
              <h4 className="fw-bold">+35% promedio</h4>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card bg-success text-white shadow-lg h-100 p-4 border-0">
              <h3 className="fw-bold">🎯 Segmentación Inteligente</h3>
              <p>
                Tus ofertas llegan a clientes realmente interesados,
                aumentando la probabilidad de compra.
              </p>
              <h4 className="fw-bold">Mayor conversión</h4>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card bg-danger text-white shadow-lg h-100 p-4 border-0">
              <h3 className="fw-bold">💰 Publicidad de Bajo Costo</h3>
              <p>
                Más económico que campañas tradicionales y con mejor
                retorno de inversión.
              </p>
              <h4 className="fw-bold">ROI optimizado</h4>
            </div>
          </div>

        </div>

        <div className="mt-5">
          <h2 className="fw-bold mb-3">
            Más de 500 empresas ya confían en nosotros
          </h2>
          <p className="mb-4">
            Forma parte de la nueva generación de marketing digital
            basado en resultados.
          </p>

          <button className="btn btn-warning btn-lg px-5 fw-bold shadow">
            🚀 Registrar Mi Empresa Ahora
          </button>
        </div>

      </div>
    </div>
  );
};

export default Beneficios;
