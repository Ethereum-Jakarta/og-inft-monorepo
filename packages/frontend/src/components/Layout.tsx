import { Link, Outlet } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-bold text-white">
              0G INFT
            </Link>
            <nav className="flex gap-6">
              <Link to="/" className="text-gray-300 hover:text-white transition">
                Home
              </Link>
              <Link to="/mint" className="text-gray-300 hover:text-white transition">
                Mint
              </Link>
              <Link to="/my-infts" className="text-gray-300 hover:text-white transition">
                My INFTs
              </Link>
              <Link to="/chat" className="text-gray-300 hover:text-white transition">
                Chat
              </Link>
            </nav>
          </div>

          <ConnectButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          0G Agent INFT - Intelligent NFTs powered by 0G Network
        </div>
      </footer>
    </div>
  );
}
