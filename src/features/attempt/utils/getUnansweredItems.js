import { isItemAnswered } from "./isItemAnswered";

export const getUnansweredItems = ({ items = [], responses = [] }) => {
  const responseList = Array.isArray(responses) ? responses : [];
  const responseMap = new Map(
    responseList.map((response) => [response.itemId, response])
  );

  return items.filter(
    (item) => !isItemAnswered(responseMap.get(item.id))
  );
};
