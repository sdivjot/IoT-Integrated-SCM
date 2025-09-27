import React from "react";

import { ethers } from "ethers";
import SupplyChainLifecycle from "../contracts/SupplyChainLifecycle.json";
import contractAddresses from "../contracts/contract-addresses.json";
import { NoWalletDetected } from "./NoWalletDetected";
import { PageLoader } from "./static/PageLoader";
import { InitializedContent } from "./InitializedContent";

// This is the default id used by the Hardhat Network
const HARDHAT_NETWORK_ID = '31337';
const SEPOLIA_NETWORK_ID = '11155111';


/**
 * The main app component. The main paths and components are called from here.
 * Wallet initialization state is checked here. User and contract details are passed down to the child components when required.
 * 
 * @author syuki
 */
export class Dapp extends React.Component {
  constructor(props) {
    super(props);

    this.initialState = {
      selectedAddress: undefined,
      initialized: false,
    };

    this.state = this.initialState;
  }

  componentDidMount() {
    this.connectWallet();
  }

  render() {
    // Ethereum wallets inject the window.ethereum object. If it hasn't been
    // injected, we instruct the user to install a wallet.
    if (window.ethereum === undefined) {
      return <NoWalletDetected />;
    }

    // If the account data hasn't loaded yet, we show
    // a loading component.
    if (!this.state.initialized) {
      return <PageLoader />;
    }

    // If everything is loaded, we render the application.
    return (
      <InitializedContent
        contract={this.contractInstance}
        currentAddress={this.state.selectedAddress}
      />
    );
  }

  async connectWallet() {
    const [selectedAddress] = await window.ethereum.request({ method: 'eth_requestAccounts' });
    this.checkNetwork();

    this.initialize(selectedAddress);
    // We reinitialize it whenever the user changes their account.
    this.checkAccountChange();
  }

  checkAccountChange() {
    window.ethereum.on("accountsChanged", ([newAddress]) => {
      window.location.reload();
      // `accountsChanged` event can be triggered with an undefined newAddress.
      // This happens when the user removes the Dapp from the "Connected
      // list of sites allowed access to your addresses" (Metamask > Settings > Connections)
      // To avoid errors, we reset the dapp state 
      if (newAddress === undefined) {
        return this.resetState();
      }

      this.initialize(newAddress);
    });
  }

  // Initializes the DApp.
  initialize(userAddress) {
    // We first store the user's address in the component's state
    this.setState({
      selectedAddress: userAddress,
    });
    this.initializeEthers();
    this.setState({ initialized: true });
  }

  async initializeEthers() {
    // We first initialize ethers by creating a provider using window.ethereum
    this.provider = new ethers.providers.Web3Provider(window.ethereum);

    // Then, we initialize the contract using that provider and the contract's artifact.
    const addressEntry = contractAddresses.find(obj => obj.SupplyChainLifecycle);
    const contractAddress = addressEntry?.SupplyChainLifecycle;

    this.contractInstance = new ethers.Contract(
      contractAddress,
      SupplyChainLifecycle.abi,
      this.provider.getSigner(0)
    );

  }

  resetState() {
    this.setState(this.initialState);
  }

  async switchChain() {
  const chainIdHex = "0xaa36a7"; // Hex for 11155111

  try {
    // Try switching first
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
  } catch (error) {
    if (error.code === 4902) {
      // Sepolia not added → add it
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: chainIdHex,
          chainName: "Sepolia",
          nativeCurrency: { name: "SepoliaETH", symbol: "SepoliaETH", decimals: 18 },
          rpcUrls: ["https://eth-sepolia.g.alchemy.com/v2/IczRrCI0W7PLoMNcIDR24fOrz4fLq19H"], // your key
          blockExplorerUrls: ["https://sepolia.etherscan.io"],
        }],
      });
    } else {
      console.error("Failed to switch chain:", error);
    }
  }

  // Re-initialize after switching
  await this.initialize(this.state.selectedAddress);
}

checkNetwork() {
  const sepoliaHex = "0xaa36a7"; // Hex for 11155111
  if (window.ethereum.chainId !== sepoliaHex) {
    this.switchChain();
  }
}

}

