import React, { useState } from "react";

// player default starts with 10m and empty array of properties
const Player = () => {
  const [money, setMoney] = useState(10);
  const [properties, setProperties] = useState([]);
  // handle buying properties use button click
  const buyProperty = (property) => {
    setProperties([...properties, property]);
    setMoney(money - property.value);
  };
  // pay rent when on property
  const payRent = (property) => {
    const rent =
      property.rent[
        properties.filter((p) => p.colour === property.colour).length - 1
      ];
    setMoney(money - rent);
  };
  return (
    <div className="player">
      <h3>Player Status</h3>
      <p>Money: {money} million</p>
      <p>Properties: {properties.map((p) => p.name).join(", ")}</p>
    </div>
  );
};

export default Player;
