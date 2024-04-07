import React from "react";

import ReactDOM from "react-dom/client";
import App from "./App";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react"; // Make sure this package exists or is correctly named

const wallets = [new PetraWallet()];

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <AptosWalletAdapterProvider plugins={wallets} autoConnect={true}>
  <App />
</AptosWalletAdapterProvider>
);
export default App;
