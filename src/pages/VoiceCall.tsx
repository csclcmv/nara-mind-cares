import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AudioRecorder, encodeAudioForAPI } from "@/utils/AudioRecorder";
import { AudioQueue } from "@/utils/AudioPlayer";
import { supabase } from "@/integrations/supabase/client";

const VoiceCall = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [duration, setDuration] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const projectId = "stnwflqwalluzhnyjchy";

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      connect();
    };
    checkAuth();

    return () => {
      disconnect();
    };
  }, []);

  useEffect(() => {
    if (isConnected) {
      durationIntervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [isConnected]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const connect = async () => {
    try {
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
          title: "Connected to Nara",
          description: "Start speaking to your AI companion",
        });
      };

      wsRef.current.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("Received:", data.type);

          if (data.type === 'response.audio.delta') {
            setIsSpeaking(true);
            const binaryString = atob(data.delta);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            await audioQueueRef.current?.addToQueue(bytes);
          } else if (data.type === 'response.audio.done') {
            setIsSpeaking(false);
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
        navigate("/chat");
      };

      wsRef.current.onclose = () => {
        console.log("WebSocket closed");
        setIsConnected(false);
        setIsConnecting(false);
      };

    } catch (error) {
      console.error("Error connecting:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start voice call",
        variant: "destructive",
      });
      setIsConnecting(false);
      navigate("/chat");
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
    setIsSpeaking(false);
    setIsConnected(false);
    
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
  };

  const handleEndCall = () => {
    disconnect();
    toast({
      title: "Call ended",
    });
    navigate("/chat");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-primary/10 flex flex-col items-center justify-center p-8">
      {isConnecting ? (
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
          <p className="text-xl text-muted-foreground">Connecting to Nara...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-12 w-full max-w-md">
          {/* Avatar/Visualizer */}
          <div className="relative">
            <div className={`w-48 h-48 rounded-full bg-gradient-primary flex items-center justify-center shadow-2xl transition-all duration-300 ${
              isSpeaking ? "scale-110 shadow-glow" : ""
            }`}>
              <Phone className="w-24 h-24 text-white" />
            </div>
            
            {/* Animated rings when speaking */}
            {isSpeaking && (
              <>
                <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
              </>
            )}
          </div>

          {/* Call Info */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Nara</h1>
            <p className="text-lg text-muted-foreground">AI Companion</p>
            <p className="text-2xl font-mono text-primary mt-4">{formatDuration(duration)}</p>
          </div>

          {/* Status */}
          <div className="text-center">
            <p className={`text-lg font-medium ${isSpeaking ? "text-primary animate-pulse" : "text-muted-foreground"}`}>
              {isSpeaking ? "Nara is speaking..." : "Listening..."}
            </p>
          </div>

          {/* End Call Button */}
          <Button
            size="lg"
            onClick={handleEndCall}
            className="w-24 h-24 rounded-full bg-destructive hover:bg-destructive/90 shadow-lg"
          >
            <PhoneOff className="w-10 h-10" />
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Speak naturally with Nara about your mental wellness
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceCall;
