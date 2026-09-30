export const formatDuration = (
  minutes
) => `${minutes} min`;

export const formatDate = (date) => {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
};

export const formatExperience = (years) => {
  if (years === null || years === undefined || years === "") return null;
  const numYears = Number(years);
  if (Number.isNaN(numYears)) return years;
  
  if (numYears === 1) return "1 Year";
  
  if (numYears % 1 === 0) return `${numYears} Years`;
  
  if (numYears < 1) {
    const months = Math.round(numYears * 12);
    return `${months} Month${months !== 1 ? 's' : ''}`;
  }
  
  const wholeYears = Math.floor(numYears);
  const fraction = numYears - wholeYears;
  const months = Math.round(fraction * 12);
  
  if (months === 0) return `${wholeYears} Year${wholeYears !== 1 ? 's' : ''}`;
  if (months === 12) return `${wholeYears + 1} Years`;
  
  return `${wholeYears} Year${wholeYears !== 1 ? 's' : ''} ${months} Month${months !== 1 ? 's' : ''}`;
};
