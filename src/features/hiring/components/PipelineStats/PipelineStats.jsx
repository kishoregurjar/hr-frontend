const PipelineStats = ({ stats = [] }) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => (
        <div key={item.roundId} className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
            {item.count}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Active candidates</p>
        </div>
      ))}
    </div>
  );
};

export default PipelineStats;
