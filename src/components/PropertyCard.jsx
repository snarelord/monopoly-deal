import React from "react";
import { propertyCards } from "../data/cardData";

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

// declare logic dealing with only 2 properties in a set + 4 properties in a set
const PropertyCard = ({ name, colorSet, value, rent }) => {
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

        <p style={{ textAlign: "center" }}>Value £{value}M</p>

        <div style={{ clear: "both", paddingBottom: "10px" }}>
          <div style={{ float: "left" }}>Properties Owned: 1</div>
          <div style={{ float: "right" }}>{rent[0] ? `£${rent[0]}M` : "-"}</div>
          <br />
          <div style={{ float: "left" }}>Properties Owned: 2</div>
          <div style={{ float: "right" }}>{rent[1] ? `£${rent[1]}M` : "-"}</div>
          <br />
          <div style={{ float: "left" }}>Complete Set</div>
          <div style={{ float: "right" }}>{rent[2] ? `£${rent[2]}M` : "-"}</div>
        </div>

        <p style={{ textAlign: "center", clear: "both" }}>
          With HOUSE £{rent[2] + 3}
        </p>
        <p style={{ textAlign: "center", clear: "both" }}>
          With HOTEL £{rent[2] + 7}
        </p>
      </div>
    </div>
  );
};

export default PropertyCard;
