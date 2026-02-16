from nilai_py import Client

from config import API_KEY


def main():
    # Initialize the client in API key mode
    # To obtain an API key, navigate to https://nilai.nillion.com/
    # and create a public DID / private API key.

    # The Client class automatically handles the NUC token creation and management.
    client = Client(
        base_url="https://api.nilai.nillion.network/nuc/v1",
        api_key=API_KEY,
    )

    # Make a request to the Nilai API
    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "user",
                "content": "Create a story written as if you were a pirate. Write in a pirate accent.",
            }
        ],
        stream=True,
    )

    for chunk in response:
        if chunk.choices[0].finish_reason is not None:
            print("\n[DONE]")
            break
        if chunk.choices[0].delta.content is not None:
            print(chunk.choices[0].delta.content, end="", flush=True)


if __name__ == "__main__":
    main()