import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Hash "mo:base/Hash";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Time "mo:base/Time";

actor StoryCanister {
    // Types
    type StoryId = Nat;
    type UserId = Principal;
    
    type Story = {
        id: StoryId;
        title: Text;
        introduction: Text;
        author: UserId;
        timestamp: Time.Time;
        continuations: [Continuation];
        selectedContinuations: [ContinuationId];
    };

    type Continuation = {
        id: ContinuationId;
        content: Text;
        author: UserId;
        timestamp: Time.Time;
        votes: Nat;
        voters: [UserId];
    };

    type ContinuationId = Nat;

    // State
    private stable var nextStoryId: StoryId = 0;
    private stable var nextContinuationId: ContinuationId = 0;
    private var stories = HashMap.HashMap<StoryId, Story>(0, Nat.equal, Hash.hash);
    
    // Create new story
    public shared(msg) func createStory(title: Text, introduction: Text) : async StoryId {
        let storyId = nextStoryId;
        nextStoryId += 1;
        
        let newStory: Story = {
            id = storyId;
            title = title;
            introduction = introduction;
            author = msg.caller;
            timestamp = Time.now();
            continuations = [];
            selectedContinuations = [];
        };
        
        stories.put(storyId, newStory);
        storyId
    };

    // Submit continuation
    public shared(msg) func submitContinuation(storyId: StoryId, content: Text) : async ?ContinuationId {
        switch (stories.get(storyId)) {
            case (null) { null };
            case (?story) {
                let continuationId = nextContinuationId;
                nextContinuationId += 1;
                
                let newContinuation: Continuation = {
                    id = continuationId;
                    content = content;
                    author = msg.caller;
                    timestamp = Time.now();
                    votes = 0;
                    voters = [];
                };
                
                let updatedContinuations = Array.append(story.continuations, [newContinuation]);
                
                let updatedStory = {
                    id = story.id;
                    title = story.title;
                    introduction = story.introduction;
                    author = story.author;
                    timestamp = story.timestamp;
                    continuations = updatedContinuations;
                    selectedContinuations = story.selectedContinuations;
                };
                
                stories.put(storyId, updatedStory);
                ?continuationId
            };
        }
    };

    // Vote for continuation
    public shared(msg) func vote(storyId: StoryId, continuationId: ContinuationId) : async Bool {
        switch (stories.get(storyId)) {
            case (null) { false };
            case (?story) {
                let updatedContinuations = Array.map<Continuation, Continuation>(
                    story.continuations,
                    func (cont: Continuation) : Continuation {
                        if (cont.id == continuationId) {
                            let hasVoted = Array.find<UserId>(cont.voters, func(v: UserId) : Bool { v == msg.caller }) != null;
                            if (hasVoted) {
                                cont
                            } else {
                                {
                                    id = cont.id;
                                    content = cont.content;
                                    author = cont.author;
                                    timestamp = cont.timestamp;
                                    votes = cont.votes + 1;
                                    voters = Array.append(cont.voters, [msg.caller]);
                                }
                            }
                        } else {
                            cont
                        }
                    }
                );
                
                let updatedStory = {
                    id = story.id;
                    title = story.title;
                    introduction = story.introduction;
                    author = story.author;
                    timestamp = story.timestamp;
                    continuations = updatedContinuations;
                    selectedContinuations = story.selectedContinuations;
                };
                
                stories.put(storyId, updatedStory);
                true
            };
        }
    };

    // Select winning continuation
    public shared(msg) func selectWinningContinuation(storyId: StoryId) : async Bool {
        switch (stories.get(storyId)) {
            case (null) { false };
            case (?story) {
                let winningContinuation = Array.foldLeft<Continuation, ?Continuation>(
                    story.continuations,
                    null,
                    func (acc: ?Continuation, curr: Continuation) : ?Continuation {
                        switch (acc) {
                            case (null) { ?curr };
                            case (?winning) {
                                if (curr.votes > winning.votes) { ?curr } else { ?winning }
                            };
                        }
                    }
                );
                
                switch (winningContinuation) {
                    case (null) { false };
                    case (?winner) {
                        let updatedSelectedContinuations = Array.append(story.selectedContinuations, [winner.id]);
                        
                        let updatedStory = {
                            id = story.id;
                            title = story.title;
                            introduction = story.introduction;
                            author = story.author;
                            timestamp = story.timestamp;
                            continuations = story.continuations;
                            selectedContinuations = updatedSelectedContinuations;
                        };
                        
                        stories.put(storyId, updatedStory);
                        true
                    };
                }
            };
        }
    };

    // Query functions
    public query func getStory(storyId: StoryId) : async ?Story {
        stories.get(storyId)
    };

    public query func getAllStories() : async [Story] {
        var storyList = Buffer.Buffer<Story>(0);
        for ((_, story) in stories.entries()) {
            storyList.add(story);
        };
        Buffer.toArray(storyList)
    };
}