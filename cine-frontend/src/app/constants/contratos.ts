export const CINE_MANAGER_ADDRESS = "0xf657b6707B3ddeC6500e86FDD91E1aaC80998704";
export const CINE_TOKEN_ADDRESS = "0x2e0e5770D071c8Db59F3F17C035736Cd49422047";

// Para empezar, solo necesitamos las funciones principales que vamos a usar:
export const CINE_MANAGER_ABI = [
  "function precioBoleto() view returns (uint256)",
  "function verificarAsiento(uint256 idFuncion, uint256 idAsiento) view returns (bool)",
  "function comprarBoleto(uint256 idFuncion, uint256 idAsiento, string memory metadataURI) external"
];

export const CINE_TOKEN_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function mint(address to, uint256 amount) external",
  "function faucet(uint256 amount) external"
];