import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CineService } from './services/cine';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { QRCodeComponent } from 'angularx-qrcode';
import { CINE_TOKEN_ADDRESS } from './constants/contratos';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, QRCodeComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  tokenAddressVisual: string = CINE_TOKEN_ADDRESS;
  walletConectada: string = '';
  cargando: boolean = false;

  vistaActual: string = 'catalogo'; 
  peliculas: any[] = [];
  peliculaSeleccionada: any = null;
  horarioSeleccionado: any = null;

  asientos: any[] = [];
  asientoSeleccionado: number | null = null;
  boletoComprado: boolean = false;
  asientoComprado: number | null = null;
  datosQR: string = '';

  // Variable para guardar los datos cuando se escanea un QR
  ticketEscaneado: any = null; 

  private firestore: Firestore = inject(Firestore);

  constructor(private cineService: CineService, private cdr: ChangeDetectorRef) {
    for (let i = 1; i <= 12; i++) {
      this.asientos.push({ id: i, ocupado: false });
    }
  }

  ngOnInit() {
    // 1. Revisamos si la URL trae los datos de un boleto escaneado
    const params = new URLSearchParams(window.location.search);
    
    if (params.get('ticket') === 'true') {
      // Entramos en modo "Validador"
      this.vistaActual = 'validador';
      this.ticketEscaneado = {
        pelicula: params.get('peli'),
        hora: params.get('hora'),
        asiento: params.get('asiento'),
        imagen: params.get('img'),
        fecha: new Date().toLocaleDateString() // Pone la fecha actual
      };
    } else {
      // 2. Si no es un escaneo, cargamos la página normal
      this.cargarPeliculas();
    }
  }

  async conectar() {
    try {
      this.walletConectada = await this.cineService.conectarWallet();
      this.cdr.detectChanges();
    } catch (error) {
      console.error("Error al conectar:", error);
    }
  }

  async obtenerTokens() {
    this.cargando = true;
    try {
      await this.cineService.reclamarTokensGratis();
      alert("🎁 ¡Felicidades! Se han depositado 100 CIN Tokens de prueba en tu billetera.");
    } catch (error: any) {
      // Recuerda poner aquí tu dirección real de administrador
      const ADMIN_WALLET = "0xF6df9...pega_tu_direccion_completa_aqui..."; 
      
      if (this.walletConectada.toLowerCase() === ADMIN_WALLET.toLowerCase()) {
        alert("⚠️ Alerta: Revisa que tengas suficiente SepoliaETH para pagar el gas.");
      } else {
        alert("ℹ️ Distribución Automática: Esta cuenta no es administradora. El dueño ya te ha transferido fondos.");
      }
    }
    this.cargando = false;
    this.cdr.detectChanges();
  }

  async cargarPeliculas() {
    try {
      const querySnapshot = await getDocs(collection(this.firestore, 'peliculas'));
      this.peliculas = querySnapshot.docs.map(doc => doc.data());
      this.cdr.detectChanges();
    } catch (error) {
      console.error("Error cargando películas:", error);
    }
  }

  verHorarios(pelicula: any) {
    this.peliculaSeleccionada = pelicula;
    this.vistaActual = 'horarios';
  }

  async verSala(horario: any) {
    this.horarioSeleccionado = horario;
    this.vistaActual = 'sala';
    this.asientoSeleccionado = null;
    this.boletoComprado = false;
    await this.cargarEstadoAsientos();
  }

  async cargarEstadoAsientos() {
    if (!this.walletConectada) return; 
    
    for (let asiento of this.asientos) {
      try {
        asiento.ocupado = await this.cineService.verificarAsiento(this.horarioSeleccionado.idFuncion, asiento.id);
      } catch (error) {
        console.error(`Error leyendo el asiento ${asiento.id}:`, error);
      }
    }
    this.cdr.detectChanges(); 
  }

  seleccionarAsiento(id: number, ocupado: boolean) {
    if (!ocupado) {
      this.asientoSeleccionado = id;
    }
  }

  async comprar() {
    if (this.asientoSeleccionado && this.horarioSeleccionado) {
      this.cargando = true;
      try {
        const idFuncion = this.horarioSeleccionado.idFuncion;
        const metadataURI = `https://micine.com/ticket/${idFuncion}/${this.asientoSeleccionado}`;
        this.asientoComprado = this.asientoSeleccionado;

        const recibo = await this.cineService.comprarBoletoNFT(idFuncion, this.asientoSeleccionado, metadataURI);

        // AQUÍ ARMAMOS LA URL DEL CÓDIGO QR
        // ⚠️ IMPORTANTE: Cuando subas esto a internet, cambia esta URL por tu dominio real
        const dominio = "https://micine.netlify.app"; 
        
        this.datosQR = `${dominio}/?ticket=true&peli=${encodeURIComponent(this.peliculaSeleccionada.titulo)}&hora=${encodeURIComponent(this.horarioSeleccionado.hora)}&asiento=${this.asientoComprado}&img=${encodeURIComponent(this.peliculaSeleccionada.imagen)}`;
        
        this.boletoComprado = true; 

        setTimeout(async () => {
          await this.cargarEstadoAsientos(); 
          this.cdr.detectChanges(); 
        }, 2500);

        this.asientoSeleccionado = null;

      } catch (error: any) {
        if (this.datosQR !== '') {
          this.boletoComprado = true;
        } else {
          const motivo = error.reason || error.shortMessage || error.message || "Fallo desconocido";
          alert("La transacción se detuvo. Motivo de la blockchain:\n\n" + motivo);
        }
      }
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  volver(vista: string) {
    this.vistaActual = vista;
    if (vista === 'catalogo') {
      this.peliculaSeleccionada = null;
      this.horarioSeleccionado = null;
      this.boletoComprado = false;
    }
  }
}