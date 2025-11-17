"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function TestApiPage() {
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserGames = useAction(api.yahooApi.fetchUserGames);
  const syncLeagues = useAction(api.dataSyncActions.syncLeagues);

  const testFetchUserGames = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);
    
    try {
      console.log("Testing fetchUserGames...");
      const xml = await fetchUserGames({});
      console.log("Got XML response:", xml.substring(0, 500));
      
      setResults({
        success: true,
        type: "userGames",
        data: xml.substring(0, 2000), // Show first 2000 chars
        fullLength: xml.length,
      });
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message || "Unknown error");
      setResults({
        success: false,
        error: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testSyncLeagues = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);
    
    try {
      console.log("Testing syncLeagues...");
      const result = await syncLeagues({});
      console.log("Sync result:", result);
      
      setResults({
        success: true,
        type: "syncLeagues",
        data: result,
      });
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message || "Unknown error");
      setResults({
        success: false,
        error: err.message,
        stack: err.stack,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Yahoo API Test</h1>

      <Card>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={testFetchUserGames}
              disabled={isLoading}
              isLoading={isLoading}
            >
              Test Fetch User Games
            </Button>
            <Button
              onClick={testSyncLeagues}
              disabled={isLoading}
              isLoading={isLoading}
              variant="secondary"
            >
              Test Sync Leagues
            </Button>
            <Button
              onClick={() => {
                setResults(null);
                setError(null);
              }}
              variant="secondary"
            >
              Clear Results
            </Button>
          </div>

          {isLoading && <LoadingSpinner />}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <h3 className="font-semibold text-red-800 mb-2">Error:</h3>
              <pre className="text-sm text-red-700 whitespace-pre-wrap">{error}</pre>
            </div>
          )}

          {results && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
              <h3 className="font-semibold mb-2">
                {results.success ? "✅ Success" : "❌ Failed"}
              </h3>
              <div className="space-y-2">
                <div>
                  <strong>Type:</strong> {results.type || "Error"}
                </div>
                {results.data && (
                  <div>
                    <strong>Data:</strong>
                    <pre className="text-xs mt-2 p-2 bg-white rounded border overflow-auto max-h-96">
                      {typeof results.data === "string"
                        ? results.data
                        : JSON.stringify(results.data, null, 2)}
                    </pre>
                  </div>
                )}
                {results.fullLength && (
                  <div className="text-sm text-gray-600">
                    Full response length: {results.fullLength} characters
                  </div>
                )}
                {results.error && (
                  <div>
                    <strong>Error:</strong>
                    <pre className="text-xs mt-2 p-2 bg-red-50 rounded border overflow-auto">
                      {results.error}
                    </pre>
                  </div>
                )}
                {results.stack && (
                  <div>
                    <strong>Stack:</strong>
                    <pre className="text-xs mt-2 p-2 bg-red-50 rounded border overflow-auto max-h-48">
                      {results.stack}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="space-y-2">
          <h3 className="font-semibold">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
            <li>Click "Test Fetch User Games" to test the basic API call</li>
            <li>Click "Test Sync Leagues" to test the full sync process</li>
            <li>Check the browser console for detailed logs</li>
            <li>If errors occur, check the error message and stack trace</li>
          </ol>
        </div>
      </Card>
    </div>
  );
}

