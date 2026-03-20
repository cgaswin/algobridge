import { BriefcaseBusiness, ThumbsDown, ThumbsUp, TrendingUp, X } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { OVERLAY_OPEN_REQUESTED_EVENT } from '@/src/shared/messaging';

export function OverlayApp() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onOpenRequested = () => {
      setOpen(true);
    };

    window.addEventListener(OVERLAY_OPEN_REQUESTED_EVENT, onOpenRequested);

    return () => {
      window.removeEventListener(OVERLAY_OPEN_REQUESTED_EVENT, onOpenRequested);
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0">
        <DialogHeader className="gap-3 border-b bg-gradient-to-r from-secondary to-background pb-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary/15 p-2 text-primary">
                <BriefcaseBusiness aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">AlgoBridge</p>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" aria-label="Close overlay">
                <X aria-hidden="true" />
              </Button>
            </DialogClose>
          </div>
          <div className="flex flex-col gap-3">
            <Badge variant="secondary" className="w-fit text-[11px] uppercase tracking-wide">
              Easy
            </Badge>
            <div className="flex flex-col gap-1">
              <DialogTitle className="text-4xl font-bold tracking-tight">Two Sum</DialogTitle>
              <DialogDescription className="max-w-xl text-base leading-relaxed">
                Given an array of integers and a target value, find two numbers whose sum
                equals the target.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4 p-6">
          <Card className="border-primary/30 bg-background/70">
            <CardHeader className="gap-3 pb-2">
              <Badge className="w-fit bg-primary/10 text-primary">Practical Application 1/1</Badge>
              <CardTitle className="text-2xl">E-commerce Inventory Matching</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-base leading-relaxed text-muted-foreground">
                Imagine a gift-card engine that must instantly find two cart items whose total
                exactly matches a customer credit amount. This is the same pairing logic as Two
                Sum, but in production.
              </p>
              <div className="flex items-center gap-2 rounded-md border bg-secondary/50 px-3 py-2 text-sm font-medium text-primary">
                <TrendingUp aria-hidden="true" />
                Reduces search from O(n^2) to O(n)
              </div>
              <Separator />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">Was this scenario helpful?</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <ThumbsUp aria-hidden="true" />
                    Yes
                  </Button>
                  <Button variant="outline" size="sm">
                    <ThumbsDown aria-hidden="true" />
                    No
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
