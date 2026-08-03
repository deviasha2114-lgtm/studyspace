import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function ResourcePage({ params }: { params: { resourceId: string } }) {
  const { user } = useAuth();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedResources, setRelatedResources] = useState([]);
  const router = useRouter();
  const pathname = usePathname();
  const resourceId = params.resourceId;

  useEffect(() => {
    const fetchResource = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await axios.get(`/api/resources/${resourceId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setResource(response.data.data);

        // Fetch related resources (same category)
        const relatedResponse = await axios.get(`/api/resources?category=${response.data.data.category}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const related = relatedResponse.data.data || [];
        setRelatedResources can only include with some already selectedRelated!= ).filter.is relatedResources = .

        filter((r: any) => r.id !== resourceId).slice(0, 3);
      } catch (err: any) {
        console.error('Error fetching resource:', err);
        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to load resource'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [user, resourceId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Loading Resource...</h2>
            <Link href="/resources" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to Resources
            </Link>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-500">Loading resource details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Resource</h2>
            <Link href="/resources" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to Resources
            </Link>
          </div>
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Resource</h2>
            <Link href="/resources" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to Resources
            </Link>
          </div>
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Resource not found</h3>
            <p className="text-sm text-gray-500 mt-2">
              The resource you're looking for doesn't exist or has been removed.
            </p>
            <Link
              href="/resources"
              className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
            >
              Back to Resources
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button and Share */}
        <div className="mb-6 flex justify-between items-start flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-3 mb-3 md:mb-0">
            <Link
              href="/resources"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to Resources
            </Link>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full hover:bg-indigo-200"
            >
              Copy Link
            </button>
            <button
              onClick={() => {
                // Placeholder for share functionality
                alert('Sharing feature coming soon!');
              }}
              className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full hover:bg-indigo-200"
            >
              Share
            </button>
          </div>
        </div>

        {/* Resource Header */}
        <div className="mb-8">
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                {getResourceTypeIcon(resource.type)}
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">{resource.title}</h1>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                  {resource.category}
                </span>
                <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full">
                  {resource.type}
                </span>
                {resource.difficulty && (
                  <span className={`px-3 py-1 bg-${getDifficultyColor(resource.difficulty)}-100 text-${getDifficultyColor(resource.difficulty)}-800 rounded-full`}>
                    {resource.difficulty}
                  </span>
                )}
              </div>
              <p className="text-gray-600">{resource.description}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {resource.tags?.map((tag: string, index: number) => (
                  <span key={index} className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                <span>⏱️ {resource.estimatedTime} min read</span>
                <span>👁️ {resource.views?.toLocaleString() || '0'} views</span>
                {resource.rating && (
                  <span>
                    ⭐ {resource.rating.toFixed(1)}
                    {Array(5).fill(0).map((_, i) =>
                      i < Math.floor(resource.rating) ? '★' :
                      i === Math.floor(resource.rating) && (resource.rating % 1 >= 0.5) ? '½' : '☆'
                    ).join('')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Resource Content */}
        <div className="bg-white rounded-lg shadow-md">
          {/* Tabs */}
          <div className="border-b border-gray-200 pb-2 mb-6">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`${activeTab === 'overview' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'} pb-2`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('content')}
                className={`${activeTab === 'content' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'} pb-2`}
              >
                Content
              </button>
              {resource.type === 'video' && (
                <button
                  onClick={() => setActiveTab('video')}
                  className={`${activeTab === 'video' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'} pb-2`}
                >
                  Video
                </button>
              )}
              {resource.type === 'book' && (
                <button
                  onClick={() => setActiveTab('chapters')}
                  className={`${activeTab === 'chapters' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'} pb-2`}
                >
                  Chapters
                </button>
              )}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* About */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">About this Resource</h3>
                <p className="text-gray-600">{resource.description}</p>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <span className="flex-shrink-0 text-indigo-600">📅</span>
                      <span>
                        <p className="font-medium text-gray-900">Published</p>
                        <p className="text-sm text-gray-500">
                          {new Date(resource.createdAt).toLocaleDateString()}
                        </p>
                      </span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="flex-shrink-0 text-indigo-600">📚</span>
                      <span>
                        <p className="font-medium text-gray-900">Category</p>
                        <p className="text-sm text-gray-500">{resource.category}</p>
                      </span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="flex-shrink-0 text-indigo-600">🏷️</span>
                      <span>
                        <p className="font-medium text-gray-900">Tags</p>
                        <p className="text-sm text-gray-500">
                          {resource.tags?.join(', ') || 'None'}
                        </p>
                      </span>
                    </div>
                    {resource.difficulty && (
                      <div className="flex items-start space-x-3">
                        <span className="flex-shrink-0 text-indigo-600">⚖️</span>
                        <span>
                          <p className="font-medium text-gray-900">Difficulty</p>
                          <p className="text-sm text-gray-500">{resource.difficulty}</p>
                        </span>
                      </span>
                    }
                    {resource.estimatedTime && (
                      <div className="flex items-start space-x-3">
                        <span className="flex-shrink-0 text-indigo-600">⏱️</span>
                        <span>
                          <p className="font-medium text-gray-900">Estimated Time</p>
                          <p className="text-sm text-gray-500">{resource.estimatedTime} minutes</p>
                        </span>
                      </span>
                    }
                    {resource.pages && (
                      <div className="flex items-start space-x-3">
                        <span className="flex-shrink-0 text-indigo-600">📄</span>
                        <span>
                          <p className="font-medium text-gray-900">Pages</p>
                          <p className="text-sm text-gray-500">{resource.pages}</p>
                        </span>
                      </span>
                    }
                  </div>
                </div>

                {/* Statistics */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <span className="flex-shrink-0 text-indigo-600">👁️</span>
                        <span>
                          <p className="font-medium text-gray-900">Views</p>
                          <p className="text-sm text-gray-500">{resource.views?.toLocaleString() || '0'}</p>
                        </span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="flex-shrink-0 text-indigo-600">⭐</span>
                        <span>
                          <p className="font-medium text-gray-900">Rating</p>
                          <p className="text-sm text-gray-500">
                            {resource.rating?.toFixed(1) || '0'}/5
                          </span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="flex-shrink-0 text-indigo-600">💬</span>
                        <span>
                          <p className="font-medium text-gray-900">Comments</p>
                          <p className="text-sm text-gray-500">{resource.comments?.toLocaleString() || '0'}</p>
                        </span>
                    </div>
                    {resource.downloads && (
                      <div className="flex items-start space-x-3">
                        <span className="flex-shrink-0 text-indigo-600">💾</span>
                        <span>
                          <p className="font-medium text-gray-900">Downloads</p>
                          <p className="text-sm text-gray-500">{resource.downloads?.toLocaleString() || '0'}</p>
                        </span>
                    </div>
                  }
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      // Simulate adding to favorites
                      alert('Added to your favorites!');
                    }}
                    className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow-sm hover:bg-indigo-700"
                  >
                    ⭐ Save to Favorites
                  </button>
                  {resource.type === 'pdf' || resource.url?.endsWith('.pdf') && (
                    <button
                      onClick={() => {
                        // Simulate download
                        alert('Download starting...');
                      }}
                      className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg shadow-sm hover:bg-green-700"
                    >
                      📥 Download PDF
                    </button>
                  )}
                  {!resource.type === 'pdf' && !resource.url?.endsWith('.pdf') && (
                    <button
                      onClick={() => {
                        // Simulate opening external link
                        window.open(resource.url || '#', '_blank');
                      }}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700"
                    >
                      🔗 Open External Resource
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{resource.title}</h2>
              <p className="mb-4 text-gray-600">{resource.description}</p>
              {/* Simulated content based on resource type */}
              {resource.type === 'article' || resource.type === 'text' && (
                <>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                  <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                  <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Key Concepts</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Important concept one</li>
                    <li>Important concept two</li>
                    <li>Important concept three</li>
                  </ul>
                  <blockquote className="border-l-4 border-indigo-500 pl-4 italic my-6">
                    "The important thing is not to stop questioning. Curiosity has its own reason for existence."
                  </blockquote>
                  <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
                </>
              )}
              {resource.type === 'video' && (
                <div className="mb-6">
                  <div className="relative w-full h-0 pb-[56.25%] bg-gray-200 rounded-lg overflow-hidden">
                    <iframe
                      title="Educational video"
                      src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    ></iframe>
                  </div>
                  <p className="mt-4 text-gray-600">
                    Note: This is a placeholder video. In a real implementation, this would embed the actual educational video content.
                  </p>
                </div>
              )}
              {resource.type === 'book' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Book Details</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <span className="flex-shrink-0 text-indigo-600">📖</span>
                      <span>
                        <p className="font-medium text-gray-900">Author</p>
                        <p className="text-sm text-gray-500">{resource.author || 'Unknown Author'}</p>
                      </span>
                    </span>
                    <div className="flex items-start space-x-3">
                      <span className="flex-shrink-0 text-indigo-600">🏢</span>
                      <span>
                        <p className="font-medium text-gray-900">Publisher</p>
                        <p className="text-sm text-gray-500">{resource.publisher || 'Various'}</p>
                      </span>
                    </span>
                    <div className="flex items-start space-x-3">
                      <span className="flex-shrink-0 text-indigo-600">📅</span>
                      <span>
                        <p className="font-medium text-gray-900">Published</p>
                        <p className="text-sm text-gray-500">{resource.publicationDate || 'Unknown'}</p>
                      </span>
                    </span>
                    <div className="flex items-start space-x-3">
                      <span className="flex-shrink-0 text-indigo-600">🔖</span>
                      <span>
                        <p className="font-medium text-gray-900">ISBN</p>
                        <p className="text-sm text-gray-500">{resource.isbn || 'N/A'}</p>
                      </span>
                    </span>
                  </div>
                </div>
              )}
              {resource.type === 'code' && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Code Example</h3>
                  <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                    <pre className="language-javascript"><code>
// Example code snippet
function fetchData(url) {
  return fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log('Data received:', data);
      return data;
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      throw error;
    });
}

// Usage
fetchData('/api/data')
  .then(data => {
    // Process data
    console.log(data);
  })
  .catch(error => {
    console.error('Failed to fetch data:', error);
              </code></pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'video' && (
            <div className="mb-6">
              <div className="relative w-full h-0 pb-[56.25%] bg-gray-200 rounded-lg overflow-hidden">
                <iframe
                  title="Educational video"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                ></iframe>
              </div>
              <p className="mt-4 text-gray-600">
                Note: This is a placeholder video. In a real implementation, this would embed the actual educational video content.
              </p>
            </div>
          )}

          {activeTab === 'chapters' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Table of Contents</h3>
              <div className="space-y-2">
                y-3">
                {[1, 2, 3, 4, 5].map((chapter, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full">
                        {chapter}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Chapter {chapter}: Advanced Concepts</h4>
                      <p className="text-sm text-gray-500">
                        In this chapter, we explore advanced topics and their practical applications.
                      </p>
                      <span className="text-xs text-gray-500">
                        ~25 minutes read
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Related Resources */}
        {relatedResources.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Related Resources</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedResources.map((res: any) => (
                <div key={res.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        {getResourceTypeIcon(res.type)}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{res.title}</h4>
                      <p className="text-sm text-gray-500 mb-2">{res.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-800 text-xs rounded-full">
                          {res.category}
                        </span>
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-800 text-xs rounded-full">
                          {res.type}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500">
                        <span>⏱️ {res.estimatedTime} min</span>
                        <span>👁️ {res.views?.toLocaleString() || '0'} views</span>
                      </div>
                      <Link
                        href={`/resources/${res.id}`}
                        className="mt-2 inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full hover:bg-indigo-200"
                      >
                        View Resource
                      </li>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          }
        </div>

        {/* Back to Resources */}
        <div className="mt-8 text-center">
          <Link
            href="/resources"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to Resources
          </Link>
        </div>
      </div>
    </div>
  );
}

// State for tab selection
let activeTab = 'overview';

// Helper function to get resource type icon
function getResourceTypeIcon(type: string) {
  switch (type.toLowerCase()) {
    case 'article':
      return '📰';
    case 'video':
      return '▶️';
    case 'book':
      return '📖';
    case 'pdf':
      return '📄';
    case 'code':
      return '</>';
    case 'audio':
      return '🎧';
    case 'interactive':
      return '🎮';
    default:
      return '📎';
  }
}

// Helper function to get difficulty color
function getDifficultyColor(difficulty: string) {
  switch (difficulty.toLowerCase()) {
    case 'beginner':
      return 'green';
    case 'intermediate':
      return 'yellow';
    case 'advanced':
      return 'red';
    default:
      return 'gray';
  }
}