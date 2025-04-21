# pkg

I decided to put all future npm packages I build in a single repo: this one. It makes sense for three reasons.

## It'll be quick to get started

This repo will effectively act like a template, with `typescript`, `eslint`, etc. set-up already. But unlike a template, it's living. I don't have to worry about my template being old, nor about updating it.

I previously created [new-react-ts-lib/](https://aykev.dev/new-react-ts-lib/), which works nicely, but I have to keep remembering to update. When I update a package I generated from this template, the template doesn't update with it.

## It'll be easier to maintain

Instead of having to individually update eslint and typescript across _n_ packages, I just have to update it in one. Sure, there will be _n_ subfolders to ensure still build after an update to these types of shared resources, but if there's something the migration to ESLint v9 and its flat-config format taught me, is that there's plenty of situations where that will still be faster.

## I don't have any big packages

So I really don't have to worry about it getting too messy. If a package were to ever grow very big then I'll consider extracting it into its own repo.

<!-- My hope is to also

30/11/24 -->

30/11/24
