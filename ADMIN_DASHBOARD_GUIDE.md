# Admin Dashboard Documentation

## Overview

The admin dashboard at `http://localhost:3000/admin` is your centralized content management system. It provides complete control over all frontend sections with 10 management tabs.

## Admin Dashboard Mapping

### Complete Tab-to-Frontend Reference

| # | Admin Tab | Component/Section | Purpose | Fields Editable | Status |
|---|-----------|-------------------|---------|-----------------|--------|
| 1 | **📁 Portfolio** | `Portfolio.jsx`, `PortfolioCard.jsx`, `PortfolioGrid.jsx` (home) | Manage portfolio projects | Title, Excerpt, Body, Tags, Cover image, GitHub URL, Live URL, Images | ✅ Complete |
| 2 | **📝 Blog** | `BlogList.jsx`, `BlogDetail.jsx`, `BlogCards.jsx` (home) | Create and manage blog posts | Title, Excerpt, Content, Cover image, Tags, Linked products | ✅ Complete |
| 3 | **🛍️ Products** | Related to BlogPost & Product pages | Digital products for download or affiliate linking | Title, Description, Price, File, Affiliate URL, Stripe integration | ✅ Complete |
| 4 | **💼 Services** | `ServicesGrid.jsx` (home) | Service offerings | Title, Description, Details/Subtitles | ✅ Complete |
| 5 | **⚡ Skills** | `SkillsGrid.jsx` (home) | Technology skills | Category, Skill name, Proficiency level | ✅ Complete |
| 6 | **📄 Resources** | `Resources.jsx` (page) | CV and Certifications | CV file uploads, Certification files & details | ✅ Complete |
| 7 | **⭐ Reviews** | `ReviewsSlider.jsx` (home), `AddReview.jsx` (page) | Customer testimonials | Name, Rating (1-5), Message, Product link, Publish status | ✅ Complete |
| 8 | **👤 About** | `About.jsx` (page), `AboutPreview.jsx` (home) | Full bio and home intro | Name, Title, Bio, Long description, Profile image, Location, Email, Website, Social URLs | ✅ Complete |
| 9 | **🎬 Hero** | `HeroCloud.jsx` (home) | Hero banner content | Greeting, Typing strings, Main title, Buttons, Background media, Scroll text | ✅ Complete |
| 10 | **💰 Donations** | `Donate.jsx` (page) | Donation configuration | Donation info, Bank details, Gift cards | ✅ Complete |

---

## Feature Details by Tab

### 1. 📁 Portfolio Tab
**Frontend Coverage:**
- Portfolio page (`/portfolio`) - List with tag filtering
- Portfolio detail page (`/portfolio/:slug`) - Full project details
- Home section (PortfolioGrid) - Featured 6 projects

**Admin Capabilities:**
- Create new portfolio projects
- Upload cover image (auto-resized)
- Add project tags (create new on the fly)
- Write full project description (body field)
- Link GitHub & live project URLs
- Upload multiple project images
- Edit existing projects
- Delete projects

**API Endpoint:** `/api/portfolio/`

---

### 2. 📝 Blog Tab (NEW)
**Frontend Coverage:**
- Blog page (`/blog`) - List of all blog posts
- Blog detail page (`/blog/:slug`) - Full article reading
- Home section (BlogCards) - Latest 6 posts

**Admin Capabilities:**
- Create new blog posts
- Upload cover image for each post
- Write blog excerpt and full content
- Add tags to categorize posts
- Link products to promote (shown in blog detail)
- Edit published posts
- Delete posts

**API Endpoint:** `/api/blog/`

**Related API Functions (New):**
- `createBlog(data)` - Create new post
- `updateBlog(id, data)` - Edit post
- `deleteBlog(id)` - Remove post
- `fetchBlogList()` - Get all posts

---

### 3. 🛍️ Products Tab
**Frontend Coverage:**
- Products can be linked to blog posts
- Product purchase/download flow
- Affiliate link tracking

**Admin Capabilities:**
- Create digital products
- Set pricing in cents ($5.00 = 500 cents)
- Upload product file (downloadable)
- Add affiliate URL for external products
- Stripe integration (optional)
- Link to blog posts
- Manage product availability

**API Endpoint:** `/api/products/`

---

### 4. 💼 Services Tab
**Frontend Coverage:**
- Services displayed on home page (ServicesGrid)
- Services page (`/services`)

**Admin Capabilities:**
- Create service offerings
- Add service title and description
- Define sub-services/details
- Reorder services

**API Endpoint:** `/api/services/`

---

### 5. ⚡ Skills Tab
**Frontend Coverage:**
- Skills displayed on home page (SkillsGrid)
- Skills page (`/skills`)

