---
layout: post
title: "Welcome to the Blog"
---

Everything below this line is the actual post, written in plain Markdown:

* **bold** and *italic* work as expected
* Headings with `##` and `###`
* Numbered and bulleted lists
* [Links](https://sohaib-hasan.github.io/) just need `[text](url)`

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
