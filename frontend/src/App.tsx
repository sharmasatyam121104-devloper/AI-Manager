import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import { Toaster } from "./shared";
import Home from "./pages/Home";

const App = () => {
  return (
    <div className="App">
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
