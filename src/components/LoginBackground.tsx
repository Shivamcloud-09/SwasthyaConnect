
import Image from 'next/image';
import { cn } from '@/lib/utils';

type LoginBackgroundProps = {
    children: React.ReactNode;
    className?: string;
};

export default function LoginBackground({ children, className }: LoginBackgroundProps) {
    return (
        <div className="relative flex items-center justify-center min-h-[calc(100vh-80px)] w-full bg-muted/30 p-4">
            {/* Background Illustration */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <Image
                    src="https://images.unsplash.com/photo-1629904853716-f0bc54eea481?q=80&w=1920&auto=format&fit=crop"
                    alt="Hospital reception area"
                    fill
                    className="object-cover"
                    data-ai-hint="hospital reception"
                />
                <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative text-center text-white/10 select-none">
                        <svg
                            className="w-48 h-48 md:w-64 md:h-64"
                            viewBox="0 0 100 100"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M50,10 L50,90 M10,50 L90,50"
                                stroke="currentColor"
                                strokeWidth="8"
                                strokeLinecap="round"
                            />
                        </svg>
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl md:text-2xl font-extrabold tracking-widest">
                            HOSPITAL
                        </span>
                    </div>
                </div>
            </div>

            {/* Foreground Content */}
            <div className={cn("relative z-10", className)}>
                {children}
            </div>
        </div>
    );
}
