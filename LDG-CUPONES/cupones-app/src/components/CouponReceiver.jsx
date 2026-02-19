import React, { useState } from "react";

const CouponReceiver = () => {
  const [image, setImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="container my-5" id="cupon">
      <div className="card shadow p-4">
        <h2 className="text-center mb-4">Validar Cupón</h2>

        <div className="mb-3">
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        {image && (
          <div className="text-center">
            <h5>Vista previa:</h5>
            <img
              src={image}
              alt="Cupón"
              className="img-fluid rounded mt-3"
              style={{ maxHeight: "300px" }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponReceiver;
