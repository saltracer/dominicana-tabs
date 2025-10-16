# TODO LIST

## Profiles
- [] Redesign the prefences page, as the organization doesn't make sense and not all of them are used. The initial idea is that they would be organized by "section"of the app (eg prayer, study, etc)

## Prayer
- More content
- devotions need to be built. With audio. 
- Vespers or Lauds ... need to prove the design
- Redesign Rosary
- Rosary Audio
 - [ ] implement cache invalidation and redownload of audio files -testing phase
 - [x] allow specific voices to be clear, obviously 
 - [x] reimplement expo-audio for an iOS/android compatible solution 
 - [x] get audio playback displaying as part of the iOS/android audio experience 
 - [x] add a setting to explicitly clear the cache
 - [ ] create admin only cms front end web only
 - [x] create a voice for John Henry Newman 
 - [x] a voice for Therese
 - [x] a voice for Francis de Sales
 - [x] a voice for Hildegard
 - [ ] generate the rosary audio for the different voices
 - [ ] allow the voices to be deleted without needing to reselect the voice and then clear the cache
 - [ ] text highlighting?


## Study
- [x] Bookmarking
- [x] Notes
- [x] Highlights
  - [x] Highlight the bible
  - [ ] Highlight epubs
- [ ] Book audio?
- [x] Redeisgn how the bible is accessed
- [x] keep books downloaded
- [x] cache the book covers
- [x] Add a setting to remove the download
- [ ] Add a admin only, web only, CMS to manage the books and their covers and other metadata
- [ ] Dark mode menu isn't working right. Perhaps this can be extracted and refactored as a high-level component?

## Community
- [ ] Calendar is ugly

## Preaching
- [ ] Subscribe to blogs
- [ ] Subscribe to podcasts

## Other
- [ ] Carplay
- [ ] Admin console
- [ ] Look for opportunities to refactor
- [ ] fix the user profile sub page titling

## Books to add
 - st Patrick’s autobiography 
 - st Benedict’s biography by st Gregory 


## Future Extensibility of Admin Section

The admin console is designed to easily add new management areas:

- **Blog Posts** - CRUD for blog_posts table
- **Podcasts** - New table + storage bucket
- **Liturgy Components** - Manage liturgy_components and liturgy_templates
- **Daily Offices** - Content management for daily_offices
- **Notifications** - Send push notifications to users
- **Analytics Export** - Download usage reports

Each new area follows the same pattern:

1. Add route under `app/admin/{area}/`
2. Create service in `services/Admin{Area}Service.ts`
3. Add navigation item in admin layout
4. Use shared components (AdminTable, AdminForm, etc.)