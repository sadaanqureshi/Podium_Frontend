'use client';
import { useEffect } from 'react';
import { useAppSelector } from '@/lib/store/hooks';
import nProgress from 'nprogress';
import 'nprogress/nprogress.css';

// Custom CSS for YouTube Red Line
const progressBarStyle = `
  #nprogress .bar {
    background: #3b82f6 !important; /* Blue color */
    height: 3px !important;
    box-shadow: 0 0 10px #3b82f6, 0 0 5px #3b82f6;
  }
  #nprogress .spinner { display: none !important; }
`;

const GlobalProgressBar = () => {
    const activeRequests = useAppSelector((state) => state.ui.activeRequests);

    useEffect(() => {
        nProgress.configure({ showSpinner: false, speed: 400 });

        if (activeRequests > 0) {
            nProgress.start();
        } else {
            nProgress.done();
        }
    }, [activeRequests]);

    return <style dangerouslySetInnerHTML={{ __html: progressBarStyle }} />;
};

export default GlobalProgressBar;