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

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Category" />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="all">Category: All</SelectItem>
        {categories.map((cat) => (
          <SelectItem key={cat.id} value={cat.id}>
            {cat.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CategoryFilter;
