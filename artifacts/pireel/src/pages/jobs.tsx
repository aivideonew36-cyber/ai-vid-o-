import { motion } from "framer-motion";
import { Link } from "wouter";
import { format } from "date-fns";
import { Film, Trash2, ExternalLink, AlertCircle, Clock, PlayCircle } from "lucide-react";
import { useJobs, useDeleteVideoJob } from "@/hooks/use-jobs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function JobsList() {
  const { data: jobs, isLoading } = useJobs(true);
  const deleteMutation = useDeleteVideoJob();
  const { toast } = useToast();

  const handleDelete = (id: string) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Job Deleted", description: "The video job was successfully removed." });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error", description: "Failed to delete the job." });
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'processing': return 'bg-primary/10 text-primary border-primary/20 shadow-[0_0_10px_rgba(6,182,212,0.2)]';
      case 'queued': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'failed': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Generation Queue</h1>
          <p className="text-muted-foreground mt-1">Manage your 4K video processing tasks.</p>
        </div>
        <Link href="/submit">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl">
            <PlusIcon className="w-4 h-4 mr-2" />
            New Video
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl bg-card" />
          ))}
        </div>
      ) : jobs?.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-white/10 rounded-2xl bg-card/30">
          <Film className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
          <h3 className="text-xl font-medium text-foreground mb-2">No Active Jobs</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">Your pipeline is idle. Submit a new prompt to start the TensorRT inference process.</p>
          <Link href="/submit">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 rounded-xl">Start Generation</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {jobs?.map((job) => (
            <Card key={job.id} className="glass-panel overflow-hidden transition-all hover:border-white/10 hover:shadow-xl hover:shadow-black/40 group">
              <div className="p-5 sm:p-6 flex flex-col lg:flex-row gap-6">
                
                {/* Left Side: Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className={`font-mono text-xs uppercase px-2 py-0.5 rounded-md ${getStatusColor(job.status)}`}>
                          {job.status === 'processing' && <Loader2Icon className="w-3 h-3 mr-1.5 animate-spin inline" />}
                          {job.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-mono">ID: {job.id.substring(0,8)}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(job.createdAt), "MMM d, HH:mm")}
                        </span>
                      </div>
                      <h3 className="font-medium text-foreground line-clamp-2 leading-relaxed">"{job.prompt}"</h3>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-mono text-muted-foreground">
                    <span className="px-2 py-1 bg-black/40 rounded border border-white/5">{job.resolution}</span>
                    <span className="px-2 py-1 bg-black/40 rounded border border-white/5">{job.environment}</span>
                    {job.voiceText && <span className="px-2 py-1 bg-accent/10 text-accent rounded border border-accent/20">Wav2Lip Active</span>}
                  </div>
                </div>

                {/* Right Side: Progress & Actions */}
                <div className="lg:w-72 flex flex-col justify-between shrink-0 space-y-4 lg:space-y-0 lg:border-l border-white/5 lg:pl-6">
                  
                  {job.status === 'processing' || job.status === 'queued' ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-primary">Layer {job.currentLayer}/2000</span>
                        <span className="text-muted-foreground">{job.progress}%</span>
                      </div>
                      <Progress value={job.progress} className="h-2 bg-black/50" indicatorClassName="bg-gradient-to-r from-primary to-accent" />
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Est: {job.estimatedTime}s remaining</span>
                        <span>GPU: 100%</span>
                      </div>
                    </div>
                  ) : job.status === 'completed' ? (
                    <div className="flex items-center gap-3 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                      <CheckCircle2Icon className="w-8 h-8 text-emerald-500" />
                      <div>
                        <div className="text-sm font-medium text-emerald-500">Render Complete</div>
                        <div className="text-xs text-emerald-500/70 font-mono">Compute: {job.computeTime}s</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                      <AlertCircle className="w-8 h-8 text-red-500" />
                      <div>
                        <div className="text-sm font-medium text-red-500">Render Failed</div>
                        <div className="text-xs text-red-500/70 line-clamp-1">{job.errorMessage || "Pipeline error"}</div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Link href={`/jobs/${job.id}`} className="flex-1">
                      <Button variant="secondary" className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs">
                        <ExternalLink className="w-3 h-3 mr-2" />
                        Details
                      </Button>
                    </Link>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-card border-white/10">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Job</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this job? This action cannot be undone and will remove all generated assets.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5">Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(job.id)} className="bg-red-500 text-white hover:bg-red-600">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function PlusIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
}

function Loader2Icon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
}

function CheckCircle2Icon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>;
}
