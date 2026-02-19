import React from "react";

const CarouselEmpresas = () => {
  return (
    <div className="container my-5" id="empresas">
      <h2 className="text-center mb-4">Empresas Registradas</h2>

      <div
        id="carouselEmpresas"
        className="carousel slide"
        data-bs-ride="carousel"
      >
        <div className="carousel-inner rounded shadow">

          {/* Cupón 1 - eBay */}
          <div className="carousel-item active">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg"
              className="d-block w-100 bg-white p-5"
              alt="eBay"
              style={{ maxHeight: "400px", objectFit: "contain" }}
            />
            <div className="carousel-caption bg-dark bg-opacity-75 rounded">
              <h5>eBay</h5>
              <p>15% de descuento en productos seleccionados</p>
            </div>
          </div>

          {/* Cupón 2 - OXXO */}
          <div className="carousel-item">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/63/Oxxo_Logo.svg"
              className="d-block w-100 bg-white p-5"
              alt="OXXO"
              style={{ maxHeight: "400px", objectFit: "contain" }}
            />
            <div className="carousel-caption bg-dark bg-opacity-75 rounded">
              <h5>OXXO</h5>
              <p>2x1 en bebidas seleccionadas</p>
            </div>
          </div>

        </div>

        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#carouselEmpresas"
          data-bs-slide="prev"
        >
          <span className="carousel-control-prev-icon"></span>
        </button>

        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#carouselEmpresas"
          data-bs-slide="next"
        >
          <span className="carousel-control-next-icon"></span>
        </button>
      </div>
    </div>
  );
};

export default CarouselEmpresas;
