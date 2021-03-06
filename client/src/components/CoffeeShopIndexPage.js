import React, { useState, useEffect } from "react";
import CoffeeShopTile from "./CoffeeShopTile";

const CoffeeShopIndexPage = (props) => {
  const [coffeeShops, setCoffeeShops] = useState([]);

  const getCoffeeShops = async () => {
    try {
      const response = await fetch("/api/v1/coffee-shops");
      if (!response.ok) {
        const errorMessage = `${response.status} (${response.statusText})`;
        const error = new Error(errorMessage);
        throw error;
      }
      const body = await response.json();
      setCoffeeShops(body.coffeeShops);
    } catch (err) {
      console.error(`Error in fetch: ${err.message}`);
    }
  };

  useEffect(() => {
    getCoffeeShops();
  }, []);

  const coffeeShopTiles = coffeeShops.map((coffeeShop) => {
    return <CoffeeShopTile key={coffeeShop.id} coffeeShop={coffeeShop} />;
  });

  return (
    <div className="list">
      <div className="tiles">
        <h2>JavaSipped Spots</h2>
        {coffeeShopTiles}
      </div>
    </div>
  );
};

export default CoffeeShopIndexPage;
