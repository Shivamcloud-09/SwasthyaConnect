
import CuratedList from "@/components/CuratedList";

export default function CuratedPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-2">Curated Hospitals</h1>
                <p className="text-lg text-muted-foreground">A list of trusted and verified hospitals in our network.</p>
            </div>
            <CuratedList />
        </div>
    );
}
