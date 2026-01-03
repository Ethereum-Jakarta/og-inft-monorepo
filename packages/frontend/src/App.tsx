import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Mint } from "./pages/Mint";
import { MyINFTs } from "./pages/MyINFTs";
import { Chat } from "./pages/Chat";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="mint" element={<Mint />} />
        <Route path="my-infts" element={<MyINFTs />} />
        <Route path="chat" element={<Chat />} />
      </Route>
    </Routes>
  );
}

export default App;
