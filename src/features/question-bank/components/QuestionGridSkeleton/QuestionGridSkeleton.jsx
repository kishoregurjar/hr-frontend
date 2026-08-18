import QuestionCardSkeleton from "../QuestionCardSkeleton";

const QuestionGridSkeleton = ({
  count = 6,
}) => {
  return (
    <div className="grid gap-8 md:grid-cols-2 2xl:grid-cols-3">
      {Array.from({ length: count }).map(
        (_, index) => (
          <QuestionCardSkeleton key={index} />
        )
      )}
    </div>
  );
};

export default QuestionGridSkeleton;
