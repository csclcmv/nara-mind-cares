import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Brain, ArrowLeft, MessageCircle, ThumbsUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Post {
  id: number;
  content: string;
  likes: number;
  replies: number;
  timestamp: string;
}

const Forum = () => {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      content: "Starting therapy this week. Any tips for first-time sessions?",
      likes: 12,
      replies: 5,
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      content: "Finals week anxiety is real. How are you all coping?",
      likes: 24,
      replies: 8,
      timestamp: "5 hours ago",
    },
    {
      id: 3,
      content: "Just wanted to share that meditation really helped me today!",
      likes: 18,
      replies: 3,
      timestamp: "1 day ago",
    },
  ]);
  const [newPost, setNewPost] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);

  const handlePost = () => {
    if (!newPost.trim()) return;

    const post: Post = {
      id: posts.length + 1,
      content: newPost,
      likes: 0,
      replies: 0,
      timestamp: "Just now",
    };

    setPosts([post, ...posts]);
    setNewPost("");
    toast({
      title: "Posted!",
      description: "Your anonymous post has been shared with the community",
    });
  };

  const handleLike = (postId: number) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <header className="border-b bg-card shadow-soft p-4">
        <div className="container mx-auto max-w-4xl flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="font-semibold text-lg">Peer Support Forum</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl p-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Community Support</h2>
          <p className="text-muted-foreground">Share and connect anonymously with peers</p>
        </div>

        <Card className="mb-6 shadow-soft">
          <CardHeader>
            <CardTitle>Share Your Thoughts</CardTitle>
            <CardDescription>Post anonymously to the community</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What's on your mind? (This post will be anonymous)"
              className="min-h-[100px]"
            />
            <Button onClick={handlePost} disabled={!newPost.trim()}>
              Post Anonymously
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="shadow-soft hover:shadow-glow transition-shadow">
              <CardContent className="pt-6">
                <p className="mb-4">{post.content}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{post.likes}</span>
                  </button>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.replies} replies</span>
                  </div>
                  <span className="ml-auto">{post.timestamp}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Forum;
