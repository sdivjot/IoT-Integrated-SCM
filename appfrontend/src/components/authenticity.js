import React, { useState } from "react";
import { ethers } from "ethers";
import supplyChainArtifact from "../contracts/SupplyChainLifecycle.json";

const ProductAuthenticityDashboard = () => {
  const [productId, setProductId] = useState("");
  const [authData, setAuthData] = useState("");

  const fetchProductAuthData = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask.");
      return;
    }
    if (!productId || productId.trim() === "") {
      alert("Please enter a valid product ID.");
      return;
    }
    const numericProductId = parseInt(productId, 10);
    if (isNaN(numericProductId)) {
      alert("Invalid product ID format.");
      return;
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // Replace with your actual SupplyChainLifecycle contract address
    const contractAddress = "0x00899f961bb3B328b03F38524B164A1021D0e2fC";
    const supplyChainContract = new ethers.Contract(contractAddress, supplyChainArtifact.abi, provider);
    
    try {
      const product = await supplyChainContract.getProductDetails(numericProductId);
      const desc = product.productDesc;
      if (desc) {
        setAuthData(desc);
      } else {
        setAuthData("No records available.");
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      setAuthData("No records available.");
    }
  };

  return (
    <div className="dashboard">
      <h2>Product Authenticity Dashboard</h2>
      <input
        type="number"
        placeholder="Enter Product ID"
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
      />
      <button onClick={fetchProductAuthData}>Fetch Authenticity Data</button>
      <div>
        {authData ? (
          <div>
            <h3>Authenticity Data:</h3>
            <p>{authData}</p>
          </div>
        ) : (
          <p>No records available.</p>
        )}
      </div>
    </div>
  );
};

export default ProductAuthenticityDashboard;