**Admin Capabilities:**
- Add technology skills
- Organize by category
- Set proficiency level
- Reorder skill display

**API Endpoint:** `/api/skills/`

---

### 6. 📄 Resources Tab
**Frontend Coverage:**
- Resources page (`/resources`)

**Admin Capabilities:**
- Upload CV/Resume file
- Set as active/inactive
- Upload certifications with details:
  - Certificate name
  - Issuing organization
  - Issue & expiry dates
  - Certificate file/badge
- Publish/unpublish resources

**API Endpoints:**
- `/api/cv/`
- `/api/certifications/`

---

### 7. ⭐ Reviews Tab (NEW)
**Frontend Coverage:**
- Reviews displayed on home page (ReviewsSlider)
- Add review form on multiple pages (AddReview)
- Review moderation dashboard

**Admin Capabilities:**
- View all customer reviews (published & pending)
- Filter by status (All / Published / Pending)
- Publish/unpublish reviews
- Delete spam or inappropriate reviews
- See reviewer name, rating, date submitted
- Link reviews to specific products (optional)

**Moderation Details:**
- New reviews start as "Pending" (unpublished)
- Click "Publish" to make visible on homepage
- Click "Unpublish" to hide without deleting
- Delete permanently if spam/inappropriate
- Reviewers' ratings displayed as stars (★)

**API Endpoint:** `/api/reviews/`

**Related API Functions (New):**
- `fetchAllReviews()` - Get all reviews (published + unpublished)
- `updateReview(id, data)` - Publish/unpublish
- `deleteReview(id)` - Remove review

---

### 8. 👤 About Tab
**Frontend Coverage:**
- Full About page (`/about`)
- About preview on home page (AboutPreview) - **Same data!**

**Admin Capabilities:**
- Set your full name
- Professional title
- Upload profile picture
- Write short bio (displays on home)
- Write long description (full About page)
- Location
- Email address
- Website URL
- Social media links:
  - LinkedIn
  - GitHub
  - Twitter
- Resume/CV link
- Publish toggle

**Important Note:** The About data you edit here is displayed in TWO places:
1. Full About page (`/about`) - Uses all fields
2. Home page preview (AboutPreview) - Uses: profile_image, name, title, bio, location, email, social links

**API Endpoint:** `/api/about/`

---

### 9. 🎬 Hero Tab
**Frontend Coverage:**
- Hero banner on home page (HeroCloud)
- Typing animation with developer titles

**Admin Capabilities:**
- Edit greeting text
- Configure typing animation strings
  - What titles/roles appear in typing animation
- Main hero title
- Add up to 2 CTA buttons with links
- Upload background video or image
- "Scroll to continue" text
- Publish toggle

**Features:**
- Animated typing effect with cursor
- Responsive background media
- Parallax scrolling effect

**API Endpoint:** `/api/hero/`

---

### 10. 💰 Donations Tab
**Frontend Coverage:**
- Donations page (`/donate`)
- Donation session management
- Payment processing (Stripe/PayPal optional)

**Admin Capabilities:**
- Set donation info/description
- Configure bank transfer details
  - Account name
  - Account number
  - Bank name
  - Routing/Swift details
- Manage gift card offerings
  - Card name/title
  - Card image/badge
  - Card details

**API Endpoints:**
- `/api/donation-info/`
- `/api/bank-details/`
- `/api/gift-cards/`

---

## Home Page Sections Quick Reference

The home page renders 7 sections in order:

1. **HeroCloud** - Typing animation hero banner
   - Managed via: 🎬 Hero tab
   - Displays: Greeting, typing strings, CTA buttons

2. **AboutPreview** - Profile intro section
   - Managed via: 👤 About tab
   - Displays: Profile image, name, title, bio, social links

3. **ServicesGrid** - Service cards
   - Managed via: 💼 Services tab
   - Displays: 3-4 service offerings with descriptions

4. **SkillsGrid** - Technology skills
   - Managed via: ⚡ Skills tab
   - Displays: Categories and skill names

5. **PortfolioGrid** - Featured projects
   - Managed via: 📁 Portfolio tab
   - Displays: Featured 6 portfolio items

6. **ReviewsSlider** - Customer testimonials
   - Managed via: ⭐ Reviews tab
   - Displays: Published reviews in carousel

7. **BlogCards** - Latest blog posts
   - Managed via: 📝 Blog tab
   - Displays: Latest 6 blog posts with excerpts

---

## Frontend Pages Overview

