import React from "react";

const colourMap = {
  brown: "SaddleBrown",
  lightblue: "SkyBlue",
  pink: "Pink",
  orange: "#Orange",
  red: "Red",
  yellow: "Yellow",
  green: "Green",
  blue: "Blue",
  black: "Black",
  utility: "#A9A9A9",
};

const MoneyCard = ({ name, colorSet, value, rent }) => {
  return (
    <div style={{ width: "94%", margin: "auto" }}>
      <div
        style={{
          maxWidth: "180px",
          height: "270px",
          margin: "60px auto",
          border: "1px solid #ccc",
          padding: "10px",
          boxShadow: "0 1px 1px 1px #ccc",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            backgroundColor: colourMap[colorSet] || "white",
            color: "black",
            padding: "10px",
            margin: "0",
            border: "2px solid black",
          }}
        >
          <small
            style={{
              textTransform: "uppercase",
              fontFamily: "kabel",
              fontSize: "19px",
              letterSpacing: "1px",
              color: "white",
            }}
          >
            {name}
          </small>
          <br />
        </h2>
      </div>
    </div>
  );
};

export default MoneyCard;
