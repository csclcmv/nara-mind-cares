import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  if (!OPENAI_API_KEY) {
    return new Response("OpenAI API key not configured", { status: 500 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  let openAISocket: WebSocket | null = null;

  socket.onopen = async () => {
    console.log("Client connected to relay");
    
    try {
      // Connect to OpenAI Realtime API
      openAISocket = new WebSocket(
        "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01",
        {
          headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "OpenAI-Beta": "realtime=v1",
          },
        }
      );

      openAISocket.onopen = () => {
        console.log("Connected to OpenAI Realtime API");
        
        // Send session configuration after connection
        const sessionConfig = {
          type: "session.update",
          session: {
            modalities: ["text", "audio"],
            instructions: "You are NeuroConnect, a compassionate mental wellness AI companion for university students. You provide empathetic support, active listening, and guidance for mental health concerns. Keep responses warm, understanding, and supportive. Encourage students to seek professional help when needed.",
            voice: "alloy",
            input_audio_format: "pcm16",
            output_audio_format: "pcm16",
            input_audio_transcription: {
              model: "whisper-1"
            },
            turn_detection: {
              type: "server_vad",
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 1000
            },
            temperature: 0.8,
            max_response_output_tokens: 4096
          }
        };
        
        openAISocket?.send(JSON.stringify(sessionConfig));
      };

      openAISocket.onmessage = (event) => {
        console.log("Received from OpenAI:", event.data);
        socket.send(event.data);
      };

      openAISocket.onerror = (error) => {
        console.error("OpenAI WebSocket error:", error);
        socket.send(JSON.stringify({ 
          type: "error", 
          error: "OpenAI connection error" 
        }));
      };

      openAISocket.onclose = () => {
        console.log("OpenAI connection closed");
        socket.close();
      };
    } catch (error) {
      console.error("Error connecting to OpenAI:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      socket.send(JSON.stringify({ 
        type: "error", 
        error: errorMessage 
      }));
    }
  };

  socket.onmessage = (event) => {
    console.log("Received from client:", event.data);
    if (openAISocket && openAISocket.readyState === WebSocket.OPEN) {
      openAISocket.send(event.data);
    }
  };

  socket.onerror = (error) => {
    console.error("Client WebSocket error:", error);
  };

  socket.onclose = () => {
    console.log("Client disconnected");
    if (openAISocket) {
      openAISocket.close();
    }
  };

  return response;
});
