import React, { useState, useEffect } from 'react';
import { HttpAgent, Actor } from '@dfinity/agent';

// Canister ID'sini dinamik olarak al
const getCanisterId = () => {
  try {
    // Local canister ID'sini environment'tan almaya çalış
    return process.env.CANISTER_ID_BACKEND || "swrvp-laaaa-aaaab-qbkuq-cai";
  } catch (error) {
    console.error("Error getting canister ID:", error);
    return "swrvp-laaaa-aaaab-qbkuq-cai"; // Fallback ID
  }
};

// Host URL'sini ortama göre ayarla
const HOST = process.env.NODE_ENV === "development" 
  ? "http://localhost:4943" 
  : "https://ic0.app";

// IDL tanımlaması
const idlFactory = ({IDL}) => {
  return IDL.Service({
    'createStory': IDL.Func([IDL.Text, IDL.Text], [IDL.Nat], []),
    'submitContinuation': IDL.Func([IDL.Nat, IDL.Text], [IDL.Opt(IDL.Nat)], []),
    'vote': IDL.Func([IDL.Nat, IDL.Nat], [IDL.Bool], []),
    'selectWinningContinuation': IDL.Func([IDL.Nat], [IDL.Bool], []),
    'getStory': IDL.Func([IDL.Nat], [IDL.Opt(IDL.Record({
      'id': IDL.Nat,
      'title': IDL.Text,
      'introduction': IDL.Text,
      'author': IDL.Principal,
      'timestamp': IDL.Int,
      'continuations': IDL.Vec(IDL.Record({
        'id': IDL.Nat,
        'content': IDL.Text,
        'author': IDL.Principal,
        'timestamp': IDL.Int,
        'votes': IDL.Nat,
        'voters': IDL.Vec(IDL.Principal)
      })),
      'selectedContinuations': IDL.Vec(IDL.Nat)
    }))], ['query']),
    'getAllStories': IDL.Func([], [IDL.Vec(IDL.Record({
      'id': IDL.Nat,
      'title': IDL.Text,
      'introduction': IDL.Text,
      'author': IDL.Principal,
      'timestamp': IDL.Int,
      'continuations': IDL.Vec(IDL.Record({
        'id': IDL.Nat,
        'content': IDL.Text,
        'author': IDL.Principal,
        'timestamp': IDL.Int,
        'votes': IDL.Nat,
        'voters': IDL.Vec(IDL.Principal)
      })),
      'selectedContinuations': IDL.Vec(IDL.Nat)
    }))], ['query'])
  });
};

