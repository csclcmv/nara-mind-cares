import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Brain, Heart, Users, MessageCircle } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-soft">
      <main className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-16">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center mb-6 shadow-glow">
            <Brain className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            NeuroConnect
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Your university mental wellness companion. Access AI support, professional counselors, and peer community - all in one place.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")} className="shadow-glow">
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">AI Companion</h3>
            <p className="text-muted-foreground">
              Talk to NeuroConnect anytime, anywhere. Get instant support and guidance.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Professional Help</h3>
            <p className="text-muted-foreground">
              Connect with licensed counselors for personalized support.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Peer Community</h3>
            <p className="text-muted-foreground">
              Share experiences and support each other anonymously.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
