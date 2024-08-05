import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const contractABI = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "x",
        type: "uint256",
      },
    ],
    name: "set",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "get",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const contractAddress = "0x5e0ADD48d2fb84873951145C4Af11e5b0e53c0a0";

export default function Web3App() {
  const [contract, setContract] = useState(null);
  const [storedValue, setStoredValue] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeContract = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const newContract = new ethers.Contract(
            contractAddress,
            contractABI,
            signer
          );
          setContract(newContract);

          // Initialize the contract with a value
          await initializeContractValue(newContract);
        } catch (error) {
          console.error("Failed to initialize contract:", error);
          setError("Failed to initialize contract: " + error.message);
        }
      } else {
        console.log("Please install MetaMask!");
        setError("Please install MetaMask!");
      }
    };

    initializeContract();
  }, []);

  const initializeContractValue = async (contract) => {
    try {
      console.log("Initializing contract with a value...");
      const tx = await contract.set(42); // Set an initial value of 42
      await tx.wait();
      console.log("Contract initialized with value 42");
    } catch (error) {
      console.error("Error initializing contract value:", error);
      setError("Error initializing contract value: " + error.message);
    }
  };

  const getValue = async () => {
    if (contract) {
      try {
        console.log("Calling get() function...");
        const value = await contract.get();
        console.log("Raw value returned:", value);
        setStoredValue(value.toString());
        setError(null);
      } catch (error) {
        console.error("Error getting value:", error);
        setError("Error getting value: " + error.message);

        // Additional logging
        console.log("Contract address:", contractAddress);
        console.log("Contract ABI:", JSON.stringify(contractABI, null, 2));

        if (error.transaction) {
          console.log("Transaction details:", error.transaction);
        }
      }
    } else {
      setError("Contract not initialized");
    }
  };

  const setValue = async () => {
    if (contract && inputValue) {
      try {
        console.log("Calling set() function with value:", inputValue);
        const tx = await contract.set(inputValue);
        console.log("Transaction sent:", tx.hash);
        await tx.wait();
        console.log("Transaction confirmed");
        getValue();
        setError(null);
      } catch (error) {
        console.error("Error setting value:", error);
        setError("Error setting value: " + error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Simple Storage dApp</h1>
        <div className="mb-4">
          <button
            onClick={getValue}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Get Value
          </button>
          {storedValue !== null && (
            <p className="mt-2">Stored Value: {storedValue}</p>
          )}
        </div>
        <div>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="border rounded px-2 py-1 mr-2"
            placeholder="Enter a number"
          />
          <button
            onClick={setValue}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Set Value
          </button>
        </div>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
}
