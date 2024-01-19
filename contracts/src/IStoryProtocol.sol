// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { ShortStrings, ShortString } from "openzeppelin-contracts/ShortStrings.sol";

/// @title Story Protocol Interface
interface IStoryProtocol {
    struct RegisterIPAssetParams {
        address owner;
        uint8 ipOrgAssetType;
        string name;
        bytes32 hash;
        string mediaUrl;
    }

    struct ParamValue {
        ShortString tag;
        bytes value;
    }

    struct LicenseCreation {
        /// Array of (tag, value) pairs for the parameters, corresponding to the tags in the
        /// licensing framework.
        ParamValue[] params;
        /// Parent license id, if any. 0 otherwise.
        uint256 parentLicenseId;
        /// Linked IPA id, if any. 0 otherwise.
        uint256 ipaId;
    }

    enum LicensorConfig {
        /// Null value.
        Unset,
        /// Licensor is the IP org owner, for all licenses.
        IpOrgOwnerAlways,
        /// Licensor will be:
        /// - If parentLicense is provided, the licensee of the parent license.
        /// - If parentLicense is not provided, the Owner of the linked IPA.
        /// - If no parentLicense and no linked IPA, the IP org owner.
        Source
    }

    struct LicensingConfig {
        /// The id of the licensing framework.
        string frameworkId;
        /// Array of (tag, value) pairs for the parameters, corresponding to the tags in the
        /// licensing framework.
        ParamValue[] params;
        /// Enum with the rules to determine the licensor for this IP org's licenses
        LicensorConfig licensor;
    }

    /// @notice Emits when a new IP asset is registered.
    /// @param ipAssetId_ The global IP asset identifier.
    /// @param name_ The assigned name for the IP asset.
    /// @param ipOrg_ The registering governing body for the IP asset.
    /// @param registrant_ The initial individual registrant of the IP asset.
    /// @param hash_ The content hash associated with the IP asset.
    event Registered(
        uint256 ipAssetId_,
        string name_,
        address indexed ipOrg_,
        address indexed registrant_,
        bytes32 hash_
    );

    function registerIpOrg(
        address owner_,
        string calldata name_,
        string calldata symbol_,
        string[] calldata ipAssetTypes_
    ) external returns (address ipOrg_);

    function configureIpOrgLicensing(address ipOrg_, LicensingConfig calldata config_) external;

    function createLicense(
        address ipOrg_,
        LicenseCreation calldata params_,
        bytes[] calldata preHooksData_,
        bytes[] calldata postHooksData_
    ) external returns (uint256);

    function activateLicense(address ipOrg_, uint256 licenseId_) external;

    function registerIPAsset(
        address ipOrg_,
        RegisterIPAssetParams calldata params_,
        uint256 licenseId_,
        bytes[] calldata preHooksData_,
        bytes[] calldata postHooksData_
    ) external returns (uint256, uint256);

    function transferIPAsset(
        address ipOrg_,
        address from_,
        address to_,
        uint256 ipAssetId_,
        bytes[] calldata preHooksData_,
        bytes[] calldata postHooksData_
    ) external;
}