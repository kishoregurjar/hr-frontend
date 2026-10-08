"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getQuestionCategories } from "@/lib/api/questions";

const CategoryFilter = ({ value, onChange }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getQuestionCategories()
      .then((res) => {
        // getQuestionCategories already returns { success, data: [...] }
        const list = Array.isArray(res?.data) ? res.data : [];
        setCategories(list);
      })
      .catch(() => setCategories([]));
  }, []);

  const displayLabel =
    !value || value === "all" || value === "Category"
      ? "All Categories"
      : value;

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="All Categories">
          {displayLabel}
        </SelectValue>
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="all">All Categories</SelectItem>
        {categories.map((cat) => {
          const catName = cat.name || cat.title || String(cat);
          return (
            <SelectItem key={cat.id || catName} value={catName}>
              {catName}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

export default CategoryFilter;
