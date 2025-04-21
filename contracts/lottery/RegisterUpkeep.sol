// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";

struct RegistrationParams {
    string name;
    bytes encryptedEmail;
    address upkeepContract;
    uint32 gasLimit;
    address adminAddress;
    uint8 triggerType;
    bytes checkData;
    bytes triggerConfig;
    bytes offchainConfig;
    uint96 amount;
}

interface AutomationRegistrarInterface {
    function registerUpkeep(
        RegistrationParams calldata requestParams
    ) external returns (uint256);
}

contract RegisterUpkeep {
    error NotEnoughLINKAllowance();
    LinkTokenInterface public immutable i_link;
    AutomationRegistrarInterface public immutable i_registrar;

    constructor(
        LinkTokenInterface link,
        AutomationRegistrarInterface registrar
    ) {
        i_link = link;
        i_registrar = registrar;
    }

    event NewUpkeep(uint256 _upkeepId);

    function registerAndPredictID(
        string memory _name,
        address _contractAddress,
        uint _linksToSend
    ) external {
        uint96 LINKS_TO_SEND = uint96(_linksToSend);

        RegistrationParams memory params = RegistrationParams({
            name: _name,
            encryptedEmail: "",
            upkeepContract: _contractAddress,
            gasLimit: 100000,
            adminAddress: msg.sender,
            triggerType: 0,
            checkData: "",
            triggerConfig: "",
            offchainConfig: "",
            amount: LINKS_TO_SEND
        });
        i_link.approve(address(i_registrar), params.amount);

        uint256 upkeepId = i_registrar.registerUpkeep(params);
        emit NewUpkeep(upkeepId);
    }
}
