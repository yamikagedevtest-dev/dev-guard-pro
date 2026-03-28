import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";
import Logo from "@/components/Logo";

const CertificateVerify = () => {
  const { certificateId } = useParams();
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!certificateId) return;
    supabase.from('certificates').select('*').eq('certificate_id', certificateId).single()
      .then(({ data, error }) => { if (error || !data) setNotFound(true); else setCert(data); setLoading(false); });
  }, [certificateId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(250_85%_65%/0.06),transparent_60%)]" />
      <Card className="glass glow max-w-md w-full relative z-10">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4"><Logo size={36} /></div>
          <CardTitle className="text-xl">Certificate Verification</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {notFound ? (
            <div>
              <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-bold text-destructive mb-2">Invalid Certificate</h3>
              <p className="text-muted-foreground text-sm">This certificate ID does not exist or has been revoked.</p>
            </div>
          ) : (
            <div>
              <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
              <h3 className="text-lg font-bold text-accent mb-6">Valid Certificate</h3>
              <div className="space-y-3 text-left text-sm">
                <div className="flex justify-between p-2.5 rounded-lg bg-secondary/20"><span className="text-muted-foreground">Certificate ID</span><span className="font-mono text-xs text-primary">{cert.certificate_id}</span></div>
                <div className="flex justify-between p-2.5 rounded-lg bg-secondary/20"><span className="text-muted-foreground">Score</span><span className="font-bold">{Math.round(Number(cert.final_score))}%</span></div>
                <div className="flex justify-between p-2.5 rounded-lg bg-secondary/20"><span className="text-muted-foreground">Trust Score</span><span className="font-bold">{Math.round(Number(cert.trust_score))}</span></div>
                <div className="flex justify-between p-2.5 rounded-lg bg-secondary/20"><span className="text-muted-foreground">Issued</span><span>{new Date(cert.issued_at).toLocaleDateString()}</span></div>
                <div className="flex justify-between items-center p-2.5 rounded-lg bg-secondary/20"><span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className={cert.is_valid ? 'border-accent/30 text-accent' : 'border-destructive/30 text-destructive'}>{cert.is_valid ? 'Valid' : 'Revoked'}</Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CertificateVerify;