const NameInput = () => {
  const [stories, setStories] = useState([]);
  const [newStory, setNewStory] = useState({ title: '', introduction: '' });
  const [selectedStory, setSelectedStory] = useState(null);
  const [newContinuation, setNewContinuation] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backend, setBackend] = useState(null);

  // Backend bağlantısını başlat
  useEffect(() => {
    const initializeBackend = async () => {
      try {
        console.log("Initializing backend connection...");
        const agent = new HttpAgent({ host: HOST });
        
        // Development modunda root key'i fetch et
        if (process.env.NODE_ENV === "development") {
          console.log("Fetching root key...");
          await agent.fetchRootKey().catch(err => {
            console.warn("Unable to fetch root key:", err);
          });
        }

        const canisterId = getCanisterId();
        console.log("Using canister ID:", canisterId);

        const actor = Actor.createActor(idlFactory, {
          agent,
          canisterId: canisterId,
        });

        console.log("Actor created successfully");
        setBackend(actor);
      } catch (err) {
        console.error("Failed to initialize backend:", err);
        setError("Failed to initialize backend: " + err.message);
      }
    };

    initializeBackend();
  }, []);

  // Hikayeleri yükle
  useEffect(() => {
    const fetchStories = async () => {
      if (!backend) {
        console.log("Backend not initialized yet");
        return;
      }

      try {
        console.log("Fetching stories...");
        const allStories = await backend.getAllStories();
        console.log("Fetched stories:", allStories);
        setStories(allStories);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching stories:", err);
        setError("Failed to fetch stories: " + err.message);
        setLoading(false);
      }
    };

    if (backend) {
      fetchStories();
    }
  }, [backend]);

  const handleCreateStory = async (event) => {
    event.preventDefault();
    if (!backend) {
      setError("Backend not initialized");
      return;
    }

    try {
      setLoading(true);
      console.log("Creating new story:", newStory);
      const storyId = await backend.createStory(newStory.title, newStory.introduction);
      console.log("Story created with ID:", storyId);
      
      // Refresh stories list
      const updatedStories = await backend.getAllStories();
      setStories(updatedStories);
      
      setNewStory({ title: '', introduction: '' });
    } catch (err) {
      console.error("Error creating story:", err);
      setError("Failed to create story: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitContinuation = async (storyId) => {
    if (!backend) {
      setError("Backend not initialized");
      return;
    }

    try {
      setLoading(true);
      console.log("Submitting continuation for story:", storyId);
      const continuationId = await backend.submitContinuation(storyId, newContinuation);
      console.log("Continuation submitted with ID:", continuationId);
      
      // Refresh stories list
      const updatedStories = await backend.getAllStories();
      setStories(updatedStories);
      
      setNewContinuation('');
    } catch (err) {
      console.error("Error submitting continuation:", err);
      setError("Failed to submit continuation: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div style={{ color: 'red', padding: '20px', textAlign: 'center' }}>
        <h2>Error</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading && !backend) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Connecting to backend...</h2>
      </div>
    );
  }

  // Existing render code...
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
      {!selectedStory ? (
        <div>
          <h1 style={{ color: '#333' }}>Story Writing App</h1>
          <form onSubmit={handleCreateStory} style={{ marginBottom: '20px' }}>
            <input
              type="text"
              value={newStory.title}
              onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
              placeholder="Story Title"
              style={{
                display: 'block',
                margin: '10px auto',
                padding: '10px',
                width: '80%',
                maxWidth: '300px',
                border: '1px solid #ccc',
                borderRadius: '5px',
              }}
              required
            />
            <textarea
              value={newStory.introduction}
              onChange={(e) => setNewStory({ ...newStory, introduction: e.target.value })}
              placeholder="Story Introduction"
              style={{
                display: 'block',
                margin: '10px auto',
                padding: '10px',
                width: '80%',
                maxWidth: '300px',
                height: '100px',
                border: '1px solid #ccc',
                borderRadius: '5px',
              }}
              required
            ></textarea>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Story'}
            </button>
          </form>
          <div>
            <h2 style={{ color: '#555' }}>Existing Stories</h2>
            {stories.length === 0 ? (
              <p>No stories yet. Be the first to create one!</p>
            ) : (
              stories.map((story, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedStory(story)}
                  style={{
                    padding: '10px',
                    margin: '10px auto',
                    maxWidth: '400px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <h3>{story.title}</h3>
                  <p>{story.introduction}</p>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div>
          <h1>{selectedStory.title}</h1>
          <p>{selectedStory.introduction}</p>
          <textarea
            value={newContinuation}
            onChange={(e) => setNewContinuation(e.target.value)}
            placeholder="Write a continuation..."
            style={{
              display: 'block',
              margin: '10px auto',
              padding: '10px',
              width: '80%',
              maxWidth: '300px',
              height: '100px',
              border: '1px solid #ccc',
              borderRadius: '5px',
            }}
          ></textarea>
          <button
            onClick={() => handleSubmitContinuation(selectedStory.id)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              margin: '10px',
            }}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Continuation'}
          </button>
          <button
            onClick={() => setSelectedStory(null)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              margin: '10px',
            }}
          >
            Go Back
          </button>
        </div>
      )}
    </div>
  );
};

export default NameInput;