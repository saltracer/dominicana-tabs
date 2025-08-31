import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useTheme } from '../../components/ThemeProvider';
import FeastBanner from '../../components/FeastBanner';
import LiturgicalCalendarService from '../../services/LiturgicalCalendar';
import { LiturgicalDay, Reflection, BlogPost } from '../../types';

export default function PreachingScreen() {
  const { colorScheme } = useTheme();
  const [liturgicalDay, setLiturgicalDay] = useState<LiturgicalDay | null>(null);
  const [activeTab, setActiveTab] = useState<'reflections' | 'blog' | 'audio'>('reflections');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSubscription, setHasSubscription] = useState(false);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const calendarService = LiturgicalCalendarService.getInstance();
    const today = new Date();
    const day = calendarService.getLiturgicalDay(today);
    setLiturgicalDay(day);
    loadReflections();
    loadBlogPosts();
  }, []);

  const handleDateChange = (date: Date) => {
    const calendarService = LiturgicalCalendarService.getInstance();
    const day = calendarService.getLiturgicalDay(date);
    setLiturgicalDay(day);
  };

  const loadReflections = () => {
    const sampleReflections: Reflection[] = [
      {
        id: 'reflection-1',
        title: 'The Light of Truth',
        author: 'Fr. Thomas Aquinas, OP',
        content: 'In today\'s Gospel, we are reminded of the importance of seeking truth in all things. As Dominicans, we are called to be preachers of truth, following in the footsteps of our holy father St. Dominic...',
        date: new Date().toISOString(),
        liturgicalDay: 'Wednesday of the First Week of Ordinary Time',
        tags: ['truth', 'gospel', 'dominican'],
        isDominican: true,
        audioUrl: 'https://example.com/audio/reflection-1.mp3',
        imageUrl: undefined
      },
      {
        id: 'reflection-2',
        title: 'Contemplation and Action',
        author: 'Sr. Catherine of Siena, OP',
        content: 'The Dominican charism calls us to both contemplation and action. We cannot truly preach what we have not first contemplated in our hearts...',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        liturgicalDay: 'Tuesday of the First Week of Ordinary Time',
        tags: ['contemplation', 'action', 'charism'],
        isDominican: true,
        audioUrl: undefined,
        imageUrl: undefined
      }
    ];
    setReflections(sampleReflections);
  };

  const loadBlogPosts = () => {
    const sampleBlogPosts: BlogPost[] = [
      {
        id: 'blog-1',
        title: 'The Dominican Way of Prayer',
        author: 'Fr. Dominic, OP',
        content: 'The Dominican tradition offers a unique approach to prayer that combines intellectual rigor with heartfelt devotion. Our method of prayer is rooted in the study of Scripture and the teachings of the Church...',
        excerpt: 'Exploring the distinctive prayer tradition of the Order of Preachers...',
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['prayer', 'dominican', 'tradition'],
        category: 'Spirituality',
        isDominican: true,
        featuredImage: undefined,
        audioUrl: 'https://example.com/audio/blog-1.mp3'
      },
      {
        id: 'blog-2',
        title: 'Preaching in the Digital Age',
        author: 'Fr. Augustine, OP',
        content: 'As we navigate the challenges of the digital age, Dominican preachers must adapt their methods while remaining faithful to our charism of preaching truth...',
        excerpt: 'How Dominican preaching adapts to modern communication...',
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['preaching', 'digital', 'modern'],
        category: 'Ministry',
        isDominican: true,
        featuredImage: undefined,
        audioUrl: undefined
      }
    ];
    setBlogPosts(sampleBlogPosts);
  };

  const filteredReflections = reflections.filter(reflection =>
    searchQuery === '' ||
    reflection.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reflection.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBlogPosts = blogPosts.filter(post =>
    searchQuery === '' ||
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReflectionPress = (reflection: Reflection) => {
    Alert.alert(
      reflection.title,
      `By ${reflection.author}\n\n${reflection.content}`,
      [
        { text: 'Close', style: 'default' },
        ...(reflection.audioUrl ? [{
          text: 'Listen',
          onPress: () => {
            if (!hasSubscription) {
              Alert.alert(
                'Subscription Required',
                'Audio content requires a premium subscription.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Subscribe', onPress: () => setHasSubscription(true) }
                ]
              );
            } else {
              Alert.alert('Audio Player', 'Audio player would open here.');
            }
          }
        }] : [])
      ]
    );
  };

  const handleBlogPostPress = (post: BlogPost) => {
    Alert.alert(
      post.title,
      `By ${post.author}\n\n${post.content}`,
      [
        { text: 'Close', style: 'default' },
        { text: 'Read Full Post', onPress: () => {
          Alert.alert('Full Post', 'Full blog post would be displayed here.');
        }},
        ...(post.audioUrl ? [{
          text: 'Listen',
          onPress: () => {
            if (!hasSubscription) {
              Alert.alert(
                'Subscription Required',
                'Audio content requires a premium subscription.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Subscribe', onPress: () => setHasSubscription(true) }
                ]
              );
            } else {
              Alert.alert('Audio Player', 'Audio player would open here.');
            }
          }
        }] : [])
      ]
    );
  };

  if (!liturgicalDay) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Loading liturgical information...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]} edges={['left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Subscription Banner */}
        {!hasSubscription && (
          <View style={styles.subscriptionBanner}>
            <Ionicons name="headset" size={20} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
            <Text style={[styles.subscriptionText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
              Subscribe for audio content
            </Text>
            <TouchableOpacity onPress={() => setHasSubscription(true)} style={styles.subscribeButton}>
              <Text style={[styles.subscribeButtonText, { color: Colors[colorScheme ?? 'light'].primary }]}>
                Subscribe
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tab Navigation */}
        <View style={[styles.tabContainer, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              { 
                backgroundColor: activeTab === 'reflections' 
                  ? Colors[colorScheme ?? 'light'].primary 
                  : Colors[colorScheme ?? 'light'].card,
              }
            ]}
            onPress={() => setActiveTab('reflections')}
          >
            <Ionicons 
              name="bookmark" 
              size={20} 
              color={activeTab === 'reflections' 
                ? Colors[colorScheme ?? 'light'].dominicanWhite 
                : Colors[colorScheme ?? 'light'].textSecondary
              } 
            />
            <Text style={[
              styles.tabText,
              { 
                color: activeTab === 'reflections' 
                  ? Colors[colorScheme ?? 'light'].dominicanWhite 
                  : Colors[colorScheme ?? 'light'].text
              }
            ]}>
              Reflections
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              { 
                backgroundColor: activeTab === 'blog' 
                  ? Colors[colorScheme ?? 'light'].primary 
                  : Colors[colorScheme ?? 'light'].card,
              }
            ]}
            onPress={() => setActiveTab('blog')}
          >
            <Ionicons 
              name="document-text" 
              size={20} 
              color={activeTab === 'blog' 
                ? Colors[colorScheme ?? 'light'].dominicanWhite 
                : Colors[colorScheme ?? 'light'].textSecondary
              } 
            />
            <Text style={[
              styles.tabText,
              { 
                color: activeTab === 'blog' 
                  ? Colors[colorScheme ?? 'light'].dominicanWhite 
                  : Colors[colorScheme ?? 'light'].text
              }
            ]}>
              Blog
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              { 
                backgroundColor: activeTab === 'audio' 
                  ? Colors[colorScheme ?? 'light'].primary 
                  : Colors[colorScheme ?? 'light'].card,
              }
            ]}
            onPress={() => setActiveTab('audio')}
          >
            <Ionicons 
              name="headset" 
              size={20} 
              color={activeTab === 'audio' 
                ? Colors[colorScheme ?? 'light'].dominicanWhite 
                : Colors[colorScheme ?? 'light'].textSecondary
              } 
            />
            <Text style={[
              styles.tabText,
              { 
                color: activeTab === 'audio' 
                  ? Colors[colorScheme ?? 'light'].dominicanWhite 
                  : Colors[colorScheme ?? 'light'].text
              }
            ]}>
              Audio
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { 
          backgroundColor: Colors[colorScheme ?? 'light'].surface,
          borderColor: Colors[colorScheme ?? 'light'].border
        }]}>
          <Ionicons name="search" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: Colors[colorScheme ?? 'light'].text }]}
            placeholder="Search content..."
            placeholderTextColor={Colors[colorScheme ?? 'light'].textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Reflections Tab */}
        {activeTab === 'reflections' && (
          <View style={styles.tabContent}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Daily Reflections
            </Text>
            
            <View style={styles.reflectionsList}>
              {filteredReflections.map((reflection) => (
                <TouchableOpacity
                  key={reflection.id}
                  style={[styles.reflectionCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
                  onPress={() => handleReflectionPress(reflection)}
                >
                  <View style={styles.reflectionHeader}>
                    <View style={styles.reflectionInfo}>
                      <Text style={[styles.reflectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                        {reflection.title}
                      </Text>
                      <Text style={[styles.reflectionAuthor, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                        By {reflection.author}
                      </Text>
                    </View>
                    {reflection.audioUrl && (
                      <Ionicons 
                        name="headset" 
                        size={24} 
                        color={hasSubscription ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].textMuted} 
                      />
                    )}
                  </View>
                  <Text style={[styles.reflectionExcerpt, { color: Colors[colorScheme ?? 'light'].textMuted }]} numberOfLines={3}>
                    {reflection.content}
                  </Text>
                  <View style={styles.reflectionFooter}>
                    <Text style={[styles.reflectionDate, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      {new Date(reflection.date).toLocaleDateString()}
                    </Text>
                    {reflection.isDominican && (
                      <View style={styles.dominicanBadge}>
                        <Text style={styles.dominicanBadgeText}>OP</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Blog Tab */}
        {activeTab === 'blog' && (
          <View style={styles.tabContent}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Blog Posts
            </Text>
            
            <View style={styles.blogList}>
              {filteredBlogPosts.map((post) => (
                <TouchableOpacity
                  key={post.id}
                  style={[styles.blogCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
                  onPress={() => handleBlogPostPress(post)}
                >
                  <View style={styles.blogHeader}>
                    <View style={styles.blogInfo}>
                      <Text style={[styles.blogTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                        {post.title}
                      </Text>
                      <Text style={[styles.blogAuthor, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                        By {post.author}
                      </Text>
                    </View>
                    {post.audioUrl && (
                      <Ionicons 
                        name="headset" 
                        size={24} 
                        color={hasSubscription ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].textMuted} 
                      />
                    )}
                  </View>
                  <Text style={[styles.blogExcerpt, { color: Colors[colorScheme ?? 'light'].textMuted }]} numberOfLines={3}>
                    {post.excerpt}
                  </Text>
                  <View style={styles.blogFooter}>
                    <Text style={[styles.blogDate, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </Text>
                    <View style={styles.blogCategory}>
                      <Text style={[styles.blogCategoryText, { color: Colors[colorScheme ?? 'light'].primary }]}>
                        {post.category}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Audio Tab */}
        {activeTab === 'audio' && (
          <View style={styles.tabContent}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Audio Content
            </Text>
            
            {!hasSubscription ? (
              <View style={styles.subscriptionRequired}>
                <Ionicons name="lock-closed" size={64} color={Colors[colorScheme ?? 'light'].textMuted} />
                <Text style={[styles.subscriptionRequiredTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Premium Subscription Required
                </Text>
                <Text style={[styles.subscriptionRequiredText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Subscribe to access audio homilies, meditations, and spiritual talks from Dominican friars.
                </Text>
                <TouchableOpacity
                  style={[styles.subscribeButtonLarge, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
                  onPress={() => setHasSubscription(true)}
                >
                  <Text style={[styles.subscribeButtonLargeText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                    Subscribe Now
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.audioContent}>
                <Text style={[styles.audioContentText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Audio content would be displayed here.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
      
      {/* Feast Banner at Bottom */}
      <FeastBanner 
        liturgicalDay={liturgicalDay} 
        onDateChange={handleDateChange}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  subscriptionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.info,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  subscriptionText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  subscribeButton: {
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  subscribeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  tabContent: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    fontFamily: 'Georgia',
  },
  reflectionsList: {
    marginTop: 8,
  },
  reflectionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reflectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reflectionInfo: {
    flex: 1,
  },
  reflectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: 'Georgia',
  },
  reflectionAuthor: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  reflectionExcerpt: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    fontFamily: 'Georgia',
  },
  reflectionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reflectionDate: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },
  dominicanBadge: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dominicanBadgeText: {
    color: Colors.light.dominicanWhite,
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  blogList: {
    marginTop: 8,
  },
  blogCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  blogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  blogInfo: {
    flex: 1,
  },
  blogTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: 'Georgia',
  },
  blogAuthor: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  blogExcerpt: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    fontFamily: 'Georgia',
  },
  blogFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  blogDate: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },
  blogCategory: {
    backgroundColor: Colors.light.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  blogCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  subscriptionRequired: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  subscriptionRequiredTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'Georgia',
  },
  subscriptionRequiredText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
    fontFamily: 'Georgia',
    lineHeight: 24,
  },
  subscribeButtonLarge: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  subscribeButtonLargeText: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  audioContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  audioContentText: {
    fontSize: 16,
    fontFamily: 'Georgia',
  },
});
