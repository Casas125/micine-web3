// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract CineBoleto is ERC721URIStorage {
    uint256 private _nextTokenId;
    address public cineManager;

    constructor() ERC721("CineBoleto", "TKT") {
        cineManager = msg.sender; // El Manager será quien autorice la creación
    }

    // Solo el contrato principal (CineManager) podrá mintear boletos
    function mintBoleto(address pasajero, string memory tokenURI) external returns (uint256) {
        require(msg.sender == cineManager, "Solo el CineManager puede emitir boletos");
        
        uint256 tokenId = _nextTokenId++;
        _mint(pasajero, tokenId);
        _setTokenURI(tokenId, tokenURI); // Aquí guardamos qué película y asiento es
        
        return tokenId;
    }
    // Función para actualizar quién es el manager autorizado
    function setCineManager(address _nuevoManager) external {
        require(msg.sender == cineManager, "Solo el jefe actual puede cambiar al manager");
        cineManager = _nuevoManager;
    }
}