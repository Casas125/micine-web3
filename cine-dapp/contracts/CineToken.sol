// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CineToken is ERC20 {
    constructor() ERC20("CineToken", "CIN") {
        // Le damos 1 millón de tokens al creador del contrato para que los distribuya
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
}