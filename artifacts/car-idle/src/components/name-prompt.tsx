import { useEffect, useState } from "react";
import { useGameState } from "@/hooks/use-game-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NamePrompt() {
  const { state, setPlayerName, ready } = useGameState();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    if (ready && !state.playerName) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [ready, state.playerName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length > 0) {
      setPlayerName(name.trim());
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      // Prevent closing by clicking outside if name isn't set
      if (!val && !state.playerName) return;
      setOpen(val);
    }}>
      <DialogContent className="sm:max-w-md bg-card/95 border-primary/50 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tighter text-primary uppercase neon-text-primary text-center">
            Enter Your Racer Name
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <Input 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Street King 99"
            className="text-lg text-center font-bold h-12 bg-background border-primary/30 focus-visible:ring-primary uppercase"
            maxLength={20}
          />
          <Button type="submit" size="lg" className="w-full font-bold uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 hover:neon-border-primary transition-all">
            Enter the Underground
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
