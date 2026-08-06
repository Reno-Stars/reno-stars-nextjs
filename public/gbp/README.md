# Google Business Profile product tiles

Square crops of Reno Stars project photos, used as the product images on the
Google Business Profile listing.

They live here rather than in R2 because the GBP editor runs on google.com and
has to read the pixels back out of a canvas to attach them, which needs an
`Access-Control-Allow-Origin` header. R2's public bucket does not send one and
our token cannot set a bucket CORS policy; raw.githubusercontent.com does.

| File | Product |
|---|---|
| p010.jpg | Curbless Shower |
| p036.jpg | Grab Bars |
| p037.jpg | Accessible Bathroom Renovation |
| p038.jpg | Walk-In Tub |
| p039.jpg | Comfort-Height Toilet |
| p041.jpg | Roll-Under Vanity |
| p070.jpg | Basement Suite |
| p213.jpg | Basement Finishing |

Nothing imports these — the site does not link them, and deleting the branch
only breaks the ability to re-attach the same photo to a product later.
