import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("CineDeployment", (m) => {
  const cineToken = m.contract("CineToken");
  const cineBoleto = m.contract("CineBoleto");
  const cineManager = m.contract("CineManager", [cineToken, cineBoleto]);

  // ¡Aquí está la magia! Le decimos al NFT que su nuevo jefe es el CineManager
  m.call(cineBoleto, "setCineManager", [cineManager]);

  return { cineToken, cineBoleto, cineManager };
});