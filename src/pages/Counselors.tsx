import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Brain, ArrowLeft, Calendar, Clock, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Counselor {
  id: number;
  name: string;
  specialty: string;
  availability: string;
  image: string;
}

const Counselors = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);

  const counselors: Counselor[] = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      specialty: "Anxiety & Stress Management",
      availability: "Mon, Wed, Fri - 9AM-5PM",
      image: "SJ",
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialty: "Depression & Mood Disorders",
      availability: "Tue, Thu - 10AM-6PM",
      image: "MC",
    },
    {
      id: 3,
      name: "Dr. Emily Rodriguez",
      specialty: "Academic Pressure & Performance",
      availability: "Mon-Fri - 1PM-7PM",
      image: "ER",
    },
  ];

  const handleBooking = (counselor: Counselor) => {
    setSelectedCounselor(counselor);
    setShowBookingModal(true);
  };

  const confirmBooking = () => {
    if (!selectedCounselor) return;
    
    setShowBookingModal(false);
    toast({
      title: "Booking confirmed!",
      description: `Session with ${selectedCounselor.name} has been scheduled.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="border-b bg-card shadow-soft p-4">
        <div className="container mx-auto max-w-6xl flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="font-semibold text-lg">Professional Counselors</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl p-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Book a Session</h2>
          <p className="text-muted-foreground">Connect with licensed mental health professionals</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {counselors.map((counselor) => (
            <Card key={counselor.id} className="shadow-soft hover:shadow-glow transition-shadow">
              <CardHeader>
                <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl mb-4 mx-auto shadow-glow">
                  {counselor.image}
                </div>
                <CardTitle className="text-center">{counselor.name}</CardTitle>
                <CardDescription className="text-center">{counselor.specialty}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{counselor.availability}</span>
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleBooking(counselor)}
                >
                  Book Session
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Booking Confirmation</DialogTitle>
            <DialogDescription>
              Your session with {selectedCounselor?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Date & Time</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(Date.now() + 86400000).toLocaleDateString()} at 2:00 PM
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Video className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Zoom Link</p>
                <p className="text-sm text-muted-foreground">
                  Will be sent to your email
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Duration</p>
                <p className="text-sm text-muted-foreground">50 minutes</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowBookingModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={confirmBooking} className="flex-1">
              Confirm Booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Counselors;
