module vibe_social_addr::vibe_social {
    use std::string::{Self, String};
    use std::signer;

    use aptos_framework::account;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::object::{Self, Object};
    use aptos_std::table::{Self, Table};

    // ============ Structs ============

    struct Comment has key {
        content: String,
        author: address,
        target_obj: address,
        vibe_score: i64,
        transfer_ref: object::TransferRef,
        delete_ref: object::DeleteRef,
        extend_ref: object::ExtendRef,
    }

    struct VoteKey has copy, drop, store {
        voter: address,
        comment: address,
    }

    struct VoteRegistry has key {
        votes: Table<VoteKey, bool>,
    }

    /// Holds the event handle so all CommentCreated events are queryable at module address.
    struct CommentEvents has key {
        comment_created_events: EventHandle<CommentCreated>,
    }

    // ============ Events ============

    #[event]
    struct CommentCreated has drop, store {
        comment: address,
        author: address,
        target_obj: address,
    }

    #[event]
    struct VoteCast has drop, store {
        voter: address,
        comment: address,
        up: bool,
    }

    #[event]
    struct CommentDeleted has drop, store {
        comment: address,
        author: address,
    }

    // ============ Constants ============

    const MAX_CONTENT_LENGTH: u64 = 500;
    const E_EMPTY_STRING: u64 = 1;
    const E_CONTENT_TOO_LONG: u64 = 2;
    const E_ZERO_ADDRESS: u64 = 3;
    const E_NOT_OWNER: u64 = 4;
    const E_NOT_COMMENT_OBJECT: u64 = 5;
    const E_SELF_VOTE: u64 = 6;
    const E_UNAUTHORIZED: u64 = 7;
    const E_COMMENT_EVENTS_NOT_INIT: u64 = 8;

    // ============ Init Module ============

    fun init_module(deployer: &signer) {
        move_to(deployer, VoteRegistry {
            votes: table::new(),
        });
        move_to(deployer, CommentEvents {
            comment_created_events: account::new_event_handle<CommentCreated>(deployer),
        });
    }

    #[test_only]
    public fun init_module_for_test(deployer: &signer) {
        move_to(deployer, VoteRegistry {
            votes: table::new(),
        });
        move_to(deployer, CommentEvents {
            comment_created_events: account::new_event_handle<CommentCreated>(deployer),
        });
    }

    /// One-time init for already-deployed modules that were published before CommentEvents existed.
    /// Call once from the deployer account after upgrade.
    public entry fun init_comment_events(deployer: &signer) {
        assert!(signer::address_of(deployer) == @vibe_social_addr, E_UNAUTHORIZED);
        move_to(deployer, CommentEvents {
            comment_created_events: account::new_event_handle<CommentCreated>(deployer),
        });
    }

    // ============ Entry: create_comment ============

    /// Create a new comment as an Aptos Object. Author can delete later to reclaim storage.
    public entry fun create_comment(
        creator: &signer,
        content: String,
        target_obj: address,
    ) acquires CommentEvents {
        let comment_obj = create_comment_internal(creator, content, target_obj);
        let comment_addr = object::object_address(&comment_obj);
        let creator_addr = signer::address_of(creator);
        let events = borrow_global_mut<CommentEvents>(@vibe_social_addr);
        event::emit_event(&mut events.comment_created_events, CommentCreated {
            comment: comment_addr,
            author: creator_addr,
            target_obj,
        });
    }

    /// Internal creation; used by entry and by tests.
    public fun create_comment_internal(
        creator: &signer,
        content: String,
        target_obj: address,
    ): Object<Comment> {
        let creator_addr = signer::address_of(creator);

        assert!(string::length(&content) > 0, E_EMPTY_STRING);
        assert!(string::length(&content) <= MAX_CONTENT_LENGTH, E_CONTENT_TOO_LONG);
        assert!(target_obj != @0x0, E_ZERO_ADDRESS);

        let constructor_ref = object::create_object(creator_addr);
        let transfer_ref = object::generate_transfer_ref(&constructor_ref);
        let delete_ref = object::generate_delete_ref(&constructor_ref);
        let extend_ref = object::generate_extend_ref(&constructor_ref);
        let object_signer = object::generate_signer(&constructor_ref);

        move_to(&object_signer, Comment {
            content,
            author: creator_addr,
            target_obj,
            vibe_score: 0,
            transfer_ref,
            delete_ref,
            extend_ref,
        });

        object::object_from_constructor_ref<Comment>(&constructor_ref)
    }

    // ============ Entry: vote ============

    /// One wallet = one vote per comment. Changing vote updates the score accordingly.
    public entry fun vote(
        voter: &signer,
        comment_obj: Object<Comment>,
        up: bool,
    ) acquires Comment, VoteRegistry {
        let voter_addr = signer::address_of(voter);
        let comment_addr = object::object_address(&comment_obj);

        assert!(object::owner(comment_obj) != voter_addr, E_SELF_VOTE);

        let vote_key = VoteKey {
            voter: voter_addr,
            comment: comment_addr,
        };

        let registry = borrow_global_mut<VoteRegistry>(@vibe_social_addr);
        let comment = borrow_global_mut<Comment>(comment_addr);

        let (already_voted, old_up) = if (table::contains(&registry.votes, copy vote_key)) {
            let prev = *table::borrow(&registry.votes, copy vote_key);
            (true, prev)
        } else {
            (false, false)
        };

        let delta: i64 = if (up) { 1 } else { -1 };
        let old_delta: i64 = if (old_up) { 1 } else { -1 };

        if (already_voted) {
            comment.vibe_score = comment.vibe_score - old_delta + delta;
            *table::borrow_mut(&mut registry.votes, vote_key) = up;
        } else {
            comment.vibe_score = comment.vibe_score + delta;
            table::add(&mut registry.votes, vote_key, up);
        };

        event::emit(VoteCast {
            voter: voter_addr,
            comment: comment_addr,
            up,
        });
    }

    // ============ Entry: delete_comment ============

    /// Only the comment author can delete. Destroys the object and reclaims storage (gas refund).
    public entry fun delete_comment(
        owner: &signer,
        comment_obj: Object<Comment>,
    ) acquires Comment {
        let owner_addr = signer::address_of(owner);
        let comment_addr = object::object_address(&comment_obj);

        assert!(object::owner(comment_obj) == owner_addr, E_NOT_OWNER);

        let Comment {
            content: _,
            author,
            target_obj: _,
            vibe_score: _,
            transfer_ref: _,
            delete_ref,
            extend_ref: _,
        } = move_from<Comment>(comment_addr);

        event::emit(CommentDeleted {
            comment: comment_addr,
            author,
        });

        object::delete(delete_ref);
    }

    // ============ View functions ============

    #[view]
    public fun get_vibe_score(comment_addr: address): i64 acquires Comment {
        *&borrow_global<Comment>(comment_addr).vibe_score
    }

    #[view]
    public fun get_comment(comment_addr: address): (String, address, address, i64) acquires Comment {
        let c = borrow_global<Comment>(comment_addr);
        (c.content, c.author, c.target_obj, c.vibe_score)
    }

    #[view]
    public fun has_voted(voter: address, comment_addr: address): (bool, bool) {
        let key = VoteKey { voter, comment: comment_addr };
        let registry = borrow_global<VoteRegistry>(@vibe_social_addr);
        if (table::contains(&registry.votes, key)) {
            (true, *table::borrow(&registry.votes, key))
        } else {
            (false, false)
        }
    }
}
