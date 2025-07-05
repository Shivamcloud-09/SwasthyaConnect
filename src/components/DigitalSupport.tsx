
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import jsPDF from 'jspdf';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
    Activity, BrainCircuit, ChevronRight, Download, FilePlus, HeartPulse, LoaderCircle, LogIn, Paperclip, Phone, Trash2, UploadCloud, Video, FileText, Bot
} from 'lucide-react';
import { Separator } from './ui/separator';

type MedicalRecord = {
    id: string;
    userId: string;
    title: string;
    fileName: string;
    downloadURL: string;
    createdAt: Date;
};

// --- Sub-components for clarity ---

const LoginPrompt = () => (
    <div className="flex flex-col items-center justify-center text-center p-8 border rounded-lg bg-card/50 backdrop-blur-sm max-w-lg mx-auto">
        <HeartPulse className="h-16 w-16 text-primary mb-4" />
        <h2 className="text-2xl font-bold font-headline mb-2">Access Your Digital Health Hub</h2>
        <p className="text-muted-foreground mb-6">Please log in to manage your prescriptions, consult with doctors, and access your medical records.</p>
        <Button asChild>
            <Link href="/login"><LogIn className="mr-2" /> Log In to Continue</Link>
        </Button>
    </div>
);

const DigitalPrescriptionTab = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [symptoms, setSymptoms] = useState('');
    const [prescriptionText, setPrescriptionText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGeneratePrescription = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!symptoms.trim() || !user || !db) return;

        setIsLoading(true);
        const dummyPrescription = `
            --- Digital Prescription ---

            Patient: ${user.email}
            Date: ${new Date().toLocaleDateString()}

            Reported Symptoms:
            ${symptoms}

            --- Diagnosis & Advice (Sample) ---
            - Probable Diagnosis: Viral Fever / General Malaise
            - Take complete rest for 3-5 days.
            - Stay hydrated. Drink plenty of fluids like water, coconut water, and soups.
            - Monitor temperature.

            --- Medication (Sample) ---
            1. Tab. Paracetamol 500mg - (1 tablet after food, up to 3 times a day if fever > 100°F)
            2. Tab. Cetirizine 10mg - (1 tablet at night for 3 days for cold symptoms)

            --- Follow-up ---
            Consult a doctor via video if symptoms persist after 3 days or worsen.
            This is a system-generated prescription and not a substitute for professional medical advice.
        `;
        setPrescriptionText(dummyPrescription);

        try {
            await addDoc(collection(db, 'digitalPrescriptions'), {
                userId: user.uid,
                symptoms,
                prescription: dummyPrescription,
                createdAt: serverTimestamp(),
            });
            toast({ title: "Prescription Saved", description: "Your prescription has been saved to your account." });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save the prescription.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadPdf = () => {
        if (!prescriptionText) return;
        const doc = new jsPDF();
        doc.setFontSize(12);
        doc.text(prescriptionText, 10, 10, { maxWidth: 190 });
        doc.save(`prescription-${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Digital Prescription</CardTitle>
                <CardDescription>Enter your symptoms to get a preliminary digital prescription. Always consult a doctor for serious issues.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleGeneratePrescription} className="space-y-4">
                    <Label htmlFor="symptoms">Describe your symptoms or complaints</Label>
                    <Textarea id="symptoms" value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="e.g., Fever, headache, and sore throat for 2 days." required />
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? <LoaderCircle className="animate-spin" /> : 'Generate Prescription'}
                    </Button>
                </form>

                {prescriptionText && (
                    <div className="mt-6 p-4 border rounded-lg bg-muted/50">
                        <h3 className="font-bold mb-2">Generated Prescription:</h3>
                        <pre className="whitespace-pre-wrap text-sm font-sans bg-background p-3 rounded-md">{prescriptionText}</pre>
                        <Button onClick={handleDownloadPdf} className="mt-4 w-full">
                            <Download className="mr-2" /> Download as PDF
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const VideoConsultationTab = () => {
    const { user } = useAuth();
    const handleStartConsultation = () => {
        const roomName = `SwasthyaConnect-Consult-${user?.uid.slice(0, 8)}-${Math.random().toString(36).substring(2, 9)}`;
        window.open(`https://meet.jit.si/${roomName}`, '_blank');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Video Consultation</CardTitle>
                <CardDescription>Connect with a healthcare professional face-to-face from the comfort of your home.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                <Video className="h-16 w-16 mx-auto text-primary mb-4" />
                <p className="mb-4 text-muted-foreground">Click the button below to start a secure video call. No software installation is required.</p>
                <Button onClick={handleStartConsultation} size="lg">Start Video Consultation</Button>
            </CardContent>
        </Card>
    );
};

const MedicalRecordsTab = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchRecords = async () => {
        if (!user || !db) return;
        setIsLoading(true);
        const q = query(collection(db, "medicalRecords"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const fetchedRecords: MedicalRecord[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            fetchedRecords.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate()
            } as MedicalRecord);
        });
        setRecords(fetchedRecords.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
        setIsLoading(false);
    };

    useEffect(() => {
        fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !title.trim() || !user || !storage) return;

        setIsLoading(true);
        const storageRef = ref(storage, `medical-records/${user.uid}/${Date.now()}_${file.name}`);
        
        try {
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            await addDoc(collection(db, 'medicalRecords'), {
                userId: user.uid,
                title,
                fileName: file.name,
                downloadURL,
                createdAt: serverTimestamp(),
            });

            toast({ title: "Upload Successful", description: `"${title}" has been uploaded.` });
            setTitle('');
            setFile(null);
            if(fileInputRef.current) fileInputRef.current.value = "";
            fetchRecords();
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Upload Failed' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (record: MedicalRecord) => {
        if (!user || !storage || !db) return;
        const yes = confirm(`Are you sure you want to delete "${record.title}"?`);
        if (!yes) return;

        const fileRef = ref(storage, `medical-records/${user.uid}/${record.fileName}`);
        const docRef = doc(db, 'medicalRecords', record.id);
        
        try {
            await deleteObject(fileRef);
            await deleteDoc(docRef);
            toast({ title: 'Record Deleted', description: `"${record.title}" has been removed.` });
            fetchRecords();
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Deletion Failed' });
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle className="font-headline">Upload New Record</CardTitle>
                    <CardDescription>Upload prescriptions, lab reports, or other medical documents.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="record-title">Document Title</Label>
                            <Input id="record-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Blood Test Report" required />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="record-file">File (PDF, JPG, PNG)</Label>
                            <Input id="record-file" ref={fileInputRef} type="file" onChange={e => setFile(e.target.files?.[0] || null)} required />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <LoaderCircle className="animate-spin" /> : <UploadCloud className="mr-2" />} Upload Document
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="lg:col-span-2">
                 <CardHeader>
                    <CardTitle className="font-headline">Your Medical Records</CardTitle>
                    <CardDescription>Access and manage your uploaded health documents.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && records.length === 0 ? (
                        <div className="text-center py-8"><LoaderCircle className="mx-auto animate-spin" /></div>
                    ) : records.length > 0 ? (
                        <ul className="space-y-3">
                            {records.map(rec => (
                                <li key={rec.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Paperclip className="h-5 w-5 text-primary" />
                                        <div>
                                            <p className="font-semibold">{rec.title}</p>
                                            <p className="text-xs text-muted-foreground">Uploaded: {rec.createdAt.toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button asChild variant="outline" size="icon">
                                            <a href={rec.downloadURL} target="_blank" rel="noopener noreferrer"><Download /></a>
                                        </Button>
                                         <Button variant="destructive" size="icon" onClick={() => handleDelete(rec)}>
                                            <Trash2 />
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">You have no medical records uploaded.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

const SymptomCheckerTab = () => {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<any>({});
    const [result, setResult] = useState('');
    const { toast } = useToast();

    const questions = [
        { id: 'area', text: 'Where is your main symptom located?', options: ['Head', 'Chest', 'Abdomen', 'Limbs'] },
        { id: 'head', text: 'What kind of head symptom?', options: ['Headache', 'Dizziness', 'Congestion'], dependsOn: { key: 'area', value: 'Head' } },
        { id: 'chest', text: 'What kind of chest symptom?', options: ['Cough', 'Shortness of Breath', 'Pain'], dependsOn: { key: 'area', value: 'Chest' } },
        { id: 'abdomen', text: 'What kind of abdomen symptom?', options: ['Pain', 'Nausea', 'Bloating'], dependsOn: { key: 'area', value: 'Abdomen' } },
        { id: 'limbs', text: 'What kind of limb symptom?', options: ['Pain', 'Numbness', 'Swelling'], dependsOn: { key: 'area', value: 'Limbs' } },
        { id: 'duration', text: 'How long have you had this symptom?', options: ['Less than a day', '1-3 days', 'More than 3 days'], dependsOn: { key: 'head' } },
        { id: 'duration_chest', text: 'How long have you had this symptom?', options: ['Less than a day', '1-3 days', 'More than 3 days'], dependsOn: { key: 'chest' } },
    ];
    
    const visibleQuestions = questions.filter(q => !q.dependsOn || answers[q.dependsOn.key] === q.dependsOn.value);
    const currentQuestion = visibleQuestions[step];

    const handleAnswer = (option: string) => {
        const newAnswers = { ...answers, [currentQuestion.id]: option };
        setAnswers(newAnswers);

        if (step + 1 >= visibleQuestions.length) {
            // End of quiz logic
            let res = "Based on your symptoms, we recommend general care. For a detailed diagnosis, please consult a doctor.";
            if (newAnswers.chest === 'Shortness of Breath') res = "Shortness of breath can be serious. We strongly recommend an immediate video consultation.";
            if (newAnswers.head === 'Headache' && newAnswers.duration === 'More than 3 days') res = "A persistent headache warrants a professional opinion. Please consider a video consultation.";
            setResult(res);
        } else {
            setStep(step + 1);
        }
    };

    const handleReset = () => {
        setStep(0);
        setAnswers({});
        setResult('');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">AI-Powered Symptom Checker</CardTitle>
                <CardDescription>Answer a few questions to get a preliminary analysis. This is not a substitute for a professional diagnosis.</CardDescription>
            </CardHeader>
            <CardContent>
                {result ? (
                    <div className="text-center">
                        <p className="font-semibold mb-4">{result}</p>
                        <div className="flex gap-4 justify-center">
                            <Button onClick={handleReset}>Start Over</Button>
                            <Button asChild variant="secondary"><Link href="/digital-support#video"><Phone className="mr-2" />Consult a Doctor</Link></Button>
                        </div>
                    </div>
                ) : currentQuestion ? (
                    <div>
                        <p className="font-semibold text-lg mb-4">{currentQuestion.text}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {currentQuestion.options.map(opt => (
                                <Button key={opt} variant="outline" size="lg" onClick={() => handleAnswer(opt)} className="justify-start">
                                    <ChevronRight className="mr-2" /> {opt}
                                </Button>
                            ))}
                        </div>
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
};

const WellnessResourcesTab = () => {
    const tips = [
        { title: 'Stay Hydrated', category: 'Nutrition', icon: Droplet, content: 'Drink at least 8 glasses of water a day to keep your body functioning optimally.' },
        { title: 'Mindful Breathing', category: 'Mental Health', icon: BrainCircuit, content: 'Practice 5 minutes of deep breathing to reduce stress and improve focus.' },
        { title: 'Daily Movement', category: 'Fitness', icon: Activity, content: 'Aim for at least 30 minutes of moderate activity like walking, cycling, or dancing each day.' },
        { title: 'Balanced Diet', category: 'Nutrition', icon: Droplet, content: 'Include a variety of fruits, vegetables, lean proteins, and whole grains in your meals.' },
        { title: 'Quality Sleep', category: 'Mental Health', icon: BrainCircuit, content: 'Ensure you get 7-9 hours of quality sleep per night for mental and physical recovery.' },
        { title: 'Strength Training', category: 'Fitness', icon: Activity, content: 'Incorporate strength training exercises at least twice a week to build and maintain muscle mass.' },
    ];
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Wellness Resources</CardTitle>
                <CardDescription>Explore tips and articles to help you maintain a healthy lifestyle.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tips.map((tip, i) => (
                        <Card key={i} className="bg-muted/50">
                            <CardHeader className="flex-row items-center gap-4 space-y-0">
                                <tip.icon className="w-8 h-8 text-primary" />
                                <CardTitle className="text-lg">{tip.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{tip.content}</p>
                            </CardContent>
                        </Card>
                    ))}
                 </div>
            </CardContent>
        </Card>
    );
};


export default function DigitalSupport() {
    const { user, loading } = useAuth();
    const [activeTab, setActiveTab] = useState("prescription");

    useEffect(() => {
        const hash = window.location.hash.replace('#', '');
        if (hash) {
            setActiveTab(hash);
        }
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-2">Digital Health Support</h1>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">Your one-stop solution for digital prescriptions, video consultations, medical records, and wellness advice.</p>
            </div>
            
            {!user ? (
                <LoginPrompt />
            ) : (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto md:h-12">
                        <TabsTrigger value="prescription" className="py-2"><FileText className="mr-2"/>Prescription</TabsTrigger>
                        <TabsTrigger value="video" className="py-2"><Video className="mr-2"/>Consultation</TabsTrigger>
                        <TabsTrigger value="records" className="py-2"><FilePlus className="mr-2"/>Records</TabsTrigger>
                        <TabsTrigger value="symptom-checker" className="py-2"><Bot className="mr-2"/>Symptom Checker</TabsTrigger>
                        <TabsTrigger value="wellness" className="py-2"><HeartPulse className="mr-2"/>Wellness</TabsTrigger>
                    </TabsList>

                    <div className="mt-6">
                        <TabsContent value="prescription"><DigitalPrescriptionTab /></TabsContent>
                        <TabsContent value="video"><VideoConsultationTab /></TabsContent>
                        <TabsContent value="records"><MedicalRecordsTab /></TabsContent>
                        <TabsContent value="symptom-checker"><SymptomCheckerTab /></TabsContent>
                        <TabsContent value="wellness"><WellnessResourcesTab /></TabsContent>
                    </div>
                </Tabs>
            )}
        </div>
    );
}
