# Design References

Accepted visual references:

- `references/v2-home-above-fold.png` — 首页首屏：导航、hero、搜索、chip、Closing Soon。
- `references/v2-home-browsing.png` — 首页浏览态：Deadline Watch、机会卡片网格（sticky 筛选条已在实现中精简为 hero chip）。
- `references/v2-categories.png` — 分类浏览页：smart filters、分类卡片、路径探索。

Current implementation:

- `src/components/discovery/AtlasLanding.tsx` — 发现首页
- `src/components/discovery/CategoriesPage.tsx` — 分类页
- `src/components/opportunity/` — 卡片与详情组件
- `src/styles/atlas.css`
- `src/styles/atlas-categories.css`
- `src/styles/atlas-responsive.css`

Runtime assets live in `public/assets/`. Keep only assets referenced by current UI or docs.
