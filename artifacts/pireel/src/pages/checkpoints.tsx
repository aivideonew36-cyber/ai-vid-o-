import { motion } from "framer-motion";
import { Database, Zap, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CATEGORY_RANGES, CATEGORY_COLORS } from "@/lib/constants";
import { Progress } from "@/components/ui/progress";

export default function Checkpoints() {
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3 mb-2">
            <Database className="w-8 h-8 text-primary" />
            2,000 Checkpoints Topology
          </h1>
          <p className="text-muted-foreground text-lg">
            The core intelligence of PIReel. The network injects data by blocks of 50 into the GPU to build the image layer by layer, eliminating errors.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Visual Map */}
        <div className="xl:col-span-2 space-y-4">
          {CATEGORY_RANGES.map((cat, index) => {
            const colorClass = CATEGORY_COLORS[cat.id] || "bg-primary";
            const isDetailed = index > 8; // Highlight the later complex ones
            
            return (
              <motion.div 
                key={cat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass-panel overflow-hidden border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex flex-col sm:flex-row items-stretch">
                    <div className={`w-full sm:w-2 bg-black relative flex shrink-0`}>
                       <div className={`absolute inset-0 ${colorClass} opacity-80`} />
                    </div>
                    <div className="p-4 sm:p-5 flex-1 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground">{cat.name}</h3>
                          {isDetailed && <Zap className="w-3 h-3 text-accent" />}
                        </div>
                        <p className="text-xs text-muted-foreground max-w-md">
                          Points responsible for processing the {cat.name.toLowerCase()} matrix.
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end shrink-0 w-full sm:w-auto">
                        <div className="text-sm font-mono bg-black/40 px-3 py-1 rounded-lg border border-white/10 mb-2">
                          Pts <span className="text-primary">{cat.start}</span> - <span className="text-primary">{cat.end}</span>
                        </div>
                        <div className="w-full sm:w-32 h-1.5 bg-black/50 rounded-full overflow-hidden">
                          <div className={`h-full ${colorClass} w-full`} />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <Card className="glass-panel bg-gradient-to-b from-card to-black sticky top-24">
            <CardHeader>
              <CardTitle className="font-display text-xl">Injection Architecture</CardTitle>
              <CardDescription>How the GPU processes 2000 points in 60 seconds.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Foundation (1-750)</h4>
                    <p className="text-xs text-muted-foreground">Builds skeleton, facial geometry, skin textures, and lighting.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <span className="text-accent font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Context (751-1500)</h4>
                    <p className="text-xs text-muted-foreground">Locks prompt adherence, diversity, temporal coherence, and motion.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <span className="text-emerald-500 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Fidelity (1501-2000)</h4>
                    <p className="text-xs text-muted-foreground">4K Upscaling, cinematic colorimetry, and final error cleaning.</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 mt-6">
                <div className="p-4 rounded-xl bg-black/40 border border-primary/20 text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-primary/5 blur-xl"></div>
                  <Layers className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-display font-bold text-foreground">100%</div>
                  <div className="text-xs text-muted-foreground mt-1">Checkpoints pre-loaded in VRAM</div>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </motion.div>
  );
}
