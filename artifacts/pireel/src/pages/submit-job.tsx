import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlayCircle, Wand2, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCreateVideoJob } from "@/hooks/use-jobs";
import { useToast } from "@/hooks/use-toast";
import { CreateJobRequestResolution } from "@workspace/api-client-react";

const formSchema = z.object({
  prompt: z.string().min(10, "Prompt must be at least 10 characters long").max(1000, "Prompt too long"),
  resolution: z.enum(["1080p", "4K"]),
  environment: z.string().min(1, "Environment is required"),
  hairType: z.string().min(1, "Hair type is required"),
  ethnicBackground: z.string().min(1, "Ethnic background is required"),
  voiceText: z.string().optional(),
  voiceClone: z.boolean().default(false),
  duration: z.number().default(30),
});

export default function SubmitJob() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createMutation = useCreateVideoJob();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      resolution: "4K",
      environment: "studio",
      hairType: "straight",
      ethnicBackground: "caucasian",
      voiceText: "",
      voiceClone: false,
      duration: 30,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createMutation.mutate({
      data: {
        ...values,
        resolution: values.resolution as CreateJobRequestResolution,
      }
    }, {
      onSuccess: (data) => {
        toast({
          title: "Pipeline Initiated",
          description: "Your 4K video generation job has started.",
        });
        setLocation(`/jobs/${data.id}`);
      },
      onError: (err: any) => {
        toast({
          variant: "destructive",
          title: "Submission Failed",
          description: err.message || "An error occurred while creating the job.",
        });
      }
    });
  }

  const generateRandomPrompt = () => {
    form.setValue("prompt", "A cinematic 4K medium shot of a confident professional woman with curly hair walking through a neon-lit futuristic server room. She wears a sleek dark tailored suit. Studio rim lighting accentuates her silhouette, highly detailed skin texture, photorealistic, 85mm lens.");
    form.setValue("environment", "futuristic server room");
    form.setValue("hairType", "curly");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Create New Video</h1>
        <p className="text-muted-foreground mt-2">Initialize the TensorRT pipeline with your exact specifications.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="glass-panel border-t-primary/50 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            
            <CardContent className="p-6 md:p-8 space-y-8 relative z-10">
              {/* Primary Prompt Area */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-primary" />
                    Cinematic Prompt
                  </h3>
                  <Button type="button" variant="ghost" size="sm" onClick={generateRandomPrompt} className="text-xs h-8 text-primary hover:text-primary hover:bg-primary/10">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Surprise Me
                  </Button>
                </div>
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the human, clothing, lighting, and scene in rich detail..." 
                          className="min-h-[160px] text-base resize-y bg-black/40 border-white/10 focus:border-primary/50 transition-colors p-4 rounded-xl shadow-inner shadow-black/50"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-muted-foreground">
                        Be descriptive. The pipeline's ControlNet points (901-1050) enforce exact text adherence.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/5">
                {/* Left Column: Visuals */}
                <div className="space-y-6">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Visual Specifications</h3>
                  
                  <FormField
                    control={form.control}
                    name="resolution"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resolution Target</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-black/20 border-white/10 rounded-xl">
                              <SelectValue placeholder="Select resolution" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-card border-white/10">
                            <SelectItem value="1080p">1080p HD</SelectItem>
                            <SelectItem value="4K">4K Ultra HD (SUPIR Upscaling)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="hairType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hair System (Pts 251-350)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-black/20 border-white/10 rounded-xl">
                                <SelectValue placeholder="Hair type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-card border-white/10">
                              <SelectItem value="straight">Straight</SelectItem>
                              <SelectItem value="curly">Curly / Wavy</SelectItem>
                              <SelectItem value="braids">Braids</SelectItem>
                              <SelectItem value="afro">Afro-textured</SelectItem>
                              <SelectItem value="bald">Bald / Shaved</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ethnicBackground"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ethnicity (Pts 1051-1200)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-black/20 border-white/10 rounded-xl">
                                <SelectValue placeholder="Background" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-card border-white/10">
                              <SelectItem value="caucasian">Caucasian</SelectItem>
                              <SelectItem value="african">African / Black</SelectItem>
                              <SelectItem value="asian">Asian</SelectItem>
                              <SelectItem value="hispanic">Hispanic / Latino</SelectItem>
                              <SelectItem value="middle_eastern">Middle Eastern</SelectItem>
                              <SelectItem value="mixed">Mixed / Multiracial</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="environment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Environment (Pts 751-900)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-black/20 border-white/10 rounded-xl">
                              <SelectValue placeholder="Select environment" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-card border-white/10">
                            <SelectItem value="studio">Professional Studio</SelectItem>
                            <SelectItem value="office">Modern Office</SelectItem>
                            <SelectItem value="outdoor">Outdoor / Nature</SelectItem>
                            <SelectItem value="urban">Urban / Cityscape</SelectItem>
                            <SelectItem value="cinematic">Cinematic Abstract</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Right Column: Audio & Duration */}
                <div className="space-y-6">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Audio & Mechanics</h3>

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (Locked to compute ratio)</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-3">
                            <Input 
                              type="number" 
                              disabled 
                              value={field.value} 
                              className="bg-black/40 border-white/10 rounded-xl w-24 text-center font-mono"
                            />
                            <span className="text-sm text-muted-foreground">Seconds</span>
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs">Requires exactly 60s of GPU compute.</FormDescription>
                      </FormItem>
                    )}
                  />

                  <div className="p-4 rounded-xl bg-black/20 border border-white/5 space-y-4">
                    <FormField
                      control={form.control}
                      name="voiceText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dialogue / Voice Text (Pts 351-450)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter text for Wav2Lip-HD synchronization..." 
                              className="min-h-[80px] text-sm resize-none bg-black/40 border-white/10 rounded-xl"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="voiceClone"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/5 bg-black/20 p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm font-medium">Enable RVC Voice Cloning</FormLabel>
                            <FormDescription className="text-xs">
                              Uses personalized vocal timbre.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-accent"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="bg-black/40 border-t border-white/5 p-6 flex items-center justify-between">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                GPU L4 Ready for Inference
              </div>
              <Button 
                type="submit" 
                size="lg" 
                disabled={createMutation.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Initializing Pipeline...
                  </>
                ) : (
                  <>
                    <PlayCircle className="mr-2 h-5 w-5" />
                    Start Generation (60s)
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </motion.div>
  );
}
