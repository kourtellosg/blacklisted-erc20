// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Blacklist} from "./Blacklist.sol";

contract BlacklistERC20 is ERC20, Blacklist {
    error AccountBlacklisted();

    constructor(
        uint256 supply,
        address defaultAdmin
    ) ERC20("Blacklist ERC20", "BLT") Blacklist(defaultAdmin) {
        _mint(defaultAdmin, supply);
    }

    function _update(
        address from,
        address to,
        uint256 value
    ) internal override {
        if (isBlacklisted(from)) revert AccountBlacklisted();
        super._update(from, to, value);
    }
}
