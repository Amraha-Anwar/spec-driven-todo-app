import useSWR from "swr";
import { fetcher } from "../../lib/fetcher";
import { useAuth } from "./use-auth";

interface Task {
  id: string;
  title: string;
  description?: string;
  is_completed: boolean;
  priority?: string;
  due_date?: string;
  user_id: string; 
  created_at: string;
  updated_at: string;
}

export const useTasks = () => {
  const { data: session } = useAuth();
  const userId = session?.user?.id;

  const { data, error, isLoading, mutate } = useSWR<Task[]>(
    userId ? `/api/${userId}/tasks` : null,
    fetcher
  );

  return {
    tasks: data,
    isLoading,
    isError: error,
    mutate,
  };
};