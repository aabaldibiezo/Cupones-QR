import React from "react";

const Hero = () => {
  return (
    <div className="bg-primary text-white text-center py-5" id="inicio">
      <div className="container">
        <h1 className="display-4 fw-bold">Publicidad Inteligente con Cupones Digitales</h1>
        <p className="lead">
          Conectamos empresas con clientes a través de promociones exclusivas.
        </p>
        <button className="btn btn-light btn-lg mt-3">
          Publicar Mi Empresa
        </button>
      </div>
    </div>
  );
};

export default Hero;
