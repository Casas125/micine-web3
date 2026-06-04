// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Interfaces mínimas para interactuar con tus otros contratos
interface ICineToken {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

interface ICineBoleto {
    function mintBoleto(address to, string memory uri) external;
}

contract CineManager {
    ICineToken public token;
    ICineBoleto public nft;

    // El precio de cada boleto (10 CIN Tokens, asumiendo 18 decimales estándar)
    uint256 public precioBoleto = 10 * (10 ** 18);

    // Mapeo Doble: idFuncion -> idAsiento -> estaOcupado
    // Ejemplo: asientosOcupados[101][12] = true (El asiento 12 de la función 101 está ocupado)
    mapping(uint256 => mapping(uint256 => bool)) public asientosOcupados;

    // Constructor que enlaza este manager con tus contratos de Token y NFT
    constructor(address _tokenAddress, address _nftAddress) {
        token = ICineToken(_tokenAddress);
        nft = ICineBoleto(_nftAddress);
    }

    // Función que Angular llama (view) para pintar los asientos de rojo o verde
    function verificarAsiento(uint256 _idFuncion, uint256 _idAsiento) external view returns (bool) {
        return asientosOcupados[_idFuncion][_idAsiento];
    }

    // Función principal que ejecuta la compra desde la web
    function comprarBoleto(uint256 _idFuncion, uint256 _idAsiento, string memory _metadataURI) external {
        // 1. Verificamos que el asiento esté libre en esa función específica
        require(!asientosOcupados[_idFuncion][_idAsiento], "El asiento ya esta vendido para esta funcion");

        // 2. Cobramos los 10 CIN Tokens al usuario 
        // (Nota: el usuario ya debió haber firmado un 'approve' en Angular para permitir este cobro)
        require(token.transferFrom(msg.sender, address(this), precioBoleto), "Fallo el pago con tokens CIN");

        // 3. Marcamos el asiento como ocupado para que nadie más lo pueda comprar
        asientosOcupados[_idFuncion][_idAsiento] = true;

        // 4. Le ordenamos al contrato CineBoleto que imprima el NFT y se lo envíe al usuario
        nft.mintBoleto(msg.sender, _metadataURI);
    }
}