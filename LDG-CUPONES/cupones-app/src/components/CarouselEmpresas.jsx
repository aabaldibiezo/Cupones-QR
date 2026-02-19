import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient"; // Asegúrate de que la ruta sea correcta

const CarouselEmpresas = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPromociones();
  }, []);

  const fetchPromociones = async () => {
    try {
      setLoading(true);
      // Traemos las promociones de Supabase
      const { data, error } = await supabase
        .from("promociones")
        .select("*");

      if (error) throw error;
      setPromos(data || []);
    } catch (error) {
      console.error("Error cargando promociones:", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center my-5">Cargando cupones...</div>;
  if (promos.length === 0) return <div className="text-center my-5">No hay promociones activas.</div>;

  return (
    <div className="container my-5" id="empresas">
      <h2 className="text-center mb-4">Promociones Disponibles</h2>

      <div
        id="carouselEmpresas"
        className="carousel slide"
        data-bs-ride="carousel"
      >
        <div className="carousel-inner rounded shadow">
          {promos.map((promo, index) => (
            <div 
              key={promo.id} 
              className={`carousel-item ${index === 0 ? "active" : ""}`}
            >
              <img
                src={promo.imagen_cupon_url || "https://via.placeholder.com/800x400?text=No+Image"}
                className="d-block w-100 bg-white p-5"
                alt={promo.titulo_promo}
                style={{ height: "400px", objectFit: "contain" }}
              />
              <div className="carousel-caption bg-dark bg-opacity-75 rounded">
                <h5>{promo.titulo_promo}</h5>
                <p>Válido de {promo.hora_inicio} a {promo.hora_fin}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Controles del Carrusel */}
        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#carouselEmpresas"
          data-bs-slide="prev"
        >
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Anterior</span>
        </button>

        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#carouselEmpresas"
          data-bs-slide="next"
        >
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Siguiente</span>
        </button>
      </div>
    </div>
  );
};

export default CarouselEmpresas;