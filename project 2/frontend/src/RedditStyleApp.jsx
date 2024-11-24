import React, { useState } from 'react';

const RedditStyleApp = () => {
  // Sabit kullanıcı bilgisi
  const currentUser = {
    username: "user123",
    id: "1"
  };

  const [stories, setStories] = useState([]);
  const [currentView, setCurrentView] = useState('create');
  const [selectedStory, setSelectedStory] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    duration: '24'
  });
  const [continuationForm, setContinuationForm] = useState({
    content: ''
  });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateStory = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const newStory = {
        id: Date.now(),
        ...formData,
        author: currentUser.username,
        timestamp: new Date().toISOString(),
        continuations: [],
        selectedContinuation: null
      };
      
      setStories(prev => [...prev, newStory]);
      setFormData({ title: '', content: '', duration: '24' });
      setError('');
      setCurrentView('view');
    } catch (err) {
      setError('Failed to create story. Please try again.');
    }
  };

  const handleCreateContinuation = (storyId) => {
    if (!continuationForm.content.trim()) {
      setError('Please write your continuation');
      return;
    }

    const newContinuation = {
      id: Date.now(),
      content: continuationForm.content,
      author: currentUser.username,
      timestamp: new Date().toISOString(),
      votes: 0,
      voters: {}
    };

    setStories(prev => {
      const newStories = prev.map(story => {
        if (story.id === storyId) {
          return {
            ...story,
            continuations: [...story.continuations, newContinuation]
          };
        }
        return story;
      });
      
      if (selectedStory?.id === storyId) {
        setSelectedStory(newStories.find(s => s.id === storyId));
      }
      
      return newStories;
    });

    setContinuationForm({ content: '' });
    setError('');
  };

const handleVote = (storyId, continuationId, isUpvote) => {
  setStories(prev => {
    return prev.map(story => {
      if (story.id === storyId) {
        return {
          ...story,
          continuations: story.continuations.map(cont => {
            if (cont.id === continuationId) {
              const currentVote = cont.voters[currentUser.id] || 0; // Kullanıcının mevcut oy durumu
              const newVoteValue = isUpvote ? 1 : -1;
              
              let voteDiff = 0;
              if (currentVote === newVoteValue) {
                // Eğer kullanıcı aynı yönde tekrar oy veriyorsa oyu sıfırla
                voteDiff = -currentVote;
                delete cont.voters[currentUser.id];
              } else {
                // Yeni bir oy veya ters yönde bir oy
                voteDiff = newVoteValue - currentVote;
                cont.voters[currentUser.id] = newVoteValue;
              }

              return {
                ...cont,
                votes: cont.votes + voteDiff, // Oy farkını uygula
                voters: { ...cont.voters }
              };
            }
            return cont;
          })
        };
      }
      return story;
    });
  });
};


  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-xl font-bold text-orange-500">StoryChain</h1>
              <nav className="hidden sm:flex space-x-1">
                <button 
                  onClick={() => {setCurrentView('create'); setSelectedStory(null);}}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  New Story
                </button>
                <button 
                  onClick={() => {setCurrentView('view'); setSelectedStory(null);}}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Browse
                </button>
              </nav>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {currentUser.username}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded text-red-800 dark:text-red-200">
            {error}
          </div>
        )}

        {currentView === 'create' ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Create a New Story</h2>
            <form onSubmit={handleCreateStory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Story Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="An interesting title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Story Content</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Write your story..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Voting Duration</label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="24">24 Hours</option>
                  <option value="48">48 Hours</option>
                  <option value="72">72 Hours</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Post Story
              </button>
            </form>
          </div>
        ) : selectedStory ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{selectedStory.title}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Posted by u/{selectedStory.author} • {new Date(selectedStory.timestamp).toLocaleDateString()}</p>
              <div className="prose dark:prose-invert max-w-none">
                {selectedStory.content}
              </div>
            </div>

            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Continue the Story</h3>
              <div className="space-y-4">
                <textarea
                  name="content"
                  value={continuationForm.content}
                  onChange={(e) => setContinuationForm({ content: e.target.value })}
                  rows={4}
                  className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Write your continuation..."
                />
                <button
                  onClick={() => handleCreateContinuation(selectedStory.id)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Submit
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {selectedStory.continuations?.map(continuation => (
                <div key={continuation.id} className="flex space-x-3">
                  <div className="flex flex-col items-center space-y-1">
                    <button 
                      onClick={() => handleVote(selectedStory.id, continuation.id, true)}
                      className="text-gray-400 hover:text-orange-500"
                    >
                      ▲
                    </button>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {continuation.votes}
                    </span>
                    <button 
                      onClick={() => handleVote(selectedStory.id, continuation.id, false)}
                      className="text-gray-400 hover:text-blue-500"
                    >
                      ▼
                    </button>
                  </div>
                  <div className="flex-1 bg-gray-50 dark:bg-gray-700/50 rounded-md p-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      u/{continuation.author} • {new Date(continuation.timestamp).toLocaleDateString()}
                    </p>
                    <p className="text-gray-900 dark:text-gray-100">{continuation.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setSelectedStory(null)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                ← Back to Stories
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {stories.map(story => (
              <div 
                key={story.id}
                onClick={() => setSelectedStory(story)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="p-4">
                  <div className="flex space-x-4">
                    <div className="flex-shrink-0">
                      <div className="flex flex-col items-center space-y-1 w-10">
                        <span className="text-2xl font-medium text-gray-700 dark:text-gray-300">
                          {story.continuations?.length || 0}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">parts</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {story.title}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        by u/{story.author} • {new Date(story.timestamp).toLocaleDateString()}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
                        {story.content}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default RedditStyleApp;