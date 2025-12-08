
interface GithubConfig {
    owner: string;
    repo: string;
    branch: string;
    accessToken: string;
}

export async function validateGithubAccess(config: GithubConfig): Promise<boolean> {
    try {
        const response = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}`, {
            headers: {
                Authorization: `Bearer ${config.accessToken}`,
                Accept: "application/vnd.github.v3+json",
            },
        });

        return response.ok;
    } catch (error) {
        console.error("GitHub Validation Error:", error);
        return false;
    }
}

export async function pushToGithub(
    config: GithubConfig,
    filePath: string,
    content: string,
    message: string
) {
    const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${filePath}`;

    // 1. Check if file exists to get SHA (for update)
    let sha: string | undefined;
    try {
        const checkResponse = await fetch(`${url}?ref=${config.branch}`, {
            headers: {
                Authorization: `Bearer ${config.accessToken}`,
                Accept: "application/vnd.github.v3+json",
            },
        });

        if (checkResponse.ok) {
            const data = await checkResponse.json();
            sha = data.sha;
        }
    } catch (e) {
        // Prepare for create if not found
    }

    // 2. Create or Update file
    const contentBase64 = Buffer.from(content).toString('base64');

    const body: any = {
        message,
        content: contentBase64,
        branch: config.branch,
    };

    if (sha) {
        body.sha = sha;
    }

    const response = await fetch(url, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${config.accessToken}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`GitHub API Error: ${error.message}`);
    }

    return await response.json();
}
