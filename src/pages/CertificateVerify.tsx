import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";
import { CheckCircle, XCircle, Zap } from "lucide-react";

const CertificateVerify = () => {
  const { certificateId } = useParams();
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!certificateId) return;
    supabase.from('certificates').select('*').eq('certificate_id', certificateId).single()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true);
        else setCert(data);
        setLoading(false);
      });
  }, [certificateId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="glass neon-glow max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Zap className="w-7 h-7 text-primary" />
            </div>
          </div>
          <CardTitle>Certificate Verification</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {notFound ? (
            <div>
              <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h3 className="text-xl font-bold text-destructive mb-2">Invalid Certificate</h3>
              <p className="text-muted-foreground">This certificate ID does not exist or has been revoked.</p>
            </div>
          ) : (
            <div>
              <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-bold text-accent mb-4">Valid Certificate</h3>
              <div className="space-y-3 text-left">
                <div className="flex justify-between"><span className="text-muted-foreground">Certificate ID</span><span className="font-mono text-sm">{cert.certificate_id}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Score</span><span className="font-bold">{Math.round(Number(cert.final_score))}%</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Trust Score</span><span>{Math.round(Number(cert.trust_score))}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Issued</span><span>{new Date(cert.issued_at).toLocaleDateString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge className="bg-accent/20 text-accent">{cert.is_valid ? 'Valid' : 'Revoked'}</Badge></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CertificateVerify;
