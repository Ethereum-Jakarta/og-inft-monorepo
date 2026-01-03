import { useState, useEffect, useCallback } from "react";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import toast from "react-hot-toast";
import { parseAbiItem, type Address } from "viem";
import { CONTRACTS } from "../config/contracts";
import { AgentNFTAbi } from "../contracts/AgentNFT";

// Hook to fetch user's tokens from events
function useUserTokens(userAddress: Address | undefined) {
  const publicClient = usePublicClient();
  const [ownedTokens, setOwnedTokens] = useState<number[]>([]);
  const [authorizedTokens, setAuthorizedTokens] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTokens = useCallback(async () => {
    if (!publicClient || !userAddress) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch Minted events where user is the owner
      const mintedLogs = await publicClient.getLogs({
        address: CONTRACTS.AgentNFT,
        event: parseAbiItem("event Minted(uint256 indexed _tokenId, address indexed _creator, address indexed _owner)"),
        args: { _owner: userAddress },
        fromBlock: 0n,
        toBlock: "latest",
      });

      // Fetch Authorization events where user was authorized
      const authLogs = await publicClient.getLogs({
        address: CONTRACTS.AgentNFT,
        event: parseAbiItem("event Authorization(address indexed _from, address indexed _to, uint256 indexed _tokenId)"),
        args: { _to: userAddress },
        fromBlock: 0n,
        toBlock: "latest",
      });

      // Get unique token IDs from minted events
      const mintedTokenIds = [...new Set(mintedLogs.map((log) => Number(log.args._tokenId)))];

      // Get unique token IDs from auth events
      const authTokenIds = [...new Set(authLogs.map((log) => Number(log.args._tokenId)))];

      setOwnedTokens(mintedTokenIds);
      setAuthorizedTokens(authTokenIds.filter((id) => !mintedTokenIds.includes(id)));
    } catch (error) {
      console.error("Failed to fetch tokens:", error);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, userAddress]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  return { ownedTokens, authorizedTokens, isLoading, refetch: fetchTokens };
}

function INFTCard({ tokenId }: { tokenId: number }) {
  const { address } = useAccount();
  const [newAuthorizedAddress, setNewAuthorizedAddress] = useState("");
  const [showManage, setShowManage] = useState(false);

  // Read token data
  const { data: owner } = useReadContract({
    address: CONTRACTS.AgentNFT,
    abi: AgentNFTAbi,
    functionName: "ownerOf",
    args: [BigInt(tokenId)],
  });

  const { data: authorizedUsers, refetch: refetchAuthorized } = useReadContract({
    address: CONTRACTS.AgentNFT,
    abi: AgentNFTAbi,
    functionName: "authorizedUsersOf",
    args: [BigInt(tokenId)],
  });

  const { data: intelligentData } = useReadContract({
    address: CONTRACTS.AgentNFT,
    abi: AgentNFTAbi,
    functionName: "intelligentDatasOf",
    args: [BigInt(tokenId)],
  });

  // Write functions
  const {
    data: authorizeHash,
    writeContract: authorize,
    isPending: isAuthorizePending,
    error: authorizeError,
  } = useWriteContract();
  const {
    data: revokeHash,
    writeContract: revoke,
    isPending: isRevokePending,
    error: revokeError,
  } = useWriteContract();

  const { isLoading: isAuthorizing, isSuccess: isAuthorizeSuccess } = useWaitForTransactionReceipt({
    hash: authorizeHash,
  });
  const { isLoading: isRevoking, isSuccess: isRevokeSuccess } = useWaitForTransactionReceipt({
    hash: revokeHash,
  });

  const toastIdAuthorize = `authorize-${tokenId}`;
  const toastIdRevoke = `revoke-${tokenId}`;

  // Authorize toast notifications
  useEffect(() => {
    if (isAuthorizePending) {
      toast.loading("Waiting for wallet confirmation...", { id: toastIdAuthorize });
    }
  }, [isAuthorizePending, toastIdAuthorize]);

  useEffect(() => {
    if (authorizeHash && isAuthorizing) {
      toast.loading("Authorizing user...", { id: toastIdAuthorize });
    }
  }, [authorizeHash, isAuthorizing, toastIdAuthorize]);

  useEffect(() => {
    if (isAuthorizeSuccess) {
      toast.success("User authorized successfully!", { id: toastIdAuthorize, duration: 4000 });
      refetchAuthorized();
    }
  }, [isAuthorizeSuccess, toastIdAuthorize, refetchAuthorized]);

  useEffect(() => {
    if (authorizeError) {
      toast.error(authorizeError.message.split("\n")[0], { id: toastIdAuthorize, duration: 4000 });
    }
  }, [authorizeError, toastIdAuthorize]);

  // Revoke toast notifications
  useEffect(() => {
    if (isRevokePending) {
      toast.loading("Waiting for wallet confirmation...", { id: toastIdRevoke });
    }
  }, [isRevokePending, toastIdRevoke]);

  useEffect(() => {
    if (revokeHash && isRevoking) {
      toast.loading("Revoking authorization...", { id: toastIdRevoke });
    }
  }, [revokeHash, isRevoking, toastIdRevoke]);

  useEffect(() => {
    if (isRevokeSuccess) {
      toast.success("Authorization revoked!", { id: toastIdRevoke, duration: 4000 });
      refetchAuthorized();
    }
  }, [isRevokeSuccess, toastIdRevoke, refetchAuthorized]);

  useEffect(() => {
    if (revokeError) {
      toast.error(revokeError.message.split("\n")[0], { id: toastIdRevoke, duration: 4000 });
    }
  }, [revokeError, toastIdRevoke]);

  const isOwner = owner?.toLowerCase() === address?.toLowerCase();

  const handleAuthorize = () => {
    if (!newAuthorizedAddress) return;
    authorize({
      address: CONTRACTS.AgentNFT,
      abi: AgentNFTAbi,
      functionName: "authorizeUsage",
      args: [BigInt(tokenId), newAuthorizedAddress as Address],
    });
    setNewAuthorizedAddress("");
  };

  const handleRevoke = (userAddress: Address) => {
    revoke({
      address: CONTRACTS.AgentNFT,
      abi: AgentNFTAbi,
      functionName: "revokeAuthorization",
      args: [BigInt(tokenId), userAddress],
    });
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold">INFT #{tokenId}</h3>
          <p className="text-sm text-gray-400">
            {intelligentData?.[0]?.dataDescription || "No description"}
          </p>
        </div>
        {isOwner && (
          <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded">
            Owner
          </span>
        )}
      </div>

      {/* Data Hash */}
      <div className="mb-4">
        <p className="text-xs text-gray-500">Data Hash:</p>
        <p className="text-xs font-mono text-gray-400 truncate">
          {intelligentData?.[0]?.dataHash}
        </p>
      </div>

      {/* Authorized Users */}
      <div className="mb-4">
        <p className="text-sm text-gray-400 mb-2">
          Authorized Users: {authorizedUsers?.length || 0}
        </p>
        {authorizedUsers && authorizedUsers.length > 0 && (
          <div className="space-y-1">
            {authorizedUsers.map((user) => (
              <div
                key={user}
                className="flex items-center justify-between bg-gray-700 rounded px-3 py-2"
              >
                <span className="text-xs font-mono">
                  {user.slice(0, 8)}...{user.slice(-6)}
                </span>
                {isOwner && (
                  <button
                    onClick={() => handleRevoke(user)}
                    disabled={isRevokePending || isRevoking}
                    className="text-xs text-red-400 hover:text-red-300 disabled:text-gray-500"
                  >
                    {isRevoking ? "..." : "Revoke"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Management (Owner Only) */}
      {isOwner && (
        <div>
          <button
            onClick={() => setShowManage(!showManage)}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            {showManage ? "Hide" : "Manage"} Access
          </button>

          {showManage && (
            <div className="mt-4 space-y-3">
              <input
                type="text"
                value={newAuthorizedAddress}
                onChange={(e) => setNewAuthorizedAddress(e.target.value)}
                placeholder="0x... address to authorize"
                className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 text-sm"
              />
              <button
                onClick={handleAuthorize}
                disabled={isAuthorizePending || isAuthorizing || !newAuthorizedAddress}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-sm"
              >
                {isAuthorizePending ? "Confirm in wallet..." : isAuthorizing ? "Authorizing..." : "Authorize User"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function MyINFTs() {
  const { address, isConnected } = useAccount();
  const { ownedTokens, authorizedTokens, isLoading, refetch } = useUserTokens(address);

  if (!isConnected) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-4">Connect Wallet</h2>
        <p className="text-gray-400">Please connect your wallet to view your INFTs</p>
      </div>
    );
  }

  const hasTokens = ownedTokens.length > 0 || authorizedTokens.length > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My INFTs</h1>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 rounded-lg text-sm transition"
        >
          {isLoading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-16">
          <p className="text-gray-400">Loading your INFTs...</p>
        </div>
      ) : !hasTokens ? (
        <div className="text-center py-16">
          <p className="text-gray-400">No INFTs found. Mint your first INFT to get started!</p>
        </div>
      ) : (
        <>
          {/* Owned Tokens */}
          {ownedTokens.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-300">
                Owned ({ownedTokens.length})
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ownedTokens.map((tokenId) => (
                  <INFTCard key={tokenId} tokenId={tokenId} />
                ))}
              </div>
            </div>
          )}

          {/* Authorized Tokens */}
          {authorizedTokens.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-300">
                Authorized Access ({authorizedTokens.length})
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {authorizedTokens.map((tokenId) => (
                  <INFTCard key={tokenId} tokenId={tokenId} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
