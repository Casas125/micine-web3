import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import { 
  CINE_MANAGER_ADDRESS, CINE_MANAGER_ABI, 
  CINE_TOKEN_ADDRESS, CINE_TOKEN_ABI 
} from '../constants/contratos';

@Injectable({
  providedIn: 'root'
})
export class CineService {
  private provider: any;
  private signer: any;
  private userAddress: string = '';

  constructor() {
    // Verificar si MetaMask está instalado
    if ((window as any).ethereum) {
      this.provider = new ethers.BrowserProvider((window as any).ethereum);
    } else {
      console.warn("MetaMask no está instalado. Instálalo para usar esta DApp.");
    }
  }

  // 1. Conectar la Wallet de MetaMask
  async conectarWallet(): Promise<string> {
    if (!this.provider) throw new Error("MetaMask no detectado");
    
    // Solicitar acceso a las cuentas
    await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
    this.signer = await this.provider.getSigner();
    this.userAddress = await this.signer.getAddress();
    
    return this.userAddress;
  }

  // 2. Consultar si un asiento específico está ocupado
  async verificarAsiento(idFuncion: number, idAsiento: number): Promise<boolean> {
    const contratoManager = new ethers.Contract(CINE_MANAGER_ADDRESS, CINE_MANAGER_ABI, this.provider) as any;
    const ocupado = await contratoManager.verificarAsiento(idFuncion, idAsiento);
    return ocupado;
  }

  // 3. Flujo Completo de Compra (Aprobar Token + Comprar Boleto NFT)
  async comprarBoletoNFT(idFuncion: number, idAsiento: number, metadataURI: string) {
    if (!this.signer) await this.conectarWallet();

    const contratoToken = new ethers.Contract(CINE_TOKEN_ADDRESS, CINE_TOKEN_ABI, this.signer) as any;
    const contratoManager = new ethers.Contract(CINE_MANAGER_ADDRESS, CINE_MANAGER_ABI, this.signer) as any;

    const precio = await contratoManager.precioBoleto();

    console.log("Paso 1: Solicitando aprobación de CineTokens...");
    const txAprobar = await contratoToken.approve(CINE_MANAGER_ADDRESS, precio);
    await txAprobar.wait(); 
    console.log("Aprobación concedida.");

    console.log("Paso 2: Procesando la compra del boleto NFT...");
    const txCompra = await contratoManager.comprarBoleto(idFuncion, idAsiento, metadataURI);
    const recibo = await txCompra.wait();
    console.log("¡Compra exitosa! Bloque minado:", recibo.blockNumber);
    
    return recibo;
  }

  // 4. Faucet para reclamar 100 CIN Tokens gratis en Sepolia
  async reclamarTokensGratis(): Promise<any> {
    if (!this.signer) await this.conectarWallet();

    const contratoToken = new ethers.Contract(CINE_TOKEN_ADDRESS, CINE_TOKEN_ABI, this.signer) as any;
    
    console.log("Solicitando 100 CIN Tokens al Faucet...");
    const cantidad = ethers.parseEther("100"); 
    
    try {
      if (typeof contratoToken.faucet === 'function') {
        const tx = await contratoToken.faucet(cantidad);
        return await tx.wait();
      } else {
        const tx = await contratoToken.mint(this.userAddress, cantidad);
        return await tx.wait();
      }
    } catch (error) {
      console.error("Error en Faucet automatizado:", error);
      throw new Error("El contrato no permite la auto-acuñación pública.");
    }
  }
}