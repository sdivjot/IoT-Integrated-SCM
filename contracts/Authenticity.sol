// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.21 <0.9.0;

contract Authenticity {
    struct AuthenticityRecord {
        uint256 evidenceId;
        uint256 productId;
        string iotTagId;
        bytes32 digitalFingerprint;
        string location;
        uint256 timestamp;
        string metadata;
    }
    
    // Mapping from productId to an array of authenticity records
    mapping(uint256 => AuthenticityRecord[]) public authenticityRecords;
    
    // Event to log new authenticity evidence
    event AuthenticityLogged(
        uint256 indexed productId,
        uint256 evidenceId,
        string iotTagId,
        bytes32 digitalFingerprint,
        string location,
        uint256 timestamp,
        string metadata
    );
    
    // Function to log authenticity data
    function logAuthenticityData(
        uint256 productId,
        string memory iotTagId,
        bytes32 digitalFingerprint,
        string memory location,
        uint256 timestamp,
        string memory metadata
    ) public {
        uint256 evidenceId = authenticityRecords[productId].length;
        authenticityRecords[productId].push(AuthenticityRecord({
            evidenceId: evidenceId,
            productId: productId,
            iotTagId: iotTagId,
            digitalFingerprint: digitalFingerprint,
            location: location,
            timestamp: timestamp,
            metadata: metadata
        }));
        emit AuthenticityLogged(productId, evidenceId, iotTagId, digitalFingerprint, location, timestamp, metadata);
    }
}
