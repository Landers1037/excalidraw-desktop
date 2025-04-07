import { useState, useEffect } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import "./App.css";

function App() {
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  const [appState, setAppState] = useState({});
  const [elements, setElements] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    window.EXCALIDRAW_ASSET_PATH = "/";

    window.addEventListener("beforeunload", () => {
      localStorage.setItem("excalidrawState", JSON.stringify(appState));
      localStorage.setItem("excalidrawElements", JSON.stringify(elements));
    });

    const savedState = localStorage.getItem("excalidrawState");
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      setAppState(parsedState);
    }

    const savedElements = localStorage.getItem("excalidrawElements");
    if (savedElements) {
      const parsedElements = JSON.parse(savedElements);
      setElements(parsedElements);
    }

    setMounted(true);
  }, []);

  function handleOnChange(newElements, newState) {
    newState.collaborators = [];

    localStorage.setItem("excalidrawState", JSON.stringify(newState));
    localStorage.setItem("excalidrawElements", JSON.stringify(newElements));
  }

  return (
    <main className="container">
      {mounted ? (
        <Excalidraw
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          initialData={{
            appState: appState,
            elements: elements,
          }}
          onChange={(elements, appState) => {
            handleOnChange(elements, appState);
          }}
       />
      ) : (
        <div className="loading">
          <p>Loading...</p>
        </div>
      )}
    </main>
  );
}

export default App;
