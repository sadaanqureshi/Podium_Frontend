import {
  getPublicCategoriesAPI,
  getPublicCoursesAPI,
  resolveMediaUrl,
} from '@/lib/api/apiService';

export type CatalogCourse = {
  id: number;
  title: string;
  author: string;
  description: string;
  rating: number;
  imageUrl: string;
  totalLessons: number;
  price: string | number | null;
  category?: string;
  href?: string;
  ctaLabel?: string;
};

export type CatalogCategory = {
  id: number | string;
  name: string;
};

export type PublicCatalog = {
  courses: CatalogCourse[];
  categories: CatalogCategory[];
  totalItems: number;
  requiresAuth: boolean;
};

function teacherName(teacher: any) {
  if (!teacher) return 'Academy Faculty';
  const name = `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim();
  return name || 'Academy Faculty';
}

export function mapPublicCourse(item: any, href?: string, ctaLabel?: string): CatalogCourse {
  return {
    id: item.id,
    title: item.courseName || item.title || 'Untitled Course',
    author: teacherName(item.teacher),
    description: item.shortDescription || item.description || 'No description provided.',
    rating: item.avgRating || item.rating || 0,
    imageUrl: resolveMediaUrl(item.coverImg || item.imageUrl) || '/blankcover.jpg',
    totalLessons: item.totalLectures || item.totalLessons || 0,
    price: item.price ?? null,
    category: item.courseCategory?.name || item.category?.name,
    href,
    ctaLabel,
  };
}

export async function loadPublicCatalog(limit = 8): Promise<PublicCatalog> {
  const [coursesRes, catsRes] = await Promise.all([
    getPublicCoursesAPI(1, limit),
    getPublicCategoriesAPI(),
  ]);

  const rawCourses = coursesRes.data || [];
  const fromCourses = rawCourses
    .map((item: any) => item.courseCategory?.name)
    .filter(Boolean) as string[];

  const apiCats: CatalogCategory[] = (catsRes.data || [])
    .map((c: any) => ({
      id: c.id ?? c.name,
      name: c.name || c.categoryName || '',
    }))
    .filter((c: CatalogCategory) => c.name);

  const uniqueNames = Array.from(new Set([...apiCats.map((c) => c.name), ...fromCourses]));
  const categories = uniqueNames.map((name) => {
    const match = apiCats.find((c) => c.name === name);
    return match || { id: name, name };
  });

  return {
    courses: rawCourses.map((item: any) => mapPublicCourse(item)),
    categories,
    totalItems: Number(coursesRes.meta?.totalItems ?? rawCourses.length) || 0,
    requiresAuth: coursesRes.requiresAuth && rawCourses.length === 0,
  };
}
