import { useEffect, useRef } from "react";
import { useInitializeSessionMutation } from "@/hooks/useInitializeSessionMutation";
import { useLoginMutation } from "@/hooks/useLoginMutation";
import { useNillion } from "@/hooks/useNillion";
import { usePersistedConnection } from "@/hooks/usePersistedConnection";
import { useSessionQuery } from "@/hooks/useSessionQuery";

export function AuthFlowManager() {
  const { state } = useNillion();
  const { hasStoredSession } = usePersistedConnection();
  const { isSuccess: isSessionReady } = useSessionQuery();
  const { mutate: initialize } = useInitializeSessionMutation();
  const { mutate: login } = useLoginMutation();
  const authFlowTriggeredRef = useRef(false);

  // Reset the auth flow trigger when user logs out (did becomes null)
  useEffect(() => {
    if (!state.did) {
      authFlowTriggeredRef.current = false;
    }
  }, [state.did]);

  // Trigger authentication flow when MetaMask is connected
  useEffect(() => {
    const isMetaMaskConnected = state.did && state.wallets.isMetaMaskConnected;
    if (isMetaMaskConnected && !isSessionReady && !authFlowTriggeredRef.current) {
      authFlowTriggeredRef.current = true;
      if (hasStoredSession) {
        login();
      } else {
        initialize();
      }
    }
  }, [state.did, state.wallets.isMetaMaskConnected, isSessionReady, hasStoredSession, login, initialize]);

  // This component only manages side effects, it doesn't render anything
  return null;
}

