
"use client";

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";


type UserRatingProps = {
    currentRating: number | null;
    onRatingChange: (rating: number) => void;
};

export default function UserRating({ currentRating, onRatingChange }: UserRatingProps) {
    const [hoverRating, setHoverRating] = useState(0);
    const { toast } = useToast();

    const handleClick = (rating: number) => {
        onRatingChange(rating);
        toast({
            title: "Rating Submitted!",
            description: `You gave a rating of ${rating} stars. Thank you for your feedback.`,
        });
    }

    return (
        <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={cn(
                        'h-6 w-6 cursor-pointer transition-colors',
                        (hoverRating || currentRating || 0) >= star
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                    )}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => handleClick(star)}
                />
            ))}
        </div>
    );
}
