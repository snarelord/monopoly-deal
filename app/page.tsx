import GameBoard from "@/components/game-board";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-green-50">
      <h1 className="text-3xl font-bold text-center mb-6">Monopoly Deal</h1>
      <GameBoard />
    </main>
  );
}
