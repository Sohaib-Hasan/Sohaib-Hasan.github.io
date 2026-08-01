---
layout: post
title: "Welcome to the Blog"
---

This is the first post on this site — and also a quick reference for how to publish new ones, since the whole point of this setup is that a new post should never require touching HTML.

## How this works

Every post is just a Markdown file inside the `_posts` folder, named like this:

```
2026-08-01-welcome-to-the-blog.md
```

The date at the front of the filename **is** the publish date — GitHub Pages reads it automatically. The rest of the filename becomes the post's URL.

At the top of every post, three dashes open and close a small settings block:

```
---
layout: post
title: "Your Post Title Here"
---
```

Everything below that line is the actual post, written in plain Markdown:

- `**bold**` and `*italic*` work as expected
- Headings with `##` and `###`
- Numbered and bulleted lists
- [Links](https://sohaib-hasan.github.io) just need `[text](url)`

## Math, properly typeset

Since this is a mathematics site, inline math like $E = mc^2$ and full display equations both render properly:

$$\int_0^1 x^2 \, dx = \frac{1}{3}$$

## Code, when it's needed

```python
def is_prime(n):
    if n < 2:
        return False
    return all(n % i != 0 for i in range(2, int(n**0.5) + 1))
```

That's the whole system. New post = new Markdown file, uploaded the same way everything else on this site gets uploaded.
