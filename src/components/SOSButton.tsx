
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { PhoneCall } from "lucide-react";

export default function SOSButton() {
  const { role } = useAuth();

  if (role === 'admin') {
    return null;
  }
  
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          size="lg" 
          className="fixed bottom-6 right-6 rounded-full h-16 w-16 shadow-2xl z-50 animate-pulse"
        >
          <PhoneCall className="h-8 w-8" />
          <span className="sr-only">SOS</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-headline text-2xl">Emergency Assistance</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to call for emergency medical assistance. Please stay calm and provide your location clearly to the operator.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="text-center my-4">
          <p className="text-lg text-muted-foreground">Emergency Number:</p>
          <p className="text-4xl font-bold text-destructive">102</p>
          <p className="text-sm mt-2">(Ambulance Service)</p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <a href="tel:102">Call Now</a>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
