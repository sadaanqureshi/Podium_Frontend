import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UploadingFile {
  file: File;
  progress: number;
}

interface AssignmentState {
  currentAssignment: any | null;
  submission: any | null;
  loading: boolean;
  error: string | null;
  uploadProgress: number;
  uploadingFiles: UploadingFile[];
  fileNames: Record<string, string>; // Map of fileUrl -> fileName
}

// Load submission from localStorage on initialization
const getInitialSubmission = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('assignment_submission');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error("Error parsing assignment_submission:", error);
        return null;
      }
    }
  }
  return null;
};

const getInitialFileNames = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('assignment_file_names');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error("Error parsing assignment_file_names:", error);
        return {};
      }
    }
  }
  return {};
};

const initialState: AssignmentState = {
  currentAssignment: null,
  submission: getInitialSubmission(),
  loading: false,
  error: null,
  uploadProgress: 0,
  uploadingFiles: [],
  fileNames: getInitialFileNames(),
};

const assignmentSlice = createSlice({
  name: 'assignment',
  initialState,
  reducers: {
    setAssignment: (state, action: PayloadAction<any>) => {
      state.currentAssignment = action.payload;
      state.loading = false;
      state.error = null;
    },
    setSubmission: (state, action: PayloadAction<any>) => {
      state.submission = action.payload;
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('assignment_submission', JSON.stringify(action.payload));
      }
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    setUploadingFiles: (state, action: PayloadAction<UploadingFile[]>) => {
      state.uploadingFiles = action.payload;
    },
    addFileName: (state, action: PayloadAction<{ url: string; name: string }>) => {
      state.fileNames[action.payload.url] = action.payload.name;
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('assignment_file_names', JSON.stringify(state.fileNames));
      }
    },
    removeFileName: (state, action: PayloadAction<string>) => {
      delete state.fileNames[action.payload];
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('assignment_file_names', JSON.stringify(state.fileNames));
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearAssignment: (state) => {
      state.currentAssignment = null;
      state.submission = null;
      state.error = null;
      state.uploadProgress = 0;
      state.uploadingFiles = [];
    },
    clearUploadProgress: (state) => {
      state.uploadProgress = 0;
      state.uploadingFiles = [];
    },
  },
});

export const { 
  setAssignment, 
  setSubmission, 
  setLoading, 
  setError, 
  clearAssignment,
  setUploadProgress,
  setUploadingFiles,
  addFileName,
  removeFileName,
  clearUploadProgress
} = assignmentSlice.actions;
export default assignmentSlice.reducer;

