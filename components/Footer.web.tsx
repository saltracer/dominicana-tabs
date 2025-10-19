import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/components/ThemeProvider';
import { useIsMobile, useIsTablet } from '@/hooks/useMediaQuery';
import { spacing } from '@/constants/Spacing';

export default function Footer() {
  const { colorScheme } = useTheme();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  const quickLinks1 = [
    { name: 'Prayer', href: '/(tabs)/prayer' },
    { name: 'Study', href: '/(tabs)/study' },
  ];

  const quickLinks2 = [
    { name: 'Community', href: '/(tabs)/community' },
    { name: 'Preaching', href: '/(tabs)/preaching' },
  ];

  const resources1 = [
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const resources2 = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: 'logo-facebook' },
    { name: 'Twitter', icon: 'logo-twitter' },
    { name: 'Instagram', icon: 'logo-instagram' },
  ];

  return (
    <View style={Object.assign({}, styles.footer, { backgroundColor: Colors[colorScheme ?? 'light'].surface })}>
      <View style={Object.assign(
        {},
        styles.footerContent,
        isMobile ? styles.footerContentMobile : {},
        isTablet ? styles.footerContentTablet : {}
      )}>
        {/* Logo Column */}
        <View style={Object.assign({}, styles.footerColumn, isMobile ? styles.footerColumnMobile : {})}>
          <View style={styles.logoSection}>
            <View style={styles.logoIcon}>
              <Image 
                source={require('../assets/images/dominicana_logo.png')} 
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={Object.assign({}, styles.logoText, { color: Colors[colorScheme ?? 'light'].primary })}>
              Dominicana
            </Text>
          </View>
          <Text style={Object.assign({}, styles.footerDescription, { color: Colors[colorScheme ?? 'light'].textSecondary })}>
            A digital resource for the Order of Preachers, supporting prayer, study, community, and preaching.
          </Text>
        </View>

        {/* Quick Links Columns */}
        <View style={Object.assign(
          {},
          styles.footerColumnGroup,
          isMobile ? styles.footerColumnGroupMobile : {},
          isTablet ? styles.footerColumnGroupTablet : {}
        )}>
          <View style={Object.assign({}, styles.footerColumn, isMobile ? styles.footerColumnMobile : {})}>
            <Text style={Object.assign(
              {},
              styles.footerSectionTitle,
              isTablet ? styles.footerSectionTitleTablet : {},
              { color: Colors[colorScheme ?? 'light'].text }
            )}>
              Quick Links
            </Text>
            {quickLinks1.map((link, index) => (
              <Link key={index} href={link.href as any} asChild>
                <TouchableOpacity style={styles.footerLink}>
                  <Text style={Object.assign(
                    {},
                    styles.footerLinkText,
                    isTablet ? styles.footerLinkTextTablet : {},
                    { color: Colors[colorScheme ?? 'light'].textSecondary }
                  )}>
                    {link.name}
                  </Text>
                </TouchableOpacity>
              </Link>
            ))}
          </View>

          {!isMobile && (
            <View style={styles.footerColumn}>
              <Text style={Object.assign(
                {},
                styles.footerSectionTitle,
                isTablet ? styles.footerSectionTitleTablet : {},
                { color: 'transparent' }
              )}>
                &nbsp;
              </Text>
              {quickLinks2.map((link, index) => (
                <Link key={index} href={link.href as any} asChild>
                  <TouchableOpacity style={styles.footerLink}>
                    <Text style={Object.assign(
                      {},
                      styles.footerLinkText,
                      isTablet ? styles.footerLinkTextTablet : {},
                      { color: Colors[colorScheme ?? 'light'].textSecondary }
                    )}>
                      {link.name}
                    </Text>
                  </TouchableOpacity>
                </Link>
              ))}
            </View>
          )}
          
          {isMobile && quickLinks2.map((link, index) => (
            <Link key={index} href={link.href as any} asChild>
              <TouchableOpacity style={styles.footerLink}>
                <Text style={Object.assign({}, styles.footerLinkText, { color: Colors[colorScheme ?? 'light'].textSecondary })}>
                  {link.name}
                </Text>
              </TouchableOpacity>
            </Link>
          ))}
        </View>

        {/* Resources Columns */}
        <View style={Object.assign(
          {},
          styles.footerColumnGroup,
          isMobile ? styles.footerColumnGroupMobile : {},
          isTablet ? styles.footerColumnGroupTablet : {}
        )}>
          <View style={Object.assign({}, styles.footerColumn, isMobile ? styles.footerColumnMobile : {})}>
            <Text style={Object.assign(
              {},
              styles.footerSectionTitle,
              isTablet ? styles.footerSectionTitleTablet : {},
              { color: Colors[colorScheme ?? 'light'].text }
            )}>
              Resources
            </Text>
            {resources1.map((link, index) => (
              <Link key={index} href={link.href as any} asChild>
                <TouchableOpacity style={styles.footerLink}>
                  <Text style={Object.assign(
                    {},
                    styles.footerLinkText,
                    isTablet ? styles.footerLinkTextTablet : {},
                    { color: Colors[colorScheme ?? 'light'].textSecondary }
                  )}>
                    {link.name}
                  </Text>
                </TouchableOpacity>
              </Link>
            ))}
          </View>

          {!isMobile && (
            <View style={styles.footerColumn}>
              <Text style={Object.assign(
                {},
                styles.footerSectionTitle,
                isTablet ? styles.footerSectionTitleTablet : {},
                { color: 'transparent' }
              )}>
                &nbsp;
              </Text>
              {resources2.map((link, index) => (
                <Link key={index} href={link.href as any} asChild>
                  <TouchableOpacity style={styles.footerLink}>
                    <Text style={Object.assign(
                      {},
                      styles.footerLinkText,
                      isTablet ? styles.footerLinkTextTablet : {},
                      { color: Colors[colorScheme ?? 'light'].textSecondary }
                    )}>
                      {link.name}
                    </Text>
                  </TouchableOpacity>
                </Link>
              ))}
            </View>
          )}
          
          {isMobile && resources2.map((link, index) => (
            <Link key={index} href={link.href as any} asChild>
              <TouchableOpacity style={styles.footerLink}>
                <Text style={Object.assign({}, styles.footerLinkText, { color: Colors[colorScheme ?? 'light'].textSecondary })}>
                  {link.name}
                </Text>
              </TouchableOpacity>
            </Link>
          ))}
        </View>
      </View>

      {/* Bottom Line */}
      <View style={Object.assign(
        {},
        styles.bottomLine,
        isMobile ? styles.bottomLineMobile : {},
        { borderTopColor: Colors[colorScheme ?? 'light'].border }
      )}>
        <Text style={Object.assign({}, styles.copyright, { color: Colors[colorScheme ?? 'light'].textSecondary })}>
          © 2025 Dominicana. All rights reserved.
        </Text>
        <View style={Object.assign({}, styles.socialLinks, isMobile ? styles.socialLinksMobile : {})}>
          {socialLinks.map((social, index) => (
            <TouchableOpacity 
              key={index} 
              style={Object.assign({}, styles.socialLink, isMobile ? styles.socialLinkMobile : {})}
              accessibilityLabel={social.name}
              accessibilityRole="button"
            >
              <Ionicons 
                name={social.icon as any} 
                size={isMobile ? 20 : 16} 
                color={Colors[colorScheme ?? 'light'].textSecondary} 
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: spacing.xl, // 32px
    marginTop: 'auto',
  },
  
  // Main content container
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg, // 24px
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.lg, // 24px
  },
  footerContentMobile: {
    flexDirection: 'column',
    paddingHorizontal: spacing.md, // 16px
    marginBottom: spacing.md, // 16px
  },
  footerContentTablet: {
    paddingHorizontal: spacing.md, // 16px
  },
  
  // Column groups
  footerColumnGroup: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: spacing.sm, // 8px
  },
  footerColumnGroupMobile: {
    flexDirection: 'column',
    marginHorizontal: 0,
    marginBottom: spacing.lg, // 24px
  },
  footerColumnGroupTablet: {
    marginHorizontal: spacing.xs, // 4px
  },
  
  // Individual columns
  footerColumn: {
    flex: 1,
    marginHorizontal: spacing.xs, // 4px
  },
  footerColumnMobile: {
    marginHorizontal: 0,
    marginBottom: spacing.md, // 16px
  },
  
  // Logo section
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md, // 12px
  },
  logoIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm, // 8px
    backgroundColor: 'transparent',
  },
  logoImage: {
    width: 20,
    height: 20,
    backgroundColor: 'transparent',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  footerDescription: {
    fontSize: 14,
    marginBottom: spacing.md, // 12px
    fontFamily: 'Georgia',
    lineHeight: 20,
  },
  
  // Section titles and links
  footerSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.md, // 12px
    fontFamily: 'Georgia',
  },
  footerSectionTitleTablet: {
    fontSize: 14,
    marginBottom: spacing.sm, // 8px
  },
  footerLink: {
    marginBottom: spacing.sm, // 8px
    minHeight: 32,
    justifyContent: 'center',
  },
  footerLinkText: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  footerLinkTextTablet: {
    fontSize: 13,
  },
  
  // Bottom line
  bottomLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md, // 16px
    borderTopWidth: 1,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.lg, // 24px
  },
  bottomLineMobile: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: spacing.md, // 16px
    paddingTop: spacing.md, // 16px
  },
  copyright: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },
  socialLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialLinksMobile: {
    marginTop: spacing.md, // 16px
  },
  socialLink: {
    marginLeft: spacing.md, // 16px
    padding: spacing.xs, // 4px
    minWidth: 36,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialLinkMobile: {
    marginLeft: spacing.sm, // 8px
    marginRight: spacing.sm, // 8px
    minWidth: 44,
    minHeight: 44,
  },
});
