# reels/

Short animation clips for the reel wall (see "Reel wall" in the main README). Nothing in this folder loads until a visitor hovers over or taps a reel.

For each reel put two files here, with the same base name:

- `name.mp4` : the clip. 2 to 4 seconds, loops, no sound, about 540 px wide, **under 250 KB**.
- `name.webp` : the poster picture shown before it plays. About 360 px wide, **under 30 KB**.

Make both from your original render with ffmpeg:

```
ffmpeg -i original.mp4 -an -t 4 -vf "scale=540:-2,fps=24" -c:v libx264 -crf 30 -preset slow -pix_fmt yuv420p -movflags +faststart name.mp4
ffmpeg -ss 2 -i name.mp4 -frames:v 1 -vf scale=360:-2 name.webp
```

(`-ss 2` takes the poster picture 2 seconds in, so it is never a blank first frame. Raise `-crf` to 32 if a clip is still over 250 KB.)
