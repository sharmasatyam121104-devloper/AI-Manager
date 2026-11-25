import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import { Toaster } from "./shared";
import Home from "./pages/Home";
import CreateAgent from "./pages/CreateAgent";
import NotFound from "./pages/NotFound";
import Agents from "./pages/Agents";
import Chat from "./pages/Chat";

const App = () => {
  return (
    <div className="App">
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/agents/new" element={<CreateAgent />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
