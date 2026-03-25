import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import NotFound from "@/pages/not-found";
import { AppLayout } from "@/components/layout/app-layout";
import Home from "@/pages/home";
import SubmitJob from "@/pages/submit-job";
import JobsList from "@/pages/jobs";
import JobDetail from "@/pages/job-detail";
import Pipeline from "@/pages/pipeline";
import Checkpoints from "@/pages/checkpoints";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/submit" component={SubmitJob} />
        <Route path="/jobs" component={JobsList} />
        <Route path="/jobs/:id" component={JobDetail} />
        <Route path="/pipeline" component={Pipeline} />
        <Route path="/checkpoints" component={Checkpoints} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
