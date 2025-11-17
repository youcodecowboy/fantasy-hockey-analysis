"use client";

import { useState } from "react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

export default function TestYahooPage() {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testAuthorizeRoute = async () => {
    addResult("Testing /api/yahoo/authorize...");
    try {
      const response = await fetch("/api/yahoo/authorize", { redirect: "manual" });
      if (response.status === 0 || response.type === "opaqueredirect") {
        addResult("✅ Authorize route redirects correctly (OAuth flow started)");
      } else {
        addResult(`⚠️ Unexpected response: ${response.status} ${response.statusText}`);
      }
    } catch (error: any) {
      addResult(`❌ Error: ${error.message}`);
    }
  };

  const testCallbackRoute = async () => {
    addResult("Testing /api/yahoo/callback (should redirect with error)...");
    try {
      const response = await fetch("/api/yahoo/callback", { redirect: "manual" });
      if (response.status === 0 || response.type === "opaqueredirect") {
        addResult("✅ Callback route handles requests correctly");
      } else {
        addResult(`⚠️ Response: ${response.status} ${response.statusText}`);
      }
    } catch (error: any) {
      addResult(`❌ Error: ${error.message}`);
    }
  };

  const checkEnvironment = () => {
    addResult("Checking environment variables...");
    const hasClientId = !!process.env.NEXT_PUBLIC_YAHOO_CLIENT_ID;
    const hasRedirectUri = !!process.env.NEXT_PUBLIC_YAHOO_REDIRECT_URI;
    
    addResult(`Client ID configured: ${hasClientId ? "✅" : "❌"}`);
    addResult(`Redirect URI configured: ${hasRedirectUri ? "✅" : "❌"}`);
    
    if (hasRedirectUri) {
      const redirectUri = process.env.NEXT_PUBLIC_YAHOO_REDIRECT_URI;
      addResult(`Redirect URI: ${redirectUri}`);
      if (redirectUri?.includes("localhost")) {
        addResult("⚠️ WARNING: Yahoo OAuth does not allow localhost URLs!");
      }
    }
  };

  const testCookieStorage = () => {
    addResult("Testing cookie storage...");
    const testData = { test: "value", yahooUserId: "test123" };
    document.cookie = `yahoo_token_data=${JSON.stringify(testData)}; path=/; max-age=300`;
    
    const cookies = document.cookie.split("; ");
    const found = cookies.find((c) => c.startsWith("yahoo_token_data="));
    
    if (found) {
      addResult("✅ Cookie can be set and read");
      // Clean up
      document.cookie = "yahoo_token_data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    } else {
      addResult("❌ Cookie storage test failed");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Yahoo OAuth Test Page</h1>
      
      <Card>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={checkEnvironment}>Check Environment</Button>
            <Button onClick={testAuthorizeRoute} variant="secondary">
              Test Authorize Route
            </Button>
            <Button onClick={testCallbackRoute} variant="secondary">
              Test Callback Route
            </Button>
            <Button onClick={testCookieStorage} variant="secondary">
              Test Cookie Storage
            </Button>
            <Button
              onClick={() => setTestResults([])}
              variant="secondary"
            >
              Clear Results
            </Button>
          </div>

          {testResults.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold mb-2">Test Results:</h3>
              <div className="space-y-1">
                {testResults.map((result, idx) => (
                  <div key={idx} className="text-sm font-mono">
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <div className="space-y-2">
          <h3 className="font-semibold">Important Notes:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            <li>Yahoo OAuth does NOT allow localhost URLs</li>
            <li>You must test on your production Vercel URL</li>
            <li>Make sure redirect URI matches exactly in Yahoo console</li>
            <li>Check browser console and Network tab for detailed logs</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

