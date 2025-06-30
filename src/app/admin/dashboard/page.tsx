
import { hospitals } from '@/data/hospitals';
import AdminDashboard from '@/components/AdminDashboard';

export default function AdminDashboardPage() {
    return <AdminDashboard initialHospitals={hospitals} />;
}
