import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import ReactPlayer from "react-player";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [videoUrl, setVideoUrl] = useState(""); // state to store the video URL
  // const videoUrl =
  //   "https://stream.vgm.tv/ipfs/bafybeie65uuexn4xu2v5a5ibyvyyw6elvyp2levkjixv264itxn5uvw7mq/playlist.m3u8";

  const playVideo = (url: string) => {
    setVideoUrl(url); // Set the video URL to play
  };

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <main className="container">
      <h1>Welcome to Tauri + React</h1>

      <div className="row">
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      {/* <video
        ref={url}
        controls
        className="max-w-full max-h-full"
        crossOrigin="anonymous"
      /> */}
      {/* https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8 */}
      <button
        onClick={() =>
          playVideo(
            "https://stream.vgm.tv/ipfs/bafybeie65uuexn4xu2v5a5ibyvyyw6elvyp2levkjixv264itxn5uvw7mq/playlist.m3u8"
          )
        }
      >
        Play Video Playlist
      </button>
      {/* Video player */}
      {videoUrl && (
        <ReactPlayer
          url={videoUrl}
          controls={true}
          width="100%"
          height="100%"
        />
      )}

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>
      <p>{greetMsg}</p>
    </main>
  );
}

export default App;
