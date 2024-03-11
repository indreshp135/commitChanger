from fastapi import FastAPI, Request
from fastapi.responses import FileResponse
import os
from git import Repo, Actor
from fastapi.middleware.cors import CORSMiddleware
import zipfile

app = FastAPI()

app.add_middleware(
    CORSMiddleware, allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

REPOS_DIR = os.path.join(os.getcwd(), 'repos')
NEW_REPOS_DIR = os.path.join(os.getcwd(), 'new_repos')

os.makedirs(REPOS_DIR, exist_ok=True)
os.makedirs(NEW_REPOS_DIR, exist_ok=True)


@app.get('/')
async def root():
    return {'message': 'Hello, World!'}


@app.post('/repo')
async def clone_repo(request: Request):
    data = await request.json()
    owner = data.get('owner')
    repo = data.get('repo')
    access_token = data.get('access_token')
    repo_dir = os.path.join(REPOS_DIR, f"{owner}/{repo}")
    # Remove the directory if it already exists
    os.system('rm -rf ' + repo_dir)
    os.makedirs(os.path.dirname(repo_dir), exist_ok=True)
    try:
        Repo.clone_from(
            f"https://{access_token}@github.com/{owner}/{repo}.git", repo_dir)
    except Exception as e:
        return {'message': str(e)}

    old_repo = Repo(repo_dir)

    new_repo_dir = os.path.join(NEW_REPOS_DIR, f"{owner}/{repo}")

    os.system('rm -rf ' + new_repo_dir)
    os.makedirs(new_repo_dir, exist_ok=True)

    Repo.init(new_repo_dir)

    branches = [b.name for b in old_repo.heads]
    return {'branches': branches}


@app.post('/branch')
async def set_branch(request: Request):
    data = await request.json()
    owner = data.get('owner')
    repo = data.get('repo')
    branch = data.get('branch')

    repo_dir = os.path.join(REPOS_DIR, f"{owner}/{repo}")
    old_repo = Repo(repo_dir)

    # Checkouts the branch
    old_repo.git.checkout(branch)

    commits = list(old_repo.iter_commits(branch))
    commits.reverse()

    return [{"sha": c.hexsha,
             "message": c.message,
             "author": c.author.name,
             "time": c.committed_datetime.strftime("%Y-%m-%d %H:%M:%S"),
             "email": c.author.email,
             } for c in commits]


@app.post('/change-commit')
async def change_commit(
    request: Request
):
    data = await request.json()
    owner = data.get('owner')
    repo = data.get('repo')
    commit_hash = data.get('commit_hash')
    author_name = data.get('author_name')
    author_email = data.get('author_email')
    commit_datetime = data.get('commit_datetime')

    new_repo_dir = os.path.join(NEW_REPOS_DIR, f"{owner}/{repo}")
    old_repo_dir = os.path.join(REPOS_DIR, f"{owner}/{repo}")
    new_repo = Repo(new_repo_dir)
    old_repo = Repo(old_repo_dir)

    commit = old_repo.commit(commit_hash)

    # # Check if new_repo head is at the previous commit
    # if new_repo.head.commit.hexsha != previous_commit.hexsha:
    #     return {'message': 'Head is not at the previous commit'}

    # File changes in the commit
    for file in commit.stats.files:
        try:
            # Getting the file from the old repository
            file_content = old_repo.git.show(commit.hexsha + ':' + file)
            print(file)
            # Creating the file in the new repository
            os.makedirs(os.path.dirname(os.path.join(
                new_repo.working_tree_dir, file)), exist_ok=True)
            # Writing the file in the new repository
            with open(os.path.join(new_repo.working_tree_dir, file), 'w') as f:
                f.write(file_content.encode(
                    'utf-8', 'replace').decode('utf-8'))
        except Exception as e:
            # Deleting the file if it already exists
            os.system('rm -rf ' + os.path.join(new_repo.working_tree_dir, file))
            print(e)
            print("File not found: ", file)
            pass

    # Git add the files
    new_repo.git.add('.')

    # Commit the changes
    new_repo.index.commit(commit.message, author=Actor(author_name, author_email), committer=Actor(
        author_name, author_email), author_date=commit_datetime, commit_date=commit_datetime)

    return {'message': 'Commit changed successfully'}


@app.get('/download-zip')
async def download_zip(owner: str, repo: str):
    new_repo_dir = os.path.join(NEW_REPOS_DIR, f"{owner}/{repo}")
    # ZIP the new repository
    zip_file = os.path.join(os.getcwd(), 'repo.zip')
    with zipfile.ZipFile(zip_file, 'w') as zip:
        # Zip only the new_repo_dir folder and its contents
        for root, dirs, files in os.walk(new_repo_dir):
            for file in files:
                file_path = os.path.join(root, file)
                zip.write(file_path, 
                       os.path.relpath(os.path.join(root, file), 
                                       os.path.join(new_repo_dir, '..')))

    return FileResponse(zip_file, media_type='application/zip', filename='repo.zip')
