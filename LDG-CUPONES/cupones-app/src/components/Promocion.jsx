import React from "react";

const Promocion = () => {
  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      
      {/* HERO PRINCIPAL */}
      <section style={{
        background: "linear-gradient(135deg, #ff7e5f, #feb47b)",
        color: "white",
        padding: "80px 20px",
        textAlign: "center"
      }}>
        <h1 style={{ fontSize: "3rem", fontWeight: "bold" }}>
          🎁 Conectamos negocios con clientes reales
        </h1>
        <p style={{ fontSize: "1.3rem", maxWidth: "800px", margin: "20px auto" }}>
          Nuestra plataforma une empresas que quieren crecer con personas que buscan ahorrar.
          Creamos promociones inteligentes que benefician a todos.
        </p>
      </section>

      {/* SECCIÓN PARA USUARIOS */}
      <section style={{ padding: "60px 20px", textAlign: "center" }}>
        <h2 style={{ fontSize: "2.2rem", marginBottom: "20px", color: "#ff7e5f" }}>
          💳 Para quienes buscan descuentos
        </h2>

        <p style={{ maxWidth: "800px", margin: "0 auto 20px auto", fontSize: "1.1rem" }}>
          Descubre promociones exclusivas en tiendas, restaurantes y servicios locales.
          Accede a descuentos especiales diseñados para ayudarte a ahorrar en tus compras diarias.
        </p>

        <ul style={{ listStyle: "none", padding: 0, fontSize: "1.1rem" }}>
          <li>✔️ Cupones actualizados constantemente</li>
          <li>✔️ Descuentos reales en negocios confiables</li>
          <li>✔️ Fácil de usar</li>
          <li>✔️ Ahorra dinero en cada compra</li>
        </ul>

        <p style={{ marginTop: "20px", fontWeight: "bold" }}>
          Busca. Escanea. Ahorra. Así de simple.
        </p>
      </section>

      {/* SECCIÓN PARA EMPRESAS */}
      <section style={{
        backgroundColor: "#f5f5f5",
        padding: "60px 20px",
        textAlign: "center"
      }}>
        <h2 style={{ fontSize: "2.2rem", marginBottom: "20px", color: "#333" }}>
          🚀 Para empresas que quieren más clientes
        </h2>

        <p style={{ maxWidth: "900px", margin: "0 auto 20px auto", fontSize: "1.1rem" }}>
          Ofrecemos un espacio publicitario estratégico dentro de nuestra plataforma
          donde tu negocio puede promocionar ofertas exclusivas.
          No es solo publicidad. Es generación directa de tráfico y ventas.
        </p>

        <p style={{ maxWidth: "900px", margin: "0 auto 20px auto", fontSize: "1.1rem" }}>
          Publicas tu promoción, nuestros usuarios la descubren,
          visitan tu tienda y reciben un descuento.
          Tú obtienes nuevos clientes y aumentas tus ventas.
        </p>

        <h3 style={{ marginTop: "30px" }}>🎯 Beneficios para tu negocio:</h3>

        <ul style={{ listStyle: "none", padding: 0, fontSize: "1.1rem" }}>
          <li>✔️ Mayor visibilidad de marca</li>
          <li>✔️ Clientes con intención real de compra</li>
          <li>✔️ Incremento inmediato en tráfico</li>
          <li>✔️ Posibilidad de fidelización</li>
          <li>✔️ Modelo ganar-ganar</li>
        </ul>

        <p style={{ marginTop: "30px", fontWeight: "bold", fontSize: "1.2rem" }}>
          No vendemos publicidad. Generamos clientes.
        </p>
      </section>

      {/* LLAMADO A LA ACCIÓN */}
      <section style={{
        background: "#ff7e5f",
        color: "white",
        padding: "50px 20px",
        textAlign: "center"
      }}>
        <h2>🤝 Crece con nosotros</h2>
        <p style={{ maxWidth: "700px", margin: "20px auto" }}>
          Si eres usuario, comienza a ahorrar hoy.
          Si eres empresa, comienza a atraer nuevos clientes.
        </p>

        <button style={{
          backgroundColor: "white",
          color: "#ff7e5f",
          padding: "15px 30px",
          fontSize: "1.1rem",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          fontWeight: "bold"
        }}>
          Comenzar Ahora
        </button>
      </section>

    </div>
  );
};

export default Promocion;
