import { ReactNode, FC, useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import LensHelloWorldContext from "./LensHelloWorldContext";
import {
  IPAssetMintedEvent,
  IPAssetMintedEventFormatted,
  PostCreatedEvent,
  PostCreatedEventFormatted,
  convertPostEventToSerializable,
  convertIPAssetMintedEventToSerializable,
  LoginData,
} from "../utils/types";
import { network, uiConfig } from "../utils/constants";
import { publicClient } from "../main";
import { lensHubEventsAbi } from "../utils/lensHubEventsAbi";
import { helloWorldAbi } from "../utils/helloWorldAbi";
import { disconnect } from "wagmi/actions";

interface LensHelloWorldProviderProps {
  children: ReactNode;
}

export const LensHelloWorldProvider: FC<LensHelloWorldProviderProps> = ({
  children,
}) => {
  const [handle, setHandle] = useState<string | undefined>();
  const [profileId, setProfileId] = useState<number | undefined>();
  const { address } = useAccount();
  const [posts, setPosts] = useState<PostCreatedEventFormatted[]>([]);
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState<LoginData>();

  const connect = (loginDataParam: LoginData) => {
    setLoginData(loginDataParam);
  };

  const chainId = network === "polygon" ? 137 : 80001;

  const refresh = useCallback(async () => {
    setLoading(true);

    const savedCurrentBlock = localStorage.getItem("currentBlock");
    const savedPostEvents: PostCreatedEventFormatted[] = JSON.parse(
      localStorage.getItem("postEvents") || "[]"
    );

    if (savedPostEvents.length) {
      setPosts(savedPostEvents);
    }

    const startBlock = savedCurrentBlock
      ? parseInt(savedCurrentBlock)
      : uiConfig.openActionContractStartBlock;

    const currentBlock = await publicClient({
      chainId,
    }).getBlockNumber();

    const postEventsMap = new Map(
      savedPostEvents.map((event) => [event.transactionHash, event])
    );

    for (let i = startBlock; i < currentBlock; i += 20000) {
      const toBlock = i + 19999 > currentBlock ? currentBlock : i + 19999;

      const postEvents = await publicClient({
        chainId: network === "polygon" ? 137 : 80001,
      }).getContractEvents({
        address: uiConfig.lensHubProxyAddress,
        abi: lensHubEventsAbi,
        eventName: "PostCreated",
        fromBlock: BigInt(i),
        toBlock: BigInt(toBlock),
      });

      const helloWorldEvents = await publicClient({
        chainId,
      }).getContractEvents({
        address: uiConfig.helloWorldContractAddress,
        abi: helloWorldAbi,
        eventName: "IPAssetMinted",
        fromBlock: BigInt(i),
        toBlock: BigInt(toBlock),
      });

      const postEventsParsed = postEvents as unknown as PostCreatedEvent[];
      const helloWorldEventsParsed =
        helloWorldEvents as unknown as IPAssetMintedEvent[];

      const filteredEvents = postEventsParsed.filter((event) => {
        return event.args.postParams.actionModules.includes(
          uiConfig.openActionContractAddress
        );
      });

      const serializablePostEvents = filteredEvents.map((event) =>
        convertPostEventToSerializable(event)
      );

      const serializableIPAssetMintedEvents = helloWorldEventsParsed.map((event) =>
        convertIPAssetMintedEventToSerializable(event)
      );

      const serializableIPAssetMap:Record<string, IPAssetMintedEventFormatted> = {}
      serializableIPAssetMintedEvents.forEach(it=> serializableIPAssetMap[it.transactionHash] = it)

      serializablePostEvents.forEach((event) =>{
        event.ipAssetMintedEvent = serializableIPAssetMap[event.transactionHash]
        postEventsMap.set(event.transactionHash, event)
      });
    }

    const allPostEvents = Array.from(postEventsMap.values());

    localStorage.setItem("currentBlock", currentBlock.toString());
    localStorage.setItem("postEvents", JSON.stringify(allPostEvents));

    setPosts(allPostEvents);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (loginData) {
      setHandle(loginData!.handle!.localName);
      setProfileId(parseInt(loginData!.id, 16));

      localStorage.setItem("handle", loginData!.handle!.localName);
      localStorage.setItem("profileId", loginData!.id);
      localStorage.setItem("address", loginData.ownedBy.address);
    }
  }, [loginData]);

  // Set handle and profile
  useEffect(() => {
    const storedHandle = localStorage.getItem("handle");
    const storedProfileId = localStorage.getItem("profileId");
    const storedAddress = localStorage.getItem("address");

    if (storedHandle && address === storedAddress) {
      setHandle(storedHandle);
    } else {
      setHandle(undefined);
    }

    if (storedProfileId && address === storedAddress) {
      setProfileId(parseInt(storedProfileId, 16));
    } else {
      setProfileId(undefined);
    }
  }, [address]);

  return (
    <LensHelloWorldContext.Provider
      value={{
        profileId,
        handle,
        address,
        posts,
        refresh,
        clear: () => {
          setProfileId(undefined);
          setHandle(undefined);
        },
        disconnect: () => {
          disconnect();
          localStorage.removeItem("handle");
          localStorage.removeItem("profileId");
          localStorage.removeItem("address");
        },
        loading,
        connect,
      }}
    >
      {children}
    </LensHelloWorldContext.Provider>
  );
};
