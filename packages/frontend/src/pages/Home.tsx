import { Link } from "react-router-dom";
import { useAccount } from "wagmi";

export function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center py-16">
        <h1 className="text-5xl font-bold mb-4">0G Agent INFT</h1>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Create, manage, and interact with Intelligent NFTs powered by 0G Network.
          Each INFT contains encrypted AI configurations that can be used for inference.
        </p>
        {isConnected ? (
          <div className="flex gap-4 justify-center">
            <Link
              to="/mint"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
            >
              Mint INFT
            </Link>
            <Link
              to="/my-infts"
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition"
            >
              View My INFTs
            </Link>
          </div>
        ) : (
          <p className="text-gray-500">Connect your wallet to get started</p>
        )}
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="text-3xl mb-4">🎨</div>
          <h3 className="text-xl font-semibold mb-2">Create INFTs</h3>
          <p className="text-gray-400">
            Mint intelligent NFTs with encrypted AI configurations. Each INFT can
            contain unique agent personalities and capabilities.
          </p>
        </div>
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="text-3xl mb-4">🔐</div>
          <h3 className="text-xl font-semibold mb-2">Manage Access</h3>
          <p className="text-gray-400">
            Control who can use your INFT. Authorize specific addresses to access
            the AI capabilities without transferring ownership.
          </p>
        </div>
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="text-3xl mb-4">💬</div>
          <h3 className="text-xl font-semibold mb-2">Chat & Inference</h3>
          <p className="text-gray-400">
            Interact with your INFT through a chat interface. Run AI inference
            powered by 0G Compute with on-chain authorization.
          </p>
        </div>
      </section>
    </div>
  );
}
