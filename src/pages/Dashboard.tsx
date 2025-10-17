import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, MessageCircle, Calendar, Users, LogOut, Smile, Meh, Frown, Clock, CheckCircle2, Circle, ClipboardList } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MoodEntry {
  id: string;
  mood: string;
  notes: string | null;
  created_at: string;
}

interface TherapistAssignment {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  completed: boolean;
  created_at: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [assignments, setAssignments] = useState<TherapistAssignment[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      loadMoodHistory(session.user.id);
      loadAssignments(session.user.id);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadMoodHistory(session.user.id);
        loadAssignments(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadMoodHistory = async (userId: string) => {
    const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!error && data) {
      setMoodHistory(data);
    }
  };

  const loadAssignments = async (userId: string) => {
    const { data, error } = await supabase
      .from('therapist_assignments')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true, nullsFirst: false });

    if (!error && data) {
      setAssignments(data);
    }
  };

  const toggleAssignmentComplete = async (assignmentId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('therapist_assignments')
      .update({ completed: !currentStatus })
      .eq('id', assignmentId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update assignment",
        variant: "destructive",
      });
    } else {
      setAssignments(prev => 
        prev.map(a => a.id === assignmentId ? { ...a, completed: !currentStatus } : a)
      );
      toast({
        title: "Assignment updated",
        description: !currentStatus ? "Marked as complete" : "Marked as incomplete",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "Come back soon!",
    });
  };

  const handleMoodSelect = async (mood: string) => {
    setSelectedMood(mood);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('mood_entries')
      .insert({
        user_id: user.id,
        mood: mood.toLowerCase(),
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save mood",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Mood recorded",
        description: `You're feeling ${mood} today`,
      });
    }
  };

  const moods = [
    { value: "happy", icon: Smile, label: "Happy", color: "text-green-500" },
    { value: "neutral", icon: Meh, label: "Neutral", color: "text-yellow-500" },
    { value: "sad", icon: Frown, label: "Sad", color: "text-red-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">NeuroConnect</span>
          </div>
          <Button onClick={handleSignOut} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">How are you feeling today?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-2 lg:col-span-3 shadow-soft hover:shadow-glow transition-shadow cursor-pointer" onClick={() => navigate("/chat")}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                  <MessageCircle className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Talk to NeuroConnect AI</CardTitle>
                  <CardDescription>Your AI mental wellness companion is here to listen</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Counselor Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Connect with professional counselors</p>
              <Button className="w-full" onClick={() => navigate("/counselors")}>
                Book Session
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Peer Forum
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Anonymous community support</p>
              <Button className="w-full" variant="outline" onClick={() => navigate("/forum")}>
                Join Forum
              </Button>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-3 shadow-soft">
            <CardHeader>
              <CardTitle>Mood Tracker</CardTitle>
              <CardDescription>How are you feeling right now?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-around">
                {moods.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => handleMoodSelect(mood.label)}
                    className={`p-3 rounded-full transition-all ${
                      selectedMood === mood.label ? 'bg-primary/10 scale-110' : 'hover:bg-muted'
                    }`}
                  >
                    <mood.icon className={`w-8 h-8 ${mood.color}`} />
                  </button>
                ))}
              </div>

              {moodHistory.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Recent Moods
                  </h3>
                  <div className="space-y-2">
                    {moodHistory.map((entry) => {
                      const moodIcon = moods.find(m => m.value === entry.mood);
                      const MoodIcon = moodIcon?.icon || Meh;
                      return (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <MoodIcon className={`w-5 h-5 ${moodIcon?.color || 'text-muted-foreground'}`} />
                            <span className="text-sm capitalize">{entry.mood}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(entry.created_at).toLocaleDateString()} {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {assignments.length > 0 && (
            <Card className="md:col-span-2 lg:col-span-3 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-primary" />
                  Therapist Recommendations
                </CardTitle>
                <CardDescription>Session notes and homework assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <button
                        onClick={() => toggleAssignmentComplete(assignment.id, assignment.completed)}
                        className="mt-1 flex-shrink-0"
                      >
                        {assignment.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`font-semibold ${assignment.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {assignment.title}
                          </h4>
                          {assignment.due_date && (
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              Due: {new Date(assignment.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {assignment.description && (
                          <p className={`text-sm mt-1 ${assignment.completed ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                            {assignment.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
