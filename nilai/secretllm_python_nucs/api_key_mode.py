from nilai_py import Client, NilAuthInstance

from config import API_KEY


def main():
    # Initialize the client in API key mode
    # To obtain an API key, navigate to https://nilpay.vercel.app/
    # and create a new subscription.
    # The API key will be displayed in the subscription details.
    # The Client class automatically handles the NUC token creation and management.
    ## For sandbox, use the following:
    client = Client(
        base_url="https://nilai-a779.nillion.network/nucs/v1/",
        api_key=API_KEY,
        # For production, use the following:
        # nilauth_instance=NilAuthInstance.PRODUCTION,
    )

    # Make a request to the Nilai API
    response = client.chat.completions.create(
        model="google/gemma-3-27b-it",
        messages=[
            {"role": "user", "content": "Hello! Can you help me with something?"}
        ],
    )

    print(f"Response: {response.choices[0].message.content}")


if __name__ == "__main__":
    main()