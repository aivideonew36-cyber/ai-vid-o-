import { motion } from "framer-motion";
import { Cpu, Activity, Database, CheckCircle2, Zap, Clock, PlayCircle, Film } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { usePipeline } from "@/hooks/use-pipeline";
import { useJobs } from "@/hooks/use-jobs";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { status, tools, isLoadingStatus, isLoadingTools } = usePipeline();
  const { data: jobs, isLoading: isLoadingJobs } = useJobs(true);

  const activeJobsCount = jobs?.filter(j => j.status === 'processing' || j.status === 'queued').length || 0;
  const completedJobsCount = jobs?.filter(j => j.status === 'completed').length || 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-2">
            Welcome to <span className="text-gradient">PIReel</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Ultra-realistic 4K human video generation powered by 2000 checkpoint layers and NVIDIA L4 TensorRT pipeline.
          </p>
        </div>
        <Link href="/submit" className="shrink-0">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(6,182,212,0.4)] rounded-xl font-semibold gap-2 transition-all hover:scale-105 active:scale-95">
            <PlayCircle className="w-5 h-5" />
            Generate Video
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoadingStatus ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl bg-card" />)
        ) : (
          <>
            <motion.div variants={itemVariants} className="group glow-effect">
              <Card className="glass-panel border-l-4 border-l-primary relative overflow-hidden h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-primary" />
                    Compute Power
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-display font-bold text-foreground">{status?.gpuModel || 'NVIDIA L4'}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-medium px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">
                      {status?.vramTotal || 24}GB VRAM
                    </span>
                    <span className="text-xs font-medium px-2 py-1 rounded-md bg-accent/10 text-accent border border-accent/20">
                      TensorRT Active
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} className="group glow-effect">
              <Card className="glass-panel border-l-4 border-l-accent relative overflow-hidden h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Zap className="w-4 h-4 text-accent" />
                    Performance Ratio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-display font-bold text-foreground">{status?.computeRatio || '2:1'}</div>
                  <p className="text-sm text-muted-foreground mt-2">60s compute = 30s video</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} className="group glow-effect">
              <Card className="glass-panel border-l-4 border-l-emerald-500 relative overflow-hidden h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-500" />
                    Checkpoints Loaded
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-display font-bold text-foreground">{status?.checkpointsLoaded || 2000}<span className="text-muted-foreground text-lg font-normal"> / 2000</span></div>
                  <div className="w-full bg-secondary h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-emerald-500 h-full w-full rounded-full" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants} className="group glow-effect">
              <Card className="glass-panel border-l-4 border-l-blue-500 relative overflow-hidden h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    Active Jobs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-display font-bold text-foreground">{activeJobsCount}</div>
                  <p className="text-sm text-muted-foreground mt-2">{completedJobsCount} completed today</p>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="glass-panel h-full">
            <CardHeader>
              <CardTitle className="font-display">Recent Generations</CardTitle>
              <CardDescription>Latest video rendering processes in the pipeline.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingJobs ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl bg-white/5" />)}
                </div>
              ) : jobs && jobs.length > 0 ? (
                <div className="space-y-3">
                  {jobs.slice(0, 5).map(job => (
                    <Link key={job.id} href={`/jobs/${job.id}`} className="block group">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className={`w-2 h-2 rounded-full ${
                            job.status === 'completed' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 
                            job.status === 'failed' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 
                            'bg-primary animate-pulse shadow-[0_0_8px_#06b6d4]'
                          }`} />
                          <div>
                            <p className="font-medium line-clamp-1 max-w-[200px] sm:max-w-sm">{job.prompt}</p>
                            <p className="text-xs text-muted-foreground mt-1 capitalize">{job.status} • Layer {job.currentLayer}/2000</p>
                          </div>
                        </div>
                        <div className="text-right hidden sm:block">
                          <span className="text-xs font-mono bg-black/40 px-2 py-1 rounded border border-white/10">{job.resolution}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                  <Film className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                  <p className="text-muted-foreground">No generation jobs yet.</p>
                  <Link href="/submit" className="text-primary hover:underline mt-2 inline-block">Create your first video</Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="glass-panel h-full bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <CardTitle className="font-display flex items-center justify-between">
                System Core
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </CardTitle>
              <CardDescription>Critical pipeline tools status</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTools ? (
                <Skeleton className="h-48 w-full rounded-xl bg-white/5" />
              ) : (
                <div className="space-y-4">
                  {tools?.slice(0, 5).map(tool => (
                    <div key={tool.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${tool.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <span className="text-muted-foreground">{tool.name}</span>
                      </div>
                      <span className="font-mono text-xs opacity-70">{tool.version}</span>
                    </div>
                  ))}
                  <Link href="/pipeline" className="block w-full">
                    <Button variant="outline" className="w-full mt-4 bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                      View All 20 Tools
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
