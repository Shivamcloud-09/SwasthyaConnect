
"use client";

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Home } from "lucide-react"

type RequestDoctorVisitProps = {
    hospitalName: string;
}

export default function RequestDoctorVisit({ hospitalName }: RequestDoctorVisitProps) {
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const patientName = formData.get('name');
    toast({
        title: "Request Sent!",
        description: `Your request for a home visit for ${patientName} has been sent to ${hospitalName}.`,
    });
    // Here you would typically close the dialog if it was controlled
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" className="w-full">
            <Home className="mr-2 h-4 w-4" /> Request Home Visit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request a Home Doctor Visit</DialogTitle>
          <DialogDescription>
            Fill out the form below. A representative from {hospitalName} will contact you shortly.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                Patient Name
                </Label>
                <Input id="name" name="name" required className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                Address
                </Label>
                <Input id="address" name="address" required className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="symptoms" className="text-right">
                Symptoms
                </Label>
                <Textarea id="symptoms" name="symptoms" required className="col-span-3" />
            </div>
            </div>
            <DialogFooter>
                <Button type="submit">Submit Request</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
