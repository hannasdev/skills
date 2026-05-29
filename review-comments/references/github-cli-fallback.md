# GitHub CLI Fallback

Prefer `review-comments/scripts/review-comments.mjs`. Use these raw commands
only when the helper script is unavailable or fails unexpectedly.

Replace `OWNER`, `REPO`, `PR_NUMBER`, and `THREAD_ID` with the target values.

## Fetch unresolved review threads

```bash
gh api graphql --paginate -f query='\
query($owner:String!, $name:String!, $pr:Int!, $endCursor:String) {\
   repository(owner:$owner, name:$name) {\
      pullRequest(number:$pr) {\
         reviewThreads(first:100, after:$endCursor) {\
            nodes {\
               id\
               isResolved\
               comments(first:20) { nodes { author { login } path line body url } }\
            }\
            pageInfo { hasNextPage endCursor }\
         }\
      }\
   }\
}' -f owner='OWNER' -f name='REPO' -F pr=PR_NUMBER
```

## Reply and resolve a thread

```bash
gh api graphql -f query='mutation($threadId:ID!, $body:String!){addPullRequestReviewThreadReply(input:{pullRequestReviewThreadId:$threadId, body:$body}){comment{id}}}' -f threadId='THREAD_ID' -f body='Addressed in COMMIT. Validation: TEST_COMMAND'
gh api graphql -f query='mutation($id:ID!){resolveReviewThread(input:{threadId:$id}){thread{id isResolved}}}' -f id='THREAD_ID'
```

## Verify PR checks

```bash
gh pr checks PR_NUMBER -R OWNER/REPO
```
