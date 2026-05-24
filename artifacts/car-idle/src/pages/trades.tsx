import { useState } from "react";
import { useGameState } from "@/hooks/use-game-state";
import { CARS } from "@/lib/cars";
import {
  useListTrades,
  getListTradesQueryKey,
  useCreateTrade,
  useAcceptTrade,
  useCancelTrade,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Trades() {
  const { state } = useGameState();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [offeredCarId, setOfferedCarId] = useState("");
  const [wantedCarId, setWantedCarId] = useState("");

  const { data: trades, isLoading, refetch } = useListTrades(
    {},
    { query: { queryKey: getListTradesQueryKey({}) } }
  );

  const createTrade = useCreateTrade();
  const acceptTrade = useAcceptTrade();
  const cancelTrade = useCancelTrade();

  const ownedUniqueIds = [...new Set(state.ownedCars)];
  const ownedUnique = ownedUniqueIds.map(id => CARS.find(c => c.id === id)).filter(Boolean);

  const handleCreate = () => {
    if (!offeredCarId || !wantedCarId || !state.playerName) return;
    const offeredCar = CARS.find(c => c.id === offeredCarId);
    const wantedCar = CARS.find(c => c.id === wantedCarId);
    if (!offeredCar || !wantedCar) return;

    createTrade.mutate({
      data: {
        offerPlayerId: state.playerId,
        offerPlayerName: state.playerName,
        offeredCarId,
        offeredCarName: offeredCar.name,
        wantedCarId,
        wantedCarName: wantedCar.name,
      }
    }, {
      onSuccess: () => {
        setShowCreate(false);
        setOfferedCarId("");
        setWantedCarId("");
        queryClient.invalidateQueries({ queryKey: getListTradesQueryKey({}) });
      }
    });
  };

  const handleAccept = (tradeId: number) => {
    acceptTrade.mutate({
      tradeId,
      data: { acceptPlayerId: state.playerId }
    }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListTradesQueryKey({}) })
    });
  };

  const handleCancel = (tradeId: number) => {
    cancelTrade.mutate({ tradeId }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListTradesQueryKey({}) })
    });
  };

  return (
    <div className="flex flex-col gap-6 animated-bg">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-white neon-text-primary">Car Market</h1>
          <p className="text-muted-foreground mt-1">Trade cars with other racers</p>
        </div>
        <Button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-primary text-primary-foreground font-bold uppercase tracking-wider"
          disabled={!state.playerName || ownedUniqueIds.length === 0}
        >
          {showCreate ? "Cancel" : "Create Trade"}
        </Button>
      </div>

      {/* Create trade form */}
      {showCreate && (
        <div className="bg-card border border-primary/30 rounded-xl p-5 flex flex-col gap-4">
          <div className="text-sm font-bold uppercase tracking-widest text-primary">New Trade Offer</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Offering</label>
              <Select value={offeredCarId} onValueChange={setOfferedCarId}>
                <SelectTrigger className="border-border/60 bg-background">
                  <SelectValue placeholder="Select car to offer" />
                </SelectTrigger>
                <SelectContent>
                  {ownedUnique.map(car => car && (
                    <SelectItem key={car.id} value={car.id}>{car.name} ({car.brand})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">Wanting</label>
              <Select value={wantedCarId} onValueChange={setWantedCarId}>
                <SelectTrigger className="border-border/60 bg-background">
                  <SelectValue placeholder="Select car you want" />
                </SelectTrigger>
                <SelectContent>
                  {CARS.map(car => (
                    <SelectItem key={car.id} value={car.id}>{car.name} ({car.brand})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={handleCreate}
            disabled={!offeredCarId || !wantedCarId || createTrade.isPending}
            className="bg-primary text-primary-foreground font-bold uppercase tracking-wider self-start"
          >
            {createTrade.isPending ? "Posting..." : "Post Trade"}
          </Button>
        </div>
      )}

      {/* Trade listings */}
      {isLoading ? (
        <div className="flex items-center justify-center h-32 text-muted-foreground">Loading market...</div>
      ) : !trades || trades.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground flex flex-col items-center gap-2">
          <div className="text-4xl">📋</div>
          <div className="text-lg font-bold text-white">No trades yet</div>
          <div className="text-sm">Be the first to post an offer!</div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {trades.map(trade => {
            const isMyTrade = trade.offerPlayerId === state.playerId;
            const offeredCar = CARS.find(c => c.id === trade.offeredCarId);
            const wantedCar = CARS.find(c => c.id === trade.wantedCarId);

            return (
              <div
                key={trade.id}
                className={`rounded-xl border p-4 flex items-center gap-4 flex-wrap ${isMyTrade ? "border-primary/30 bg-primary/5" : "border-border/40 bg-card"}`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="text-center shrink-0">
                    <div className="text-xs text-muted-foreground mb-1">Offering</div>
                    <div className="bg-background/60 rounded-lg p-2 min-w-[80px]">
                      <svg viewBox="0 0 40 20" className="w-10 mx-auto" fill="none">
                        <path d="M4 14 L6 7 Q12 4 20 4 Q28 4 34 7 L36 14 Z"
                          fill={offeredCar?.category === 'ferrari' ? '#cc0000' : offeredCar?.category === 'jdm' ? '#0055cc' : '#aa5500'} />
                        <circle cx="10" cy="15" r="4" fill="#111" stroke="#555" strokeWidth="1" />
                        <circle cx="30" cy="15" r="4" fill="#111" stroke="#555" strokeWidth="1" />
                      </svg>
                      <div className="text-xs font-bold text-white text-center mt-1 truncate max-w-[72px]">{trade.offeredCarName}</div>
                    </div>
                  </div>

                  <div className="text-2xl text-muted-foreground shrink-0">→</div>

                  <div className="text-center shrink-0">
                    <div className="text-xs text-muted-foreground mb-1">Wanting</div>
                    <div className="bg-background/60 rounded-lg p-2 min-w-[80px]">
                      <svg viewBox="0 0 40 20" className="w-10 mx-auto" fill="none">
                        <path d="M4 14 L6 7 Q12 4 20 4 Q28 4 34 7 L36 14 Z"
                          fill={wantedCar?.category === 'ferrari' ? '#cc0000' : wantedCar?.category === 'jdm' ? '#0055cc' : '#aa5500'} />
                        <circle cx="10" cy="15" r="4" fill="#111" stroke="#555" strokeWidth="1" />
                        <circle cx="30" cy="15" r="4" fill="#111" stroke="#555" strokeWidth="1" />
                      </svg>
                      <div className="text-xs font-bold text-white text-center mt-1 truncate max-w-[72px]">{trade.wantedCarName}</div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white">{trade.offerPlayerName}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(trade.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  {isMyTrade ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancel(trade.id)}
                      disabled={cancelTrade.isPending}
                      className="border-destructive/50 text-destructive hover:bg-destructive/10 font-bold uppercase tracking-wider text-xs"
                    >
                      Cancel
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleAccept(trade.id)}
                      disabled={acceptTrade.isPending}
                      className="bg-primary text-primary-foreground font-bold uppercase tracking-wider text-xs"
                    >
                      Accept
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
