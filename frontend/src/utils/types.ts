export type PostCreatedEvent = {
    args: {
        postParams: {
            profileId: number;
            contentURI: string;
            actionModules: string[];
            actionModulesInitDatas: string[];
            referenceModule: string;
            referenceModuleInitData: string;
        };
        pubId: number;
        actionModulesInitReturnDatas: string[];
        referenceModuleInitReturnData: string;
        transactionExecutor: string;
        timestamp: number;
    };
    blockNumber: number;
    transactionHash: string;
};

export type PostCreatedEventFormatted = {
    args: {
        postParams: {
            profileId: string;
            contentURI: string;
            actionModules: string[];
            actionModulesInitDatas: string[];
            referenceModule: string;
            referenceModuleInitData: string;
        };
        pubId: string;
        actionModulesInitReturnDatas: string[];
        referenceModuleInitReturnData: string;
        transactionExecutor: string;
        timestamp: string;
    };
    blockNumber: string;
    transactionHash: string;
    ipAssetMintedEvent ?: IPAssetMintedEventFormatted;
};

export type IPAssetMintedEvent = {
    args: {
        ipOrgId: string;
        globalId: bigint;
        localId: bigint;
    }
    blockNumber: number;
    transactionHash: string;
}

export type IPAssetMintedEventFormatted = {
    args: {
        ipOrgId: string;
        globalId: string;
        localId: string;
    }
    blockNumber: string;
    transactionHash: string;
}

export function convertPostEventToSerializable(
    event: PostCreatedEvent
): PostCreatedEventFormatted {
    return {
        ...event,
        args: {
            ...event.args,
            postParams: {
                ...event.args.postParams,
                profileId: event.args.postParams.profileId.toString(),
            },
            pubId: event.args.pubId.toString(),
            timestamp: event.args.timestamp.toString(),
        },
        blockNumber: event.blockNumber.toString(),
    };
}

export function convertIPAssetMintedEventToSerializable(
    event: IPAssetMintedEvent
): IPAssetMintedEventFormatted {
    return {
        args: {
            ipOrgId: event.args.ipOrgId,
            globalId: event.args.globalId.toString(),
            localId: event.args.localId.toString(),
        },
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber.toString(),
    };
}

export type LoginData = {
    handle: {
        localName: string;
    };
    id: string;
    ownedBy: {
        address: string;
    };
};