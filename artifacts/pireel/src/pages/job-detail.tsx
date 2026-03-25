import { useRoute } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Cpu, Activity, Download, Play, 
  Terminal, Layers, CheckCircle2, AlertCircle, Settings
} from "lucide-react";
import { Link } from "wouter";
import { useJobDetail } from "@/hooks/use-jobs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CATEGORY_RANGES, CATEGORY_COLORS } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

export default function JobDetail() {
  const [, params] = useRoute("/jobs/:id");
  const id = params?.id || "";
  const { data: job, isLoading, error } = useJobDetail(id);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="w-32 h-10 bg-card rounded-xl" />
        <Skeleton className="w-full h-[400px] bg-card rounded-2xl" />
        <Skeleton className="w-full h-64 bg-card rounded-2xl" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground">Job Not Found</h2>
        <p className="text-muted-foreground mt-2">The requested video generation job could not be located.</p>
        <Link href="/jobs">
          <Button variant="outline" className="mt-6 border-white/10">Back to Jobs</Button>
        </Link>
      </div>
    );
  }

  // Find current category being processed
  const currentCategoryIndex = CATEGORY_RANGES.findIndex(
    cat => job.currentLayer >= cat.start && job.currentLayer <= cat.end
  );
  
  const currentCategory = currentCategoryIndex !== -1 ? CATEGORY_RANGES[currentCategoryIndex] : CATEGORY_RANGES[0];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-6 pb-20"
    >
      <div className="flex items-center gap-4 mb-8">
        <Link href="/jobs">
          <Button variant="ghost" size="icon" className="rounded-xl border border-white/5 hover:bg-white/5">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-3">
            Job Details
            <Badge variant="outline" className={`font-mono text-xs ${
              job.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
              job.status === 'processing' ? 'bg-primary/10 text-primary border-primary/20 animate-pulse' :
              job.status === 'failed' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
              'bg-white/5 text-muted-foreground'
            }`}>
              {job.status.toUpperCase()}
            </Badge>
          </h1>
          <p className="text-xs text-muted-foreground font-mono mt-1">ID: {job.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Player or Progress Hero */}
          <Card className="glass-panel overflow-hidden border-t-primary/30">
            {job.status === 'completed' ? (
              <div className="aspect-video bg-black relative flex items-center justify-center group border-b border-white/5">
                {job.videoUrl ? (
                  <video src={job.videoUrl} controls className="w-full h-full object-cover" />
                ) : (
                  <>
                    <img src={`${import.meta.env.BASE_URL}images/hero-bg.png`} alt="Placeholder" className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm" />
                    <Button size="icon" className="w-16 h-16 rounded-full bg-primary/80 hover:bg-primary backdrop-blur-sm text-black shadow-[0_0_30px_rgba(6,182,212,0.6)] z-10 scale-100 group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 ml-1" />
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="aspect-video bg-gradient-to-br from-black to-secondary relative flex flex-col items-center justify-center p-8 text-center border-b border-white/5 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
                
                <div className="relative z-10 w-full max-w-md mx-auto">
                  <Activity className="w-12 h-12 text-primary mx-auto mb-6 animate-pulse drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
                  <h3 className="text-xl font-display font-bold text-foreground mb-2">
                    {job.status === 'queued' ? 'Waiting in Queue...' : 'TensorRT Inference Active'}
                  </h3>
                  <p className="text-sm text-primary font-mono mb-8 h-5">
                    {job.status === 'processing' ? `Processing Layer: ${currentCategory.name}` : ''}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-muted-foreground">Checkpoint {job.currentLayer}/2000</span>
                      <span className="text-primary font-bold">{job.progress}%</span>
                    </div>
                    <Progress value={job.progress} className="h-3 bg-black/60 shadow-inner" indicatorClassName="bg-gradient-to-r from-primary via-blue-400 to-accent" />
                  </div>
                </div>
              </div>
            )}
            
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Terminal className="w-4 h-4" /> Prompt Payload
                  </h4>
                  <div className="p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-sm leading-relaxed text-foreground/90">
                    {job.prompt}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                  <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                    <div className="text-xs text-muted-foreground mb-1">Resolution</div>
                    <div className="font-mono text-sm">{job.resolution}</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                    <div className="text-xs text-muted-foreground mb-1">Environment</div>
                    <div className="font-mono text-sm capitalize">{job.environment}</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                    <div className="text-xs text-muted-foreground mb-1">Duration</div>
                    <div className="font-mono text-sm">{job.duration}s</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                    <div className="text-xs text-muted-foreground mb-1">Voice</div>
                    <div className="font-mono text-sm">{job.voiceText ? 'Wav2Lip' : 'None'}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Pipeline Status & Checkpoints */}
        <div className="space-y-6">
          <Card className="glass-panel">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Cpu className="w-5 h-5 text-primary" />
                Compute Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-sm text-muted-foreground">Est. Time</span>
                <span className="font-mono text-sm">{job.estimatedTime || '--'}s</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-sm text-muted-foreground">Compute Time</span>
                <span className="font-mono text-sm text-emerald-400">{job.computeTime || '--'}s</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-sm text-muted-foreground">Ratio Target</span>
                <span className="font-mono text-sm text-accent">2:1</span>
              </div>
              
              {job.status === 'completed' && (
                <Button className="w-full mt-4 bg-primary text-black hover:bg-primary/90 font-semibold gap-2 rounded-xl">
                  <Download className="w-4 h-4" /> Download 4K MP4
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Layers className="w-5 h-5 text-accent" />
                Pipeline Stages
              </CardTitle>
              <CardDescription className="text-xs">2000 Checkpoints Timeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative border-l-2 border-white/10 ml-3 pl-5 space-y-6 py-2">
                {CATEGORY_RANGES.filter((_, i) => i % 2 === 0).slice(0, 6).map((cat, idx) => {
                  const isCompleted = job.currentLayer > cat.end;
                  const isCurrent = job.currentLayer >= cat.start && job.currentLayer <= cat.end;
                  const isPending = job.currentLayer < cat.start;
                  
                  return (
                    <div key={cat.id} className="relative">
                      <div className={`absolute -left-[27px] w-3 h-3 rounded-full border-2 bg-background 
                        ${isCompleted ? 'border-emerald-500 bg-emerald-500 shadow-[0_0_8px_#10b981]' : 
                          isCurrent ? 'border-primary bg-primary animate-pulse shadow-[0_0_8px_#06b6d4]' : 
                          'border-white/20'}`} 
                      />
                      <div className="flex justify-between items-start">
                        <div>
                          <p className={`text-sm font-medium ${isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {cat.name}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">Pts {cat.start}-{cat.end}</p>
                        </div>
                        {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        {isCurrent && <Settings className="w-4 h-4 text-primary animate-spin" />}
                      </div>
                    </div>
                  );
                })}
                <div className="relative">
                  <div className="absolute -left-[27px] w-3 h-3 rounded-full border-2 border-white/20 bg-background" />
                  <p className="text-sm font-medium text-muted-foreground italic">... 11 more stages</p>
                </div>
              </div>
              <Link href="/checkpoints" className="block mt-6">
                <Button variant="outline" className="w-full border-white/10 text-xs">View Full Pipeline Tree</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
