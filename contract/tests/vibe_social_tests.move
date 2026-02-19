#[test_only]
module vibe_social_addr::vibe_social_tests {
    use std::string;

    use aptos_framework::object;
    use vibe_social_addr::vibe_social;

    const E_ASSERT: u64 = 999;

    // ============ Helpers ============

    #[test(creator = @0x1, voter = @0x2, other = @0x3)]
    fun test_setup_and_create_comment(creator: &signer, voter: &signer, other: &signer) {
        vibe_social::init_module_for_test(creator);

        let content = string::utf8(b"Hello vibe");
        let target = @0x42;
        let comment_obj = vibe_social::create_comment_internal(creator, content, target);

        let (content_out, author, target_out, score) = vibe_social::get_comment(object::object_address(&comment_obj));
        assert!(content_out == string::utf8(b"Hello vibe"), E_ASSERT);
        assert!(author == @0x1, E_ASSERT);
        assert!(target_out == @0x42, E_ASSERT);
        assert!(score == 0, E_ASSERT);
        assert!(vibe_social::get_vibe_score(object::object_address(&comment_obj)) == 0, E_ASSERT);
    }

    #[test(creator = @0x1, voter = @0x2)]
    fun test_vote_up(creator: &signer, voter: &signer) {
        vibe_social::init_module_for_test(creator);

        let comment_obj = vibe_social::create_comment_internal(
            creator,
            string::utf8(b"Post"),
            @0x1,
        );
        let comment_addr = object::object_address(&comment_obj);

        vibe_social::vote(voter, comment_obj, true);

        assert!(vibe_social::get_vibe_score(comment_addr) == 1, E_ASSERT);
        let (has, up) = vibe_social::has_voted(@0x2, comment_addr);
        assert!(has == true && up == true, E_ASSERT);
    }

    #[test(creator = @0x1, voter = @0x2)]
    fun test_vote_down(creator: &signer, voter: &signer) {
        vibe_social::init_module_for_test(creator);

        let comment_obj = vibe_social::create_comment_internal(
            creator,
            string::utf8(b"Post"),
            @0x1,
        );
        let comment_addr = object::object_address(&comment_obj);

        vibe_social::vote(voter, comment_obj, false);

        assert!(vibe_social::get_vibe_score(comment_addr) == -1, E_ASSERT);
        let (has, up) = vibe_social::has_voted(@0x2, comment_addr);
        assert!(has == true && up == false, E_ASSERT);
    }

    #[test(creator = @0x1, voter = @0x2)]
    fun test_change_vote(creator: &signer, voter: &signer) {
        vibe_social::init_module_for_test(creator);

        let comment_obj = vibe_social::create_comment_internal(
            creator,
            string::utf8(b"Post"),
            @0x1,
        );
        let comment_addr = object::object_address(&comment_obj);

        vibe_social::vote(voter, comment_obj, true);
        assert!(vibe_social::get_vibe_score(comment_addr) == 1, E_ASSERT);

        vibe_social::vote(voter, comment_obj, false);
        assert!(vibe_social::get_vibe_score(comment_addr) == -1, E_ASSERT);
    }

    #[test(creator = @0x1)]
    #[expected_failure(abort_code = vibe_social::E_SELF_VOTE)]
    fun test_self_vote_fails(creator: &signer) {
        vibe_social::init_module_for_test(creator);

        let comment_obj = vibe_social::create_comment_internal(
            creator,
            string::utf8(b"Post"),
            @0x1,
        );

        vibe_social::vote(creator, comment_obj, true);
    }

    #[test(creator = @0x1)]
    #[expected_failure(abort_code = vibe_social::E_EMPTY_STRING)]
    fun test_empty_content_fails(creator: &signer) {
        vibe_social::init_module_for_test(creator);

        vibe_social::create_comment_internal(
            creator,
            string::utf8(b""),
            @0x1,
        );
    }

    #[test(creator = @0x1)]
    #[expected_failure(abort_code = vibe_social::E_ZERO_ADDRESS)]
    fun test_zero_target_fails(creator: &signer) {
        vibe_social::init_module_for_test(creator);

        vibe_social::create_comment_internal(
            creator,
            string::utf8(b"Hi"),
            @0x0,
        );
    }

    #[test(creator = @0x1)]
    fun test_entry_create_comment_emits_event(creator: &signer) {
        vibe_social::init_module_for_test(creator);

        vibe_social::create_comment(creator, string::utf8(b"Via entry"), @0x99);

        // We cannot easily assert on events in unit tests; just ensure no abort.
    }

    #[test(owner = @0x1)]
    fun test_delete_comment_by_owner(owner: &signer) {
        vibe_social::init_module_for_test(owner);

        let comment_obj = vibe_social::create_comment_internal(
            owner,
            string::utf8(b"Delete me"),
            @0x1,
        );
        let comment_addr = object::object_address(&comment_obj);

        vibe_social::delete_comment(owner, comment_obj);

        // Comment resource is gone; querying would abort. So we just verify no abort above.
    }

    #[test(creator = @0x1, owner = @0x1, attacker = @0x2)]
    #[expected_failure(abort_code = vibe_social::E_NOT_OWNER)]
    fun test_delete_comment_by_non_owner_fails(owner: &signer, attacker: &signer) {
        vibe_social::init_module_for_test(owner);

        let comment_obj = vibe_social::create_comment_internal(
            owner,
            string::utf8(b"Mine"),
            @0x1,
        );

        vibe_social::delete_comment(attacker, comment_obj);
    }

    #[test(creator = @0x1, voter1 = @0x2, voter2 = @0x3)]
    fun test_multiple_voters(creator: &signer, voter1: &signer, voter2: &signer) {
        vibe_social::init_module_for_test(creator);

        let comment_obj = vibe_social::create_comment_internal(
            creator,
            string::utf8(b"Post"),
            @0x1,
        );
        let comment_addr = object::object_address(&comment_obj);

        vibe_social::vote(voter1, comment_obj, true);
        vibe_social::vote(voter2, comment_obj, true);

        assert!(vibe_social::get_vibe_score(comment_addr) == 2, E_ASSERT);
    }
}
