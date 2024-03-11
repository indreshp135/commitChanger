"""
    In this code, we will be using the gitpython library regenerating the git repository
    of the TVK-Client. We will be having same commit history and same files as the old but 
    the new repository will be having different commit times and commit authors and message.
"""

import os
from git import Repo, Actor, Commit
from datetime import datetime, timedelta

old_repo = Repo(os.path.join(os.getcwd(), '../TVK-Client'))

new_repo = Repo.init(os.path.join(os.getcwd(), '../TVK-Client-new'))

# Remove the .git directory from the new repository
os.system('rm -rf ' + os.path.join(new_repo.working_tree_dir, '.git'))

# Remove all the files from the new repository
os.system('rm -rf ' + os.path.join(new_repo.working_tree_dir, '*'))

# git init the new repository
new_repo.git.init()

# List of all the commits in the old repository with time, author and message
commits = list(old_repo.iter_commits('develop'))

# Reversing the list of commits to get the commits in the order they were made
commits.reverse()

# Creating a new repository with the same commit history as the old repository and same files
for commit in commits:

    print("Commit message: ", commit.message)

    # File changes in the commit
    for file in commit.stats.files:
        try:
            print(file)
            # Getting the file from the old repository
            file_content = old_repo.git.show(commit.hexsha + ':' + file)
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

    commiter_name = "S Rajakumar"
    commiter_email = "63392656+theloganhugh@users.noreply.github.com"

    new_commit_message = commit.message

    print("Commit time: ", commit.committed_datetime)
    timezone = commit.committed_datetime.tzinfo
    new_commit_time = datetime.now(
        timezone) - timedelta(hours=1) - timedelta(hours=5, minutes=30)
    # strftime with zone
    new_commit_time = new_commit_time.strftime('%Y-%m-%d %H:%M:%S %z')
    print("New Commit time: ", new_commit_time)

    author = Actor(commiter_name, commiter_email)
    committer = Actor(commiter_name, commiter_email)

    new_repo.index.commit(new_commit_message, author=author, committer=committer,
                          author_date=new_commit_time, commit_date=new_commit_time)
