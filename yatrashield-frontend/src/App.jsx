import Sidebar from "./components/Sidebar";
import TouristDashboard from "./pages/TouristDashboard";

function App() {
  return (
    <div className="app">
      <Sidebar />

      <main className="main-content">
        <TouristDashboard />
      </main>
    </div>
  );
}

export default App;