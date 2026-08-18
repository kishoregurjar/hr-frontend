const QuestionNavigator = ({
  items = [],
  responses = [],
  currentItemIndex = 0,
  onNavigate,
}) => {
  const responseList = Array.isArray(responses) ? responses : [];
  const answeredIds = new Set(
    responseList
      .filter(
        (response) =>
          response.answer !== undefined &&
          response.answer !== null &&
          response.answer !== ""
      )
      .map((response) => response.itemId)
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <p className="font-semibold uppercase tracking-wider">Question Palette</p>
        <p>
          <span className="font-semibold text-slate-900">{answeredIds.size}</span> /{" "}
          {items.length} answered
        </p>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {items.map((item, index) => {
          const answered = answeredIds.has(item.id || index);
          const active = index === currentItemIndex;

          return (
            <button
              key={item.id || index}
              type="button"
              onClick={() => onNavigate(index)}
              className={`h-9 rounded-lg border text-xs font-semibold transition-all ${
                active
                  ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20"
                  : answered
                  ? "border-slate-300 bg-slate-100 text-slate-800"
                  : "border-input bg-card text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionNavigator;
