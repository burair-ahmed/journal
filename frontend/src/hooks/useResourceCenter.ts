import { useActiveAnnouncements } from './useAnnouncements';
import { usePublishedBlogPosts } from './useBlog';
import { useActiveFAQs } from './useFAQ';

export const useResourceCenter = () => {
    const { data: announcements, isLoading: isLoadingAnnouncements } = useActiveAnnouncements();
    // Fetch only published blog posts (optimized)
    const { data: blogs, isLoading: isLoadingBlogs } = usePublishedBlogPosts(10); 
    const { data: faqs, isLoading: isLoadingFAQs } = useActiveFAQs();
    
    return {
        announcements: announcements || [],
        blogs: blogs || [],
        faqs: faqs || [],
        isLoading: isLoadingAnnouncements || isLoadingBlogs || isLoadingFAQs
    };
};
