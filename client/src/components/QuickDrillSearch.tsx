import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Drill {
  name: string;
  description: string;
  duration: string;
  difficulty: string;
  equipment: string[];
  steps: string[];
}

export default function QuickDrillSearch() {
  const [query, setQuery] = useState("");
  const [drills, setDrills] = useState<Drill[]>([]);

  const searchMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/drill-recommendations", {
        query
      });
      return response;
    },
    onSuccess: (data: any) => {
      // ✅ Adjust based on your API response structure
      const drillList = data?.recommendation?.recommendations || [];
      setDrills(drillList);
    },
    onError: (error: any) => {
      console.error("Failed to fetch drills:", error);
    }
  });

  const handleSearch = () => {
    if (query.trim()) {
      searchMutation.mutate();
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Enter drill type (e.g., serve, forehand)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border rounded px-3 py-2 flex-1"
        />
        <Button
          onClick={handleSearch}
          disabled={searchMutation.isPending}
          className="bg-primary text-white"
        >
          {searchMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Results */}
      {searchMutation.isPending && (
        <p className="text-gray-500">Searching for drills...</p>
      )}

      {!searchMutation.isPending && drills.length === 0 && (
        <p className="text-gray-500">Found 0 relevant drills.</p>
      )}

      {drills.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700">Drills Found</h3>
          {drills.map((drill, index) => (
            <Card key={index} className="border p-3">
              <CardContent>
                <h4 className="font-bold text-gray-800">{drill.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{drill.description}</p>
                <p className="text-xs text-gray-500">
                  <strong>Duration:</strong> {drill.duration} | <strong>Difficulty:</strong>{" "}
                  {drill.difficulty}
                </p>
                {drill.steps && drill.steps.length > 0 && (
                  <ul className="list-disc list-inside text-sm mt-2">
                    {drill.steps.slice(0, 3).map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
