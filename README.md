# Chat, Summarize (bart)

> [!IMPORTANT]
> `Chat, summarize`, also known as `bart` is currently under a rewrite. Most feature do not yet exist, though they will.

`bart` is a utility Discord bot that leverages LLMs to help **people** in meaninful ways. It of a few main features, and will continue to grow as time goes on. Most notably, chat supports `summarize`, `run`, `remind`, `translate`, and `query`.

Summarize is the main feature in which the most recent N messages (where message N+1 is your last message) will be fetched and subsequently summarized. You can also pass an option to specify a number of messages, and that many will be fetched.

Run and remind are variants of each other in some respect. That is, both just generate and run code, only that remind specifically disallows accessing "the outside world" in the prompt. Please do note that definitionally both of these commands are unsafe. I choose to have them out of convenience, rather than security.

Translate and query are variants of summarize. Both of these commands only operate on the supplied context window. Query allows people to ask questions about the past conversation(s), whereas translate, translates the context window into the supplied window.
