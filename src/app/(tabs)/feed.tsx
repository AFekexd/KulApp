import PageTransition from '@/components/PageTransition';
import { FeedItem, useFeedStore } from '@/stores/feedStore';
import { useGroupStore } from '@/stores/groupStore';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Globe, Home, MapPin, Radio, Search, ThumbsUp, Users } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import {
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DESIGN_COLORS = {
  background: '#2D1B15',
  card: '#3E2723',
  primary: '#A95C33',
  secondary: '#8D6E63',
  success: '#33691E',
  textPrimary: '#EFEBE9',
  textSecondary: '#BCAAA4',
  border: '#5D4037',
};

const getSizeBadgeStyle = (size: string) => {
  switch (size) {
    case 'Tiny':
      return { bg: 'rgba(0, 102, 204, 0.15)', text: '#66B2FF' };
    case 'Small':
      return { bg: 'rgba(19, 115, 51, 0.15)', text: '#81C995' };
    case 'Medium':
      return { bg: 'rgba(183, 129, 3, 0.15)', text: '#FDE293' };
    case 'Large':
      return { bg: 'rgba(197, 34, 31, 0.15)', text: '#F28B82' };
    case 'Massive':
      return { bg: 'rgba(123, 31, 162, 0.15)', text: '#D7A1F9' };
    default:
      return { bg: 'rgba(183, 129, 3, 0.15)', text: '#FDE293' };
  }
};

export default function FeedScreen() {
  const router = useRouter();
  const { feedItems, toggleUpvote, refreshFeed, isRefreshing } = useFeedStore();
  const { groups, fetchUserGroups } = useGroupStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroupFilter, setActiveGroupFilter] = useState<string>('all');

  useEffect(() => {
    fetchUserGroups();
  }, []);

  const filteredItems = feedItems.filter((item: FeedItem) => {
    const matchesSearch =
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.custom_title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.profiles.username.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    
    if (activeGroupFilter !== 'all') {
      return item.target_group_id === activeGroupFilter;
    }
    
    return true;
  });

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} h ago`;
    return `${Math.floor(hours / 24)} d ago`;
  };

  return (
    <PageTransition>
      <View style={styles.screenOuter}>
        <SafeAreaView style={styles.container} edges={['top']}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={refreshFeed}
                tintColor={DESIGN_COLORS.primary}
              />
            }
          >
            {/* Header */}
            <View style={styles.headerRow}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.title}>Recent Reports</Text>
                  <Radio size={24} color={DESIGN_COLORS.textPrimary} />
                </View>
                <Text style={styles.subtitle}>Real-time community drop activity</Text>
              </View>

              <TouchableOpacity
                style={styles.newReportBtn}
                activeOpacity={0.8}
                onPress={() => router.push('/(modals)/quick-drop')}
              >
                <Text style={styles.newReportBtnText}>+ Log Drop</Text>
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.searchBarContainer}>
              <Search size={16} color={DESIGN_COLORS.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by location, title or user..."
                placeholderTextColor={DESIGN_COLORS.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery !== '' && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Text style={styles.clearSearchText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Filter Pills: Group Scope */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillRow}>
              <TouchableOpacity
                style={[styles.filterPill, activeGroupFilter === 'all' && styles.filterPillActive]}
                onPress={() => setActiveGroupFilter('all')}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Globe size={14} color={activeGroupFilter === 'all' ? '#FFFFFF' : DESIGN_COLORS.textSecondary} />
                  <Text style={[styles.filterPillText, activeGroupFilter === 'all' && styles.filterPillTextActive]}>
                    All My Groups
                  </Text>
                </View>
              </TouchableOpacity>
              
              {groups.map((g) => (
                <TouchableOpacity
                  key={g.id}
                  style={[styles.filterPill, activeGroupFilter === g.id && styles.filterPillActive]}
                  onPress={() => setActiveGroupFilter(g.id)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Home size={14} color={activeGroupFilter === g.id ? '#FFFFFF' : DESIGN_COLORS.textSecondary} />
                    <Text style={[styles.filterPillText, activeGroupFilter === g.id && styles.filterPillTextActive]}>
                      {g.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Feed List */}
            <View style={styles.feedStack}>
              {filteredItems.length > 0 ? (
                filteredItems.map((report: FeedItem) => {
                  const badgeStyle = getSizeBadgeStyle(report.size_badge || 'Medium');
                  return (
                    <View key={report.id} style={styles.reportCard}>
                      <View style={styles.cardTopRow}>
                        <View style={styles.authorGroup}>
                          <View style={[styles.avatarCircle, !report.profiles?.avatar_url && { backgroundColor: '#5D4037' }]}>
                            {report.profiles?.avatar_url ? (
                              <Image source={{ uri: report.profiles.avatar_url }} style={styles.avatarImage} contentFit="cover" />
                            ) : (
                              <Text style={styles.avatarText}>
                                {report.profiles.username.slice(0, 2).toUpperCase()}
                              </Text>
                            )}
                          </View>
                          <View>
                            <Text style={styles.username}>{report.profiles.username}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <Text style={styles.timeAgo}>{formatTimeAgo(report.created_at)}</Text>
                              {report.groups?.name && (
                                <>
                                  <Text style={styles.metaDot}>•</Text>
                                  <Text style={styles.groupMetaText}>{report.groups.name}</Text>
                                </>
                              )}
                            </View>
                          </View>
                        </View>

                        <View style={[styles.sizeBadge, { backgroundColor: badgeStyle.bg }]}>
                          <Text style={[styles.sizeBadgeText, { color: badgeStyle.text }]}>
                            {report.size_badge}
                          </Text>
                        </View>
                      </View>

                      {/* Report Content */}
                      <View style={styles.cardBody}>
                        <Text style={styles.reportTitle}>{report.custom_title || `${report.location} Session`}</Text>

                        <View style={styles.locationMetaRow}>
                          <MapPin size={13} color={DESIGN_COLORS.textSecondary} />
                          <Text style={styles.locationText}>{report.location}</Text>
                        </View>
                      </View>

                      {/* Footer Actions */}
                      <View style={styles.cardFooter}>
                        <Text style={styles.reactionsText}>
                          {report.reactions_count} {report.reactions_count === 1 ? 'reaction' : 'reactions'}
                        </Text>

                        <TouchableOpacity
                          style={[styles.upvoteBtn, report.is_upvoted && styles.upvoteBtnActive]}
                          activeOpacity={0.7}
                          onPress={() => toggleUpvote(report.id)}
                        >
                          <ThumbsUp size={12} color={report.is_upvoted ? DESIGN_COLORS.primary : DESIGN_COLORS.textSecondary} />
                          <Text style={[styles.upvoteLabel, report.is_upvoted && styles.upvoteLabelActive]}>
                            {report.is_upvoted ? 'Upvoted' : 'Upvote'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyCard}>
                  <Search size={32} color={DESIGN_COLORS.textSecondary} />
                  <Text style={styles.emptyTitle}>No reports found</Text>
                  <Text style={styles.emptySub}>Try clearing your search or filter to see more community drops.</Text>
                </View>
              )}
            </View>

            <View style={{ height: 90 }} />
          </ScrollView>
        </SafeAreaView>
      </View>
    </PageTransition>
  );
}

const styles = StyleSheet.create({
  screenOuter: {
    flex: 1,
    backgroundColor: DESIGN_COLORS.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Nunito-ExtraBold',
    color: DESIGN_COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: DESIGN_COLORS.textSecondary,
    marginTop: 2,
  },
  newReportBtn: {
    backgroundColor: DESIGN_COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  newReportBtnText: {
    fontSize: 13,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DESIGN_COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: DESIGN_COLORS.textPrimary,
  },
  clearSearchText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: DESIGN_COLORS.textSecondary,
  },
  filterPillRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  filterPill: {
    backgroundColor: DESIGN_COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: DESIGN_COLORS.primary,
    borderColor: DESIGN_COLORS.primary,
  },
  filterPillText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: DESIGN_COLORS.textSecondary,
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  feedStack: {
    gap: 14,
  },
  reportCard: {
    backgroundColor: DESIGN_COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
    padding: 20,
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#1A0E0B',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
      web: { boxShadow: '0 6px 16px rgba(26, 14, 11, 0.4)' },
    }),
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4E342E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  avatarText: {
    fontSize: 16,
    fontFamily: 'Nunito-ExtraBold',
    color: '#EFEBE9',
  },
  username: {
    fontSize: 15,
    fontFamily: 'Nunito-ExtraBold',
    color: DESIGN_COLORS.textPrimary,
  },
  timeAgo: {
    fontSize: 11,
    color: DESIGN_COLORS.textSecondary,
  },
  groupMetaText: {
    fontSize: 11,
    color: DESIGN_COLORS.primary,
    fontFamily: 'Inter-Bold',
  },
  sizeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sizeBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
  },
  cardBody: {
    gap: 4,
  },
  reportTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-ExtraBold',
    color: DESIGN_COLORS.textPrimary,
  },
  locationMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: DESIGN_COLORS.textSecondary,
  },
  metaDot: {
    fontSize: 12,
    color: DESIGN_COLORS.border,
  },
  verificationBadge: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: DESIGN_COLORS.success,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: DESIGN_COLORS.border,
  },
  reactionsText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: DESIGN_COLORS.textSecondary,
  },
  upvoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  upvoteBtnActive: {
    backgroundColor: 'rgba(169, 92, 51, 0.15)',
    borderColor: DESIGN_COLORS.primary,
  },
  upvoteLabel: {
    fontSize: 13,
    fontFamily: 'Inter-Bold',
    color: DESIGN_COLORS.textSecondary,
  },
  upvoteLabelActive: {
    color: DESIGN_COLORS.primary,
  },
  emptyCard: {
    backgroundColor: DESIGN_COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DESIGN_COLORS.border,
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Nunito-ExtraBold',
    color: DESIGN_COLORS.textPrimary,
  },
  emptySub: {
    fontSize: 12,
    color: DESIGN_COLORS.textSecondary,
    textAlign: 'center',
  },
});
