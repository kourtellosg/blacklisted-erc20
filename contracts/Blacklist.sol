// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Multicall} from "@openzeppelin/contracts/utils/Multicall.sol";

contract Blacklist is AccessControl, Multicall {
    mapping(address => bool) private blacklisted;

    bytes32 public constant BLACKLIST_ROLE = keccak256("BLACKLIST_ROLE");

    event AddedToBlacklist(address account);
    event RemovedFromBlacklist(address account);

    error ZeroAddressCannotBlacklisted();
    error AccountAlreadyBlacklisted();
    error AccountNotBlacklisted();

    constructor(address defaultAdmin) {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(BLACKLIST_ROLE, defaultAdmin);
    }

    function addToBlacklist(address account) public onlyRole(BLACKLIST_ROLE) {
        if (account == address(0)) revert ZeroAddressCannotBlacklisted();
        if (blacklisted[account]) revert AccountAlreadyBlacklisted();
        _addToBlacklist(account);
    }

    function removeFromBlacklist(
        address account
    ) public onlyRole(BLACKLIST_ROLE) {
        if (!blacklisted[account]) revert AccountNotBlacklisted();
        _removeFromBlacklist(account);
    }

    function batchBlacklist(
        address[] memory accounts,
        bool toBeBlacklisted
    ) public onlyRole(BLACKLIST_ROLE) {
        for (uint i; i < accounts.length; ++i) {
            toBeBlacklisted
                ? _addToBlacklist(accounts[i])
                : _removeFromBlacklist(accounts[i]);
        }
    }

    function isBlacklisted(address account) public view returns (bool) {
        return _isBlacklisted(account);
    }

    function _addToBlacklist(address account) internal {
        blacklisted[account] = true;
        emit AddedToBlacklist(account);
    }

    function _removeFromBlacklist(address account) internal {
        blacklisted[account] = false;
        emit RemovedFromBlacklist(account);
    }

    function _isBlacklisted(address account) internal view returns (bool) {
        return blacklisted[account];
    }
}
