import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';

export default function ResourcesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resources, setResources] = useState<Array<any>>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchResources = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await axios.get('/api/resources', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setResources(data.resources || []);
        setCategories(data.categories || []);
      } catch (err: any) {
        console.error('Error fetching resources:', err);
        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to load resources'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [user]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  // Filter resources
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          resource.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Resources</h2>
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex items-between justify-between text-sm">
                      <span>Resources</span>
                      <span className="flex items-center space-x-2">
                        <div className="h-3 w-3 rounded-full bg-indigo-500"></div>
                        <span>Loading...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Resources</h2>
            {/* Content will be rendered below */}
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
            <svg className="h-5 w-5 text-indigo-600" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Resources
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Access study materials, references, and learning resources
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="mb-3 sm:mb-0">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search resources by title, description, or tags..."
                className="w-full pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div className="sm:self-end">
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="block w-full pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        {resources.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p className="mt-4 text-lg font-medium text-gray-900">No resources found</p>
            <p className="text-sm text-gray-500 mt-2">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredResources.map((resource: any) => (
              <div key={resource.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      {getResourceIcon(resource.type)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{resource.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{resource.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                        {resource.category}
                      </span>
                      {resource.tags && resource.tags.length > 0 && (
                        <>
                          {resource.tags.map((tag: string, index: number) => (
                            <span key={index} className="px-2 py-0.5 bg-gray-200 text-gray-800 text-xs rounded-full">
                              #{tag}
                            </span>
                          ))}
                        </>
                      )}
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-800 text-xs rounded-full">
                        {resource.difficulty || 'Beginner'}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center space-x-3">
                      <span className="text-xs text-gray-500">
                        <span className="mr-1">📅</span>
                        {new Date(resource.createdAt).toLocaleDateString()}
                      </span>
                      <span className="ml-4 text-xs text-gray-500">
                        <span className="mr-1">⏱️</span>
                        {resource.estimatedTime} min read
                      </span>
                    </div>
                    <div className="mt-3">
                      <Link
                        href={`/resources/${resource.id}`}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        View Resource →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

// Helper function to get resource icon based on type
function getResourceIcon(type: string) {
  switch (type) {
    case 'article':
      return '📰';
    case 'video':
      return '🎥';
    case 'pdf':
      return '📄';
    case 'link':
      return '🔗';
    case 'note':
      return '📝';
    case 'book':
      return '📚';
    default:
      return '📎';
  }
}