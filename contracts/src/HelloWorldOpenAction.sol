// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {HubRestricted} from 'lens/HubRestricted.sol';
import {Types} from 'lens/Types.sol';
import {IPublicationActionModule} from 'lens/IPublicationActionModule.sol';
import {LensModuleMetadata} from 'lens/LensModuleMetadata.sol';
import {IStoryProtocol} from './IStoryProtocol.sol';

contract HelloWorldOpenAction is HubRestricted, IPublicationActionModule, LensModuleMetadata {
    mapping(uint256 profileId => mapping(uint256 pubId => string initMessage)) internal _initMessages;
    IStoryProtocol internal _iStoryProtocol;

    event IPAssetMinted(address ipOrgId, uint256 globalId, uint256 localId);
    event IPOrgRegisted(address ipOrgId);
    
    constructor(address lensHubProxyContract, address storyContract, address moduleOwner) HubRestricted(lensHubProxyContract) LensModuleMetadata(moduleOwner) {
        _iStoryProtocol = IStoryProtocol(storyContract);
    }

    function supportsInterface(bytes4 interfaceID) public pure override returns (bool) {
        return interfaceID == type(IPublicationActionModule).interfaceId || super.supportsInterface(interfaceID);
    }

    function initializePublicationAction(
        uint256 profileId,
        uint256 pubId,
        address /* transactionExecutor */,
        bytes calldata data
    ) external override onlyHub returns (bytes memory) {
        string memory initMessage = abi.decode(data, (string));

        _initMessages[profileId][pubId] = initMessage;

        bytes memory combinedIPOrgName = abi.encodePacked("Lens Post");
        bytes memory combinedMessage = abi.encodePacked(initMessage);
        bytes memory combinedMetaUrl = abi.encodePacked("https://hey.xyz/posts/",pubId);
        string[] memory ipAssetTypes_ = new string[](2);
        ipAssetTypes_[0] = "STORY";
        ipAssetTypes_[1] = "ITEM";

        // create IPOrg
        address ipOrg = _iStoryProtocol.registerIpOrg(
            address(this),
            string(combinedIPOrgName),
            "LENS",
            ipAssetTypes_
        );

        emit IPOrgRegisted(ipOrg);

        // configure IPOrg license
        _iStoryProtocol.configureIpOrgLicensing(
            ipOrg,
            IStoryProtocol.LicensingConfig(
                "SPUML-1.0",
                new IStoryProtocol.ParamValue[](0),
                IStoryProtocol.LicensorConfig.IpOrgOwnerAlways
            )
        );

         // register IP asset
        (uint256 globalId, uint256 localId) = _iStoryProtocol.registerIPAsset(
            ipOrg,
            IStoryProtocol.RegisterIPAssetParams(
                address(this),
                0,
                string(combinedMessage),
                0x0000000000000000000000000000000000000000000000000000000000000000,
                string(combinedMetaUrl)
            ),
            0,
            new bytes[](0),
            new bytes[](0)
        );

        // transfer IP asset to user
        // _iStoryProtocol.transferIPAsset(
        //     ipOrg,
        //     address(this),
        //     msg.sender,
        //     globalId,
        //     new bytes[](0),
        //     new bytes[](0)
        // );

        // sent event
        emit IPAssetMinted(ipOrg, globalId, localId);

        return data;
    }

    function processPublicationAction(
        Types.ProcessActionParams calldata params
    ) external override onlyHub returns (bytes memory) {
        string memory initMessage = _initMessages[params.publicationActedProfileId][params.publicationActedId];
        (string memory actionMessage) = abi.decode(params.actionModuleData, (string));

        bytes memory combinedMessage = abi.encodePacked(initMessage, " ", actionMessage);

        emit IPAssetMinted(address(this), 666, 888);
        
        return combinedMessage;
    }
}