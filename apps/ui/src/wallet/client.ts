import { http } from "viem";
import { sepolia, polygonAmoy } from "wagmi/chains";
import { defaultWagmiConfig } from "@web3modal/wagmi/react";

const projectId = import.meta.env.VITE_WALLETCONNECT_ID || "demo";
export const chains = [polygonAmoy, sepolia] as const;

export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata: {
    name: "Kydras Mint",
    description: "Mint & distribute music",
    url: "https://kydras.local",
    icons: ["https://avatars.githubusercontent.com/u/1?v=4"]
  },
  transports: {
    [polygonAmoy.id]: http(),
    [sepolia.id]: http()
  }
});
