import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Camera, Save, User, MapPin, Briefcase, Github, Globe, Mail, Phone } from "lucide-react";
import Logo from "@/components/Logo";
import ChipLoader from "@/components/ChipLoader";
import type { User as AuthUser } from "@supabase/supabase-js";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [github, setGithub] = useState("");
  const [portfolio, setPortfolio] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) { navigate('/login'); return; }
      setUser(userData.user);

      const [profileRes, skillsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userData.user.id).single(),
        supabase.from('user_skills').select('*').eq('user_id', userData.user.id),
      ]);

      const p = profileRes.data;
      if (p) {
        setProfile(p);
        setFullName(p.full_name || "");
        setPhone(p.phone || "");
        setLocation(p.location || "");
        setExperience(String(p.experience_years || ""));
        setGithub(p.github_url || "");
        setPortfolio(p.portfolio_url || "");
      }
      setSkills(skillsRes.data || []);
      setLoading(false);
    };
    load();
  }, [navigate]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);

    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
    const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', user.id);
    setProfile((p: any) => ({ ...p, avatar_url: avatarUrl }));
    toast({ title: "Avatar updated!" });
    setUploading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      full_name: fullName,
      phone,
      location,
      experience_years: parseInt(experience) || 0,
      github_url: github,
      portfolio_url: portfolio,
    }).eq('id', user.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile saved!" });
    }
    setSaving(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><ChipLoader text="Profile" /></div>;

  const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="container mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Button>
          <Logo size={28} />
        </div>

        {/* Avatar & Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group mb-4">
            <Avatar className="w-28 h-28 border-2 border-primary/30">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="text-2xl font-bold bg-primary/20 text-primary">{initials || 'U'}</AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 rounded-full bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <Camera className="w-6 h-6 text-foreground" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>
          <h1 className="text-2xl font-bold">{fullName || 'Your Profile'}</h1>
          <p className="text-muted-foreground text-sm">{user?.email}</p>
        </div>

        {/* Profile Form */}
        <Card className="glass mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><User className="w-5 h-5 text-primary" /> Personal Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Full Name</label>
                <Input value={fullName} onChange={e => setFullName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</label>
                <Input value={user?.email || ''} disabled className="opacity-60" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone</label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Location</label>
                <Input value={location} onChange={e => setLocation(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary" /> Professional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">Years of Experience</label>
                <Input type="number" value={experience} onChange={e => setExperience(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground flex items-center gap-1.5"><Github className="w-3.5 h-3.5" /> GitHub</label>
                <Input value={github} onChange={e => setGithub(e.target.value)} placeholder="https://github.com/..." />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm text-muted-foreground flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Portfolio</label>
                <Input value={portfolio} onChange={e => setPortfolio(e.target.value)} placeholder="https://..." />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        {skills.length > 0 && (
          <Card className="glass mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {skills.map(s => (
                  <Badge key={s.id} variant="outline" className="text-sm py-1 px-3">
                    {s.skill_name}
                    <span className="ml-1.5 text-xs text-muted-foreground">({s.skill_level})</span>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Button onClick={handleSave} disabled={saving} className="w-full gradient-primary text-primary-foreground">
          <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default Profile;
