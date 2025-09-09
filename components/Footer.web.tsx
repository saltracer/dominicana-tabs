import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/components/ThemeProvider';

export default function Footer() {
  const { colorScheme } = useTheme();

  const quickLinks = [
    { name: 'Prayer', href: '/(tabs)/prayer' },
    { name: 'Study', href: '/(tabs)/study' },
    { name: 'Community', href: '/(tabs)/community' },
    { name: 'Preaching', href: '/(tabs)/preaching' },
  ];

  const resources = [
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: 'logo-facebook' },
    { name: 'Twitter', icon: 'logo-twitter' },
    { name: 'Instagram', icon: 'logo-instagram' },
  ];

  return (
    <View style={[styles.footer, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
      <View style={styles.footerContent}>
        {/* Left Column */}
        <View style={styles.footerColumn}>
          <View style={styles.logoSection}>
            <View style={styles.logoIcon}>
              <Image 
                source={require('../assets/images/dominicana_logo.png')} 
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.logoText, { color: Colors[colorScheme ?? 'light'].primary }]}>
              Dominicana
            </Text>
          </View>
          <Text style={[styles.footerDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            A digital resource for the Order of Preachers, supporting prayer, study, community, and preaching.
          </Text>
        </View>

        {/* Middle Column */}
        <View style={styles.footerColumn}>
          <Text style={[styles.footerSectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Quick Links
          </Text>
          {quickLinks.map((link, index) => (
            <Link key={index} href={link.href} asChild>
              <TouchableOpacity style={styles.footerLink}>
                <Text style={[styles.footerLinkText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  {link.name}
                </Text>
              </TouchableOpacity>
            </Link>
          ))}
        </View>

        {/* Right Column */}
        <View style={styles.footerColumn}>
          <Text style={[styles.footerSectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Resources
          </Text>
          {resources.map((link, index) => (
            <Link key={index} href={link.href} asChild>
              <TouchableOpacity style={styles.footerLink}>
                <Text style={[styles.footerLinkText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  {link.name}
                </Text>
              </TouchableOpacity>
            </Link>
          ))}
        </View>
      </View>

      {/* Bottom Line */}
      <View style={[styles.bottomLine, { borderTopColor: Colors[colorScheme ?? 'light'].border }]}>
        <Text style={[styles.copyright, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
          © 2025 Dominicana. All rights reserved.
        </Text>
        <View style={styles.socialLinks}>
          {socialLinks.map((social, index) => (
            <TouchableOpacity key={index} style={styles.socialLink}>
              <Ionicons 
                name={social.icon as any} 
                size={16} 
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
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    maxWidth: 1200,
    alignSelf: 'center',
  },
  footerColumn: {
    flex: 1,
    marginHorizontal: 16,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
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
  },
  footerDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  footerSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  footerLink: {
    marginBottom: 8,
  },
  footerLinkText: {
    fontSize: 14,
  },
  bottomLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    maxWidth: 1200,
    alignSelf: 'center',
  },
  copyright: {
    fontSize: 12,
  },
  socialLinks: {
    flexDirection: 'row',
  },
  socialLink: {
    marginLeft: 16,
    padding: 4,
  },
});
