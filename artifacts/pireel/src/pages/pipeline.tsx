import { motion } from "framer-motion";
import { Server, Cpu, CheckCircle2, ShieldAlert } from "lucide-react";
import { usePipeline } from "@/hooks/use-pipeline";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Pipeline() {
  const { tools, isLoadingTools } = usePipeline();

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]';
      case 'loading': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'error': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="bg-card/40 border border-white/5 p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
              <Server className="w-8 h-8 text-accent" />
              Software Factory
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              The 20 server tools running in perfect orchestration on Google Cloud to deliver the 2:1 compute ratio. Every component is optimized for NVIDIA TensorRT.
            </p>
          </div>
          <div className="bg-black/50 border border-white/10 p-4 rounded-xl flex items-center gap-4 shrink-0">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Cpu className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Server Status</div>
              <div className="font-display font-bold text-lg text-emerald-400 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                All Systems Nominal
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoadingTools ? (
          Array.from({ length: 20 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl bg-card border border-white/5" />
          ))
        ) : (
          tools?.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="glass-panel h-full hover:border-white/10 transition-colors">
                <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-medium text-foreground">{tool.name}</CardTitle>
                    <Badge variant="outline" className="text-[10px] font-mono border-white/10 bg-black/20 text-muted-foreground">v{tool.version}</Badge>
                  </div>
                  {tool.isCore && (
                    <ShieldAlert className="w-4 h-4 text-accent" />
                  )}
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <p className="text-xs text-muted-foreground line-clamp-2 h-8 mb-4">
                    {tool.description}
                  </p>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">{tool.category}</span>
                    <Badge className={`text-[10px] px-2 py-0 h-5 ${getStatusColor(tool.status)}`}>
                      {tool.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
