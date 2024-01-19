// LensHelloWorldContext.tsx
import React, { useContext } from "react";
import { LoginData, PostCreatedEventFormatted } from "../utils/types";

interface LensHelloWorldContextState {
  profileId?: number;
  handle?: string;
  address?: `0x${string}`;
  posts: PostCreatedEventFormatted[];
  refresh: () => void;
  clear: () => void;
  loading: boolean;
  disconnect: () => void;
  connect: (loginData: LoginData) => void;
}

const LensHelloWorldContext = React.createContext<LensHelloWorldContextState>(
  { clear: () => { }, posts: [], refresh: () => { }, loading: false, disconnect: () => { }, connect: () => { } }
);

export const useLensHelloWorld = (): LensHelloWorldContextState => {
  return useContext(LensHelloWorldContext);
};

export default LensHelloWorldContext;
