
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminLoginForm from "@/components/AdminLoginForm"
import UserLoginForm from "@/components/UserLoginForm"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card"

type UnifiedLoginFormProps = {
    defaultTab?: 'user' | 'hospital';
}

export default function UnifiedLoginForm({ defaultTab = 'user' }: UnifiedLoginFormProps) {
    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
                <CardDescription>Select your login type to continue</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue={defaultTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="user">User</TabsTrigger>
                        <TabsTrigger value="hospital">Hospital Admin</TabsTrigger>
                    </TabsList>
                    <TabsContent value="user">
                        <UserLoginForm />
                    </TabsContent>
                    <TabsContent value="hospital">
                        <AdminLoginForm />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
