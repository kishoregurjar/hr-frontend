const PageToolbar = ({ leftContent, rightContent }) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* Left Section */}
      <div className="flex flex-wrap items-center gap-3">
        {leftContent}
      </div>

      {/* Right Section */}
      <div className="flex flex-wrap items-center gap-3">
        {rightContent}
      </div>
    </div>
  );
};

export default PageToolbar;
