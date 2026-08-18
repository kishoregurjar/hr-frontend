import { motion } from "framer-motion";

const PageHeader = ({
  title,
  description,
  children,
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
      }}
    >
      <div className="flex flex-col gap-4 border-b pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {title}
          </h1>

          {description && (
            <p className="mt-1 text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {children && (
          <div className="flex items-center gap-2">
            {children}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PageHeader;
