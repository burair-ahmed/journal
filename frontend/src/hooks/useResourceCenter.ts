import { useActiveAnnouncements } from './useAnnouncements';
import { useBlogPosts } from './useBlog';

export const useResourceCenter = () => {
    const { data: announcements, isLoading: isLoadingAnnouncements } = useActiveAnnouncements();
    // Fetch only published blog posts
    const { data: blogData, isLoading: isLoadingBlogs } = useBlogPosts(1, 100, 'published'); 
    
    return {
        announcements: announcements || [],
        blogs: blogData?.posts || [],
        isLoading: isLoadingAnnouncements || isLoadingBlogs
    };
};
