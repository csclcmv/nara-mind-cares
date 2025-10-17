import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AudioRecorder, encodeAudioForAPI } from "@/utils/AudioRecorder";
import { AudioQueue } from "@/utils/AudioPlayer";

interface VoiceInterfaceProps {
  onTranscript: (text: string, role: "user" | "assistant") => void;
  onSpeakingChange: (speaking: boolean) => void;
}

const VoiceInterface = ({ onTranscript, onSpeakingChange }: VoiceInterfaceProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { toast } = useToast();

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || "stnwflqwalluzhnyjchy";

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const connect = async () => {
    try {
      setIsConnecting(true);

      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Initialize audio context
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
        audioQueueRef.current = new AudioQueue(audioContextRef.current);
      }

      // Connect to WebSocket
      const wsUrl = `wss://${projectId}.supabase.co/functions/v1/realtime-voice`;
      console.log("Connecting to:", wsUrl);
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = async () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        setIsConnecting(false);

        // Start audio recording
        audioRecorderRef.current = new AudioRecorder((audioData) => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            const encoded = encodeAudioForAPI(audioData);
            wsRef.current.send(JSON.stringify({
              type: 'input_audio_buffer.append',
              audio: encoded
            }));
          }
        });

        await audioRecorderRef.current.start();

        toast({
          title: "Voice connected",
          description: "Start speaking to NeuroConnect AI",
        });
      };

      wsRef.current.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Received:", data.type);

          if (data.type === 'response.audio.delta') {
            onSpeakingChange(true);
            const binaryString = atob(data.delta);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            await audioQueueRef.current?.addToQueue(bytes);
          } else if (data.type === 'response.audio.done') {
            onSpeakingChange(false);
          } else if (data.type === 'conversation.item.input_audio_transcription.completed') {
            onTranscript(data.transcript, "user");
          } else if (data.type === 'response.audio_transcript.delta') {
            // Accumulate assistant transcript
            onTranscript(data.delta, "assistant");
          } else if (data.type === 'error') {
            console.error("Error from server:", data.error);
            toast({
              title: "Connection error",
              description: data.error,
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error processing message:", error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        toast({
          title: "Connection error",
          description: "Failed to connect to voice service",
          variant: "destructive",
        });
        setIsConnecting(false);
      };

      wsRef.current.onclose = () => {
        console.log("WebSocket closed");
        setIsConnected(false);
        setIsConnecting(false);
        disconnect();
      };

    } catch (error) {
      console.error("Error connecting:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start voice",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    audioRecorderRef.current?.stop();
    audioRecorderRef.current = null;
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    audioQueueRef.current?.clear();
    onSpeakingChange(false);
    setIsConnected(false);
    
    toast({
      title: "Voice disconnected",
    });
  };

  return (
    <Button
      size="icon"
      variant={isConnected ? "default" : "outline"}
      onClick={isConnected ? disconnect : connect}
      disabled={isConnecting}
      className={isConnected ? "bg-primary shadow-glow" : ""}
    >
      {isConnecting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isConnected ? (
        <MicOff className="w-4 h-4" />
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </Button>
  );
};

export default VoiceInterface;
