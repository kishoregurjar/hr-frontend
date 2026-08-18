import GameCard from "../GameCard";

const GameGrid = ({ games }) => {
  return (
    <div className="grid gap-8 md:grid-cols-2 2xl:grid-cols-3">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
};

export default GameGrid;
