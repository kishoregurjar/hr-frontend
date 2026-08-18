"use client";

import { useEffect, useState } from "react";
import { getAssessments } from "@/lib/api";

const useAssessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAssessments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAssessments();
      setAssessments(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessments();
  }, []);

  return {
    assessments,
    loading,
    error,
    refetch: loadAssessments,
  };
};

export default useAssessments;
