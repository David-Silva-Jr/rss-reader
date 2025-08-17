A simple project to automatically pull content from rss feeds and download it to my computer so I have it on hand.

Just a personal project, so there may be some rough edges. Also, I'm not sure what the best practices are for Python.

For it to work, you need to add a file named rss-links.json to the same directory as this project, and populate it like this:
```
[
    {
        "name": "Feed name here",
        "link": "RSS link here"
    },
    {
        "name": "second one",
        "link": "second one"
    },
    ...
]
```

To run it, just execute run.sh. I built this on Linux, and am not really thinking of cross-platform compatibility since it's a personal project anyways, so it may not run on Windows.