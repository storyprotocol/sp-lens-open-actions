export const helloWorldAbi = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "ipOrgId",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "globalId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "localId",
                "type": "uint256"
            }
        ],
        "name": "IPAssetMinted",
        "type": "event"
    }
] as const;