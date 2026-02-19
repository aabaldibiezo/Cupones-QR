import React from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Beneficios from "./components/Beneficios";
import CarouselEmpresas from "./components/CarouselEmpresas";
import CouponReceiver from "./components/CouponReceiver";
import Promocion from "./components/Promocion";
import Footer from "./components/Footer";

function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <Beneficios />
      <Promocion />
      <CarouselEmpresas />
      <CouponReceiver />
      <Footer />
    </>
  );
}

export default App;
