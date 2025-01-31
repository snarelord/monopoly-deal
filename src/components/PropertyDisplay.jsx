// src/components/PropertyDisplay.jsx
import React from "react";
import { propertyCards } from "../cardData"; // Import property cards

function PropertyDisplay() {
  return (
    <div className="property-display">
      <h2>Property Cards</h2>
      <div className="properties">
        {propertyCards.map((property) => (
          <div key={property.id} className="property-card">
            <h3>{property.name}</h3>
            <p>Colour: {property.colour}</p>
            <p>Value: {property.value}</p>
            <p>Rent: {property.rent.join(", ")}</p>
            {/* You can add additional property features like buildings, ownership, etc. */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PropertyDisplay;
