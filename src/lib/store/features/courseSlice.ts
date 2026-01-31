import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getMyEnrolledCoursesAPI, getCourseWithContentAPI } from '@/lib/api/apiService';

// ==============================
// TYPES & INTERFACES
// ==============================
interface CourseContent {
  course: any;
  sections: any[];
  enrollments?: any[];
  enrollmentCount?: number;
}

interface CourseState {
  enrolledCourses: any[];
  courseContent: Record<number, CourseContent>; // Keyed by courseId
  loading: {
    enrolledCourses: boolean;
    courseContent: Record<number, boolean>; // Keyed by courseId
    preflighting: boolean;
  };
  preflightedCourses: number[]; // Array of course IDs that have been preflighted
  lastFetched: number | null;
  error: string | null;
}

const initialState: CourseState = {
  enrolledCourses: [],
  courseContent: {},
  loading: {
    enrolledCourses: false,
    courseContent: {},
    preflighting: false,
  },
  preflightedCourses: [],
  lastFetched: null,
  error: null,
};

// ==============================
// ASYNC THUNKS
// ==============================

/**
 * Fetch enrolled courses and automatically preflight all course content
 */
export const fetchEnrolledCourses = createAsyncThunk(
  'course/fetchEnrolledCourses',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await getMyEnrolledCoursesAPI();
      
      // Extract course IDs from enrolled courses
      const courseIds = response.map((enrollment: any) => {
        const course = enrollment.course || enrollment;
        return course.id;
      }).filter((id: number) => id != null);

      // Automatically preflight all course content in parallel (fire and forget)
      if (courseIds.length > 0) {
        // Dispatch preflight asynchronously - don't wait for it
        dispatch(preflightCourseContent(courseIds));
      }

      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch enrolled courses');
    }
  }
);

/**
 * Preflight course content for multiple courses in parallel
 */
export const preflightCourseContent = createAsyncThunk(
  'course/preflightCourseContent',
  async (courseIds: number[], { getState, rejectWithValue }) => {
    try {
      const state = getState() as { course: CourseState };
      const { courseContent, preflightedCourses } = state.course;

      // Filter out courses that are already preflighted
      const coursesToFetch = courseIds.filter(
        (id) => !preflightedCourses.includes(id) && !courseContent[id]
      );

      if (coursesToFetch.length === 0) {
        return { courseIds: [], content: {} };
      }

      // Fetch all course content in parallel
      const fetchPromises = coursesToFetch.map(async (courseId) => {
        try {
          const content = await getCourseWithContentAPI(courseId);
          return { courseId, content };
        } catch (error) {
          console.error(`Failed to preflight course ${courseId}:`, error);
          return { courseId, content: null };
        }
      });

      const results = await Promise.all(fetchPromises);

      // Build content map
      const contentMap: Record<number, CourseContent> = {};
      const successfulIds: number[] = [];

      results.forEach(({ courseId, content }) => {
        if (content) {
          contentMap[courseId] = content;
          successfulIds.push(courseId);
        }
      });

      return { courseIds: successfulIds, content: contentMap };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to preflight course content');
    }
  }
);

/**
 * Fetch course content for a single course (checks cache first)
 * Returns immediately from cache if available, no API call
 */
export const fetchCourseContent = createAsyncThunk(
  'course/fetchCourseContent',
  async (courseId: number, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { course: CourseState };
      const { courseContent } = state.course;

      // Check if course content is already in cache - return immediately
      if (courseContent[courseId]) {
        // Return synchronously from cache - no loading state needed
        return { courseId, content: courseContent[courseId], fromCache: true };
      }

      // Fetch from API if not in cache
      const content = await getCourseWithContentAPI(courseId);
      return { courseId, content, fromCache: false };
    } catch (error: any) {
      return rejectWithValue(error.message || `Failed to fetch course content for course ${courseId}`);
    }
  },
  {
    // Condition to prevent dispatch if data already exists
    condition: (courseId: number, { getState }) => {
      const state = getState() as { course: CourseState };
      // Don't dispatch if we already have the data
      return !state.course.courseContent[courseId];
    }
  }
);

// ==============================
// SLICE
// ==============================
const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {
    setEnrolledCourses: (state, action: PayloadAction<any[]>) => {
      state.enrolledCourses = action.payload;
    },
    setCourseContent: (state, action: PayloadAction<{ courseId: number; content: CourseContent }>) => {
      state.courseContent[action.payload.courseId] = action.payload.content;
      if (!state.preflightedCourses.includes(action.payload.courseId)) {
        state.preflightedCourses.push(action.payload.courseId);
      }
    },
    clearCourseCache: (state) => {
      state.enrolledCourses = [];
      state.courseContent = {};
      state.preflightedCourses = [];
      state.lastFetched = null;
      state.error = null;
      state.loading = {
        enrolledCourses: false,
        courseContent: {},
        preflighting: false,
      };
    },
    refreshCourseContent: (state, action: PayloadAction<number>) => {
      // Remove specific course from cache to force refresh
      delete state.courseContent[action.payload];
      state.preflightedCourses = state.preflightedCourses.filter(id => id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // fetchEnrolledCourses
    builder
      .addCase(fetchEnrolledCourses.pending, (state) => {
        state.loading.enrolledCourses = true;
        state.error = null;
      })
      .addCase(fetchEnrolledCourses.fulfilled, (state, action) => {
        state.loading.enrolledCourses = false;
        state.enrolledCourses = action.payload;
        state.lastFetched = Date.now();
        state.error = null;
      })
      .addCase(fetchEnrolledCourses.rejected, (state, action) => {
        state.loading.enrolledCourses = false;
        state.error = action.payload as string;
      });

    // preflightCourseContent
    builder
      .addCase(preflightCourseContent.pending, (state) => {
        state.loading.preflighting = true;
        state.error = null;
      })
      .addCase(preflightCourseContent.fulfilled, (state, action) => {
        state.loading.preflighting = false;
        // Store all preflighted course content
        Object.entries(action.payload.content).forEach(([courseIdStr, content]) => {
          const courseId = parseInt(courseIdStr, 10);
          state.courseContent[courseId] = content as CourseContent;
          if (!state.preflightedCourses.includes(courseId)) {
            state.preflightedCourses.push(courseId);
          }
        });
        state.error = null;
      })
      .addCase(preflightCourseContent.rejected, (state, action) => {
        state.loading.preflighting = false;
        state.error = action.payload as string;
      });

    // fetchCourseContent
    builder
      .addCase(fetchCourseContent.pending, (state, action) => {
        // Only set loading if not from cache (condition prevents dispatch if cached)
        const courseId = action.meta.arg;
        // Only set loading if we don't already have the data
        if (!state.courseContent[courseId]) {
          state.loading.courseContent[courseId] = true;
        }
        state.error = null;
      })
      .addCase(fetchCourseContent.fulfilled, (state, action) => {
        const { courseId, content } = action.payload;
        state.loading.courseContent[courseId] = false;
        // Only store if not from cache (already stored)
        if (!action.payload.fromCache) {
          state.courseContent[courseId] = content;
          if (!state.preflightedCourses.includes(courseId)) {
            state.preflightedCourses.push(courseId);
          }
        }
        state.error = null;
      })
      .addCase(fetchCourseContent.rejected, (state, action) => {
        const courseId = action.meta.arg;
        state.loading.courseContent[courseId] = false;
        state.error = action.payload as string;
      });
  },
});

export const { setEnrolledCourses, setCourseContent, clearCourseCache, refreshCourseContent } = courseSlice.actions;
export default courseSlice.reducer;