| Page | Route | Admin Tab | Purpose |
|------|-------|-----------|---------|
| Home | `/` | Multiple tabs | Landing page with all 7 sections |
| Portfolio | `/portfolio` | 📁 Portfolio | All projects with tag filtering |
| Portfolio Detail | `/portfolio/:slug` | 📁 Portfolio | Single project full details |
| Blog | `/blog` | 📝 Blog | All blog posts list |
| Blog Detail | `/blog/:slug` | 📝 Blog | Single blog post content |
| Skills | `/skills` | ⚡ Skills | Technology skills showcase |
| Services | `/services` | 💼 Services | Service offerings detail |
| About | `/about` | 👤 About | Full bio and information |
| Resources | `/resources` | 📄 Resources | CV and Certifications |
| Contact | `/contact` | N/A | Contact form (backend only) |
| Donate | `/donate` | 💰 Donations | Donation & support options |
| Add Review | `/add-review` | ⭐ Reviews | Submit testimonial form |

---

## Quick Tips

### Publishing Content
- **Portfolio:** Published immediately when created (no draft mode)
- **Blog:** Published immediately when created (no draft mode)
- **Reviews:** Start as "Pending" - must publish from Reviews tab
- **About:** Appears on home & `/about` immediately
- **Services/Skills:** Appear immediately
- **Certifications/CV:** Can be toggled with `is_published` flag

### Data Relationships
- **Products** can be linked to Blog posts
- **Reviews** can be linked to Products (optional)
- **Blog posts** and **Portfolio** items can have tags
- **About** data feeds BOTH full About page AND home preview

### Best Practices
1. Always add meaningful titles & descriptions
2. Use high-quality images (recommended sizes in UI hints)
3. Tag content appropriately for filtering
4. Moderate reviews before publishing (filter by Pending status)
5. Link related products to blog posts for cross-promotion
6. Update social media links in About tab
7. Use CTA buttons in Hero section to guide visitors

---

## Content Workflow

### Creating a New Blog Post
1. Go to Admin Dashboard → 📝 Blog tab
2. Fill in title, excerpt, and content
3. Upload cover image (recommended: 1200x630px)
4. Add relevant tags
5. Link related products (if applicable)
6. Click "Create Post"
7. Post appears immediately on `/blog` and in home BlogCards

### Modulating a New Review
1. Customer submits review via `/add-review` page
2. Go to Admin Dashboard → ⭐ Reviews tab
3. Filter by "Pending" to see new reviews
4. Read the review content
5. Click "Publish" to display on home page OR "Delete" if spam
6. Published reviews appear in home ReviewsSlider

### Updating About Section
1. Go to Admin Dashboard → 👤 About tab
2. Edit any field (name, title, bio, social links, etc.)
3. Upload new profile image (optional)
4. Click "Update" button
5. Changes immediately reflect:
   - Home page AboutPreview section
   - Full About page (`/about`)

---

## API Integration Summary

All admin operations use authenticated API endpoints under `/api/`:

```
GET    /api/portfolio/           - List all portfolios
POST   /api/portfolio/           - Create portfolio
PATCH  /api/portfolio/{id}/      - Edit portfolio
DELETE /api/portfolio/{id}/      - Delete portfolio

GET    /api/blog/                - List all blogs
POST   /api/blog/                - Create blog
PATCH  /api/blog/{id}/           - Edit blog
DELETE /api/blog/{id}/           - Delete blog

GET    /api/reviews/             - List all reviews
PATCH  /api/reviews/{id}/        - Update review (publish/unpublish)
DELETE /api/reviews/{id}/        - Delete review

GET    /api/about/               - Get About content
POST   /api/about/               - Create About
PATCH  /api/about/{id}/          - Update About

[... Additional endpoints for services, skills, resources, hero, donations ...]
```

All requests require `Authorization: Bearer {token}` header.

---

## Troubleshooting

### Changes not appearing on frontend
1. Make sure you clicked the save/create button
2. Check for validation errors (required fields)
3. Try refreshing the frontend page (Ctrl+F5)
4. Check browser console for API errors

### File upload fails
1. Check file size (should be < 10MB typically)
2. Verify file format (jpg, png, pdf for documents)
3. Ensure sufficient disk space on server

### Can't publish review
1. Check if review is already published
2. Verify review has valid data
3. Try refreshing the page

### About section not showing on home
1. Ensure About tab content is published (`is_published: true`)
2. Verify at least name and bio are filled
3. Check `/api/about/` endpoint returns data

---

## Next Steps

✅ All frontend sections now have admin dashboard control.
✅ Complete content management system in place.

You can now:
- Manage all portfolio projects
- Create and publish blog posts
- Moderate customer reviews
- Update your bio and social links
- Configure donations and payment methods
- Upload CV and certifications
- Customize hero section and CTAs

Happy content management! 🚀
