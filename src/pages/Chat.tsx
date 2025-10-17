import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Brain, Send, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import VoiceInterface from "@/components/VoiceInterface";
import { Phone } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm NeuroConnect, your mental wellness companion. How can I support you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const assistantTranscriptRef = useRef("");
  const lastAssistantIndexRef = useRef(-1);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Simulated AI responses
    setTimeout(() => {
      const responses = [
        "I understand how you're feeling. It's completely normal to experience these emotions. Can you tell me more about what's been on your mind?",
        "Thank you for sharing that with me. Remember, taking care of your mental health is just as important as your physical health. What do you think might help you feel better?",
        "I'm here to listen and support you. It sounds like you're going through a challenging time. Have you tried any coping strategies that have helped in the past?",
        "Your feelings are valid. Many students experience similar challenges. Would you like to explore some relaxation techniques together?",
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setMessages((prev) => [...prev, { role: "assistant", content: randomResponse }]);
      setLoading(false);
    }, 1000);
  };

  const handleTranscript = (text: string, role: "user" | "assistant") => {
    if (role === "user") {
      setMessages((prev) => [...prev, { role: "user", content: text }]);
    } else {
      // Accumulate assistant transcript
      assistantTranscriptRef.current += text;
      
      setMessages((prev) => {
        const newMessages = [...prev];
        if (lastAssistantIndexRef.current >= 0 && 
            newMessages[lastAssistantIndexRef.current]?.role === "assistant") {
          newMessages[lastAssistantIndexRef.current] = {
            role: "assistant",
            content: assistantTranscriptRef.current
          };
        } else {
          newMessages.push({ role: "assistant", content: assistantTranscriptRef.current });
          lastAssistantIndexRef.current = newMessages.length - 1;
        }
        return newMessages;
      });
    }
  };

  const handleSpeakingChange = (speaking: boolean) => {
    setIsSpeaking(speaking);
    if (!speaking) {
      // Reset transcript accumulator when AI stops speaking
      assistantTranscriptRef.current = "";
      lastAssistantIndexRef.current = -1;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft flex flex-col">
      <header className="border-b bg-card shadow-soft p-4">
        <div className="container mx-auto max-w-4xl flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold">NeuroConnect AI</h1>
              <p className="text-xs text-muted-foreground">
                {isSpeaking ? "Speaking..." : "Always here to listen"}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto max-w-4xl p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <Card
                className={`max-w-[80%] p-4 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card shadow-soft"
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </Card>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <Card className="max-w-[80%] p-4 bg-card shadow-soft">
                <p className="text-sm text-muted-foreground">NeuroConnect is typing...</p>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="border-t bg-card shadow-soft p-4">
        <div className="container mx-auto max-w-4xl flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button
            size="icon"
            variant="outline"
            onClick={() => navigate("/voice-call")}
            title="Talk to Nara"
          >
            <Phone className="w-4 h-4" />
          </Button>
          <VoiceInterface 
            onTranscript={handleTranscript}
            onSpeakingChange={handleSpeakingChange}
          />
          <Button size="icon" onClick={handleSend} disabled={!input.trim() || loading}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default Chat;
