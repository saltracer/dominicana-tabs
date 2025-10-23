# TODO LIST

## Profiles
- [x] Redesign the prefences page, as the organization doesn't make sense and not all of them are used. The initial idea is that they would be organized by "section"of the app (eg prayer, study, etc)
- [x] On the web, the profile page should be a menu dropdown, not a page modal

## Prayer
- More content
- devotions need to be built. With audio. 
- Vespers or Lauds ... need to prove the design
- Redesign Rosary
- Rosary Audio
 - [ ] implement cache invalidation and redownload of audio files -testing phase
 - [ ] Rosary final prayer needs to be split into individual prayers and combined 
 - [ ] Add preferences for final prayers
 - [x] allow specific voices to be clear, obviously 
 - [x] reimplement expo-audio for an iOS/android compatible solution 
 - [x] get audio playback displaying as part of the iOS/android audio experience 
 - [x] add a setting to explicitly clear the cache
 - [x] create admin only cms front end web only
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
- [x] Add a admin only, web only, CMS to manage the books and their covers and other metadata
- [ ] Dark mode menu isn't working right. Perhaps this can be extracted and refactored as a high-level component?
- [x] Book categories should be tags not single options
- [ ] Books need to have versions (for when epubs are updated and users are already reading an other epub) and for when books are pulled from the library but as still "owned" by users.

## Community
- [x] Calendar is ugly
- [x] Saints don't list all, the scrolling stops?
- [x] The province map doesn't show the continent filters on mobile. Appears to be behind the feast banner.
- [ ] Saints page on web isn't responsive

## Preaching
- [ ] Subscribe to blogs
- [ ] Subscribe to podcasts

## Other
- [ ] Carplay
- [x] Admin console
- [ ] Look for opportunities to refactor
- [x] fix the user profile sub page titling
- [x] scrolling footer
- [ ] support text resizing

## Admin
- [ ] Allow the Rosary Audio to be renamed
- [ ] Test book uploads. All aspects of CRUD
- [ ] Text user creation and signup workflows. All aspects of CRUD for users. From admin and user perspective.

### Books to add
 - [x] st Patrick’s autobiography 
 - [x] st Benedict’s biography by st Gregory 


## Future Extensibility of Admin Section

The admin console is designed to easily add new management areas:

- **Blog Posts** - CRUD for blog_posts table
- **Podcasts** - New table + storage bucket
- **Liturgy Components** - Manage liturgy_components and liturgy_templates
- **Daily Offices** - Content management for daily_offices
- **Notifications** - Send push notifications to users
- **Analytics Export** - Download usage reports