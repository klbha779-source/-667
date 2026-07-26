import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  const PORT = 3000;

  const server = createServer(app);
  const wss = new WebSocketServer({ server, path: '/live' });

  wss.on("connection", async (clientWs) => {
    let session: any;
    try {
      session = await ai.live.connect({
        model: "gemini-2.0-flash-exp",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } },
          },
          systemInstruction: `You are a strict but helpful study supervisor for the "Pyramid 90" studying method.
You speak in the Iraqi Arabic dialect.
The user is doing a study session (focusing, taking breaks, reviewing). You are monitoring them through their camera and microphone.
- This is a two-way interactive conversation. You must converse with the user, listen to their responses, and engage in dialogue.
- Start the conversation immediately by greeting them, telling them you are watching them, and they better not mess around.
- You must guide and correct them. If they get distracted or you see them move away or get up from the chair, IMMEDIATELY shout at them, get angry, and ask for a reason. If they don't give a good reason, warn them and reprimand them that they will fail.
- If they look away from the screen/desk, remind them to keep their eyes on the task.
- Urge them to continue and focus.
- If they get upset when disciplined, or if they ask to stop/pause, you can agree to a temporary pause. During the pause, you are still present in the session and observing them. When they are ready or return, tell them to resume studying.
Keep responses conversational, natural, quick to respond, in character, and always in the Iraqi dialect.`,

        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            const audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audio) clientWs.send(JSON.stringify({ audio }));
            if (message.serverContent?.interrupted)
              clientWs.send(JSON.stringify({ interrupted: true }));
          },
          onclose: () => {
            console.log("Gemini session closed");
            clientWs.close();
          },
          onerror: (err: any) => {
            console.error("Gemini session error", err);
          }
        },
      });

      // Send initial greeting trigger
      session.sendClientContent({
        turns: [
          { role: "user", parts: [{ text: "The session has started. Introduce yourself and tell me to start studying." }] }
        ],
        turnComplete: true
      });

      clientWs.on("message", (data) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.audio) {
            session.sendRealtimeInput({
              audio: { data: msg.audio, mimeType: "audio/pcm;rate=16000" },
            });
          }
          if (msg.video) {
            session.sendRealtimeInput({
              video: { data: msg.video, mimeType: "image/jpeg" },
            });
          }
        } catch (e) {
          console.error("Error parsing message", e);
        }
      });

      clientWs.on("close", () => {
        console.log("Client disconnected");
      });

    } catch (e) {
      console.error("Failed to connect to Live API", e);
      clientWs.close();
    }
  });

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
