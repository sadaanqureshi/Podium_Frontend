import UnifiedCourseDetail from '@/components/courses/UnifiedCourseDetail'

export default function Page({ params }: any) {
    return <UnifiedCourseDetail params={params} role="admin" />;
}