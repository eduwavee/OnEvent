import { Navbar } from "./components/Navbar";
import { AppRouter } from "./router";

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <AppRouter />
      </main>
    </div>
  );
}
