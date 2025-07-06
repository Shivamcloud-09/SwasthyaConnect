'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] bg-muted/40 p-4">
      <Card className="w-full max-w-lg text-center bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="font-headline text-2xl text-destructive">An Error Occurred</CardTitle>
          <CardDescription>
            Something went wrong while trying to load this page.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="p-4 bg-muted rounded-md">
                <p className="text-sm font-mono text-muted-foreground">{error.message || "An unknown error has occurred."}</p>
            </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => reset()}>
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
