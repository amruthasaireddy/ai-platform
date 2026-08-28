import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from github import Github
from langchain_openai import ChatOpenAI

router = APIRouter()

gh = Github(os.getenv("GITHUB_TOKEN"))
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)


@router.get("/ping")
def ping():
    return {"module": "Code Review Bot", "status": "ok"}


class ReviewRequest(BaseModel):
    repo_full_name: str   # e.g. "amruthasaireddy/ai-platform"
    pr_number: int


@router.post("/review")
async def review_pr(request: ReviewRequest):
    try:
        repo = gh.get_repo(request.repo_full_name)
        pr = repo.get_pull(request.pr_number)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Could not fetch PR: {e}")

    files = pr.get_files()
    diffs = []
    for f in files:
        if f.patch:  # some files (e.g. binary) have no patch
            diffs.append(f"File: {f.filename}\n{f.patch}")

    if not diffs:
        raise HTTPException(status_code=400, detail="No reviewable text diffs found in this PR")

    combined_diff = "\n\n".join(diffs)[:12000]  # cap size to stay within token limits

    prompt = f"""You are a senior software engineer doing a code review.
Review the following pull request diff. Point out:
- Bugs or logic errors
- Security issues
- Code style / readability issues
- Suggestions for improvement

Be concise and specific, referencing filenames where relevant.

Diff:
{combined_diff}

Code Review:"""

    response = llm.invoke(prompt)

    return {
        "repo": request.repo_full_name,
        "pr_number": request.pr_number,
        "files_reviewed": len(diffs),
        "review": response.content
    }